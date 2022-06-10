import fs from 'fs';
import path from 'path';
import less from 'less';
import VariablesOutput from 'less-plugin-variables-output';
import { srcDirname } from '../webpack/variables';

const overrideLess = fs.readFileSync(path.join(srcDirname, 'app/antd.override.less'), 'utf8');

const source = `@import "antd/lib/style/themes/default.less";\n${overrideLess}`;

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
