
import React from 'react';
import { Form, Input, Modal, Select, Tag, AutoComplete, Row, Col, Tabs } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';

const Mention = (props) => {
    const {
        isMentionModalVisible,
        setIsMentionModalVisible,
        mentionType,
        setMentionType,
        mentionSearchResults,
        mentionSearchTerm,
        handleSelectMention,
        setMentionSearchTerm,
        setMentionSearchResults,
    } = props;

    const mockUsers = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
    ];

    const mockPlaces = [
        { id: 1, name: 'Phnom Penh', description: 'Capital city of Cambodia' },
        { id: 2, name: 'Siem Reap', description: 'Famous for Angkor Wat' },
    ];

    const onHandleChangeMentionType = (key) => {
        setMentionType?.(key);
        setMentionSearchTerm('');
        setMentionSearchResults([]);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setMentionSearchTerm(value);

        if (mentionType === 'user') {
            setMentionSearchResults(
                mockUsers.filter((user) =>
                    user.name.toLowerCase().includes(value.toLowerCase())
                )
            );
        } else {
            setMentionSearchResults(
                mockPlaces.filter((place) =>
                    place.name.toLowerCase().includes(value.toLowerCase())
                )
            );
        }
    };

    const tabItems = [
        {
            label: 'User',
            key: 'user',
        },
        {
            label: 'Place',
            key: 'place',
        },
    ];

    return (
        <Modal
            title="Mention"
            open={isMentionModalVisible}
            onCancel={() => setIsMentionModalVisible(false)}
            footer={null}
            width={400}
        >
            <Tabs
                activeKey={mentionType}
                onChange={onHandleChangeMentionType}
                items={tabItems}
            />

            <Input
                placeholder={`Search ${mentionType === 'user' ? 'users' : 'places'}`}
                value={mentionSearchTerm}
                onChange={handleSearchChange}
                className="mb-4 rounded-md"
            />

            <div className="max-h-60 overflow-y-auto">
                {mentionSearchResults.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center p-3 mb-2 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                        onClick={() => handleSelectMention(item)}
                    >
                        {mentionType === 'user' ? (
                            <UserOutlined className="text-gray-500 mr-3 text-lg" />
                        ) : (
                            <EnvironmentOutlined className="text-gray-500 mr-3 text-lg" />
                        )}
                        <div>
                            <div className="font-medium text-gray-800">{item.name}</div>
                            {item.description && (
                                <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default Mention;
