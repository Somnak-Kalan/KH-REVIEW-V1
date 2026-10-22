import React from 'react'
import { Modal } from 'antd'
import Main from './Main'
const ComponentName = ({ open, setOpen, previewData, access_token, fileEN, fileKH, language }) => {
    return (
        <Modal
            open={open}
            onCancel={setOpen}
            footer={null}
        >
            <Main previewData={previewData} access_token={access_token} fileEn={fileEN} fileKh={fileKH} language={language} />
        </Modal>
    )
}

export default ComponentName
