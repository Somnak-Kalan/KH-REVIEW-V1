import React, { useEffect, useState } from 'react'
import { Col, Form, Input, Modal, Row, Button, Card } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import Swal from 'sweetalert2'

//  zustand store
import useActivityStore from '../../../../Stores/setups/activity.store'

const EditActivity = (props) => {
  const { open, setOpen, access_token, propData } = props
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const { updateActivity } = useActivityStore()

  const onFinish = async () => {
    setLoading(true)
    try {
      const value = await form.validateFields()

      const doc = {
        _id: value._id,
        nameEn: value.nameEn,
        nameKh: value.nameKh,
        description: value.description,
      }

      const res = await updateActivity({ access_token, doc })

      if (res) {
        setOpen(false)
        form.resetFields()

        Swal.fire({
          icon: 'success',
          title: 'Update Successful!',
          text: 'The information has been updated successfully.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed!',
        text: 'Something went wrong while updating.',
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

  //  Fill form from propData (NO API call)
  useEffect(() => {
    if (!propData?._id) return
    form.setFieldsValue({
      _id: propData?._id,
      nameEn: propData?.nameEn,
      nameKh: propData?.nameKh,
      description: propData?.description,
    })
  }, [propData, form])

  return (
    <Modal
      title='Edit Activity'
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
            style={{ minWidth: '120px', borderRadius: '8px' }}
          >
            update
          </Button>
        </div>
      }
    >
      <Card>
        <Form form={form} layout='vertical' name='edit_activity'>
          <Form.Item hidden name='_id'>
            <Input />
          </Form.Item>

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

export default EditActivity
