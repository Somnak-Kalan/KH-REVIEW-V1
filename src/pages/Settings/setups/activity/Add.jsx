import React, { useState } from 'react'
import { Col, Form, Input, Modal, Row, Button, Card } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import Swal from 'sweetalert2'

//  use zustand store (not service)
import useActivityStore from '../../../../Stores/setups/activity.store'

const AddActivity = (props) => {
  const { open, setOpen, access_token } = props

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  //  store action
  const { createActivity } = useActivityStore()

  const onFinish = async () => {
    setLoading(true)
    try {
      const value = form.getFieldsValue()
      const doc = {
        nameEn: value.nameEn,
        nameKh: value.nameKh,
        description: value.description,
      }

      const res = await createActivity({ access_token, doc })

      if (res) {
        setOpen(false)
        form.resetFields()
        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: 'The information has been add successfully.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed!',
        text: 'Something went wrong while adding.',
        timer: 1500,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
  }

  return (
    <Modal
      title='Add Activity'
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
            onClick={onFinish}
            loading={loading}
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
        <Form form={form} layout='vertical' name='add_activity'>
          <Row gutter={[8, 2]}>
            <Col xs={24}>
              <Form.Item
                label='Activity En'
                name='nameEn'
                style={{ marginBottom: '0px' }}
                rules={[{ required: true, message: 'field require!' }]}
              >
                <Input placeholder='Enter activity en' />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label='Activity Kh'
                name='nameKh'
                style={{ marginBottom: '0px' }}
                rules={[{ required: true, message: 'field require!' }]}
              >
                <Input placeholder='Enter activity kh' />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label='Description' name='description'>
                <TextArea rows={4} placeholder='Enter description' />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Modal>
  )
}

export default AddActivity
