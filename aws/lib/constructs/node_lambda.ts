import {Duration} from 'aws-cdk-lib'
import {
  LambdaDeploymentConfig,
  LambdaDeploymentGroup,
} from 'aws-cdk-lib/aws-codedeploy'
import {
  Alias,
  AssetCode,
  Function,
  FunctionUrl,
  FunctionUrlAuthType,
  IFunction,
  Runtime,
} from 'aws-cdk-lib/aws-lambda'
import {Construct} from 'constructs'

export interface NodeLambdaProps {
  readonly codeDir: string
  readonly bundleCommand?: string[]
  readonly bundleEnvironment?: Record<string, string>
  readonly description: string
  readonly handler: string
  readonly memorySize?: number
  readonly runtimeDuration?: Duration
  readonly runtimeEnvironment?: Record<string, string>
}

export class NodeLambda extends Construct {
  readonly lambda: IFunction
  readonly deploymentGroup: LambdaDeploymentGroup
  readonly functionUrl: FunctionUrl

  constructor(scope: Construct, id: string, props: NodeLambdaProps) {
    super(scope, id)

    const codeAsset = AssetCode.fromAsset(props.codeDir, {
      bundling: {
        image: Runtime.NODEJS_20_X.bundlingImage,
        command: props.bundleCommand ?? [
          'bash',
          '-c',
          `
            export npm_config_cache=/tmp/.npm &&
            npx yarn install &&
            npx yarn build &&
            cp -aru src node_modules /asset-output
          `,
        ],
        environment: props.bundleEnvironment,
      },
    })

    const lambda = new Function(this, 'function', {
      runtime: Runtime.NODEJS_20_X,
      timeout: props.runtimeDuration ?? Duration.minutes(1),
      description: props.description,
      handler: props.handler,
      code: codeAsset,
      memorySize: props.memorySize ?? 2048,
      environment: props.runtimeEnvironment,
    })

    this.lambda = lambda

    const alias = new Alias(this, 'alias', {
      aliasName: 'Current',
      version: lambda.currentVersion,
    })

    this.deploymentGroup = new LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias,
      // TODO - Switch to a linear or canary configuration
      deploymentConfig: LambdaDeploymentConfig.ALL_AT_ONCE,
      // TODO - alarms
    })

    this.functionUrl = lambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    })
  }
}
