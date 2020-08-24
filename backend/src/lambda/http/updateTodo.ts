import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  await docClient.update({
      TableName: todosTable,
      Key: {
          todoId
      },
      AttributeUpdates: {
          name: {
              Action: 'PUT',
              Value: updatedTodo.name
          },
          dueDate: {
              Action: 'PUT',
              Value: updatedTodo.dueDate
          },
          done: {
              Action: 'PUT',
              Value: updatedTodo.done
          }
      }
  }).promise()
  
  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: null
  }
}
