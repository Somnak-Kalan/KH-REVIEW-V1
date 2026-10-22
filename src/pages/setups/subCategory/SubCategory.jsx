import {
  Avatar,
  Breadcrumb,
  Button,
  Table,
  Tooltip,
  Typography,
} from 'antd'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from '../../../contexts/AuthContext'
import { useNavigate, useOutletContext } from 'react-router-dom'
import helpFunctions from '../../../utils/helpFunctions'
import AddSubCategory from './Add'
import TypeFilterOnly from '../../../components/Filter/setup/TypeFilter'
import SubEditCategory from './Edit'
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { PERMS } from '../../../constants/permission/perms'
import useSubCategoryStore from '../../../Stores/setups/subCategory.store'
import confirmDelete from '../../../components/Action/Confirm/DeleteConfirm'
import TableHeader from '../../../widgets/TableHeader'
import ImageLoading from '../../../components/Loading/ImageLoading'
const { Text } = Typography

const SubCategoryList = () => {
  const { access_token, checkPermission } = useContext(AuthContext)
  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()
  const { getFileImage } = helpFunctions

  const { fetchSubCategory, removeSubCategory, subCategories, loadingList } =
    useSubCategoryStore()

  const [search, setSearch] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [propData, setPropData] = useState()

  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [pageSize, setPageSize] = useState(10)

  //  compute permissions once
  const canManage = useMemo(
    () => checkPermission?.(PERMS.SUB_CATEGORY_MANAGEMENT),
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

  //  header breadcrumb
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className='font-semibold text-gray-700 dark:text-slate-300'>
          Sub Category
        </div>
        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
            { title: <span>Sub Category</span> },
          ]}
        />
      </div>
    )
  }, [setDisplayEmitContent])

  //  debounced fetch (prevents request spam while typing)
  const didFetchRef = useRef(false)

  useEffect(() => {
    if (!access_token) return

    const t = setTimeout(() => {
      const doc = { search: search ? search : '' }
      fetchSubCategory({ access_token, doc })
      didFetchRef.current = true
    }, 300)

    return () => clearTimeout(t)
  }, [access_token, search, fetchSubCategory])

  const refreshList = async () => {
    const doc = { search: search ? search : '' }
    await fetchSubCategory({ access_token, doc })
  }

  const handleEdit = (record) => {
    setOpenEdit(true)
    setPropData(record)
  }

  const handleView = (record) => {
    navigate('/sub-category/detail/' + record?._id)
  }

  const onDelete = async (record) => {
    setLoading(true)
    try {
      const doc = { _id: record?._id }
      const res = await removeSubCategory({ access_token, doc })
      if (res) await refreshList()
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
  const [imgLoadingMap, setImgLoadingMap] = useState({})
  useEffect(() => {
    const next = {}
      ; (subCategories || []).forEach((item) => {
        const url = item?.images?.find((img) => img.includes('original'))
        if (item?._id) next[item._id] = Boolean(url)
      })
    setImgLoadingMap(next)
  }, [subCategories])
  const renderNo = (_, __, index) => {
    return (currentPage - 1) * pageSize + index + 1
  }

  const columns = [
    {
      title: <span className='table-header'>No</span>,
      dataIndex: 'no',
      key: 'no',
      width: 50,
      align: 'center',
      render: renderNo,
    },
    {
      title: <span className='table-header'>Sub Category</span>,
      dataIndex: 'icon',
      key: 'icon',
      align: 'left',
      render: (_, record) => {
        const url = record?.images?.find((img) => img.includes('original'))
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

              <img
                src={url}
                alt='preload'

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
      title: <span className='table-header'>Category</span>,
      dataIndex: 'catEn',
      key: 'catEn',
      render: (_, record) => (
        <div style={{ lineHeight: 1.2 }}>
          <div className="text-gray-500" style={{ fontWeight: 600 }}>
            {record?.catEn || "-"}
          </div>
          <div className="font-bold text-gray-500" style={{ fontSize: 12 }}>
            {record?.catKh || ""}
          </div>
        </div>
      ),
    },
    {
      title: <span className='table-header'>Created By</span>,
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: <span className='table-header'>Created At</span>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_, record) => dayjs(record?.createdAt).format('YYYY-MM-DD'),
    },
    {
      title: <span className='table-header'>Action</span>,
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      width: 80,
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
    total: subCategories?.length,
    onChange: (page, size) => {
      setCurrentPage(page)
      setPageSize(size)
    },
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  }

  return (
    <>
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

      {openAdd && (
        <AddSubCategory
          open={openAdd}
          setOpen={setOpenAdd}
          access_token={access_token}
          setLoading={setLoading}
          loading={loading}
        />
      )}

      {openEdit ? (
        <SubEditCategory
          open={openEdit}
          setOpen={setOpenEdit}
          access_token={access_token}
          propData={propData}
          getFileImage={getFileImage}
        />
      ) : null}

      <TableHeader total={subCategories?.length} label="Total Amount">
        <div style={{ position: 'relative' }}>
          {loadingList && (
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
            columns={columns}
            dataSource={subCategories}
            pagination={pagination}
            bordered={false}
            size='small'
            scroll={{ x: 'max-content' }}
            className='custom-table-category'
            rowClassName={(_, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')}
          />
        </div>
      </TableHeader>
    </>
  )
}

export default SubCategoryList