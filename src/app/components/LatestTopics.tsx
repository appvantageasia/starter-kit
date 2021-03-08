import { List, Skeleton, Empty, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useGetTopicsQuery } from '../api';

const LatestTopics = () => {
    const { t } = useTranslation(['topic']);

    // get latest topics
    const { data, loading } = useGetTopicsQuery({
        variables: {
            pagination: { offset: 0, limit: 5 },
        },
        nextFetchPolicy: 'cache-and-network',
    });

    const noTopics = !data?.topics?.length;

    if (!loading && noTopics) {
        return (
            <Empty description={t('topic:noTopicYet')}>
                <Button type="primary">{t('topic:createFirstTopic')}</Button>
            </Empty>
        );
    }

    if (noTopics) {
        return null;
    }

    return (
        <List
            dataSource={data.topics}
            renderItem={topic => (
                <List.Item>
                    <Skeleton title={false}>
                        <List.Item.Meta
                            description={t('topic:previewDescription', {
                                author: topic.author.displayName,
                                replies: topic.messagesCount,
                            })}
                            title={<a href="https://ant.design">{topic.title}</a>}
                        />
                    </Skeleton>
                </List.Item>
            )}
        />
    );
};

export default LatestTopics;
