import React, { useState } from 'react'
import { Col, Form, Input, Modal, Row, Button, Card, Upload } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { CloseOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'

import UploadVideoImage from './Upload'
const AddProvince = ({ open, setOpen }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState()

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setOpen(false)
        form.resetFields()
        setImageUrl(null)
      })
      .catch((info) => {
        console.log('Validation Failed:', info)
      })
  }

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
    setImageUrl(null) // Reset image preview
  }

  return (
    <Modal
      open={open}
      width={650}
      centered
      closable={false}
      onCancel={handleCancel}
      footer={
        <div
          style={{
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <Button
            type='primary'
            onClick={handleOk}
            style={{
              minWidth: '120px',
              borderRadius: '8px',
            }}
          >
            save
          </Button>
        </div>
      }
    >
      <Card
        title='Add Province'
        extra={
          <CloseOutlined
            style={{
              fontSize: '18px',
              color: 'red',
              cursor: 'pointer',
            }}
            onClick={handleCancel}
          />
        }
      >
        <Form form={form} layout='vertical' name='add_province'>
          <Row gutter={[8, 2]}>
            <Col xs={24} className='text-center'>
              <Form.Item label='Video&Image' name='video' className='m-0 p-0'>
                <UploadVideoImage />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label='Province Name (En)'
                name='name'
                className='m-0 p-0'
                rules={[{ required: true, message: 'file require!' }]}
              >
                <Input placeholder=' province name (en)' />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label='Province Name (Kh)'
                name='name'
                className='m-0 p-0'
                rules={[{ required: true, message: 'file require!' }]}
              >
                <Input placeholder=' province name (kh)' />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24}>
              <Form.Item label='Description' name='description'>
                <TextArea rows={4} placeholder='enter description' />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Modal>
  )
}

export default AddProvince
