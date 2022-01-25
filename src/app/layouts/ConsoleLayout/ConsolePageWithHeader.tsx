import { PageHeaderWrapper, PageContainerProps } from '@ant-design/pro-layout';
import { PropsWithChildren } from 'react';

export type PageWithHeaderProps = Omit<PropsWithChildren<PageContainerProps>, 'breadcrumb' | 'breadcrumbRender'>;

const ConsolePageWithHeader = (props: PageWithHeaderProps) => <PageHeaderWrapper {...props} breadcrumb={null} />;

export default ConsolePageWithHeader;
