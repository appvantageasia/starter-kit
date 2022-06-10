/* Webpack configuration proxied for cypress component testing */
import webpackConfigurations from './index';

// the second item (index 1) is the client configuration
export default webpackConfigurations[1];
