import React from 'react';
import { Form, Input, Button, Modal, Select, Tag, AutoComplete, Row, Col } from 'antd';


const Mention = (props) => {
    const { isHashtagModalVisible, handleHashtagModalCancel, form, handleHashtagModalOk, selectedHashtags, mockHashtags } = props
    return (
        <div> {/* Location Selection Modal */}
            <Modal
                title="Select Hashtags"
                open={isHashtagModalVisible}
                onCancel={handleHashtagModalCancel}
                footer={[
                    <Button key="back" onClick={handleHashtagModalCancel} className="rounded-md">
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => form.submit()} // Submit the form to trigger onFinish with selected hashtags
                        className="rounded-md bg-blue-600 hover:bg-blue-700"
                    >
                        Select
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    onFinish={handleHashtagModalOk}
                    initialValues={{ hashtags: selectedHashtags }}
                >
                    <Form.Item name="hashtags">
                        <Select
                            mode="multiple"
                            placeholder="Select hashtags"
                            className="w-full"
                            optionLabelProp="label"
                        >
                            {mockHashtags.map((tag) => (
                                <Option key={tag} value={tag} label={tag}>
                                    {tag}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
};

export default Mention;