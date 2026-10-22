import React, { useState } from 'react'
import { Col, Form, Input, Modal, Row, Button, Card, Upload } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { CloseOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'

const getBase64 = (img, callback) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}
const beforeUpload = (file) => {
  return true
}

const AddHashTags = ({ open, setOpen }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState()

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log('Form Values:', values)
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

  const handleChange = (info) => {
    getBase64(info.file.originFileObj, (url) => {
      setLoading(false)
      setImageUrl(url)
    })
    // }
  }

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )

  return (
    <Modal
      title='Add Hashtags'
      open={open}
      width={650}
      centered
      closable={true}
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
      <Card>
        <Form form={form} layout='vertical' name='add_hashtags'>
          <Row gutter={[8, 2]}>
            <Col xs={24}>
              <Form.Item
                label='Hashtags Name (En)'
                name='hastags_name_en'
                style={{ marginBottom: '0px' }}
                rules={[{ required: true, message: 'file require!' }]}
              >
                <Input placeholder='hashtags name (en)' />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label='Hashtags Name (Kh)'
                name='hastags_name_kh'
                style={{ marginBottom: '0px' }}
                // rules={[{ required: true, message: 'file require!' }]}
              >
                <Input placeholder='hashtags name (kh)' />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24}>
              <Form.Item label='Description' name='description'>
                <TextArea rows={4} placeholder='description' />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Modal>
  )
}

export default AddHashTags
