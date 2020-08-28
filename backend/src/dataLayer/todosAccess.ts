import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.TODOS_SECONDARY_INDEX) {}
    
    async createTodo(putTodo): Promise<TodoItem> {
        
        await this.docClient.put({
            TableName: this.todosTable,
            Item: putTodo
          }).promise()
          
        
        return putTodo
    }

    async deleteTodo(todoId) {
        return await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId
            }
        }).promise()
    }

    async getTodos(userId)  {
        return await this.docClient.query({
            TableName: this.todosTable,
            IndexName : this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
          }).promise()
    }

    async updateTodo(todoId, updatedTodo: TodoUpdate) {
        return await this.docClient.update({
            TableName: this.todosTable,
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
    }
}