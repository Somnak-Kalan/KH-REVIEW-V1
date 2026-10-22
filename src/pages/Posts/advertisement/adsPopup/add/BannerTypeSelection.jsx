import React from 'react'
import { Col, Row, Radio } from 'antd'

const BannerTypeSelection = ({ bannerType, setBannerType, selectedChatBusiness }) => {
    return (
        <Row gutter={16}>
            <Col span={24}>
                <Radio.Group
                    className=""
                    style={{ width: '100%' }}
                    value={bannerType}
                    onChange={(e) => setBannerType(e.target.value)}
                >
                    <Radio
                        value="information_only"
                        className=""
                    >
                        Detail Only
                    </Radio>

                    {selectedChatBusiness && (
                        <Radio
                            value="chat_support"
                            className=""
                        >
                            Chat Support
                        </Radio>
                    )}

                    <Radio
                        value="custom_action"
                        className=""
                    >
                        Action Button
                    </Radio>
                </Radio.Group>
            </Col>
        </Row>
    )
}

export default BannerTypeSelection
