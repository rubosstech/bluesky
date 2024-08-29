import {Stack, StackProps} from 'aws-cdk-lib'
import {
  Cluster,
  ContainerImage,
  CpuArchitecture,
  OperatingSystemFamily,
} from 'aws-cdk-lib/aws-ecs'
import {ApplicationLoadBalancedFargateService} from 'aws-cdk-lib/aws-ecs-patterns'
import {Construct} from 'constructs'

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
        },
      },
    )
  }
}
