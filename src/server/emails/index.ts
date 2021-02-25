import DummyEmail from './DummyEmail';
import createSender from './createSender';

export const sendDummyEmail = createSender(DummyEmail);

export * from './transporters';
