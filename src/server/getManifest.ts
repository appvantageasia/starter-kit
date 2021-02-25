const getManifest = (bundle = 'app'): { js: string[]; css: string[] } => {
    if (process.isDev) {
        // delete cache
        delete require.cache[require.resolve('./manifest.json')];
    }

    try {
        // eslint-disable-next-line global-require, import/no-unresolved
        const manifest = require('./manifest.json');

        return manifest[bundle] || { js: [], css: [] };
    } catch (error) {
        console.error("Couldn't load the manifest");

        return { js: [], css: [] };
    }
};

export default getManifest;
