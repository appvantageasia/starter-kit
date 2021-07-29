import fs from 'fs';
import path from 'path';

let manifest = null;

const getManifest = (bundle = 'app'): { js: string[]; css: string[] } => {
    if (process.isDev) {
        // delete cache
        manifest = null;
    }

    if (manifest === null) {
        try {
            manifest = JSON.parse(fs.readFileSync(path.join(__dirname, './manifest.json'), { encoding: 'utf8' }));
        } catch (error) {
            console.error(error);
            console.error("Couldn't load the manifest");

            return { js: [], css: [] };
        }
    }

    return manifest[bundle] || { js: [], css: [] };
};

export default getManifest;
