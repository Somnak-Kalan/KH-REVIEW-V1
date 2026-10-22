import React, { useContext, useEffect, useRef, useState } from 'react'
import { Col, Form, Row, Button, Card, Breadcrumb, Avatar, Divider } from 'antd'
import { HomeOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'

import EditCategory from '../Edit'
import { AuthContext } from '../../../../contexts/AuthContext'
import helpFunctions from '../../../../utils/helpFunctions'
import { PERMS } from '../../../../constants/permission/perms'

//  zustand store
import useAmenityStore from '../../../../Stores/setups/amenity.store'

const AmenityDetail = () => {
  const [form] = Form.useForm()
  const { access_token, checkPermission } = useContext(AuthContext)
  const { getFileImage } = helpFunctions

  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()
  const { id } = useParams()

  const [openEdit, setOpenEdit] = useState(false)
  //  store
  const { fetchAmenityById, amenity, loading } = useAmenityStore()
  //CHECK PERMISSION
  useEffect(() => {
    if (!checkPermission(PERMS.AMENITY_MANAGEMENT)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])

  if (!checkPermission(PERMS.AMENITY_MANAGEMENT)) return null

  const handleBack = () => navigate('/amenity')

  //  fetch detail ONCE when id changes
  useEffect(() => {
    if (!id) return

    // Check if amenity is already cached
    if (!amenity || amenity?._id !== id) {
      // Fetch the amenity data only if it is not in the cache
      fetchAmenityById({ access_token, _id: id, force: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, access_token, amenity])

  // Header breadcrumb
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
              Amenity Detail
            </p>
          </div>
        </div>

        <Breadcrumb
          items={[
            {
              title: <HomeOutlined style={{ cursor: 'pointer' }} />,
              href: '/amenity',
            },
            {
              href: '/amenity',
              title: <span className='dark:text-slate-200'>Amenity</span>,
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

  return (
    <>
      {/* Edit Modal */}
      {openEdit === true ? (
        <EditCategory
          open={openEdit}
          setOpen={setOpenEdit}

          propData={amenity} //  pass current store data
          access_token={access_token}
          getFileImage={getFileImage}
        />
      ) : (
        ''
      )}

      {/* Top Card */}
      <Card className='my-2 dark:bg-slate-900 dark:border-slate-700' loading={loading}>
        <div className='flex items-center w-full'>
          <div className='flex items-center'>
            <Avatar
              shape='square'
              size={40}
              src={amenity?.images?.find((img) => img?.includes('original'))}
              style={{ cursor: 'pointer', marginLeft: '10px' }}
            />

            <div className='mx-2'>
              <h2 className='font-bold text-2xl dark:text-white'>
                {amenity?.nameEn || ''}
              </h2>
              <p className='text-sm text-gray-600 dark:text-slate-400'>
                {amenity?.nameKh || ''}
              </p>
            </div>
          </div>

          <div className='ml-auto'>
            {checkPermission(PERMS.ASSIGNED_USER) ? (
              <Button onClick={onEdit} type='default' icon={<EditOutlined />} />
            ) : (
              ' '
            )}
          </div>
        </div>
      </Card>

      {/* About Card */}
      <Card className='my-2 dark:bg-slate-900 dark:border-slate-700' loading={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <div className='p-2'>
              <h2 className='text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-white'>
                Description
              </h2>

              <Divider className='my-2 dark:border-slate-700' />

              <p className='text-gray-600 dark:text-slate-300'>
                {amenity?.description !== 'undefined' ? amenity?.description : ''}
              </p>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  )
}

export default AmenityDetail
