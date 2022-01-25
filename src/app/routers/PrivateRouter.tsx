import NoSSR from '../components/NoSSR';
import { useAccount } from '../components/contexts/AccountContextManager';
import LoginRouter from './LoginRouter';
import PrivateInnerRouter from './PrivateInnerRouter';

const PrivateRouter = () => {
    const user = useAccount();

    const children = !user ? (
        // user requires to be authenticated
        <LoginRouter />
    ) : (
        // move to the inner router
        <PrivateInnerRouter />
    );

    return <NoSSR>{children}</NoSSR>;
};

export default PrivateRouter;
