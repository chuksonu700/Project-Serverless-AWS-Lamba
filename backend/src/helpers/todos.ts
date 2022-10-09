import { TodosAccess } from './todosAcess'
import { getUploadUrl } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const createTodo = async (createTodoRequest: CreateTodoRequest, userId: string) => {
    const todoId = uuid.v4()
    const newTodo: TodoItem = {
        todoId,
        userId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }

    await todosAccess.createTodos(newTodo)

    return newTodo
}

export const deleteTodo = async (todoId: string, userId: string) => {
    return await todosAccess.deleteTodo(todoId, userId)
}

export const getTodosForUser = async (userId: string) => {
    return await todosAccess.getTodosForUser(userId)
}

export const updateTodo = async (userId: string, todoId: string, updatedTodo: UpdateTodoRequest) => {
    return await todosAccess.updateTodo(userId, todoId, updatedTodo)
}

export const signedUrl = async (todoId)=>{
    return await getUploadUrl(bucketName,todoId,urlExpiration);
}