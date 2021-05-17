const { spawn } = require('child_process');
const path = require('path');
const { getReleaseName } = require('./sentry');

// compute paths
const cwd = path.resolve(__dirname, '../../');

const makeExecCommand =
    logger =>
    (cmd, args, options = {}) =>
        new Promise((resolve, reject) => {
            const child = spawn(cmd, args, {
                ...options,
                env: { ...process.env, ...options.env },
            });

            // pipe data
            child.stdout.on('data', data => logger.log(data.toString()));
            child.stderr.on('data', data => logger.log(data.toString()));

            child.on('exit', code => {
                if (code) {
                    reject();
                } else {
                    resolve();
                }
            });
        });

const getImageName = (tag, image) => `${image}:${tag}`;

const verifyConditions = (pluginConfig, context) => {
    const { image } = pluginConfig;
    const { logger } = context;

    const errors = [];

    if (!image) {
        errors.push('Image name missing in plugin config');
    }

    if (!errors.length) {
        return true;
    }

    errors.forEach(error => logger.error(error));

    process.exit(1);

    return false;
};

const prepare = async (pluginConfig, context) => {
    const { image } = pluginConfig;
    const { lastRelease, nextRelease, logger } = context;
    const { version, channel } = nextRelease;
    const { version: lastVersion } = lastRelease;

    const execCommand = makeExecCommand(logger);

    // get the new image name and its tag
    const versionTag = getImageName(version, image);

    if (lastVersion) {
        try {
            // try to pull previous image
            const previousTag = getImageName(lastVersion, image);
            logger.log('Pull previous images from %s', previousTag);
            await execCommand('docker', ['pull', previousTag]);
        } catch (error) {
            // skip it
            logger.log('Could not pull previous image');
        }
    }

    const buildArgs = ['build'];

    // add tag
    buildArgs.push('-t', versionTag);
    // specify docker file
    buildArgs.push('-f', 'Dockerfile');
    // add the version
    buildArgs.push('--build-arg', `VERSION=${version}`);

    const sentryRelease = getReleaseName();

    if (sentryRelease) {
        // add the sentry release
        buildArgs.push('--build-arg', `SENTRY_RELEASE=${sentryRelease}`);
    }

    // build context
    buildArgs.push('./build');

    // then build the docker image
    logger.log('Docker building for %s', versionTag);
    await execCommand('docker', buildArgs, { cwd });

    // tag the image for the channel
    const channelTag = getImageName(channel, image);
    await execCommand('docker', ['tag', versionTag, channelTag]);

    // semantic release create draft releases on GtHib when starting the publish step
    // but the deployment is tiggered on new tags
    // however it means the docker images may not yet be available when upgrading the helm releases
    // so we need to publish the images inside this step
    // at least only the version image
    logger.log('Docker pushing for %s', versionTag);
    await execCommand('docker', ['push', versionTag]);
};

const publish = async (pluginConfig, context) => {
    const { image } = pluginConfig;
    const { nextRelease, logger } = context;
    const { channel } = nextRelease;

    const execCommand = makeExecCommand(logger);

    // push the image on the channel
    const channelTag = getImageName(channel, image);
    logger.log('Docker pushing for %s', channelTag);
    await execCommand('docker', ['push', channelTag]);
};

module.exports = { verifyConditions, prepare, publish };
