import antd from './antd-theme.json';

export type Theme = {
    readonly antd: typeof antd;

    verticalSpacing: string;
};

const theme: Theme = {
    antd,
    verticalSpacing: '20px',
};

export default theme;
