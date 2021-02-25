import antd from './antd-theme.json';

export type Theme = {
    readonly antd: typeof antd;
};

const theme = { antd };

export default theme;
