import { Col, Form, Input, Row } from 'antd'
import { useEffect, useImperativeHandle, forwardRef } from 'react'
import AdminUserServices from '../../../../services/admin/User'

const UpdatePassword = forwardRef((props, ref) => {
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

  const onFinish = async () => {

    try {

      await form.validateFields()


      const values = form.getFieldsValue()


      const doc = {

        _id: values._id,

        password: values.update_password

      }



      await AdminUserServices.updatePassword({

        doc,

        access_token

      })



      await getUserById(values._id)



      success({

        content: 'Update success'

      })



      form.resetFields()

      setIsEditing(false)



    } catch (error) {


      console.log(
        "UPDATE PASSWORD ERROR:",
        error.response?.data || error
      )


      warning({

        content:

          error.response?.data?.message ||

          'Update not success'

      })


    }

  }

  useImperativeHandle(ref, () => ({
    triggerSubmit: onFinish,
  }))

  useEffect(() => {

    if (user) {

      form.setFieldsValue({

        _id: user._id

      })

    }

  }, [user])

  return (
    <div className='bg-white my-5 rounded-lg overflow-hidden'>
      <Form
        form={form}
        name='basic'
        labelAlign='top'
        onFinish={onFinish}
        autoComplete='off'
      >
        <Form.Item
          hidden
          label='_id'
          name='_id'
          rules={[{ required: true, message: 'Field required' }]}
          labelCol={{ span: 24 }}
        >
          <Input placeholder='_id' />
        </Form.Item>
        {/* New Password & Confirm New Password Fields */}
        <Row gutter={[8, 2]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={8}>
            <Form.Item
              label={
                <span className='text-gray-600 font-medium'>New Password</span>
              }
              name='update_password'
              rules={[
                { required: true, message: 'Field required' },
                { min: 5, message: 'Password must be at least 5 characters' },
              ]}
              labelCol={{ span: 24 }}
              className='my-1 p-0'
            >
              {!isEditing ? (
                <Input placeholder={'••••••••'} disabled type='password' />
              ) : (
                <Input placeholder='New Password' type='password' />
              )}
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={8}>
            <Form.Item
              label={
                <span className='text-gray-600 font-medium'>
                  Confirm New Password
                </span>
              }
              name='confirm_password'
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('update_password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match!'))
                  },
                }),
              ]}
              labelCol={{ span: 24 }}
              className='my-1 p-0'
            >
              {!isEditing ? (
                <Input placeholder={'••••••••'} disabled type='password' />
              ) : (
                <Input placeholder='Confirm New Password' type='password' />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
})

export default UpdatePassword
