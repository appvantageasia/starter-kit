const { createReadStream } = require('fs');
const path = require('path');
const s3 = require('@aws-sdk/client-s3');
const glob = require('glob');

const assetsDir = path.resolve(__dirname, '../../build/public');

const verifyConditions = (pluginConfig, context) => {
    const { bucket, endPoint } = pluginConfig;
    const { logger } = context;

    const errors = [];

    if (!process.env.CDN_ACCESS_KEY) {
        errors.push('Access key for the CDN is missing in environment');
    }

    if (!process.env.CDN_SECRET_KEY) {
        errors.push('Secret key for the CDN is missing in environment');
    }

    if (!bucket) {
        errors.push('Bucket is missing in the plugin config');
    }

    if (!endPoint) {
        errors.push('End point is missing in the plugin config');
    }

    if (!errors.length) {
        return true;
    }

    errors.forEach(error => logger.error(error));

    process.exit(1);

    return false;
};

const publish = async (pluginConfig, context) => {
    const { bucket, endPoint, useSSL = true, region } = pluginConfig;
    const { logger, nextRelease } = context;
    const { version } = nextRelease;

    const client = new s3.S3Client({
        endpoint: endPoint,
        credentials: {
            accessKeyId: process.env.CDN_ACCESS_KEY,
            secretAccessKey: process.env.CDN_SECRET_KEY,
        },
        sslEnabled: useSSL,
        region,
    });

    logger.log('Publish on %s (%s)', endPoint, bucket);

    const assets = glob.sync('**/*', {
        cwd: path.join(__dirname, '../../build/public'),
        nodir: true,
    });

    await Promise.all(
        assets.map(filename =>
            client.send(
                new s3.PutObjectCommand({
                    Bucket: bucket,
                    Key: `${version}/${filename}`,
                    Metadata: { version },
                    Body: createReadStream(path.join(assetsDir, filename)),
                })
            )
        )
    );
};

module.exports = { verifyConditions, publish };
