import { ReactElement } from 'react';
import BasicLayout from '../layouts/BasicLayout';
import DummyErrorPage from '../pages/DummyErrorPage';

const DummyErrorRoute = (): ReactElement => (
    <BasicLayout>
        <DummyErrorPage />
    </BasicLayout>
);

export default DummyErrorRoute;
