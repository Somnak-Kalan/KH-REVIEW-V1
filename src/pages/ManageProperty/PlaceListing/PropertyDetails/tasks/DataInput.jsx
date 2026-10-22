import React from 'react';

import {
    Avatar,
    Badge,
    Button,
    Input,
    Form,
} from 'antd'
import AvatarIcon from './AvatarIcon'
import {
    UserOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons'
const { TextArea } = Input
const DataInput = (props) => {
    const { form,
        setIsEditing,
        isEditing,
        draft, setDraft, postDraft,
        statusComment, handleCancel,
        editCommentId, replyTo, author,
        value,
        loadingSave,
        statusOptions,
        toggleStatus
    } = props
    return (
        <>
            <div className='px-8 mb-5  sticky z-40 -bottom-0 bg-white '>
                {isEditing ? (
                    <Form
                        form={form}
                        onFinish={postDraft}
                        initialValues={{ comment: value }}
                        className='mb-5'
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                            }}
                        >
                            <Badge>
                                <Avatar
                                    shape='square'
                                    src=''
                                    icon={<UserOutlined />}
                                    style={{
                                        marginRight: 12,
                                        width: 40,
                                        height: 35,
                                        marginTop: 0,
                                    }}
                                />
                            </Badge>
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        borderRadius: '5px',
                                        border: 'solid 1px rgb(223, 240, 255)',
                                        paddingRight: '0px',
                                    }}
                                >
                                    {replyTo && (
                                        <div
                                            style={{
                                                paddingRight: '0px',
                                                paddingLeft: '5px',
                                                paddingTop: '5px',
                                                borderRight: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: '#0069E2',
                                            }}
                                        >
                                            {author},
                                        </div>
                                    )}
                                    {editCommentId && (
                                        <div
                                            style={{
                                                paddingRight: '0px',
                                                paddingLeft: '5px',
                                                paddingTop: '5px',
                                                borderRight: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: '#0069E2',
                                            }}
                                        >
                                            {author},
                                        </div>
                                    )}

                                    <Form.Item
                                        name='comment'
                                        style={{ flex: 1, marginBottom: 0 }}
                                        rules={[
                                            { required: true, message: 'Please enter a comment' },
                                        ]}
                                    >
                                        <TextArea
                                            placeholder={
                                                replyTo
                                                    ? 'Write a reply...'
                                                    : editCommentId
                                                        ? 'Edit comment...'
                                                        : 'Type any comment'
                                            }
                                            autoSize={{ minRows: !value ? 1 : 3, maxRows: 6 }}
                                            style={{
                                                paddingLeft: '10px',
                                                border: 'none',
                                                outline: 'none',
                                                boxShadow: 'none',
                                                borderRadius: '6px',
                                                backgroundColor: 'transparent',
                                                transition: 'all 0.1s ease',
                                            }}
                                        />
                                    </Form.Item>
                                </div>
                                <div
                                    style={{
                                        marginTop: 8,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Button
                                        type='primary'
                                        loading={loadingSave}
                                        htmlType='submit'
                                    >
                                        {replyTo ? 'Reply' : editCommentId ? 'Save' : 'Send'}
                                    </Button>
                                    <Button
                                        style={{
                                            marginLeft: 8,
                                            color: '#686868',
                                            outline: 'none',
                                            border: 'none',
                                        }}
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>

                                    <div className='flex items-center space-x-4'>
                                        {statusOptions?.map((option) => (
                                            <div
                                                key={option.value}
                                                className='flex items-center cursor-pointer'
                                                onClick={() => toggleStatus(option.value)}
                                            >
                                                <CheckCircleOutlined
                                                    style={{
                                                        fontSize: 18,
                                                        marginRight: 6,
                                                        color:
                                                            statusComment === option.value
                                                                ? '#096DD9'
                                                                : '#BADAF6',
                                                    }}
                                                />
                                                <span>{option.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: 8,
                        }}
                    >
                        <Badge>
                            <Avatar
                                shape='square'
                                src=''
                                icon={<UserOutlined />}
                                style={{ marginRight: 12, width: 40, height: 40 }}
                            />
                        </Badge>
                        <Input.TextArea
                            placeholder='Type any comment'
                            autoComplete='off'
                            autoSize={{ minRows: !draft ? 1 : 3, maxRows: 6 }}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onPressEnter={postDraft}
                            onFocus={() => setIsEditing(true)}
                            style={{
                                flex: 1,
                                fontSize: 14,
                                padding: '6px 12px',
                                border: '1px solid #DFF0FF',
                                borderRadius: 8,
                            }}
                        />

                    </div>
                )}
            </div>
        </>
    );
};

export default DataInput;