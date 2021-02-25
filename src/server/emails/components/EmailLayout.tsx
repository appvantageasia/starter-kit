import { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlText } from 'mjml-react';
import { ReactNode, ReactElement } from 'react';

export type EmailLayoutProps = { children: ReactNode | ReactElement };

const EmailLayout = ({ children }: EmailLayoutProps): ReactElement => (
    <Mjml>
        <MjmlBody background-color="#f4f4f4">
            <MjmlSection>
                <MjmlColumn background-color="#fff" border-radius="5px" padding="10px 0 10px 0">
                    {children}
                </MjmlColumn>
            </MjmlSection>
            <MjmlSection padding="0">
                <MjmlColumn>
                    <MjmlText align="center" color="gray" font-family="helvetica">
                        Dummy Application.co
                    </MjmlText>
                </MjmlColumn>
            </MjmlSection>
        </MjmlBody>
    </Mjml>
);

export default EmailLayout;
