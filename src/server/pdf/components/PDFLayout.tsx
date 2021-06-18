import { ReactNode } from 'react';

export type PDFLayoutProps = {
    children: JSX.Element | ReactNode;
};

const PDFLayout = ({ children }: PDFLayoutProps) => <div>{children}</div>;

export default PDFLayout;
