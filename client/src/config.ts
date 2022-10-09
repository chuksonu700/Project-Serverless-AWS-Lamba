// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'v8sawk0re7'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/stage`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-v0as6c6s.us.auth0.com',            // Auth0 domain
  clientId: 'BNGrzWs4gyiIuNkQ62nM0wFQNYxMISov',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
