import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

import { createTodo } from '../../businessLogic/todos'

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  logger.info(`${userId} create todo`)
  
  // TODO: Implement creating a new TODO item
  if (!newTodo.name) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error: "Name cannot be blank"
      })
    }
  }
  
  const putTodo = await createTodo(newTodo, userId)

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
