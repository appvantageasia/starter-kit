const fs = require('fs');
const { builtinModules } = require('module');
const path = require('path');
const { parse, stringify } = require('@yarnpkg/lockfile');
const { flow, map, groupBy, uniq } = require('lodash/fp');
const { Compilation } = require('webpack');

const pluginName = 'WebpackPackagePlugin';

// function to get the module name
const getParentIdentifier = identifier => {
    if (identifier[0] === '@') {
        return identifier.split('/').slice(0, 2).join('/');
    }

    return identifier.split('/')[0];
};

// default options
const defaultOptions = {
    name: process.env.npm_package_name,
    version: undefined,
    yarnFile: 'yarn.lock',
    additionalModules: [],
    scriptExecName: 'start',
    scriptExecCmd: compilation => `node ${compilation.outputOptions.filename}`,
};

const RegExpModule = /^(?<module>.+)@(?<version>.+)$/;
const processYarnMap = flow([
    Object.entries,
    map(([key, entry]) => {
        const { module, version } = key.match(RegExpModule).groups;

        return { module, version, entry };
    }),
    groupBy('module'),
]);

// function to sort version
const sortVersion = ({ groups: a }, { groups: b }) => {
    if (a.major !== b.major) {
        return parseInt(b.major, 10) - parseInt(a.major, 10);
    }

    if (a.patch !== b.patch) {
        return parseInt(b.patch, 10) - parseInt(a.patch, 10);
    }

    if (a.minor !== b.minor) {
        return parseInt(b.major, 10) - parseInt(a.major, 10);
    }

    if (b.extra && !a.extra) {
        return 1;
    }

    if (a.extra && !b.extra) {
        return -1;
    }

    return parseInt(b.extra, 10) - parseInt(a.extra, 10);
};

const RegExpVersion = /^([~^])?(?<major>[0-9]+).(?<patch>[0-9]+).(?<minor>[0-9]+)([a-z-]+(?<extra>[0-9]+))?$/;
const processDependencies = (entries, rootDependencies) => {
    // entries used by the dependencies
    const usedEntries = [];

    // list of dependencies to excluded because already processed
    const excluded = []; // by default empty

    // first we need to gather version which we requires for the root dependencies
    // we believe they should be at the latest (up to date)
    const rootEntries = rootDependencies.map(dependency => {
        // get the entries for this dependency
        const dependencyEntries = entries[dependency];
        // then get their version

        const versions = dependencyEntries
            .map(entry => entry.version)
            .map(version => version.match(RegExpVersion))
            .filter(Boolean)
            .sort(sortVersion);

        return [dependency, versions.length ? versions[0].input : '*'];
    });

    const process = dependencies => {
        // start with an empty list of sub dependencies
        const subDependencies = [];

        // loop on dependencies
        for (const [dependency, version] of dependencies) {
            // compute its hash
            const hash = `${dependency}@${version}`;

            // check the excluded
            if (excluded.includes(hash)) {
                // skip it
                continue;
            }

            // get its entry
            const { entry } = entries[dependency].find(item => item.version === version);

            // add it to used entries
            usedEntries.push([hash, entry]);

            // get dependencies from that one
            const { dependencies: nextDependencies = {}, optionalDependencies = {} } = entry;

            // add them to sub dependencies
            subDependencies.push(...Object.entries(nextDependencies), ...Object.entries(optionalDependencies));

            // add to excluded because it's now processed
            excluded.push(hash);
        }

        if (subDependencies.length) {
            process(subDependencies);
        }
    };

    process(rootEntries);

    return [Object.fromEntries(rootEntries), Object.fromEntries(usedEntries)];
};

class WebpackPackagePlugin {
    constructor(options) {
        // merge default options and given options
        this.options = { ...defaultOptions, ...options };

        // get the yarn file content
        const { yarnFile } = this.options;
        const filename = yarnFile.startsWith('/') ? yarnFile : path.resolve(process.cwd(), yarnFile);
        const content = fs.readFileSync(filename, 'utf8');

        // parse it and get the mapping from it
        this.yarnEntries = processYarnMap(parse(content).object);
    }

    apply(compiler) {
        const outputFolder = compiler.options.output.path;
        const outputFile = path.resolve(outputFolder, 'package.json');
        const outputName = path.relative(outputFolder, outputFile);
        const yarnOutputFile = path.resolve(outputFolder, 'yarn.lock');
        const yarnOutputName = path.relative(outputFolder, yarnOutputFile);

        compiler.hooks.compilation.tap(pluginName, compilation => {
            compilation.hooks.processAssets.tap(
                { name: pluginName, stage: Compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING },
                assets => {
                    const externalPackages = [];

                    const addDependency = module => {
                        // avoid core package
                        if (!builtinModules.includes(module)) {
                            // add it to our external packages
                            externalPackages.push(module);
                        }
                    };

                    compilation.modules.forEach(({ request, externalType }) => {
                        // we only look for external modules
                        if (externalType && !request.startsWith('./')) {
                            // get the main module identifier and try to add i
                            addDependency(getParentIdentifier(request));
                        }
                    });

                    // add additional dependencies
                    this.options.additionalModules.forEach(addDependency);

                    // process dependencies
                    const [dependencies, yarnMap] = processDependencies(this.yarnEntries, uniq(externalPackages));

                    // sort dependencies for consistency
                    const sortedDependencies = Object.keys(dependencies)
                        .sort()
                        .reduce((acc, key) => ({ ...acc, [key]: dependencies[key] }), {});

                    // write the new package.json
                    const output = JSON.stringify(
                        {
                            // this is a private package
                            private: true,
                            // get the name and version from options
                            name: this.options.name,
                            version: this.options.version,
                            // sort our dependencies to make things cleaner
                            dependencies: sortedDependencies,
                            scripts: {
                                // the start script
                                [this.options.scriptExecName]:
                                    this.options.scriptExecCmd instanceof Function
                                        ? this.options.scriptExecCmd(compilation)
                                        : this.options.scriptExecCmd,
                            },
                        },
                        null,
                        2
                    );

                    const yarnOutput = stringify(yarnMap);

                    // add it through webpack assets
                    // eslint-disable-next-line no-param-reassign
                    assets[outputName] = {
                        source: () => output,
                        size: () => output.length,
                    };

                    // eslint-disable-next-line no-param-reassign
                    assets[yarnOutputName] = {
                        source: () => yarnOutput,
                        size: () => yarnOutput.length,
                    };
                }
            );
        });
    }
}

module.exports = WebpackPackagePlugin;
