import React, { useContext, useEffect, useRef, useState } from 'react'
import { Col, Row, Button, Card, Breadcrumb, Divider, Avatar } from 'antd'
import { HomeOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'

import EditType from '../Edit' // use EditType (not EditCategory)
import { AuthContext } from '../../../../contexts/AuthContext'
import helpFunctions from '../../../../utils/helpFunctions'
import { PERMS } from '../../../../constants/permission/perms'
import useTypeStore from '../../../../Stores/setups/type.store'

const TypeDetail = () => {
  const { access_token, checkPermission } = useContext(AuthContext)
  const { getFileImage } = helpFunctions
  const { id } = useParams()

  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()

  const { fetchTypeById, type, loading } = useTypeStore() // use loading

  const [openEdit, setOpenEdit] = useState(false)

  // CHECK PERMISSION
  useEffect(() => {
    if (!checkPermission(PERMS.TYPE_MANAGEMENT)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])

  if (!checkPermission(PERMS.TYPE_MANAGEMENT)) return null

  useEffect(() => {
    if (!id) return

    // Only call API if data isn't cached already
    fetchTypeById({ access_token, _id: id, force: false })
  }, [id, access_token, fetchTypeById])

  // Refresh only when edit closes (to avoid double request on mount)
  const prevOpenEdit = useRef(openEdit)
  useEffect(() => {
    if (prevOpenEdit.current === true && openEdit === false && id) {
      // Call the API only if edit is closed
      fetchTypeById({ access_token, _id: id, force: false })
    }
    prevOpenEdit.current = openEdit
  }, [id, access_token, fetchTypeById, openEdit])

  const handleBack = () => navigate('/type')

  // Header content
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-2'>
        <div className='font-semibold flex' style={{ color: '#495057' }}>
          <div className='flex items-center space-x-1' style={{ color: '#495057' }}>
            <Button
              style={{ width: '40px', color: 'red' }}
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            />
            <p>Type Detail</p>
          </div>
        </div>

        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} />, href: '/type' },
            { href: '/type', title: <span>Type</span> },
            { href: '', title: <span className='text-blue-500'>Detail</span> },
          ]}
        />
      </div>
    )
  }, [setDisplayEmitContent])

  return (
    <>
      {openEdit && (
        <EditType
          open={openEdit}
          setOpen={setOpenEdit}
          access_token={access_token}
          propData={type}
          getFileImage={getFileImage}
        />
      )}

      {/* Top Card */}
      <Card className='my-2' loading={loading}>
        <div className='flex items-center w-full'>
          <div className='flex items-center'>
            <Avatar
              shape='square'
              size={40}
              src={type?.images?.find((img) => img.includes('original'))}
              style={{ cursor: 'pointer' }}
            />
            <div className='mx-2'>
              <h2 className='font-bold text-2xl'>{type?.nameEn}</h2>
              <p className='text-sm text-gray-600'>{type?.nameKh}</p>
            </div>
          </div>

          <div className='ml-auto'>
            {checkPermission(PERMS.ASSIGNED_USER) ? (
              <Button icon={<EditOutlined />} size='small' onClick={() => setOpenEdit(true)} />
            ) : (
              ''
            )}
          </div>
        </div>
      </Card>

      {/* About Card */}
      <Card className='my-2' loading={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <div className='p-2'>
              <h2 className='text-lg font-bold flex items-center gap-2 text-gray-800'>
                Description
              </h2>
              <Divider className='my-2' />
              <p className='text-gray-600'>
                {type?.description !== 'undefined' ? type?.description : ''}
              </p>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  )
}

export default TypeDetail
