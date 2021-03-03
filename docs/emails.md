# Email

Email templating is based on [mjml] framework to generate the proper HTML.
The generation is not based on template files but on react component using server side rendering feature to get
mjml code out which is then piped to mjml to retrieve the final html.

[mjml-react] is used to provide react components matching mjml tags.
Emails are transported with the help of [nodemailer].
All emails are grouped in the `emails` directory.

[nodemailer]: https://nodemailer.com/about/
[mjml-react]: https://github.com/wix-incubator/mjml-react
[mjml]: https://mjml.io/

## Example

Let's create a dummy email for example purposes which would be `src/server/emails/DummyEmails.tsx`.

```tsx
import { MjmlText } from 'mjml-react';
import EmailLayout from './components/EmailLayout';

// property for the highest component
export type DummyEmailProps = { text: string };

const DummyEmail = ({ text }: DummyEmailProps) => (
    <EmailLayout>
        <MjmlText color="#F45E43" font-family="helvetica">
            {text}
        </MjmlText>
    </EmailLayout>
);

export default DummyEmail;
```

Then update the entry point for emails which is `src/server/emails/index.ts`

```typescript
// import your new email
import DummyEmail from './DummyEmail';
// this helper will create a wrap the rendering and sending
import createSender from './createSender';

// create and export an instance for your email
export const sendDummyEmail = createSender(DummyEmail);
```

You may now send the email with the following way

```typescript
const myFunction = async () => {
    // do something...

    await sendDummyEmail({
        // you may look into nodemailer to understand the arguments/options
        subject: 'test',
        to: 'noreply@appvantage.co',
        // data is the proeprties to give to the react component
        data: { text: message.value },
    });

    // do something...
};
```
