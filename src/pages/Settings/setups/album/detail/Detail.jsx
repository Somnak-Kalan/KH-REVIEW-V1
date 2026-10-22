import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Col, Form, Row, Button, Card, Breadcrumb, Divider } from 'antd'
import { HomeOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'

import EditCategory from '../Edit'
import { AuthContext } from '../../../../../contexts/AuthContext'
import { PERMS } from '../../../../../constants/permission/perms'

//  zustand stores
import useAlbumStore from '../../../../../Stores/setups/album.store'
import useSubCategoryStore from '../../../../../Stores/setups/subCategory.store'

const AlbumDetail = () => {
  const { setDisplayEmitContent } = useOutletContext()
  const { access_token, checkPermission } = useContext(AuthContext)
  const { id } = useParams()
  const navigate = useNavigate()

  const [openEdit, setOpenEdit] = useState(false)

  //  store
  const { fetchAlbumById, album, loading } = useAlbumStore()
  const { fetchSubCategory, subCategories } = useSubCategoryStore()

  //  permission
  useEffect(() => {
    if (!checkPermission(PERMS.ACTIVITY_MANAGEMENT)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])

  if (!checkPermission(PERMS.ACTIVITY_MANAGEMENT)) return null

  const handleBack = () => navigate('/album')

  //  fetch album ONCE when id changes
  useEffect(() => {
    if (!id || !access_token) return
    fetchAlbumById({ access_token, _id: id, force: false }) // cache
    fetchSubCategory({ access_token, force: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, access_token])
  //  header (dark mode friendly)
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
            {/*  remove inline color, use classes */}
            <p className='text-slate-700 dark:text-slate-200 m-0'>
              Album Detail
            </p>
          </div>
        </div>

        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} />, href: '/album' },
            { href: '/album', title: <span className='text-slate-700 dark:text-slate-200'>Album</span> },
            { href: '', title: <span className='text-blue-500'>Detail</span> },
          ]}
        />
      </div>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDisplayEmitContent])

  //  normalize subCategory ids (array of string or objects)
  const subCategoryIds = useMemo(() => {
    const raw = album?.subCategory || []
    if (!Array.isArray(raw)) return []
    return raw
      .map((x) => (typeof x === 'string' ? x : x?._id))
      .filter(Boolean)
  }, [album])

  const assignedSubCategories = useMemo(() => {
    const list = subCategories || []
    if (!subCategoryIds.length) return []
    return list.filter((item) => subCategoryIds.includes(item?._id))
  }, [subCategories, subCategoryIds])

  //  DO NOT refetch when click edit
  const onEdit = () => setOpenEdit(true)

  //  refetch ONCE after closing edit (not when clicking edit)
  const setOpenEditSafe = (val) => {
    setOpenEdit(val)
  }

  return (
    <>
      {openEdit ? (
        <EditCategory
          open={openEdit}
          setOpen={setOpenEditSafe}
          access_token={access_token}
          propData={album}
        />
      ) : null}

      {/* Top Card */}
      <Card
        className='my-2 dark:bg-slate-900 dark:border-slate-700'
        loading={loading}
      >
        <div className='flex items-center w-full'>
          <div className='mx-2'>
            <h2 className='font-bold text-2xl text-slate-800 dark:text-white'>
              {album?.nameEn}
            </h2>
            <p className='text-sm text-gray-600 dark:text-slate-400 m-0'>
              {album?.nameKh}
            </p>
          </div>

          <div className='ml-auto'>
            {checkPermission(PERMS.ASSIGNED_USER) ? (
              <Button icon={<EditOutlined />} size='small' onClick={onEdit} />
            ) : null}
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card
        className='my-2 dark:bg-slate-900 dark:border-slate-700'
        loading={loading}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <div className='p-2'>
              <h2 className='text-lg font-bold text-slate-800 dark:text-white'>
                Description
              </h2>
              <Divider className='my-2 dark:border-slate-700' />
              <p className='text-gray-600 dark:text-slate-300 m-0'>
                {album?.description}
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Subcategories */}
      <Card
        className='my-2 dark:bg-slate-900 dark:border-slate-700'
        loading={loading}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <div className='p-2'>
              <h2 className='text-lg font-bold text-slate-800 dark:text-white mb-2'>
                Sub Categories
              </h2>

              <Divider className='my-2 dark:border-slate-700' />

              <div className='flex flex-wrap gap-2'>
                {assignedSubCategories.length > 0 ? (
                  assignedSubCategories.map((item) => (
                    <span
                      key={item?._id}
                      className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm
                                 dark:bg-slate-800 dark:text-slate-200'
                    >
                      {item?.nameEn?.trim()} - {item?.nameKh?.trim()}
                    </span>
                  ))
                ) : (
                  <p className='text-gray-500 dark:text-slate-400 m-0'>
                    No subcategories assigned.
                  </p>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  )
}

export default AlbumDetail
