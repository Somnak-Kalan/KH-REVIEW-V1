import { Button, Col, Form, Input, Row, Select } from 'antd'
import { useEffect, useImperativeHandle, forwardRef, useState } from 'react'
import AdminUserServices from '../../../../services/admin/User'

const UserInfo = forwardRef((props, ref) => {
  const {
    user,
    access_token,
    success,
    warning,
    getUserById,
    isEditing,
    setIsEditing,
  } = props
  const [form] = Form.useForm()

  // Handle form submission
  const onFinish = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      const {
        _id,
        firstName,
        lastName,
        gender,
        staffCode,
        positionTitle,
        departmentTitle,
        status,
      } = values
      const doc = {
        _id,
        firstName,
        lastName,
        gender,
        staffCode,
        positionTitle,
        departmentTitle,
        status,
      }
      const updateUser = await AdminUserServices.updateUserInfo({
        doc,
        access_token,
      })
      if (updateUser) {
        getUserById(_id)
        success({ content: 'Update success' })
        setIsEditing(false)
      } else {
        warning({ content: 'Update unsuccess' })
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Expose onFinish to the parent via ref so it can be triggered externally.
  useImperativeHandle(ref, () => ({
    triggerSubmit: onFinish,
  }))

  // Set form values when user data is available
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        ...user,
      })
    }
  }, [user, form])

  return (
    <div className='bg-white my-5 rounded-lg overflow-hidden p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-xl font-semibold'>User Information</h3>
      </div>
      <Form form={form} name='user info'>
        <Form.Item
          hidden
          label='_id'
          name='_id'
          rules={[{ required: true, message: 'Field required' }]}
        >
          <Input placeholder='_id' disabled />
        </Form.Item>
        <Row gutter={[8, 2]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
            <Form.Item
              label={
                <span className='text-gray-600 font-medium'>Staff Code</span>
              }
              name='staffCode'
              rules={[{ required: true, message: 'Field required' }]}
              labelCol={{ span: 24 }}
            >
              <Input placeholder='Staff Code' disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
            <Form.Item
              label={
                <span className='text-gray-600 font-medium'>User Name</span>
              }
              name='username'
              rules={[{ required: true, message: 'Field required' }]}
              labelCol={{ span: 24 }}
            >
              <Input placeholder='Username' disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
            <Form.Item
              label={
                <span className='text-gray-600 font-medium'>First Name</span>
              }
              name='firstName'
              rules={[{ required: true, message: 'Field required' }]}
              labelCol={{ span: 24 }}
            >
              <Input placeholder='First Name' disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
            <Form.Item
              label={
                <span className='text-gray-600 font-medium'>Last Name</span>
              }
              name='lastName'
              rules={[{ required: true, message: 'Field required' }]}
              labelCol={{ span: 24 }}
            >
              <Input placeholder='Last Name' disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
            <Form.Item
              label={<span className='text-gray-600 font-medium'>Gender</span>}
              name='gender'
              rules={[{ required: true, message: 'Field required' }]}
              labelCol={{ span: 24 }}
            >
              <Select
                placeholder='Select Gender'
                allowClear
                disabled={!isEditing}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
            <Form.Item
              label={
                <span className='text-gray-600 font-medium'>Position</span>
              }
              name='positionTitle'
              rules={[{ required: true, message: 'Field required' }]}
              labelCol={{ span: 24 }}
            >
              <Input placeholder='Position' disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
            <Form.Item
              label={
                <span className='text-gray-600 font-medium'>Department</span>
              }
              name='departmentTitle'
              rules={[{ required: true, message: 'Field required' }]}
              labelCol={{ span: 24 }}
            >
              <Input placeholder='Department' disabled={!isEditing} />
            </Form.Item>
          </Col>
          <Col xxs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
            <Form.Item
              label={<span className='text-gray-600 font-medium'>Status</span>}
              name='status'
              rules={[{ required: true, message: 'Field required' }]}
              labelCol={{ span: 24 }}
            >
              <Select
                placeholder='Select Status'
                allowClear
                disabled={!isEditing}
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
})

export default UserInfo
