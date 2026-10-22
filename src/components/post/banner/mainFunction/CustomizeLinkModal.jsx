import React from 'react'
import { Modal, Form, Input } from 'antd'

const CustomizeLinkModal = ({
    currentLinkType,
    isCustomizeModalVisible,
    handleCustomizeOk,
    handleCustomizeCancel,
    customLinkName,
    setCustomLinkName,
}) => {
    return (
        <Modal
            title={`Customize ${currentLinkType === 'app' ? 'App' : 'Website'} Link Name`}
            open={isCustomizeModalVisible}
            onOk={handleCustomizeOk}
            onCancel={handleCustomizeCancel}
        >
            <Form.Item label="Custom Name">
                <Input
                    value={customLinkName}
                    onChange={(e) => setCustomLinkName(e.target.value)}
                    placeholder={`Enter custom name for the ${currentLinkType} link`}
                />
            </Form.Item>
        </Modal>
    )
}

export default CustomizeLinkModal
