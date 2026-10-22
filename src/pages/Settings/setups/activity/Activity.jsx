import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Breadcrumb, Button, message, Table, Tooltip } from 'antd'
import { AuthContext } from '../../../../contexts/AuthContext'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import AddActivity from './Add'
import EditActivity from './Edit'
import dayjs from 'dayjs'
import { PERMS } from '../../../../constants/permission/perms'
import useActivityStore from '../../../../Stores/setups/activity.store'
import TableHeader from '../../../../widgets/TableHeader'
import TypeFilterOnly from '../../../../components/Filter/setup/TypeFilter'
import confirmDelete from '../../../../components/Action/Confirm/DeleteConfirm'
import ImageLoading from '../../../../components/Loading/ImageLoading'

const Activity = () => {
  const { access_token, checkPermission } = useContext(AuthContext)
  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()

  const { fetchActivity, activities, removeActivity, loading: storeLoading } = useActivityStore()

  //  permissions once
  const canManage = useMemo(
    () => checkPermission?.(PERMS.ACTIVITY_MANAGEMENT),
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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  // local loading only for delete confirm action
  const [loading, setLoading] = useState(false)

  const lastQueryRef = useRef(null)

  useEffect(() => {
    if (!access_token) return

    const q = (search || '').trim()
    const key = `${access_token}__${q}`

    if (lastQueryRef.current === key) return

    const t = setTimeout(() => {
      lastQueryRef.current = key
      fetchActivity({ access_token, search: q }).catch(() =>
        message.error('Failed to load data')
      )
    }, 300)

    return () => clearTimeout(t)
  }, [access_token, search, fetchActivity])

  const handleEdit = (record) => {
    setOpenEdit(true)
    setPropData(record)
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      message.success(`Copied ID: ${text}`)
    } catch {
      message.error('Copy failed')
    }
  }

  const renderNo = (_, __, index) => (currentPage - 1) * pageSize + index + 1

  const onDelete = async (record) => {
    setLoading(true)
    try {
      const doc = { _id: record?._id }
      await removeActivity({ access_token, doc })
      //  refresh after delete (keep same search)
      await fetchActivity({ access_token, search: search || '' })
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

  const handleView = (r) => navigate(`/activity/detail/${r._id}`)

  const columns = [
    {
      title: 'No',
      width: 50,
      align: 'center',
      render: renderNo,
    },
    {
      title: <>Copy ID</>,
      width: 80,
      align: 'center',
      render: (_, record) => (
        <CopyOutlined
          onClick={() => copyToClipboard(`${record._id}`)}
          className='text-blue-500 hover:text-blue-600 cursor-pointer text-lg'
        />
      ),
    },
    {
      title: 'Activity Name (En)',
      dataIndex: 'nameEn',
      key: 'nameEn',
      render: (_, record) => (
        <div className="cursor-pointer" onClick={() => handleView(record)} style={{ lineHeight: 1.2 }}>
          <div className="text-blue-800 dark:text-slate-400" style={{ fontWeight: 600 }}>
            {record?.nameEn || '-'}
          </div>
          <div className="font-bold text-gray-500 hover:underline" style={{ fontSize: 12 }}>
            {record?.nameKh || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: <span>Created By</span>,
      dataIndex: 'createdBy',
      key: 'createdBy',
      align: 'center',
    },
    {
      title: <span>Created At</span>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (text) => <>{dayjs(text)?.format('YYYY-MM-DD')}</>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <div className='flex justify-center'>
          {canEdit ? (
            <>
              <Button
                type='primary'
                icon={<EditOutlined />}
                shape='circle'
                size='small'
                style={{ marginRight: 8 }}
                onClick={() => handleEdit(record)}
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

  // header
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className='font-semibold text-gray-700 dark:text-slate-300'>Activity</div>
        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
            { title: 'Activity' },
          ]}
        />
      </div>
    )
  }, [setDisplayEmitContent])

  const pagination = {
    current: currentPage,
    pageSize,
    total: (activities || []).length,
    onChange: (page, size) => {
      setCurrentPage(page)
      setPageSize(size)
    },
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  }

  return (
    <>
      {openAdd ? (
        <AddActivity open={openAdd} setOpen={setOpenAdd} access_token={access_token} />
      ) : null}

      {openEdit ? (
        <EditActivity
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
      <TableHeader total={activities?.length} label="Total Amount">
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
          )
          }

          <Table
            rowKey={(record) => record._id}
            columns={columns}
            dataSource={activities}
            bordered={false}
            size='small'
            loading={loading || storeLoading}
            pagination={pagination}
            scroll={{ x: 'max-content' }}
            rowClassName={(_, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')}
          />

        </div>
      </TableHeader>
    </>
  )
}

export default Activity