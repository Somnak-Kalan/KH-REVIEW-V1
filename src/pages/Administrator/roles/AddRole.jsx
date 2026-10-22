import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Popconfirm,
  Empty,
  message,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  SaveOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
//
import { AuthContext } from '../../../contexts/AuthContext'
// import GroupBtn from 'components/GroupBtn'
//
import CustomSelect from '../../../components/config/Select'
import PermissionOptService from '../../../services/options/admin/permission'
import UserOptService from '../../../services/options/admin/user'
import { useNavigate, useOutletContext } from 'react-router-dom'
import AdminRoleServices from '../../../services/admin/Role'
import Swal from 'sweetalert2'
import { PERMS } from '../../../constants/permission/perms'

const AddRole = () => {
  //
  const { username, access_token, checkPermission } = useContext(AuthContext)
  const { collapsed, setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()

  //check permission
  useEffect(() => {
    if (!checkPermission(PERMS.ASSIGNED_USER)) {
      navigate('/administrator/role', { replace: true })
    }
  }, [checkPermission, navigate])
  if (!checkPermission(PERMS.ASSIGNED_USER)) {
    return null
  }
  // end check permission
  //
  const [form] = Form.useForm()
  const [form_permission] = Form.useForm()
  const [users, setUser] = useState([])
  const [permissions, setPermissions] = useState([])
  const [groupPermission, setGroupPermission] = useState([])
  const [checkPermission1, setCheckedPermissions] = useState([])
  const checkedPermissionsRef = useRef(checkPermission1)
  //
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
  //
  const getUser = async () => {
    try {
      const user = await UserOptService.fetchUserForRole({ access_token })
      if (user) {
        setUser(user)
      }
    } catch { }
  }

  const getPermission = async () => {
    try {
      const permissions = await PermissionOptService.fetchPermission({
        access_token,
      })
      setGroupPermission(permissions)
    } catch { }
  }
  useEffect(() => {
    getUser()
    getPermission()
  }, [])

  const Filter_Option = (input, option) => {
    if (!input || !option || !option.label) {
      return false
    }
    const normalizedInput = input.replace(/\s+/g, '').toLowerCase()
    const normalizedLabel = option.label.replace(/\s+/g, '').toLowerCase()
    return normalizedLabel.includes(normalizedInput)
  }
  //
  const group_permission = groupPermission?.map((item) => ({
    value: item._id,
    label: item.title,
    permissions: item?.permissions,
  }))
  //

  const handleChangeModule = (e, group) => {
    setPermissions(group)
  }
  const onFinish = async () => {
    try {
      const values = await form.validateFields()
      const { userId, name, company, description } = values
      const doc = {
        userId,
        name,
        company,
        description,
        roles: checkedPermissionsRef?.current,
      }
      const role = await AdminRoleServices.createRole({ doc, access_token })
      if (role) {
        success({ content: 'add success' })
        form.resetFields()
        form_permission.resetFields()
      } else {
        warning({ content: 'add unsuccess' })
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    checkedPermissionsRef.current = checkPermission1
  }, [checkPermission1])
  const onFinishFailed = () => { }
  const onChangePermission = (e, permissionId) => {
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
    navigate('/administrator/role')
    // setDisplayEmitContent()
  }
  //
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
                title: <span className='text-gray-600 font-medium'>Role</span>,
              },
            ]}
          />
        </div>
      </div>
    )
  }, [navigate])
  //

  return (
    <>

      <Card>
        <Form
          form={form}
          name='basic'
          labelAlign='top'
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete='off'
        >
          <div>
            {/* ------------------------------ */}
            {/* ------your code here---------- */}
            {/* ------------------------------ */}
            <Row gutter={[8, 2]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>
                      Staff Code
                    </span>
                  }
                  labelCol={{ span: 24 }}
                  className='my-1 p-0'
                  name='userId'
                  rules={[{ required: true, message: 'field require' }]}
                >
                  <CustomSelect
                    showSearch
                    style={{
                      flex: 1,
                      marginLeft: '0px',
                    }}
                    placeholder='select staff code'
                    allowClear
                    options={users}
                    filterOption={Filter_Option}
                    dropdownRender={(menu) => <div>{menu}</div>}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  className='my-1 p-0'
                  label={
                    <span className='text-gray-600 font-medium'>Company</span>
                  }
                  labelCol={{ span: 24 }}
                  name='company'
                  rules={[{ required: true, message: 'field require' }]}
                >
                  <Input placeholder='company' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  className='my-1 p-0'
                  label={
                    <span className='text-gray-600 font-medium'>
                      Group Permission
                    </span>
                  }
                  labelCol={{ span: 24 }}
                  name='Group Permission'
                >
                  <Select
                    onChange={(e, group) => handleChangeModule(e, group)}
                    mode='multiple'
                    placeholder='select module'
                    options={group_permission}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>Title</span>
                  }
                  name='name'
                  className='my-1 p-0'
                  rules={[{ required: true, message: 'field require' }]}
                  labelCol={{ span: 24 }}
                >
                  <Input placeholder='title' />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>
                      Description
                    </span>
                  }
                  name='description'
                  className='my-1 p-0'
                  labelCol={{ span: 24 }}
                >
                  <TextArea placeholder='description' rows={4} />
                </Form.Item>
              </Col>
            </Row>
            {/* ------------------------------ */}
            {/* ------end your code here---------- */}
            {/* ------------------------------ */}
          </div>
        </Form>
        <Form
          form={form_permission}
          name='permissions'
          labelAlign='top'
          autoComplete='off'
          style={{ marginTop: '40px' }}
        >
          {permissions &&
            permissions.map((element) => (
              <span key={`permission-${element?.value}`}>
                <Divider orientation='left'>
                  <span className='text-gray-700 font-semibold'>
                    {element?.label}
                  </span>
                </Divider>
                <Row gutter={[8, 2]}>
                  {element?.permissions?.map((child_element, index) => (
                    <Col
                      key={`child-${element?.value}-${index}`}
                      xs={24}
                      sm={24}
                      md={12}
                      lg={12}
                      xl={6}
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
                            onChange={(e) =>
                              onChangePermission(e, child_element?.value)
                            }
                          >
                            {child_element?.label}
                          </Checkbox>
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
export default AddRole
