import { Switch, Route } from 'react-router-dom';
import { withErrorBoundary } from './layouts/RoutedErrorBoundary';
import DummyErrorRoute from './routes/DummyErrorRoute';
import HomeRoute from './routes/HomeRoute';
import InternalErrorRoute from './routes/InternalErrorRoute';
import NotFoundRoute from './routes/NotFoundRoute';

const MainRouter = () => (
    <Switch>
        <Route component={HomeRoute} path="/" exact />
        <Route component={DummyErrorRoute} path="/dummyError" exact />
        <Route component={InternalErrorRoute} path="/500" exact />l
        <Route component={NotFoundRoute} />
    </Switch>
);

export default withErrorBoundary(MainRouter);
