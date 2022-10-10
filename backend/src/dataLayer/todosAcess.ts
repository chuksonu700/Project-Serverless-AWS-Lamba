// import * as AWS from 'aws-sdk'
import {
    createLogger
} from '../utils/logger'
import {
    TodoItem
} from '../models/TodoItem'

import {
    UpdateTodoRequest
} from '../requests/UpdateTodoRequest'
const awsXRay = require('aws-xray-sdk');
const XAWS = awsXRay.captureAWS(require('aws-sdk'));

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
const docClient = new XAWS.DynamoDB.DocumentClient()
// const docClient:DocumentClient = new AWS.DynamoDB.DocumentClient()
const TodosTable = process.env.TODOS_TABLE
export class TodosAccess {
    constructor() {}

    getTodosForUser = async (userId: string,lastKey:string) => {

        logger.info(`Getting Todos for User: ${userId}`)
            if (lastKey !== 'null') {
                const result = await  docClient.query({
                    TableName:  TodosTable,
                    KeyConditionExpression: "userId = :u",
                    ExpressionAttributeValues: {
                        ":u": userId
                    },
                    Limit: 10,
                    ExclusiveStartKey: {
                            todoId: lastKey,
                            userId: userId
                        }
                }).promise()
    
                console.log('result.data: ',result.data)
                console.log('result: ',result)
            
            logger.info(`Todo Items for user:${userId} retrieved`)
            return result
            } else {
                const result = await  docClient.query({
                    TableName:  TodosTable,
                    KeyConditionExpression: "userId = :u",
                    ExpressionAttributeValues: {
                        ":u": userId
                    },
                    Limit: 10,
                    ExclusiveStartKey:null
            }).promise()

                console.log('result: ',result)
            
            logger.info(`Todo Items for user:${userId} retrieved`)
            return result
            }        
      
    }

    createTodos = async (todo: TodoItem): Promise < TodoItem > => {
        logger.info(`Creating a new Todo for User: ${todo.userId}`,{
            todo:todo
        })
        await  docClient.put({
            TableName:  TodosTable,
            Item: todo
        }).promise()
        
        logger.info(`New Todo Created`,{
            todo
        })

        return todo
    }
    updateTodo = async (userId: string, todoId: string, updatedTodo: UpdateTodoRequest) => {
        logger.info(`Updating a Todo for User: ${userId} and TodoId: ${todoId}`,{
            updatedTodo:updatedTodo
        })
        await docClient.update({
            TableName:  TodosTable,
            Key: {
                'todoId': todoId,
                'userId': userId
                
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':name': updatedTodo.name,
                ':dueDate': updatedTodo.dueDate,
                ':done': updatedTodo.done
            }
          
        }).promise()
        
        logger.info(`Updated Todo with id: ${todoId} and owned by user: ${userId}`,{
            updatedTodo:updatedTodo,
        })
        return
    }

    deleteTodo = async (todoId: string, userId: string) => {

        logger.info(`Deleting a Todo Item for user ${userId} and todo with id ${todoId}`)
        await  docClient.delete({
            TableName:  TodosTable,
            Key: {
                userId,
                todoId
            }
        }).promise()
        logger.info(`Deleted Todo with id: ${todoId} and owned by user: ${userId}`)
        return
    }
}