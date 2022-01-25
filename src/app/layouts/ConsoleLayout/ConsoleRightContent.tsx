import { Avatar, Space, Dropdown } from 'antd';
import styled from 'styled-components';
import { useAccount } from '../../components/contexts/AccountContextManager';
import ConsoleAvatarMenu from './ConsoleAvatarMenu';

const avatarStyle = { color: '#f56a00', backgroundColor: '#fde3cf' };

const Action = styled.div`
    display: flex;
    align-items: center;
    height: 48px;
    padding: 0 12px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        background: rgba(0, 0, 0, 0.025);
    }

    &:global(.opened) {
        background: rgba(0, 0, 0, 0.025);
    }
`;

const ConsoleRightContent = () => {
    const user = useAccount(true);

    return (
        <Space>
            <Dropdown overlay={<ConsoleAvatarMenu />}>
                <Action>
                    <Avatar alt="avatar" size="small" style={avatarStyle}>
                        {user.displayName[0].toUpperCase()}
                    </Avatar>
                </Action>
            </Dropdown>
        </Space>
    );
};

export default ConsoleRightContent;
