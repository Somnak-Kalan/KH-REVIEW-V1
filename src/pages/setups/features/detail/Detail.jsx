import React, { useContext, useEffect, useState } from 'react'
import { Col, Form, Row, Button, Card, Breadcrumb, Tabs, Divider } from 'antd'
import {
  HomeOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
  DoubleLeftOutlined,
  EditOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import {
  useNavigate,
  useOutletContext,
  useLocation,
  useParams,
} from 'react-router-dom'
import Locations from './Location'
//
import EditCategory from '../Edit'
import ActivityServices from '../../../../services/setup/Activity'
import { AuthContext } from '../../../../contexts/AuthContext'
import { PERMS } from '../../../../constants/permission/perms'
//

const TypeDetail = () => {
  const [form] = Form.useForm()
  const { collapsed, setDisplayEmitContent } = useOutletContext()
  const { access_token, checkPermission } = useContext(AuthContext)
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  //
  const [openEdit, setOpenEdit] = useState(false)
  const [activity, setActivity] = useState()
  // Update clickedKey based on current route
  //CHECK PERMISSION
  useEffect(() => {
    if (!checkPermission(PERMS.FEATURE_MANAGEMENT)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])
  if (!checkPermission(PERMS.FEATURE_MANAGEMENT)) {
    return null
  }
  //END CHECK PERMISSION
  const handleBack = () => {
    navigate('/feature')
  }
  const getActivityById = async (id) => {
    try {
      const doc = { _id: id }
      const res = await ActivityServices.fetchActivityById({
        access_token,
        doc,
      })
      if (res) {
        setActivity(res)
      }
    } catch {}
  }
  useEffect(() => {
    getActivityById(id)
  }, [id])
  useEffect(() => {
    if (openEdit === false) {
      getActivityById(id)
    }
  }, [openEdit])
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-2'>
        <div className='font-semibold flex' style={{ color: '#495057' }}>
          <p className=' flex items-center space-x-1 '>
            <Button
              icon={<ArrowLeftOutlined />}
              style={{ width: '40px', color: 'red' }}
              onClick={handleBack}
            ></Button>
            <p className=''>Feature Detail</p>
          </p>
        </div>
        <Breadcrumb
          items={[
            {
              title: <HomeOutlined style={{ cursor: 'pointer' }} />,
              href: '/feature',
            },
            {
              href: '/feature',
              title: <span>Feature</span>,
            },
            {
              href: '',
              title: <span className='text-blue-500'>Detail</span>,
            },
          ]}
        />
      </div>
    )
  }, [navigate, setDisplayEmitContent])
  //
  const onEdit = () => {
    setOpenEdit(true)
  }

  return (
    <>
      {/*  */}
      {openEdit === true ? (
        <EditCategory
          open={openEdit}
          setOpen={setOpenEdit}
          access_token={access_token}
          propData={activity}
        />
      ) : (
        ''
      )}
      {/*  */}
      {/* Top Card with Category title and image */}
      <Card className='my-2'>
        <div className='flex  items-center w-full '>
          <div className='flex items-center'>
            <div className='mx-2'>
              <h2 className='font-bold text-2xl'>{activity?.nameEn}</h2>
              <p className='text-sm text-gray-600'>{activity?.nameKh}</p>
            </div>
          </div>
          <div className='ml-auto'>
            {checkPermission(PERMS.ASSIGNED_USER) ? (
              <Button
                onClick={() => onEdit()}
                type='default'
                icon={<EditOutlined />}
              />
            ) : (
              ''
            )}
          </div>
        </div>
      </Card>
      {/* About Card */}
      <Card className='my-2'>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <div className='p-2'>
              <div className=''>
                <h2 className='text-lg font-bold flex items-center gap-2 text-gray-800 '>
                  Description
                </h2>
              </div>
              <Divider className='my-2' />
              <p className='text-gray-600'>{activity?.description}</p>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  )
}

export default TypeDetail
