import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS  from 'aws-sdk'
import { parseUserId } from '../../auth/utils'

import { createLogger } from '../../utils/logger'
import * as AWSXRay from 'aws-xray-sdk'
import { getTodos } from '../../businessLogic/todos'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('auth')
const cloudwatch = new XAWS.CloudWatch();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const startTime = new Date().getTime()
  // TODO: Get all TODO items for a current user

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  logger.info(`${userId} request todo`)

  const result = await getTodos(userId)

  const endTime = new Date().getTime()
  const totalTime = endTime - startTime

  // metric log
  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Latency',
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: 'Todos/GetTodos'
          }
        ],
        Unit: 'Milliseconds',
        Value: totalTime
      }
    ],
    Namespace: 'Serverless/Todos'
  }).promise()

  const items = result.Items

  return {
    statusCode:200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      items
    })
  }
}
