import { Card, CardProps } from 'antd';

import styled from 'styled-components';

export type LoginContentProps = Pick<CardProps, 'children' | 'title'>;

const Container = styled.div`
    width: 400px;
`;

const LoginContent = (props: LoginContentProps) => (
    <Container>
        <Card {...props} />
    </Container>
);

export default LoginContent;
