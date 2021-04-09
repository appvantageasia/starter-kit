import { MjmlText } from 'mjml-react';
import EmailLayout from './components/EmailLayout';

export type DummyEmailProps = {
    text: string;
};

const DummyEmail = ({ text }: DummyEmailProps) => (
    <EmailLayout>
        <MjmlText color="#F45E43" font-family="helvetica">
            {text}
        </MjmlText>
    </EmailLayout>
);

export default DummyEmail;
