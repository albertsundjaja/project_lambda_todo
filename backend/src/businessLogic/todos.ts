import {TodosAccess} from '../dataLayer/todosAccess'
import * as uuid from 'uuid';

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const todosAccess = new TodosAccess()

export async function createTodo(
    newTodo,
    userId
): Promise<TodoItem> {
    const now = new Date().toISOString()
        const todoId = uuid.v4()
        const putTodo: TodoItem = {
            ...newTodo,
              userId: userId,
              todoId: todoId,
              createdAt: now,
              done: false,
              attachmentUrl: ''
          }
    return await todosAccess.createTodo(putTodo)
}

export async function deleteTodo(todoId) {
    return await todosAccess.deleteTodo(todoId)
}

export async function getTodos(userId) {
    return await todosAccess.getTodos(userId)
}

export async function updateTodo(todoId, data : TodoUpdate) {
    return await todosAccess.updateTodo(todoId, data)
}