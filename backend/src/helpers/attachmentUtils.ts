// import * as AWS from 'aws-sdk'
const awsXRay = require('aws-xray-sdk');
const XAWS = awsXRay.captureAWS(require('aws-sdk'));

import { createLogger } from '../utils/logger'
const logger = createLogger('Signed Url')

// TODO: Implement the fileStogare logic

const s3 = new XAWS.S3({ signatureVersion: 'v4' })
export const getUploadUrl=(bucketName:string,todoId:string,urlExpiration:string)=>{
  logger.info("Creating Signed url")  
  return s3.getSignedUrl('putObject',{
        Bucket:bucketName,
        Key: todoId,
        Expires:urlExpiration
      })
}