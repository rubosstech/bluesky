import {Stack, StackProps} from 'aws-cdk-lib'
import {
  Cluster,
  ContainerImage,
  CpuArchitecture,
  OperatingSystemFamily,
  Secret,
} from 'aws-cdk-lib/aws-ecs'
import {ApplicationLoadBalancedFargateService} from 'aws-cdk-lib/aws-ecs-patterns'
import {Secret as SSMSecret} from 'aws-cdk-lib/aws-secretsmanager'
import {Construct} from 'constructs'

export class VerusSocialServerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const cluster = new Cluster(this, 'Cluster')

    const verusSkySecret = SSMSecret.fromSecretCompleteArn(
      this,
      'VerusSkySecret',
      'arn:aws:secretsmanager:us-west-2:559732349516:secret:verusSky-kdWtGY',
    )

    const service = new ApplicationLoadBalancedFargateService(
      this,
      'BackendService',
      {
        cluster,
        runtimePlatform: {
          operatingSystemFamily: OperatingSystemFamily.LINUX,
          cpuArchitecture: CpuArchitecture.ARM64,
        },
        memoryLimitMiB: 1024,
        desiredCount: 1,
        cpu: 512,
        taskImageOptions: {
          image: ContainerImage.fromAsset('../', {
            file: 'Dockerfile.server',
          }),
          containerPort: 3000,
          environment: {
            IS_DEV: 'false',
          },
          secrets: {
            IADDRESS: Secret.fromSecretsManager(verusSkySecret, 'IADDRESS'),
            WIF: Secret.fromSecretsManager(verusSkySecret, 'WIF'),
          },
        },
      },
    )

    // Pass the DNS name into the container as an environment variable.
    // Note that this cannot be done in the definition as the
    // props are created before the load balancer.
    service.taskDefinition.defaultContainer?.addEnvironment(
      'BASE_URL',
      service.loadBalancer.loadBalancerDnsName,
    )
  }
}
