import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from '../../../contexts/AuthContext'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Button, Table, Tooltip, Avatar, Breadcrumb, message } from 'antd'
import '@fortawesome/fontawesome-free/css/all.min.css'
import dayjs from 'dayjs'
import AddAmenity from './Add'
import EditAmenity from './Edit'
import { PERMS } from '../../../constants/permission/perms'

// zustand store
import useAmenityStore from '../../../Stores/setups/amenity.store'

// widget
import TableHeader from '../../../widgets/TableHeader'

// component
import TypeFilterOnly from '../../../components/Filter/setup/TypeFilter'
import confirmDelete from '../../../components/Action/Confirm/DeleteConfirm'
import ImageLoading from '../../../components/Loading/ImageLoading'
const Amenity = () => {
  const { access_token, checkPermission } = useContext(AuthContext)
  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()

  const { fetchAmenity, amenities, loading: storeLoading, removeAmenity } = useAmenityStore()

  //  permission only once
  const canManage = useMemo(
    () => checkPermission?.(PERMS.AMENITY_MANAGEMENT),
    [checkPermission]
  )
  const canEdit = useMemo(
    () => checkPermission?.(PERMS.ASSIGNED_USER),
    [checkPermission]
  )

  //  redirect once
  useEffect(() => {
    if (!canManage) navigate('/', { replace: true })
  }, [canManage, navigate])

  if (!canManage) return null

  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [propData, setPropData] = useState()

  // local loading (for delete confirm only)
  const [loading, setLoading] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  //  FIX: debounced fetch + prevent duplicate same request
  const lastKeyRef = useRef(null)
  useEffect(() => {
    if (!access_token) return

    const q = (search || '').trim()
    const key = `${access_token}__${q}`

    // block duplicate call
    if (lastKeyRef.current === key) return

    const t = setTimeout(() => {
      lastKeyRef.current = key

      //  remove force:true
      fetchAmenity({ access_token, search: q }).catch(() => {
        message.error('Failed to load amenities')
      })
    }, 300)

    return () => clearTimeout(t)
  }, [access_token, search, fetchAmenity])

  const handleView = (record) => {
    navigate('/amenity/detail/' + record?._id)
  }

  const renderNo = (_, __, index) => (currentPage - 1) * pageSize + index + 1

  const handleEdit = (record) => {
    setPropData(record)
    setOpenEdit(true)
  }

  // delete
  const onDelete = async (record) => {
    setLoading(true)
    try {
      const doc = { _id: record?._id }
      await removeAmenity({ access_token, doc })

      //  refresh after delete (keep current search)
      const q = (search || '').trim()
      lastKeyRef.current = null // allow refresh
      await fetchAmenity({ access_token, search: q })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (record) => {
    await confirmDelete({
      record,
      title: 'Are you sure?',
      text: 'Do you really want to delete this record?',
      onDelete,
      successText: 'The record has been deleted.',
    })
  }
  //  image loading map
  const [imgLoadingMap, setImgLoadingMap] = useState({})
  useEffect(() => {
    const next = {}
      ; (amenities || []).forEach((item) => {
        const url = item?.images?.find((img) => img.includes('original'))
        if (item?._id) next[item._id] = Boolean(url)
      })
    setImgLoadingMap(next)
  }, [amenities])
  const columns = [
    {
      title: 'No',
      width: 50,
      align: 'center',
      render: renderNo,
    },
    {
      title: <span className='table-header'>Amenity</span>,
      dataIndex: 'amenity',
      key: 'amenity',
      align: 'left',
      render: (_, record) => {
        const url = record?.images?.find((img) => img.includes('original'))
        const isLoading = Boolean(record?._id && imgLoadingMap[record._id])

        return (
          <div
            className='flex items-center'
            style={{
              gap: 10,
              justifyContent: 'flex-start',
            }}
          >
            <div
              style={{
                width: 35,
                height: 35,
                minWidth: 35,
                borderRadius: 4,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {!url ? (
                <Avatar shape='square' size={35} style={{ cursor: 'pointer' }} />
              ) : (
                <>
                  {isLoading ? (
                    <div
                      style={{
                        width: 35,
                        height: 35,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <ImageLoading overlay={false} size={30} logoSize={10} />
                    </div>
                  ) : null}

                  <img
                    src={url}
                    alt='preload'
                    style={{
                      width: 1,
                      height: 1,
                      opacity: 0,
                      position: 'absolute',
                      pointerEvents: 'none',
                    }}
                    onLoad={() => {
                      setImgLoadingMap((prev) => ({
                        ...prev,
                        [record?._id]: false,
                      }))
                    }}
                    onError={() => {
                      setImgLoadingMap((prev) => ({
                        ...prev,
                        [record?._id]: false,
                      }))
                    }}
                  />

                  {!isLoading ? (
                    <Avatar
                      shape='square'
                      size={35}
                      src={url}
                      style={{ cursor: 'pointer' }}
                    />
                  ) : null}
                </>
              )}
            </div>

            <div
              className='cursor-pointer'
              onClick={() => handleView(record)}
              style={{ lineHeight: 1.2, textAlign: 'left' }}
            >
              <div
                className='text-blue-800 dark:text-slate-400'
                style={{ fontWeight: 600 }}
              >
                {record?.nameEn || '-'}
              </div>
              <div
                className='font-bold text-gray-500 hover:underline'
                style={{ fontSize: 12 }}
              >
                {record?.nameKh || ''}
              </div>
            </div>
          </div>
        )
      },
    },

    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      align: 'center',
    },
    {
      title: 'CreatedAt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (_, record) => dayjs(record?.createdAt).format('YYYY-MM-DD'),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 140,
      render: (_, record) => (
        <div className='flex justify-center'>
          <Tooltip title='View'>
            <Button
              icon={<EyeOutlined style={{ color: 'green' }} />}
              shape='circle'
              size='small'
              onClick={() => handleView(record)}
              style={{ marginRight: 8 }}
            />
          </Tooltip>

          {canEdit ? (
            <>
              <Button
                icon={<EditOutlined />}
                shape='circle'
                size='small'
                onClick={() => handleEdit(record)}
                style={{ marginRight: 8 }}
              />
              <Tooltip title='Delete'>
                <Button
                  icon={<DeleteOutlined />}
                  shape='circle'
                  size='small'
                  danger
                  onClick={() => handleDelete(record)}
                />
              </Tooltip>
            </>
          ) : null}
        </div>
      ),
    },
  ]

  const pagination = {
    current: currentPage,
    pageSize,
    total: (amenities || []).length,
    onChange: (page, size) => {
      setCurrentPage(page)
      setPageSize(size)
    },
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  }

  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className='font-semibold text-gray-700 dark:text-slate-300'>Amenity</div>
        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
            { title: 'Amenity' },
          ]}
        />
      </div>
    )
  }, [setDisplayEmitContent])

  return (
    <>
      {openAdd ? (
        <AddAmenity open={openAdd} setOpen={setOpenAdd} access_token={access_token} />
      ) : null}

      {openEdit ? (
        <EditAmenity
          open={openEdit}
          setOpen={setOpenEdit}
          propData={propData}
          access_token={access_token}
        />
      ) : null}

      <div className='mb-2' style={{ borderRadius: '5px' }}>
        <div className='mb-2 px-3 sm:px-5 py-4 bg-white rounded-lg dark:bg-slate-900'>
          <div className='sm:flex justify-between items-center'>
            <div className='w-full md:w-full 2xl:w-5/6 sm:mx-1 md:mx-0'>
              <TypeFilterOnly typeFilter={setSearch} />
            </div>

            {canEdit ? (
              <Button
                type='primary'
                style={{ background: '#1677ff' }}
                className='cursor-pointer text-white'
                onClick={() => setOpenAdd(true)}
              >
                <PlusOutlined /> add
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <TableHeader total={amenities?.length} label="Total Amount">
        <div style={{ position: 'relative' }}>
          {storeLoading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.6)',
              }}
            >
              <ImageLoading overlay={false} size={60} logoSize={25} />
            </div>
          )}
          <Table
            rowKey={(record) => record._id}
            scroll={{ x: 'max-content' }}
            columns={columns}
            dataSource={amenities || []}
            loading={loading || storeLoading}
            pagination={pagination}
          />
        </div>
      </TableHeader>
    </>
  )
}

export default Amenity