import { ReactElement } from 'react';
import BasicLayout from '../layouts/BasicLayout';
import HomePage from '../pages/HomePage';

const HomeRoute = (): ReactElement => (
    <BasicLayout>
        <HomePage />
    </BasicLayout>
);

export default HomeRoute;
