import { useLocation } from 'react-router-dom';
import LoginLayout from '../../../layouts/LoginLayout';
import ChangePassword from './ChangePassword';
import RequestNewPassword from './RequestNewPassword';

const ResetPasswordPage = () => {
    const state = useLocation().state as { token?: string };

    const element = state?.token ? <ChangePassword token={state?.token} /> : <RequestNewPassword />;

    return <LoginLayout>{element}</LoginLayout>;
};

export default ResetPasswordPage;
