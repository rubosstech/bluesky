import {Duration, Stack, StackProps} from 'aws-cdk-lib'
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
import {
  AllowedMethods,
  CachedMethods,
  CachePolicy,
  Distribution,
  OriginAccessIdentity,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import {FunctionUrlOrigin, HttpOrigin} from 'aws-cdk-lib/aws-cloudfront-origins'
import {Cluster, ContainerImage} from 'aws-cdk-lib/aws-ecs'
import {ApplicationLoadBalancedFargateService} from 'aws-cdk-lib/aws-ecs-patterns'

export class VerusSocialServerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const cluster = new Cluster(this, 'Cluster')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const service = new ApplicationLoadBalancedFargateService(
      this,
      'BackendService',
      {
        cluster,
        memoryLimitMiB: 1024,
        desiredCount: 1,
        cpu: 512,
        taskImageOptions: {
          image: ContainerImage.fromAsset('../', {
            file: 'Dockerfile.server',
          }),
        },
      },
    )

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

    const distributionAccessIdentity = new OriginAccessIdentity(
      this,
      'DistributionAccessIdentity',
    )
    assetSite.bucket.grantRead(distributionAccessIdentity)

    // const bucketOrigin = new S3Origin(assetSite.bucket, {
    //   originAccessIdentity: distributionAccessIdentity,
    //   connectionAttempts: 3,
    //   connectionTimeout: Duration.seconds(1),
    // })
    const bucketOrigin = new HttpOrigin(
      assetSite.bucket.bucketWebsiteDomainName,
    )

    const lambdaOrigin = new FunctionUrlOrigin(serverFunction.functionUrl, {
      connectionAttempts: 3,
      connectionTimeout: Duration.seconds(1),
      keepaliveTimeout: Duration.seconds(30),
      readTimeout: Duration.seconds(10),
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const distribution = new Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      enableIpv6: true,
      defaultBehavior: {
        origin: bucketOrigin,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_AND_CLOUDFRONT_2022,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        '/hello_world': {
          origin: lambdaOrigin,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          cachePolicy: CachePolicy.CACHING_OPTIMIZED,
          originRequestPolicy:
            OriginRequestPolicy.ALL_VIEWER_AND_CLOUDFRONT_2022,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        '/api/*': {
          origin: lambdaOrigin,
          allowedMethods: AllowedMethods.ALLOW_ALL,
          cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          cachePolicy: CachePolicy.CACHING_DISABLED,
          originRequestPolicy:
            OriginRequestPolicy.ALL_VIEWER_AND_CLOUDFRONT_2022,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    })

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
