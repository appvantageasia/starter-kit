import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ResetPasswordPage from '../pages/login/ResetPasswordPage';
import SignInPage from '../pages/login/SignInPage';

const PublicRouter = () => {
    const location = useLocation();

    return (
        <Routes>
            <Route element={<SignInPage />} path="signIn" />
            <Route element={<ResetPasswordPage />} path="resetPassword" />
            <Route
                element={<Navigate state={{ nextPage: location.pathname }} to={{ pathname: '/private/signIn' }} />}
                path="*"
            />
        </Routes>
    );
};

export default PublicRouter;
