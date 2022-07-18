import sourceMapSupport from 'source-map-support';

const start = async () => {
    sourceMapSupport.install({ hookRequire: true, environment: 'node' });

    if (process.env.NODE_ENV !== 'test') {
        process.env.NODE_ENV = 'development';
    }

    const { default: MainRunner } = await import('./devRunner');

    return new MainRunner().start();
};

start().catch(error => {
    console.error(error);
    process.exit(1);
});

export {};
