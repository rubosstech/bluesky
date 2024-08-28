import {Runtime} from 'aws-cdk-lib/aws-lambda'
import {Bucket, IBucket} from 'aws-cdk-lib/aws-s3'
import {BucketDeployment, Source} from 'aws-cdk-lib/aws-s3-deployment'
import {Construct} from 'constructs'

export interface S3StaticSiteProps {
  readonly bundleCommand?: string[]
  readonly bundleEnvironment?: Record<string, string>
}

export class S3StaticSite extends Construct {
  bucket: IBucket

  constructor(scope: Construct, id: string, props: S3StaticSiteProps = {}) {
    super(scope, id)

    this.bucket = new Bucket(this, 'Files')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const deployment = new BucketDeployment(this, 'DeployFiles', {
      sources: [
        Source.asset('..', {
          bundling: {
            image: Runtime.NODEJS_20_X.bundlingImage,
            command: props.bundleCommand ?? [
              'bash',
              '-c',
              `
              export npm_config_cache=/tmp/.npm &&
              npx yarn install &&
              npx yarn build-web &&
              cp -aru web-build/* /asset-output
            `,
            ],
            environment: props.bundleEnvironment,
          },
        }),
      ],
      destinationBucket: this.bucket,
    })
  }
}
