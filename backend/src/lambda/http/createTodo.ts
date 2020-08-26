import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { TodoItem } from '../../models/TodoItem'

import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid';

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const now = new Date().toISOString()
  const todoId = uuid.v4()
  // TODO: Implement creating a new TODO item
  const putTodo: TodoItem = {
    ...newTodo,
      userId: '',
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
