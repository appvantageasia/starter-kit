import { withErrorBoundary } from '../layouts/RoutedErrorBoundary';

const DummyErrorPage = () => {
    throw new Error('Ups');
};

export default withErrorBoundary(DummyErrorPage);
