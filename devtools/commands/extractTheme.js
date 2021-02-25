const fs = require('fs');
const path = require('path');
const less = require('less');
const VariablesOutput = require('less-plugin-variables-output');
const { srcDirname } = require('../webpack/variables');

const overrideLess = fs.readFileSync(path.join(srcDirname, 'app/antd.override.less'), 'utf8');

const source = `@import "antd/lib/style/themes/index.less";\n${overrideLess}`;

less.render(source, {
    javascriptEnabled: true,
    plugins: [
        new VariablesOutput({
            filename: path.join(srcDirname, 'app/antd-theme.json'),
        }),
    ],
})
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
