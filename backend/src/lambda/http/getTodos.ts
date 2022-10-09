import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId=await getUserId(event);
    const lastTodoKey= await getLaskKey(event);

    
    console.log("user:gooten",userId)

    const todos = await getTodosForUser(userId,lastTodoKey);
    console.log("lastTodoKey:");
    return {
      statusCode:200,
      body:JSON.stringify({
        items:todos.Items,
        LastEvaluatedKey:todos.LastEvaluatedKey
      })
    }
  });

handler.use(
  cors({
    credentials: true
  })
)
async function getLaskKey(event: APIGatewayProxyEvent) {
  try {
    let nextKey = await event.queryStringParameters['nextKey']
    return nextKey  
  } catch (e) {
    return 'null'
  }

}

