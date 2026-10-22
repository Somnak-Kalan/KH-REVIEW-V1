import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Checkbox,
  Divider,
  Popover,
  Breadcrumb,
  message,
  Button,
} from 'antd'
import {
  HomeOutlined,
  QuestionCircleOutlined,
  LoadingOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { useNavigate, useOutletContext } from 'react-router-dom'
import TextArea from 'antd/es/input/TextArea'
import { AuthContext } from '../../../contexts/AuthContext'
import PermissionOptService from '../../../services/options/admin/permission'
import ModuleServices from '../../../services/admin/module'
import Swal from 'sweetalert2'
import { PERMS } from '../../../constants/permission/perms'

const AddModule = () => {
  const navigate = useNavigate()
  const { collapsed, setDisplayEmitContent } = useOutletContext()
  const { username, access_token, checkPermission } = useContext(AuthContext)
  //check permission
  useEffect(() => {
    if (!checkPermission(PERMS.ASSIGNED_USER)) {
      navigate('/administrator/module', { replace: true })
    }
  }, [checkPermission, navigate])
  if (!checkPermission(PERMS.ASSIGNED_USER)) {
    return null
  }
  // end check permission
  const [form_module] = Form.useForm()
  const [form_permission] = Form.useForm()
  const [permission, setPermission] = useState([])
  const [checkedPermissions, setCheckedPermissions] = useState([]) // State to track checked permissions

  const [loading, setLoading] = useState(false)
  const checkedPermissionsRef = useRef(checkedPermissions)
  useEffect(() => {
    checkedPermissionsRef.current = checkedPermissions
  }, [checkedPermissions])
  // Use SweetAlert2 for success/warning popups
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

  // Handle form submission
  const onFinish = async () => {
    try {
      // Module form validation
      await form_module.validateFields()
      const values = form_module.getFieldsValue()
      // Prepare data for submission
      const { name, company, department, description } = values
      const doc = {
        name,
        company,
        department,
        description,
        roles: checkedPermissionsRef?.current,
      }
      ModuleServices.createModule({ doc, access_token }).then((res) => {
        if (res) {
          form_module.resetFields()
          form_permission.resetFields()
          setCheckedPermissions([])
        }
      })
    } catch (error) {
      warning({ content: 'add unsuccess' })
    }
  }
  // Fetch permission data
  const getPermission = async () => {
    try {
      const res = await PermissionOptService.fetchPermission({ access_token })
      setPermission(res)
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  useEffect(() => {
    getPermission()
  }, [])

  // Handle checkbox state change
  const onChange = (e, permissionId) => {
    const { checked } = e.target
    setCheckedPermissions((prevState) => {
      if (checked) {
        return [...prevState, permissionId]
      } else {
        return prevState.filter((id) => id !== permissionId)
      }
    })
  }

  const handleBack = () => {
    navigate('/administrator/module')
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
                title: (
                  <span className='text-gray-600 font-medium '>add module</span>
                ),
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
          form={form_module}
          name='basic'
          labelAlign='top'
          autoComplete='off'
        >
          <Row gutter={[8, 2]}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={<span className='text-gray-600 font-medium'>Title</span>}
                name='name'
                className='my-1 p-0'
                rules={[{ required: true, message: 'Field required' }]}
                labelCol={{ span: 24 }}
              >
                <Input placeholder='title' />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-medium'>Company</span>
                }
                name='company'
                className='my-1 p-0'
                rules={[{ required: true, message: 'Field required' }]}
                labelCol={{ span: 24 }}
              >
                <Input placeholder='company' />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-medium'>Department</span>
                }
                name='department'
                className='my-1 p-0'
                rules={[{ required: true, message: 'Field required' }]}
                labelCol={{ span: 24 }}
              >
                <Input placeholder='department' />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-medium'>Description</span>
                }
                name='description'
                className='my-1 p-0'
                rules={[{ required: true, message: 'Field required' }]}
                labelCol={{ span: 24 }}
              >
                <TextArea
                  placeholder='description'
                  rows={4}
                  suffix={loading ? <LoadingOutlined spin /> : ''}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div className='py-5 text-gray-700 font-semibold text-sm border-b my-5'>
          <span className='m-0 p-0'>Permissions</span>
        </div>
        {/* Permission Form */}
        <Form
          form={form_permission}
          name='permissions'
          labelAlign='top'
          autoComplete='off'
          style={{ marginTop: '40px' }}
        >
          {permission &&
            permission.map((element) => (
              <span key={element?._id}>
                <Divider orientation='left'>
                  <span className='text-gray-700 font-semibold'>
                    {element?.title}
                  </span>
                </Divider>
                <Row gutter={[8, 2]}>
                  {element?.permissions?.map((child_element) => (
                    <Col
                      xs={24}
                      sm={24}
                      md={12}
                      lg={12}
                      xl={6}
                      key={child_element?.value}
                    >
                      <Form.Item
                        className='my-1 p-0'
                        labelAlign='left'
                        style={{ display: 'flex', alignItems: 'center' }}
                        valuePropName='checked'
                        name={child_element?.value}
                      >
                        <div>
                          <Checkbox
                            onChange={(e) => onChange(e, child_element?.value)}
                          >
                            {child_element?.label}
                          </Checkbox>
                          <Popover
                            placement='topLeft'
                            content={child_element?.detail}
                          >
                            <QuestionCircleOutlined className='cursor-pointer' />
                          </Popover>
                        </div>
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              </span>
            ))}
        </Form>
      </Card>
    </>
  )
}

export default AddModule
