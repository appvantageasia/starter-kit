const path = require('path');
const glob = require('glob');
const Minio = require('minio');

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
    const { bucket, endPoint, port = 443, useSSL = true, region } = pluginConfig;
    const { logger, nextRelease } = context;
    const { version } = nextRelease;

    const client = new Minio.Client({
        endPoint,
        port,
        useSSL,
        accessKey: process.env.CDN_ACCESS_KEY,
        secretKey: process.env.CDN_SECRET_KEY,
        region,
    });

    logger.log('Publish on %s (%s)', endPoint, bucket);

    const assets = glob.sync('**/*', {
        cwd: path.join(__dirname, '../../build/public'),
        nodir: true,
    });

    await Promise.all(
        assets.map(filename =>
            client.fPutObject(bucket, `${version}/${filename}`, path.join(assetsDir, filename), { version })
        )
    );
};

module.exports = { verifyConditions, publish };
