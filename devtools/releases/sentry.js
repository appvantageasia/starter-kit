const SentryCli = require('@sentry/cli');

let _releaseName = null;

const getReleaseName = () => _releaseName;

const verifyConditions = (pluginConfig, context) => {
    const { organization, project, repository = process.env.CIRCLE_PROJECT_REPONAME } = pluginConfig;
    const { logger } = context;

    const errors = [];

    if (!process.env.SENTRY_AUTH_TOKEN) {
        errors.push('Sentry authorization token is missing in environment');
    }

    if (!organization) {
        errors.push('Organization is missing in the plugin config');
    }

    if (!project) {
        errors.push('Project is missing in the plugin config');
    }

    if (!repository) {
        errors.push('Repository is missing in the plugin config');
    }

    if (!errors.length) {
        return true;
    }

    errors.forEach(error => logger.error(error));

    process.exit(1);

    return false;
};

const prepare = async (pluginConfig, context) => {
    const { project } = pluginConfig;
    const { nextRelease } = context;
    const { version } = nextRelease;

    _releaseName = `${project}@${version.replace(/\./g, '-')}`;
};

const publish = async (pluginConfig, context) => {
    const { project, organization, repository } = pluginConfig;
    const { lastRelease, nextRelease, logger } = context;
    const { gitHead: commit } = nextRelease;
    const { gitHead: previousCommit } = lastRelease;
    const release = getReleaseName(context);

    logger.log('Publish on sentry %s', release);

    // create sentry CLI instance
    const cli = new SentryCli(undefined, {
        silent: false,
        org: organization,
        project,
        authToken: process.env.SENTRY_AUTH_TOKEN,
    });

    // create the release
    await cli.releases.new(release);

    // upload source maps
    await cli.releases.uploadSourceMaps(release, {
        include: ['build', 'src'],
        projects: [project],
    });

    // attach commits
    await cli.releases.setCommits(release, {
        commit,
        previousCommit,
        repo: repository,
    });

    // finalize the release
    await cli.releases.finalize(release);
};

module.exports = { verifyConditions, prepare, publish, getReleaseName };
