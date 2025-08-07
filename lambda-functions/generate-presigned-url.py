import json
import boto3
import os
import uuid
from datetime import datetime

# Connect to S3
s3_client = boto3.client("s3")
BUCKET_NAME = os.environ.get("BUCKET_NAME")

EXTENSION_MAP = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/jpg": ".jpg"
}

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        content_type = body.get("contentType", "image/jpg")
        file_ext = EXTENSION_MAP.get(content_type, ".jpg")
        model_type = body.get("modelType", "default")

        # Generate timestamp
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

        # Create unique ID and key
        unique_id = str(uuid.uuid4())
        key = f"uploads/{timestamp}_{unique_id}{file_ext}"

        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": key,
                "ContentType": content_type,
                "Metadata": {
                    "model": model_type
                }
            },
            ExpiresIn=300
        )

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "uploadUrl": presigned_url,
                "key": key,
                "id": unique_id
            })
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
