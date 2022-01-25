import { lazy } from '@loadable/component';
import { ErrorBoundary } from '@sentry/react';
import { Routes, Route } from 'react-router-dom';
import ExternalLinkPage from '../pages/ExternalLinkPage';

const PrivateRouter = lazy(() => import(/* webpackChunkName: "privateApplication" */ './PrivateRouter'));
const PublicRouter = lazy(() => import(/* webpackChunkName: "publicApplication" */ './PublicRouter'));

const MainRouter = () => (
    <ErrorBoundary>
        <Routes>
            <Route element={<PrivateRouter />} path="private/*" />
            <Route element={<ExternalLinkPage />} path="l/:id" />
            <Route element={<PublicRouter />} path="*" />
        </Routes>
    </ErrorBoundary>
);

export default MainRouter;
