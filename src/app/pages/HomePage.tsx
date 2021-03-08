import { Card } from 'antd';
import LatestTopics from '../components/LatestTopics';
import WelcomeAlert from '../components/WelcomeAlert';
import { withErrorBoundary } from '../layouts/RoutedErrorBoundary';

const HomePage = () => (
    <>
        <WelcomeAlert />
        <Card>
            <LatestTopics />
        </Card>
    </>
);

export default withErrorBoundary(HomePage);
