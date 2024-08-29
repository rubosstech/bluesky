import {Stack, StackProps} from 'aws-cdk-lib'
import {
  AwsIntegration,
  Cors,
  LambdaIntegration,
  PassthroughBehavior,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway'
import {PolicyStatement, Role, ServicePrincipal} from 'aws-cdk-lib/aws-iam'
import {Construct} from 'constructs'

import {NodeLambda} from './constructs/node_lambda'
import {S3StaticSite} from './constructs/s3_static_site'
import path = require('path')

export class VerusSocialServerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const serverFunction = new NodeLambda(this, 'ServerLambda', {
      codeDir: '../auth-server',
      description: 'The main function for Verus social',
      handler: 'src/lambda_server.handler',
    })

    const assetSite = new S3StaticSite(this, 'AssetSite')

    const api = new RestApi(this, 'PrimaryApi')

    serverFunction.lambda.addPermission('PermitApiGwInvoke', {
      principal: new ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: api.arnForExecuteApi('*'),
    })

    const apiGatewayRole = new Role(this, 'APIGatewayRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    })

    apiGatewayRole.addToPolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [
          assetSite.bucket.bucketArn,
          path.join(assetSite.bucket.bucketArn, '*'),
        ],
      }),
    )

    // Static part of the site
    api.root.addMethod(
      'GET',
      new AwsIntegration({
        service: 's3',
        integrationHttpMethod: 'GET',
        path: path.join(assetSite.bucket.bucketName, 'index.html'),
        options: {
          credentialsRole: apiGatewayRole,
          passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
          integrationResponses: [
            {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Content-Type':
                  'integration.response.header.Content-Type',
              },
            },
          ],
        },
      }),
      {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Content-Type': true,
            },
          },
        ],
      },
    )
    api.root
      .addProxy({
        defaultCorsPreflightOptions: {
          allowOrigins: Cors.ALL_ORIGINS,
          allowMethods: ['GET'],
        },
        defaultIntegration: new AwsIntegration({
          service: 's3',
          integrationHttpMethod: 'GET',
          path: path.join(assetSite.bucket.bucketName, '{proxy+}'),
          options: {
            credentialsRole: apiGatewayRole,
            passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
            integrationResponses: [
              {
                statusCode: '200',
                responseParameters: {
                  'method.response.header.Content-Type':
                    'integration.response.header.Content-Type',
                },
              },
            ],
          },
        }),
        anyMethod: false,
        defaultMethodOptions: {
          methodResponses: [
            {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Content-Type': true,
              },
            },
          ],
        },
      })
      .addMethod('GET')
    // Backend part of the site
    api.root.addResource('hello_world').addProxy({
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      defaultIntegration: new LambdaIntegration(serverFunction.lambda, {
        proxy: true,
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Content-Type':
                'integration.response.header.Content-Type',
            },
          },
        ],
      }),
      defaultMethodOptions: {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Content-Type': true,
            },
          },
        ],
      },
    })
    api.root.addResource('api').addProxy({
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      defaultIntegration: new LambdaIntegration(serverFunction.lambda, {
        proxy: true,
        integrationResponses: [
          {
            statusCode: '200',
          },
        ],
      }),
      defaultMethodOptions: {
        methodResponses: [
          {
            statusCode: '200',
          },
        ],
      },
    })
  }
}
