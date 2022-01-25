import BasicLayout from '../../layouts/BasicLayout';

const DummyErrorComponent = () => {
    throw new Error('Ups');
};

const DummyErrorPage = () => (
    <BasicLayout>
        <DummyErrorComponent />
    </BasicLayout>
);

export default DummyErrorPage;
