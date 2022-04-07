import MainRunner from './devRuner';

if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'development';
}

new MainRunner().start();
