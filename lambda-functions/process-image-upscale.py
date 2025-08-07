import boto3
import os
import json
import urllib.request
from urllib.parse import unquote_plus
import time

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("ImageProcessingResults")

BUCKET_NAME = os.environ["BUCKET_NAME"]
REPLICATE_API = os.environ["REPLICATE_API"]

def lambda_handler(event, context):
    try:
        print("Received event:", event)
        results = []

        for record in event["Records"]:
            key = unquote_plus(record["s3"]["object"]["key"])
            print(f"Processing file: {key}")

            response = s3.get_object(Bucket=BUCKET_NAME, Key=key)
            metadata = response.get("Metadata", {})
            print(f"Metadata: {metadata}")

            model_name = metadata.get("model")
            if not model_name:
                raise ValueError("Model name not found in metadata")

            presigned_get_url = s3.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": BUCKET_NAME, "Key": key},
                ExpiresIn=300
            )
            print(f"Presigned GET URL: {presigned_get_url}")
            print(f"Using model: {model_name}")

            url = "https://api.replicate.com/v1/predictions"
            headers = {
                "Authorization": f"Bearer {REPLICATE_API}",
                "Content-Type": "application/json"
            }

            data = json.dumps({
                "version": "xinntao/realesrgan:1b976a4d456ed9e4d1a846597b7614e79eadad3032e9124fa63859db0fd59b56",
                "input": {
                    "img": presigned_get_url,
                    "version": model_name,
                    "scale": 4
                }
            }).encode('utf-8')

            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read().decode())
                print(f"Replicate initial response: {result}")

            prediction_url = result["urls"]["get"]

            output_url = None
            for _ in range(60):
                poll_req = urllib.request.Request(
                    prediction_url,
                    headers={"Authorization": f"Bearer {REPLICATE_API}"}
                )
                with urllib.request.urlopen(poll_req) as poll_resp:
                    poll_result = json.loads(poll_resp.read().decode())

                status = poll_result.get("status")
                print(f"Polling status: {status}")

                if status == "succeeded":
                    output_url = poll_result.get("output")
                    break
                elif status == "failed":
                    raise Exception("Prediction failed")
                else:
                    time.sleep(2)

            if not output_url:
                raise ValueError("No output URL after polling Replicate prediction")

            # Store in DynamoDB with the S3 key as primary key
            table.put_item(
                Item={
                    "requestID": key,  # use the S3 object key as your partition key
                    "output_url": output_url,
                    "model_name": model_name,
                    "timestamp": int(time.time()),
                    "status": "completed"
                }
                )

            print("Stored result in DynamoDB.")

            results.append(f"Prediction created for {key}: {output_url}")

        return {
            'statusCode': 200,
            'body': "\n".join(results)
        }

    except Exception as e:
        print("Error occurred:", str(e))
        return {
            'statusCode': 500,
            'body': f"Error: {str(e)}"
        }
