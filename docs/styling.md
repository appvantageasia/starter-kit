# Ant Design & Styled Components

This project supports [Ant Design][antd] as well as [styled-components][styled].
Ant Design [LESS][less] variables can be overrided by definitions in `src/app/antd.override.less`

Ant Design variables are pushed into styled components theme (context) to re-used on runtime.
To do so, after doing changes on those variables, you must execute the command `yarn schema:style`.
The variables will be extracted to `src/app/antd-theme.json`.

However any changes on this override file will not trigger a rebuild,
it's required to manually restart the build/server to apply your changes.

[antd]: https://ant.design/
[less]: http://lesscss.org/
[styled]: https://styled-components.com/
