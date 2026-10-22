import { Button, Card, Col, Form, Input, Row } from 'antd'
import AdminProfileInfoService from '../../../services/admin/profile/profileInfo'
import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

const Password = () => {
  const { access_token, success, warning, userId } = useOutletContext()

  const [form] = Form.useForm()
  const onFinish = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      const { _id, password, oldPassword } = values
      const doc = { oldPassword: oldPassword, newPassword: password }
      const updatePassword = await AdminProfileInfoService.updatePassword({
        doc,
        access_token,
      }).catch((error) => { })
      if (updatePassword) {
        success({ content: 'update success' })
        form.resetFields()
      } else {
        warning({ content: 'update unsuccess' })
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    form.setFieldsValue({ _id: userId })
  }, [userId])
  return (
    <>
      <Card
        title={<span className='text-gray-800 font-semibold'>Password</span>}
        className='shadow-md'
        extra={
          <>
            <Button type='primary' onClick={onFinish}>
              Update
            </Button>
          </>
        }
      >
        <Form
          form={form}
          name='basic'
          labelAlign='top'
          onFinish={onFinish}
          autoComplete='off'
        >
          <div>
            {/* ------------------------------ */}
            {/* ------your code here---------- */}
            {/* ------------------------------ */}
            <Form.Item
              hidden
              label='_id'
              name='_id'
              className='my-1 p-0'
              rules={[
                { required: true, message: 'field require' },
                {
                  min: 5,
                  message: 'Password must be at least 5 characters',
                },
              ]}
              labelCol={{ span: 24 }}
            >
              <Input placeholder='_id' />
            </Form.Item>
            <Row gutter={[8, 2]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  label={
                    <>
                      <span className='text-gray-600 font-medium'>
                        New Password
                      </span>
                    </>
                  }
                  name='password'
                  className='my-1 p-0'
                  rules={[
                    { required: true, message: 'field require' },
                    {
                      min: 5,
                      message: 'Password must be at least 5 characters',
                    },
                  ]}
                  labelCol={{ span: 24 }}
                >
                  <Input placeholder='password' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  label={
                    <>
                      <span className='text-gray-600 font-medium'>
                        Confirm New Password{' '}
                      </span>
                    </>
                  }
                  name='confirm_password'
                  className='my-1 p-0'
                  rules={[
                    {
                      required: true,
                      message: 'Please confirm your password',
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(
                          new Error('Passwords do not match!')
                        )
                      },
                    }),
                  ]}
                  labelCol={{ span: 24 }}
                >
                  <Input placeholder='confirm password' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  label={
                    <>
                      <span className='text-gray-600 font-medium'>
                        Old Password
                      </span>
                    </>
                  }
                  name='oldPassword'
                  className='my-1 p-0'
                  rules={[
                    { required: true, message: 'field require' },
                    {
                      min: 5,
                      message: 'Old Password must be at least 5 characters',
                    },
                  ]}
                  labelCol={{ span: 24 }}
                >
                  <Input placeholder='old password' />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      </Card>
    </>
  )
}
export default Password
