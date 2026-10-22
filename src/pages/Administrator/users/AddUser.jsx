import React, { useContext, useEffect, useState } from 'react'
import {
  Breadcrumb,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  message,
  Row,
  Select,
  Popconfirm,
  Button,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { useContent } from '../../../contexts/ContentContext'
import { useOutletContext, useNavigate } from 'react-router-dom'
import ModuleOptService from '../../../services/options/admin/module'
import { AuthContext } from '../../../contexts/AuthContext'
import AdminUserServices from '../../../services/admin/User'
import PermissionOptService from '../../../services/options/admin/permission'
import Swal from 'sweetalert2'
import { PERMS } from '../../../constants/permission/perms'

const AddUser = () => {
  const navigate = useNavigate()
  const { username, access_token, checkPermission } = useContext(AuthContext)

  //check permission
  useEffect(() => {
    if (!checkPermission(PERMS.ASSIGNED_USER)) {
      navigate('/administrator/user', { replace: true })
    }
  }, [checkPermission, navigate])
  if (!checkPermission(PERMS.ASSIGNED_USER)) {
    return null
  }
  // end check permission
  const { content, setContent } = useContent()
  const { collapsed, setDisplayEmitContent } = useOutletContext()
  const [form] = Form.useForm()
  const [moduleOtp, setModuleOtp] = useState([])
  const [moduleLoading, setModuleLoading] = useState(true)
  const [staffCodeEntered, setStaffCodeEntered] = useState(false)
  const [permissions, setPermissions] = useState([])

  const success = ({ content }) => {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: content,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const warning = ({ content }) => {
    Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: content,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const getModuleOpt = async () => {
    try {
      const moduleOpt = await ModuleOptService.fetchModule({ access_token })
      if (moduleOpt) {
        setModuleLoading(false)
        setModuleOtp(moduleOpt)
      }
    } catch (error) {
      console.error('Error fetching module options:', error)
    }
  }

  useEffect(() => {
    getModuleOpt()
  }, [])

  const getPermissionByModule = async (moduleId) => {
    try {
      const doc = { moduleId }
      const permissions = await PermissionOptService.fetchPermissionByModule({
        doc,
        access_token,
      })
      if (permissions) {
        setPermissions(permissions)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  const onHandleChangeModule = (data) => {
    getPermissionByModule(data)
  }

  const onFinish = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()

      const {
        staffCode,
        firstName,
        lastName,
        username,
        gender,
        positionTitle,
        departmentTitle,
        moduleId,
        status,
        password,
      } = values
      const doc = {
        staffCode,
        firstName,
        lastName,
        username,
        gender,
        positionTitle,
        departmentTitle,
        moduleId,
        status,
        password,
      }
      const add_user = await AdminUserServices.createUser({ doc, access_token })
      if (add_user) {
        success({ content: 'User added successfully' })
        form.resetFields()
      } else {
        warning({ content: 'User creation unsuccessful' })
      }
    } catch (error) {
      console.log('Validation Error:', error)
    }
  }

  const handleStaffCodeChange = (value) => {
    setStaffCodeEntered(value !== '')
  }

  const handleBack = () => {
    navigate('/administrator/user')
  }
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-2'>
        <div className='flex space-x-1'>
          <Button
            type='primary'
            style={{ background: '#1677ff' }}
            icon={<ArrowLeftOutlined style={{ color: 'white' }} />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            type='primary'
            style={{ background: '#1677ff' }}
            className='cursor-pointer text-white'
            onClick={() => onFinish()}
          >
            <SaveOutlined style={{ fontSize: '16px', color: 'white' }} />
            Save
          </Button>
        </div>
        <div>
          <Breadcrumb
            items={[
              { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
              {
                title: <span className='text-gray-600 font-medium'> user</span>,
              },
            ]}
          />
        </div>
      </div>
    )
  }, [navigate])

  return (
    <>

      <Card>
        <Form
          form={form}
          name='basic'
          labelAlign='top'
          onFinish={onFinish}
          autoComplete='off'
        >
          <div>
            <Row gutter={[8, 2]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>
                      Staff Code
                    </span>
                  }
                  name='staffCode'
                  className='my-1 p-0'
                  rules={[{ required: true, message: 'Field required' }]}
                  labelCol={{ span: 24 }}
                >
                  <Input
                    placeholder='Staff code'
                    onChange={(e) => handleStaffCodeChange(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>
                      First Name
                    </span>
                  }
                  name='firstName'
                  className='my-1 p-0'
                  rules={[{ required: true, message: 'Field required' }]}
                  labelCol={{ span: 24 }}
                >
                  <Input placeholder='First name' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>Last Name</span>
                  }
                  name='lastName'
                  className='my-1 p-0'
                  rules={[{ required: true, message: 'Field required' }]}
                  labelCol={{ span: 24 }}
                >
                  <Input placeholder='Last name' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>User Name</span>
                  }
                  name='username'
                  className='my-1 p-0'
                  rules={[{ required: true, message: 'Field required' }]}
                  labelCol={{ span: 24 }}
                >
                  <Input placeholder='Username' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>Gender</span>
                  }
                  name='gender'
                  className='my-1 p-0'
                  rules={[{ required: true, message: 'Field required' }]}
                  labelCol={{ span: 24 }}
                >
                  <Select
                    placeholder='Select gender'
                    options={[
                      { label: 'Male', value: 'Male' },
                      { label: 'Female', value: 'Female' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>Position</span>
                  }
                  name='positionTitle'
                  className='my-1 p-0'
                  rules={[{ required: true, message: 'Field required' }]}
                  labelCol={{ span: 24 }}
                >
                  <Input placeholder='Position' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>
                      Department
                    </span>
                  }
                  name='departmentTitle'
                  className='my-1 p-0'
                  rules={[{ required: true, message: 'Field required' }]}
                  labelCol={{ span: 24 }}
                >
                  <Input placeholder='Department' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                <Form.Item
                  className='my-1 p-0'
                  label={
                    <span className='text-gray-600 font-medium'>Module</span>
                  }
                  labelCol={{ span: 24 }}
                  name='moduleId'
                >
                  <Select
                    mode='multiple'
                    placeholder='Select module'
                    onChange={onHandleChangeModule}
                    options={moduleOtp}
                    loading={moduleLoading}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>Status</span>
                  }
                  name='status'
                  className='my-1 p-0'
                  rules={[{ required: true, message: 'Field required' }]}
                  labelCol={{ span: 24 }}
                >
                  <Select
                    placeholder='Select status'
                    options={[
                      { label: 'Active', value: 'Active' },
                      { label: 'Inactive', value: 'Inactive' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>Password</span>
                  }
                  name='password'
                  className='my-1 p-0'
                  rules={[
                    { required: true, message: 'Field required' },
                    {
                      min: 5,
                      message: 'Password must be at least 5 characters',
                    },
                  ]}
                  labelCol={{ span: 24 }}
                >
                  <Input placeholder='Password' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={8}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>
                      Confirm Password
                    </span>
                  }
                  name='confirm_password'
                  className='my-1 p-0'
                  rules={[
                    { required: true, message: 'Please confirm your password' },
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
                  <Input placeholder='Confirm Password' />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
        <div className='my-2'>
          <div className='text-sm text-gray-700 font-semibold border-b'>
            <span>Permissions</span>
          </div>
        </div>
        <Card>
          <div>
            {permissions && permissions.length > 0 ? (
              permissions.map((module) => (
                <span key={module._id}>
                  <Divider orientation='left'>{module.name}</Divider>
                  <Row gutter={[8, 2]}>
                    {module.permissions.map((permission) => (
                      <Col
                        key={permission}
                        xs={24}
                        sm={10}
                        md={12}
                        lg={8}
                        xl={8}
                        xxl={8}
                      >
                        <span className='mx-1'>
                          <CheckCircleOutlined style={{ color: 'blue' }} />
                        </span>
                        <span className='mx-1'>{permission}</span>
                      </Col>
                    ))}
                  </Row>
                </span>
              ))
            ) : (
              <Empty description='No permission available' />
            )}
          </div>
        </Card>
      </Card>
    </>
  )
}

export default AddUser
