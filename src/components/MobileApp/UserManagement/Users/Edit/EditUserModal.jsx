import React, { useEffect, useContext } from 'react'
import { Modal, Form, Input, Row, Col, Select, DatePicker, Upload, Avatar, Button } from 'antd'
import { CameraOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const getValidDayjs = (value) => {
    if (!value || value === '-' || value === 'Invalid Date') return null
    const d = dayjs(value)
    return d.isValid() ? d : null
}

export default function EditUserModal({ open, user, onCancel, onSave, userNameExisting }) {
    const [form] = Form.useForm()

    useEffect(() => {
        if (!open) return

        form.setFieldsValue({
            username: user?.fullName || '',
            nickname: user?.nickname || '',
            phone: user?.phone || '',
            email: user?.email === '-' ? '' : user?.email || '',
            gender: user?.gender && user?.gender !== '-' ? user.gender : 'Male',
            dob: getValidDayjs(user?.dob),
            location: user?.location === '-' ? '' : user?.location || '',
            bio: user?.bio === '-' ? '' : user?.bio || '',
        })
    }, [open, user, form])

    const handleOk = async () => {
        const values = await form.validateFields()

        onSave?.({
            ...values,
            dob:
                values?.dob && dayjs(values.dob).isValid()
                    ? values.dob.format('YYYY-MM-DD')
                    : null,
        })
    }

    return (
        <Modal
            open={open}
            title="Edit User Information"
            onCancel={onCancel}
            onOk={handleOk}
            width={900}
            okText="Save Change"
            cancelText="Cancel"
            okButtonProps={{ className: 'rounded-lg' }}
            cancelButtonProps={{ className: 'rounded-lg' }}
        >
            <div className="flex gap-6">
                {/* left avatar */}
                <div className="pt-2">
                    <div className="relative w-fit">
                        <Avatar size={64} src={user?.avatar} />
                        <div className="absolute -bottom-1 -right-1">
                            <Upload showUploadList={false}>
                                <Button
                                    size="small"
                                    shape="circle"
                                    icon={<CameraOutlined />}
                                />
                            </Upload>
                        </div>
                    </div>
                </div>

                {/* form */}
                <div className="flex-1">
                    <Form form={form} layout="vertical">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Username"
                                    name="username"
                                    rules={[{ required: true, message: 'Please input username' }]}
                                >
                                    <Input placeholder="Username" />
                                </Form.Item>

                                {userNameExisting ? (
                                    <div className="text-red-500 text-xs -mt-4 mb-2">
                                        {userNameExisting}
                                    </div>
                                ) : null}
                            </Col>

                            <Col span={12}>
                                <Form.Item label="Nickname" name="nickname">
                                    <Input placeholder="Add Nickname" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item label="Phone" name="phone">
                                    <Input placeholder="+855 ..." />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item label="Email" name="email">
                                    <Input placeholder="email@example.com" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item label="Gender" name="gender">
                                    <Select
                                        options={[
                                            { value: 'Male', label: 'Male' },
                                            { value: 'Female', label: 'Female' },
                                            { value: 'Other', label: 'Other' },
                                        ]}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item label="Date of birth" name="dob">
                                    <DatePicker className="w-full" format="DD MMM, YYYY" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item label="Location" name="location">
                                    <Input placeholder="Phnom Penh" />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item label="Bio" name="bio">
                                    <Input.TextArea rows={3} placeholder="Write bio..." />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
        </Modal>
    )
}