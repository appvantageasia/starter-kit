const fs = require('fs');
const { builtinModules } = require('module');
const path = require('path');
const { uniq } = require('lodash/fp');
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
    packageFile: 'package.json',
    additionalModules: [],
    scriptExecName: 'start',
    scriptExecCmd: compilation => `node ${compilation.outputOptions.filename}`,
};

class WebpackPackagePlugin {
    constructor(options) {
        // merge default options and given options
        this.options = { ...defaultOptions, ...options };
        const { packageFile } = this.options;

        // get the package file content
        const packageFilename = packageFile.startsWith('/') ? packageFile : path.resolve(process.cwd(), packageFile);
        const packageContent = fs.readFileSync(packageFilename, 'utf8');

        // parse it and keep it there
        this.packageDependencies = JSON.parse(packageContent).dependencies;
    }

    apply(compiler) {
        const outputFolder = compiler.options.output.path;
        const outputFile = path.resolve(outputFolder, 'package.json');
        const outputName = path.relative(outputFolder, outputFile);

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

                    // sort dependencies for consistency
                    const sortedDependencies = uniq(externalPackages)
                        .sort()
                        .reduce((acc, key) => ({ ...acc, [key]: this.packageDependencies[key] }), {});

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

                    // add it through webpack assets
                    // eslint-disable-next-line no-param-reassign
                    assets[outputName] = {
                        source: () => output,
                        size: () => output.length,
                    };
                }
            );
        });
    }
}

module.exports = WebpackPackagePlugin;
