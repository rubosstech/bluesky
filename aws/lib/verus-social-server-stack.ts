import {Stack, StackProps} from 'aws-cdk-lib'
import {LambdaRestApi} from 'aws-cdk-lib/aws-apigateway'
import {Construct} from 'constructs'

import {NodeLambda} from './constructs/node_lambda'

export class VerusSocialServerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const serverFunction = new NodeLambda(this, 'ServerLambda', {
      codeDir: '../auth-server',
      description: 'The main function for Verus social',
      handler: 'src/lambda_server.handler',
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const api = new LambdaRestApi(this, 'VerusSocialApi', {
      handler: serverFunction.lambda,
      proxy: true,
    })
  }
}
