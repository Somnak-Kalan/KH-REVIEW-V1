import { CheckCircleOutlined } from '@ant-design/icons'
import { Card, Checkbox, Col, Divider, Form, Input, Row, Select } from 'antd'
import PermissionOptService from '../../../../services/options/admin/permission'
import ModuleOptService from '../../../../services/options/admin/module'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import AdminUserServices from '../../../../services/admin/User'

const Permission = forwardRef((props, ref) => {
  const {
    user,
    access_token,
    success,
    warning,
    getUserById,
    isEditing,
    setIsEditing,
  } = props
  const [modules, setModules] = useState([])
  const [permissions, setPermissions] = useState([])
  const [form] = Form.useForm()
  const [module, setModule] = useState([])
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin'))

  const getModule = async () => {
    try {
      const modulesRes = await ModuleOptService.fetchModule({ access_token })
      if (modulesRes) {
        setModules(modulesRes)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getPermissionByModule = async (moduleId) => {
    try {
      const doc = { moduleId }
      const permissionsRes = await PermissionOptService.fetchPermissionByModule(
        {
          doc,
          access_token,
        }
      )
      if (permissionsRes) {
        setPermissions(permissionsRes)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getModule()
  }, [access_token])

  const onFinish = async () => {
    try {
      const values = await form.validateFields()
      const { _id, isAdmin } = values
      const doc = { _id, moduleId: module, isAdmin }
      const permissionUpdate = await AdminUserServices.updatePermission({
        doc,
        access_token,
      })
      if (permissionUpdate) {
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

  useImperativeHandle(ref, () => ({
    triggerSubmit: onFinish,
  }))

  const onHandleChangeModule = (data) => {
    getPermissionByModule(data)
    setModule(data)
  }

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        ...user,
      })
      // load permissions based on user's module
      getPermissionByModule(user?.moduleId)
      setModule(user?.moduleId)
    }
  }, [user, form, access_token])

  return (
    <div className='bg-white my-5 rounded-lg overflow-hidden'>
      <div>
        <Form form={form} name='permission' onFinish={onFinish}>
          <Form.Item hidden label='_id' name='_id'>
            <Input />
          </Form.Item>
          <Row gutter={[8, 2]}>
            <Col xs={24} sm={24} xl={12}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-medium'>Module</span>
                }
                name='moduleId'
                labelCol={{ span: 24 }}
              >
                <Select
                  onChange={onHandleChangeModule}
                  mode='multiple'
                  placeholder='select module'
                  options={modules}
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                name='isAdmin'
                valuePropName='checked'
              >
                <Checkbox
                  disabled={!isEditing || isAdmin === 'false'}
                  className='text-gray-600 font-medium'
                >
                  isAdmin
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <div className='my-2'>
          <div className='text-sm text-gray-700 font-semibold border-b'>
            <span className='py-2'>Permissions</span>
          </div>
        </div>

        <Card>
          <div>
            {permissions &&
              permissions.map((moduleItem) => (
                <span key={moduleItem._id}>
                  <Divider orientation='left'>
                    <span className='text-gray-700 font-medium'>
                      {moduleItem.name}
                    </span>
                  </Divider>
                  <Row gutter={[8, 2]}>
                    {moduleItem.permissions.map((perm) => (
                      <Col
                        key={perm}
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
                        <span className='mx-1'>{perm}</span>
                      </Col>
                    ))}
                  </Row>
                </span>
              ))}
          </div>
        </Card>
      </div>
    </div>
  )
})

export default Permission
