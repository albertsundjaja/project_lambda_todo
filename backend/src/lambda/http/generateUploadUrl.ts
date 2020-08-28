import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWSXRay from 'aws-xray-sdk'
import { parseUserId } from '../../auth/utils'

const XAWS = AWSXRay.captureAWS(AWS)
import * as AWS  from 'aws-sdk'
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  const uploadUrl = getUploadUrl(todoId)

  await docClient.update({
        TableName: todosTable,
        Key: {
            todoId,
            userId
        },
        AttributeUpdates: {
            attachmentUrl: {
                Action: 'PUT',
                Value: `https://${bucketName}.s3.amazonaws.com/${todoId}`
            }
        }
    }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}

function getUploadUrl(todoId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
    })
  }