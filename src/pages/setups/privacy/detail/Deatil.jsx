import React, { useContext, useEffect, useRef, useState } from 'react'
import { Col, Form, Row, Button, Card, Breadcrumb, Avatar, Divider } from 'antd'
import { HomeOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'

import EditCategory from '../Edit'
import { AuthContext } from '../../../../contexts/AuthContext'
import helpFunctions from '../../../../utils/helpFunctions'
import { PERMS } from '../../../../constants/permission/perms'
//  zustand store
import usePrivacyStore from '../../../../Stores/setups/privacy.store'

const PrivacyDetail = () => {
  const [form] = Form.useForm()
  const { access_token, checkPermission } = useContext(AuthContext)
  const { getFileImage } = helpFunctions

  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()
  const { id } = useParams()

  const [openEdit, setOpenEdit] = useState(false)
  const [groupType, setGroupType] = useState(null)

  //  store
  const { fetchPrivacyById, privacy, loading } = usePrivacyStore()

  // prevent refresh spam after edit close
  const refreshedAfterCloseRef = useRef(false)

  //CHECK PERMISSION
  useEffect(() => {
    if (!checkPermission(PERMS.PRIVACY_MANAGEMENT)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])

  if (!checkPermission(PERMS.PRIVACY_MANAGEMENT)) return null

  const handleBack = () => navigate('/privacy')
  useEffect(() => {
    if (!id) return

    // Check if the privacy data is already cached in the store
    if (!privacy || privacy?._id !== id) {
      // Fetch data only if it's not available in the cache
      fetchPrivacyById({ access_token, _id: id, force: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, access_token, fetchPrivacyById, privacy])
  //  Refetch only once after closing the edit modal (optional)
  useEffect(() => {
    if (openEdit) return
    if (!id) return
    if (refreshedAfterCloseRef.current) return
    // Refetch once after modal closes (if needed)
    fetchPrivacyById({ access_token, _id: id, force: false })
    refreshedAfterCloseRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEdit, access_token, id, fetchPrivacyById])

  //  header
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
              Privacy Detail
            </p>
          </div>
        </div>

        <Breadcrumb
          items={[
            {
              title: <HomeOutlined style={{ cursor: 'pointer' }} />,
              href: '/privacy',
            },
            {
              href: '/privacy',
              title: <span className='dark:text-slate-200'>Privacy</span>,
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

  const onEdit = () => setOpenEdit(true)


  //  optional refresh: ONLY once when modal closes (if you want latest)
  useEffect(() => {
    if (openEdit) return
    if (!id) return
    if (refreshedAfterCloseRef.current) return

    // when edit closes, refetch once (optional)
    // remove this block if you don't want refresh after close
    fetchPrivacyById({ access_token, _id: id, force: true })
    refreshedAfterCloseRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEdit])

  return (
    <>
      {openEdit ? (
        <EditCategory
          open={openEdit}
          setOpen={setOpenEdit}
          groupType={groupType}
          propData={privacy} //  pass store data to edit (no extra fetch)
          access_token={access_token}
          getFileImage={getFileImage}
        />
      ) : null}

      {/* Top Card */}
      <Card className='my-2 dark:bg-slate-900 dark:border-slate-700' loading={loading}>
        <div className='flex items-center w-full'>
          <div className='flex items-center'>
            <Avatar
              shape='square'
              size={40}
              src={privacy?.images?.find((img) => img?.includes('original'))}
              style={{ cursor: 'pointer', marginLeft: '10px' }}
            />
            <div className='mx-2'>
              <h2 className='font-bold text-2xl dark:text-white'>
                {privacy?.nameEn}
              </h2>
              <p className='text-sm text-gray-600 dark:text-slate-400'>
                {privacy?.nameKh}
              </p>
            </div>
          </div>

          <div className='ml-auto'>
            {checkPermission(PERMS.ASSIGNED_USER) ? (
              <Button
                disabled={!checkPermission(PERMS.ASSIGNED_USER)}
                onClick={onEdit}
                type='default'
                icon={<EditOutlined />}
              />
            ) : (
              ' '
            )}
          </div>
        </div>
      </Card>

      {/* About Card */}
      <Card className='my-2 dark:bg-slate-900 dark:border-slate-700'>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <div className='p-2'>
              <h2 className='text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white'>
                Description
              </h2>

              <Divider className='my-2 dark:border-slate-700' />

              <p className='text-gray-600 dark:text-slate-300'>
                {privacy?.description !== 'undefined' ? privacy?.description : ''}
              </p>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  )
}

export default PrivacyDetail
