import json
import os
import boto3
from decimal import Decimal

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DYNAMO_TABLE_NAME'])

# Custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    request_id = None

    # Extract requestID from query string or body
    if event.get('queryStringParameters'):
        request_id = event['queryStringParameters'].get('requestID')
    elif event.get('body'):
        try:
            body = json.loads(event['body'])
            request_id = body.get('requestID')
        except Exception as e:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'Invalid JSON body: {str(e)}'})
            }

    if not request_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Missing requestID parameter'})
        }

    try:
        # Query DynamoDB using requestID as the primary key
        response = table.get_item(Key={'requestID': request_id})
        item = response.get('Item')

        if not item:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'Result not found'})
            }

        return {
            'statusCode': 200,
            'body': json.dumps(item, cls=DecimalEncoder),
            'headers': {'Content-Type': 'application/json'}
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
