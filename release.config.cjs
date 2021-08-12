module.exports = {
    branches: [
        '+([0-9])?(.{+([0-9]),x}).x',
        {
            name: 'latest',
            channel: false,
        },
        {
            name: 'next',
            channel: 'next',
            prerelease: 'next',
        },
    ],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/github',
    ],
};
