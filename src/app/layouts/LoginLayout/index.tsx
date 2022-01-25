import { ReactElement, ReactNode } from 'react';
import styled from 'styled-components';
import ErrorBoundary from '../ErrorBoundary';

const Container = styled.div`
    padding: 20px;
    min-height: 100vh;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export type LoginLayoutProps = { children: JSX.Element | ReactNode | ReactElement };

const LoginLayout = ({ children }: LoginLayoutProps) => (
    <Container>
        <ErrorBoundary>{children}</ErrorBoundary>
    </Container>
);

export default LoginLayout;
