import React, { useEffect, useState } from 'react'
import {
  Col,
  Form,
  Input,
  Modal,
  Row,
  Button,
  Card,
  Upload,
  Select,
} from 'antd'
import { CloseOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import ActivityServices from '../../../services/setup/Activity'
import Swal from 'sweetalert2'
const Edit = (props) => {
  const { open, setOpen, access_token, propData } = props
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activity, setActivity] = useState()
  const groupType = [
    { _id: 'g1', nameEn: 'Admin', nameKh: 'អ្នកគ្រប់គ្រង' },
    { _id: 'g2', nameEn: 'Manager', nameKh: 'អ្នកគ្រប់គ្រងក្រុម' },
    { _id: 'g3', nameEn: 'Staff', nameKh: 'បុគ្គលិក' },
    { _id: 'g4', nameEn: 'Customer', nameKh: 'អតិថិជន' },
  ]
  const onFinish = async () => {
    setLoading(true)
    try {
      const value = form.getFieldValue()
      const doc = {
        _id: value._id,
        nameEn: value.nameEn,
        nameKh: value.nameKh,
        description: value.description,
      }
      const res = await ActivityServices.updateActivity({ access_token, doc })
      if (res) {
        setOpen(false)
        setLoading(false)
        form.resetFields()

        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: 'The information has been add successfully.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch {
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  //
  const getActivityById = async (id) => {
    try {
      const doc = { _id: id }
      const res = await ActivityServices.fetchActivityById({
        access_token,
        doc,
      })
      if (res) {
        setActivity(res)
      }
    } catch {}
  }
  useEffect(() => {
    getActivityById(propData?._id)
  }, [propData])
  //
  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
  }
  useEffect(() => {
    form.setFieldsValue({
      _id: activity?._id,
      nameEn: activity?.nameEn,
      nameKh: activity?.nameKh,
      description: activity?.description,
    })
  }, [activity])
  return (
    <Modal
      open={open}
      width={650}
      title='Update Feature'
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
            update
          </Button>
        </div>
      }
    >
      <Card>
        <Form form={form} layout='vertical' name='edit_feature'>
          <Form.Item hidden name='_id'>
            <Input />
          </Form.Item>
          <Row gutter={[8, 2]}>
            <Col xs={24}>
              <Form.Item
                label='Feature En'
                name='nameEn'
                style={{ marginBottom: '0px' }}
                rules={[
                  {
                    required: true,
                    message: 'field require!',
                  },
                ]}
              >
                <Input placeholder='Enter Feature en' />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label='Feature Kh'
                name='nameKh'
                style={{ marginBottom: '0px' }}
                rules={[
                  {
                    required: true,
                    message: 'field require!',
                  },
                ]}
              >
                <Input placeholder='Enter Feature kh' />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label='Group Type'
                name='groupType'
                style={{ marginBottom: '0px' }}
                rules={[
                  {
                    required: true,
                    message: 'field require!',
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder='Select a group type'
                  allowClear
                  options={groupType.map((type) => ({
                    label: `${type.nameEn} (${type.nameKh})`,
                    value: type._id,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Modal>
  )
}

export default Edit
