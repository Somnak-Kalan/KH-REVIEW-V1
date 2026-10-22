import React, { useContext, useEffect, useState } from 'react'
import { Col, Form, Row, Button, Card, Breadcrumb, Divider } from 'antd'
import { HomeOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import EditCategory from '../Edit'
import { AuthContext } from '../../../../../contexts/AuthContext'
import { PERMS } from '../../../../../constants/permission/perms'

// use zustand store
import useActivityStore from '../../../../../Stores/setups/activity.store'

const TypeDetail = () => {
  const [form] = Form.useForm()
  const { setDisplayEmitContent } = useOutletContext()
  const { access_token, checkPermission } = useContext(AuthContext)
  const { id } = useParams()
  const navigate = useNavigate()

  const [openEdit, setOpenEdit] = useState(false)

  // store
  const { fetchActivityById, activity, loading } = useActivityStore()

  // CHECK PERMISSION
  useEffect(() => {
    if (!checkPermission(PERMS.ACTIVITY_MANAGEMENT)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])

  if (!checkPermission(PERMS.ACTIVITY_MANAGEMENT)) return null

  const handleBack = () => navigate('/activity')

  //  fetch ONLY when id changes (no refetch on openEdit)
  useEffect(() => {
    if (!id) return
    fetchActivityById({ access_token, _id: id, force: false }) //  use cache if already loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-2'>
        <div className='font-semibold flex'>
          <div className='flex items-center space-x-1'>
            <Button
              style={{ width: '40px', color: 'red' }}
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            />
            <p className='dark:text-slate-200' style={{ color: '#495057' }}>
              Activity Detail
            </p>
          </div>
        </div>
        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} />, href: '/activity' },
            { href: '/activity', title: <span className='dark:text-slate-200'>Activity</span> },
            { href: '', title: <span className='text-blue-500'>Detail</span> },
          ]}
        />
      </div>
    )
  }, [navigate, setDisplayEmitContent])

  const onEdit = () => setOpenEdit(true)

  return (
    <>
      {/*  Edit modal uses propData only (no fetch inside Edit) */}
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

      <Card className='my-2 dark:bg-slate-900 dark:border-slate-700' loading={loading}>
        <div className='flex items-center w-full'>
          <div className='flex items-center'>
            <div className='mx-2'>
              <h2 className='font-bold text-2xl dark:text-white'>{activity?.nameEn}</h2>
              <p className='text-sm text-gray-600 dark:text-slate-400'>{activity?.nameKh}</p>
            </div>
          </div>

          <div className='ml-auto'>
            {checkPermission(PERMS.ASSIGNED_USER) ? (
              <Button
                icon={<EditOutlined />}
                size='small'
                style={{ marginRight: 8 }}
                onClick={onEdit}
              />
            ) : (
              ''
            )}
          </div>
        </div>
      </Card>

      <Card className='my-2 dark:bg-slate-900 dark:border-slate-700' loading={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <div className='p-2'>
              <h2 className='text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white'>
                Description
              </h2>
              <Divider className='my-2 dark:border-slate-700' />
              <p className='text-gray-600 dark:text-slate-300'>{activity?.description}</p>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  )
}

export default TypeDetail
