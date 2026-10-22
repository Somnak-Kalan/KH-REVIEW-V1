import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Checkbox,
  Divider,
  Breadcrumb,
  Button,
} from 'antd'
import {
  HomeOutlined,
  QuestionCircleOutlined,
  LoadingOutlined,
  SaveOutlined,
  EditOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import TextArea from 'antd/es/input/TextArea'
import { AuthContext } from '../../../contexts/AuthContext'
import PermissionOptService from '../../../services/options/admin/permission'
import ModuleServices from '../../../services/admin/module'
import Swal from 'sweetalert2'
import { PERMS } from '../../../constants/permission/perms'

const UpdateModule = () => {
  const navigate = useNavigate()
  const { collapsed, setDisplayEmitContent } = useOutletContext()
  const { username, access_token, checkPermission } = useContext(AuthContext)
  const { id } = useParams() // Extract the 'id' parameter from the URL
  // check permission
  !checkPermission(PERMS.MODULE_LIST) && navigate('/administrator/module')
  // end check permission
  const [form_module] = Form.useForm()
  const [form_permission] = Form.useForm()
  const [permission, setPermission] = useState([])
  const [checkedPermissions, setCheckedPermissions] = useState([]) // State to track checked permissions
  const [module, setModule] = useState()
  const [loading, setLoading] = useState(false)
  const checkedPermissionsRef = useRef(checkedPermissions)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    checkedPermissionsRef.current = checkedPermissions
  }, [checkedPermissions])

  // SweetAlert2 success & warning notifications
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
      const { _id, name, company, department, description } = values
      const doc = {
        _id: _id,
        name,
        company,
        department,
        description,
        roles: checkedPermissionsRef?.current,
      }
      ModuleServices.updateModule({ doc, access_token }).then((res) => {
        if (res) {
          success({ content: 'update success' })
          getModuleById(id)
          setIsEditing(false)
        }
      })
    } catch (error) {
      warning({ content: 'update unsuccess' })
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
  const getModuleById = async (id) => {
    try {
      const doc = { _id: id }
      const module = await ModuleServices.fetchModuleById({ doc, access_token })
      setModule(module)
    } catch (error) {
      console.error('Error fetching module:', error)
    }
  }

  useEffect(() => {
    getPermission()
  }, [])
  useEffect(() => {
    getModuleById(id)
  }, [id])

  // Handle checkbox state change
  const onChange = (e, permissionId) => {
    const { checked } = e.target
    setCheckedPermissions((prevState) =>
      checked
        ? [...prevState, permissionId]
        : prevState.filter((id) => id !== permissionId)
    )
  }

  useEffect(() => {
    form_module.setFieldsValue({
      ...module,
      module,
    })
    if (module?.roles) {
      setCheckedPermissions(module.roles)
    }
  }, [form_module, module])

  const handleBack = () => {
    navigate('/administrator/module')
  }

  // Update header buttons based on edit mode
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
          {isEditing ? (
            <div className='flex space-x-1'>
              <Button onClick={() => setIsEditing(false)}>
                <EditOutlined style={{ fontSize: '20px' }} />
                Cancel
              </Button>
              <Button
                type='primary'
                style={{ background: '#1677ff' }}
                className='cursor-pointer text-white'
                onClick={onFinish}
              >
                <SaveOutlined style={{ fontSize: '16px', color: 'white' }} />
                Update
              </Button>
            </div>
          ) : checkPermission(PERMS.ASSIGNED_USER) ? (
            <Button onClick={() => setIsEditing(true)}>
              <EditOutlined style={{ fontSize: '20px' }} />
              Edit
            </Button>
          ) : (
            ''
          )}
        </div>
        <div>
          <Breadcrumb
            items={[
              { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
              {
                title: (
                  <span className='text-gray-600 font-medium'>
                    update module
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    )
  }, [navigate, isEditing, setDisplayEmitContent])

  return (
    <>

      <Card>
        <Form
          form={form_module}
          name='basic'
          labelAlign='top'
          autoComplete='off'
        >
          <Form.Item
            hidden
            label='_id'
            name='_id'
            className='my-1 p-0'
            rules={[{ required: true, message: 'Field required' }]}
            labelCol={{ span: 24 }}
          >
            <Input placeholder='id' disabled={!isEditing} />
          </Form.Item>
          <Row gutter={[8, 2]}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={<span className='text-gray-600 font-medium'>Title</span>}
                name='name'
                className='my-1 p-0'
                rules={[{ required: true, message: 'Field required' }]}
                labelCol={{ span: 24 }}
              >
                <Input placeholder='title' disabled={!isEditing} />
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
                <Input placeholder='company' disabled={!isEditing} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-semibold'>
                    Department
                  </span>
                }
                name='department'
                className='my-1 p-0'
                rules={[{ required: true, message: 'Field required' }]}
                labelCol={{ span: 24 }}
              >
                <Input placeholder='department' disabled={!isEditing} />
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
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div className='py-2 text-sm font-semibold text-gray-700 border-b my-2'>
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
          {permission.map((parent) => (
            <div key={parent?._id}>
              <Divider orientation='left'>
                <span className='text-gray-700 font-semibold'>
                  {parent?.title}
                </span>
              </Divider>
              <Row>
                {parent?.permissions?.map((child) => (
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    xl={6}
                    key={child?.value}
                  >
                    <Checkbox
                      disabled={!isEditing}
                      checked={checkedPermissions.includes(child?.value)}
                      onChange={(e) => onChange(e, child?.value)}
                    >
                      {child?.label}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Form>
      </Card>
    </>
  )
}

export default UpdateModule
