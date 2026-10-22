import { Button, Card, Col, Form, Input, Row, Select, Skeleton } from 'antd'
import { useEffect, useState } from 'react'
import { EditOutlined } from '@ant-design/icons'
import AdminRoleServices from '../../../services/admin/Role'
import AdminProfileInfoService from '../../../services/admin/profile/profileInfo'
import { useOutletContext } from 'react-router-dom'

const ProfileInfo = () => {
  const { profileInfo, access_token, success, warning } = useOutletContext()
  const [form] = Form.useForm()
  const [role, setRole] = useState()
  const [isEditing, setIsEditing] = useState(false) // State to manage edit mode
  const [loading, setLoading] = useState(true)
  const [block, setBlock] = useState(true)

  const toggleEditMode = () => {
    setIsEditing(!isEditing)
  }

  const onFinish = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      const {
        firstName,
        lastName,
        gender,
        positionTitle,
        departmentTitle,
        staffCode,
      } = values

      const doc = {
        firstName,
        lastName,
        gender,
        positionTitle,
        departmentTitle,
        staffCode,
      }
      const updatePassword = await AdminProfileInfoService.updateProfileInfo({
        doc,
        access_token,
      }).catch((error) => { })
      if (updatePassword) {
        success({ content: 'Update success' })
      } else {
        warning({ content: 'Update unsuccessful' })
      }
      setIsEditing(false)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (profileInfo) {
      setLoading(false)
      form.setFieldsValue({
        ...profileInfo,
        profileInfo,
      })
    } else {
      setLoading(false)
    }
  }, [profileInfo])

  useEffect(() => {
    if (role?.company) {
      form.setFieldsValue({
        company: role.company,
      })
    }
  }, [role])

  const noneEditElement = (info) => {
    return (
      <p
        style={{
          borderBottom: '1px solid #d9d9d9  ',
          // color: ' #495057 ',
        }}
        className='rounded py-1 font-medium text-gray-500 '
      >
        {' '}
        <span className='mx-3'>{info}</span>
      </p>
    )
  }
  return (
    <>
      <Card
        title={
          <span className='text-gray-800 font-semibold'>Profile Info</span>
        }
        className='shadow-md'
        extra={
          <>
            {isEditing ? (
              <>
                <Button onClick={toggleEditMode} className='mx-1'>
                  Cancel
                </Button>
                <Button type='primary' onClick={onFinish} className='mx-1'>
                  Update
                </Button>
              </>
            ) : (
              <EditOutlined
                onClick={toggleEditMode}
                style={{ fontSize: '16px', cursor: 'pointer' }}
              />
            )}
          </>
        }
      >
        <Form form={form} layout='vertical'>
          <Row gutter={[8, 2]}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-medium'>Staff Code </span>
                }
                rules={[{ required: true, message: 'Field required' }]}
                name='staffCode'
                className=''
              >
                {loading ? (
                  <Skeleton.Input active style={{ width: '160%' }} />
                ) : isEditing ? (
                  <Input placeholder='staff code' />
                ) : (
                  <>{noneEditElement(profileInfo?.staffCode)}</>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-medium'>Username </span>
                }
                name='username'
                className=' '
              >
                {loading ? (
                  <Skeleton.Input active style={{ width: '160%' }} />
                ) : isEditing ? (
                  <Input disabled placeholder='username' />
                ) : (
                  <>{noneEditElement(profileInfo?.username)}</>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-medium '>
                    First Name{' '}
                  </span>
                }
                name='firstName'
                rules={[{ required: true, message: 'Field required' }]}
                className=' '
              >
                {loading ? (
                  <Skeleton.Input active style={{ width: '160%' }} />
                ) : isEditing ? (
                  <Input placeholder='first name' />
                ) : (
                  <>{noneEditElement(profileInfo?.firstName)}</>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-medium '>Last Name</span>
                }
                name='lastName'
                rules={[{ required: true, message: 'Field required' }]}
                className='  '
              >
                {loading ? (
                  <Skeleton.Input active style={{ width: '160%' }} />
                ) : isEditing ? (
                  <Input placeholder='last name' />
                ) : (
                  <>{noneEditElement(profileInfo?.lastName)}</>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-medium '>Gender</span>
                }
                name='gender'
                rules={[{ required: true, message: 'Field required' }]}
                className='  '
              >
                {loading ? (
                  <Skeleton.Input active style={{ width: '160%' }} />
                ) : isEditing ? (
                  <Select
                    placeholder='select gender'
                    options={[
                      { label: 'Male', value: 'Male' },
                      { label: 'Female', value: 'Female' },
                    ]}
                  />
                ) : (
                  <>{noneEditElement(profileInfo?.gender)}</>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-medium  '>
                    Department
                  </span>
                }
                name='departmentTitle'
                className=' '
              >
                {loading ? (
                  <Skeleton.Input active style={{ width: '160%' }} />
                ) : isEditing ? (
                  <Input placeholder='department' />
                ) : (
                  <>{noneEditElement(profileInfo?.departmentTitle)}</>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                label={
                  <span className='text-gray-600 font-medium '>Position</span>
                }
                name='positionTitle'
                className=' '
              >
                {loading ? (
                  <Skeleton.Input active style={{ width: '160%' }} />
                ) : isEditing ? (
                  <Input placeholder='position' />
                ) : (
                  <>{noneEditElement(profileInfo?.positionTitle)}</>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </>
  )
}
export default ProfileInfo
