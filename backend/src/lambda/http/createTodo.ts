import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { TodoItem } from '../../models/TodoItem'

import { parseUserId } from '../../auth/utils'

import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid';
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')
const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  logger.info(`${userId} create todo`)

  const now = new Date().toISOString()
  const todoId = uuid.v4()
  // TODO: Implement creating a new TODO item
  const putTodo: TodoItem = {
    ...newTodo,
      userId: userId,
      todoId: todoId,
      createdAt: now,
      done: false,
      attachmentUrl: ''
  }

  await docClient.put({
    TableName: todosTable,
    Item: putTodo
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      item: putTodo
    })
  }
}
