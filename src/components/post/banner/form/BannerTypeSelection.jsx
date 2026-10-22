import React from 'react'
import { Col, Row, Radio, Form } from 'antd'

const BannerTypeSelection = ({ bannerType, setBannerType, form, selectedChatBusiness }) => {
    return (
        <Row gutter={16}>
            <Col span={24}>
                <Form form={form}>

                    <Form.Item
                        name="actionType"
                        rules={[{ required: true, message: 'Please select a banner type!' }]}
                    >
                        <Radio.Group
                            className=""
                            style={{ width: '100%' }}
                            value={bannerType}
                            onChange={(e) => setBannerType(e.target.value)}
                        >
                            <Radio
                                value="DetailOnly"
                                className=""
                            >
                                Detail Only
                            </Radio>

                            {selectedChatBusiness && (
                                <Radio
                                    value="Chat Support"
                                    className=""
                                >
                                    Chat Support
                                </Radio>
                            )}

                            <Radio
                                value="ActionButton"
                                className=""
                            >
                                Action Button
                            </Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    )
}

export default BannerTypeSelection

