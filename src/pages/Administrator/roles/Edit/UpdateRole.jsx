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
  message,
  Row,
  Select,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  EditOutlined,
  HomeOutlined,
  SaveOutlined,
} from '@ant-design/icons'
//
import { AuthContext } from '../../../../contexts/AuthContext'
//
import CustomSelect from '../../../../components/config/Select'
import PermissionOptService from '../../../../services/options/admin/permission'
import UserOptService from '../../../../services/options/admin/user'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import AdminRoleServices from '../../../../services/admin/Role'
import Swal from 'sweetalert2'
import { PERMS } from '../../../../constants/permission/perms'

const AddRole = () => {
  const navigate = useNavigate()
  const { username, access_token, checkPermission } = useContext(AuthContext)
  const { collapsed, setDisplayEmitContent } = useOutletContext()
  const { id } = useParams()
  // check permission
  !checkPermission(PERMS.ROLE_LIST) && navigate('/administrator/role')
  // end check permission
  const [form] = Form.useForm()
  const [form_permission] = Form.useForm()
  const [permissions, setPermissions] = useState([])
  const [groupPermission, setGroupPermission] = useState([])
  const [checkPermission1, setCheckedPermissions] = useState([])
  const checkedPermissionsRef = useRef(checkPermission1)
  const [formattedOptions, setFormattedOptions] = useState([])
  const [initialPermissions, setInitialPermissions] = useState([])
  const [displayPermission, setDisplayPermission] = useState([])

  const [user, setUser] = useState()
  const [userOpt, setUserOpt] = useState()
  const [isEditing, setIsEditing] = useState(false)

  const success = ({ content }) => {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: content,
      timer: 2000,
      showConfirmButton: false,
    })
  }
  const shouldDisplayGroup = (element) => {
    const isSelected =
      Array.isArray(displayPermission) &&
      displayPermission.includes(element.value)

    const hasInitialPermission =
      element.children?.some((child) =>
        initialPermissions.includes(child.value)
      )

    return isSelected || hasInitialPermission
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

  const getUserById = async (id) => {
    try {
      const doc = { _id: id }
      const user = await AdminRoleServices.fetchRoleById({ doc, access_token })
      if (user) {
        setUser(user)
      }
    } catch { }
  }
  const getUserForRoleById = async (id) => {
    try {
      const doc = { _id: id }
      const user = await UserOptService.fetchUserForRoleById({
        doc,
        access_token,
      })
      if (user) {
        setUserOpt(user)
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
    getPermission()
  }, [])
  useEffect(() => {
    getUserById(id)
  }, [id])

  const Filter_Option = (input, option) => {
    if (!input || !option || !option.label) {
      return false
    }
    const normalizedInput = input.replace(/\s+/g, '').toLowerCase()
    const normalizedLabel = option.label.replace(/\s+/g, '').toLowerCase()
    return normalizedLabel.includes(normalizedInput)
  }

  const handleChangeModule = (selectedValues) => {
    const selectedOptions = formattedOptions.filter(opt =>
      selectedValues.includes(opt.value)
    )
    setPermissions(selectedOptions)
    setDisplayPermission(selectedOptions)
  }

  useEffect(() => {


    setDisplayPermission(formattedOptions)
  }, [formattedOptions])


  const onFinish = async () => {
    try {
      const values = await form.validateFields()
      const { _id, name, company, description } = values
      const doc = {
        _id,
        name,
        company,
        description,
        roles: checkedPermissionsRef?.current,
      }
      const role = await AdminRoleServices.updateRoleInfo({ doc, access_token })
      if (role) {
        success({ content: 'update success' })
        setIsEditing(false)
      } else {
        warning({ content: 'update unsuccess' })
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

  useEffect(() => {
    if (user && groupPermission) {

      getUserForRoleById(user?.userId)
      // Flatten permissions from group_permission into a hierarchical structure
      const allOptions = groupPermission.map((group) => ({
        label: group.title,
        value: group._id,
        children: group.permissions.map((permission) => ({
          label: permission.label,
          value: permission.value,
          detail: permission.detail,
        })),
      }))
      // Match user roles with available permissions
      const matchedRolesObj = user.roles?.reduce((acc, role) => {
        for (let group of allOptions) {
          const matchedPermission = group.children.find(
            (permission) => permission.value === role
          )

          if (matchedPermission) {
            acc.push({
              label: matchedPermission.label,
              permissionLabel: matchedPermission.label,
              value: matchedPermission.label,
            })
          }
        }
        return acc
      }, [])

      setFormattedOptions(allOptions)
      form.setFieldsValue({
        ...user,
        user,
        group_permission: allOptions,
      })
      if (user?.roles) {
        setCheckedPermissions(user.roles)
      }
    }
  }, [form, user, groupPermission])

  const handleBack = () => {
    navigate('/administrator/role')
    // setDisplayEmitContent()
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
            <>
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
            </>
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
                  <span className='text-gray-600 font-medium'>update role</span>
                ),
              },
            ]}
          />
        </div>
      </div>
    )
  }, [navigate, isEditing])


  // after fetching user
  useEffect(() => {
    if (user?.roles) {
      setCheckedPermissions(user.roles)
      setInitialPermissions(user.roles) // track API-fetched roles
    }
  }, [user])
  return (
    <>

      <Card>
        <Form
          form={form}
          name='basic'
          labelAlign='top'
          onFinishFailed={onFinishFailed}
          autoComplete='off'
        >
          <div>
            <Form.Item
              hidden
              className='my-1 p-0'
              label='_id'
              labelCol={{ span: 24 }}
              name='_id'
              rules={[{ required: true, message: 'field require' }]}
            >
              <Input placeholder='_id' disabled />
            </Form.Item>
            <Row gutter={[8, 2]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  label={
                    <span className='text-gray-600 font-medium'>User</span>
                  }
                  labelCol={{ span: 24 }}
                  className='my-1 p-0'
                  name='userId'
                  rules={[{ required: true, message: 'field require' }]}
                >
                  <CustomSelect
                    disabled={!isEditing}
                    showSearch
                    style={{ flex: 1, marginLeft: '0px' }}
                    placeholder='select staff code'
                    allowClear
                    options={userOpt}
                    filterOption={Filter_Option}
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
                  <Input placeholder='company' disabled={!isEditing} />
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
                  name='group_permission'
                >
                  {/* <Select
                    mode="multiple"
                    placeholder="select module"
                    options={formattedOptions}
                    value={permissions}
                    onChange={handleChangeModule}
                    disabled={!isEditing}
                  /> */}
                  <Select
                    mode="multiple"
                    placeholder="select module"
                    options={formattedOptions}
                    value={permissions.map(p => p.value)}  // pass only values
                    onChange={handleChangeModule}
                    disabled={!isEditing}
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
                  <Input placeholder='title' disabled={!isEditing} />
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
                  <TextArea
                    placeholder='description'
                    rows={4}
                    disabled={!isEditing}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
        {/* <Form
          form={form_permission}
          name='permissions'
          labelAlign='top'
          autoComplete='off'
          style={{ marginTop: '40px' }}
        >
          {formattedOptions &&
            formattedOptions.map((element) => (
              !element?.includes(displayPermission?.value) && (
                <>
                  <span key={`permission-${element?.value}`}>
                    <Divider orientation='left'>
                      <span className='text-gray-700 font-medium'>
                        {element?.label}
                      </span>
                    </Divider>
                    <Row gutter={[8, 2]}>
                      {element?.children?.map((child_element, index) => (
                        <Col
                          xs={24}
                          sm={24}
                          md={12}
                          lg={12}
                          xl={6}
                          key={`child-${element?.value}-${index}`}
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
                                disabled={initialPermissions?.includes(
                                  child_element?.value
                                )}
                                checked={checkPermission1?.includes(
                                  child_element?.value
                                )}
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
                </>
              )
            ))}
        </Form> */}

        <Form
          form={form_permission}
          name='permissions'
          labelAlign='top'
          autoComplete='off'
          style={{ marginTop: '40px' }}
        >

          {displayPermission &&
            displayPermission.map((element) => {
              // if (!displayPermission?.includes(element.value)) return null
              return (
                <span key={`permission-${element?.value}`}>
                  <Divider orientation='left'>
                    <span className='text-gray-700 font-medium'>
                      {element?.label}
                    </span>
                  </Divider>
                  <Row gutter={[8, 2]}>
                    {element?.children?.map((child_element, index) => (
                      <Col
                        xs={24}
                        sm={24}
                        md={12}
                        lg={12}
                        xl={6}
                        key={`child-${element?.value}-${index}`}
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
                              disabled={initialPermissions?.includes(
                                child_element?.value
                              )}
                              checked={checkPermission1?.includes(
                                child_element?.value
                              )}
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
              )
            })}
        </Form>

      </Card>
    </>
  )
}
export default AddRole
