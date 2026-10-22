import React, { useContext, useEffect, useState } from 'react'
import {
  Avatar,
  Breadcrumb,
  Button,
  Col,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Table,
  Tooltip,
} from 'antd'
import { AuthContext } from '../../../contexts/AuthContext'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import Search from './Search'
import AddType from './Add'
import EditType from './Edit'
import ConfirmRemove from './ConfirmRemove'
import ActivityServices from '../../../services/setup/Activity'
import dayjs from 'dayjs'
import { PERMS } from '../../../constants/permission/perms'

const Features = () => {
  const { access_token, checkPermission } = useContext(AuthContext)
  const { collapsed, setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()
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
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [propData, setPropData] = useState()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  //
  const [activity, setActivity] = useState([])
  //
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const getActivity = async (search) => {
    setLoading(true)
    try {
      const doc = { search: search ? search : '' }
      const res = await ActivityServices.fetchActivity({ access_token, doc })
      if (res) {
        // setActivity(res)
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }
  useEffect(() => {
    getActivity()
  }, [])
  useEffect(() => {
    if (openEdit === false) {
      getActivity()
    }
  }, [openEdit])
  //
  const handleEdit = (record) => {
    setOpenEdit(true)
    setPropData(record)
  }
  const handleView = (record) => {
    navigate(`/feature/detail/${record?._id}`)
  }
  //
  const renderNo = (_, __, index) => {
    return (currentPage - 1) * pageSize + index + 1
  }
  const columns = [
    {
      title: 'No',
      width: 50,
      align: 'center',
      render: renderNo,
    },
    {
      title: 'Features Name (En)',
      dataIndex: 'nameEn',
      key: 'nameEn',
      render: (text, record) => (
        <Link onClick={() => handleView(record)} style={{ color: '#1677ff' }}>
          {record.nameEn}
        </Link>
      ),
    },
    {
      title: 'Features name (Kh)',
      dataIndex: 'nameKh',
      key: 'nameKh',
      render: (text, record) => (
        <Link onClick={() => handleView(record)} style={{ color: '#1677ff' }}>
          {record.nameKh}
        </Link>
      ),
    },
    {
      title: 'Group Type',
      dataIndex: 'groupType',
      key: 'groupType',
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
          {checkPermission(PERMS.ASSIGNED_USER) ? (
            <Button
              icon={<EditOutlined />}
              shape='circle'
              size='small'
              onClick={() => handleEdit(record)}
              style={{ marginRight: 8 }}
            />
          ) : (
            'You don’t have permission '
          )}

          {checkPermission(PERMS.ASSIGNED_USER) ? (
            <Tooltip title='Delete'>
              <Popconfirm
                title='Are you sure you want to delete this record?'
                onConfirm={() =>
                  ConfirmRemove({
                    record,
                    access_token,
                    getActivity,
                    setLoading,
                  })
                }
                okText='Yes'
                cancelText='No'
                placement='top'
              >
                <Button
                  icon={<DeleteOutlined />}
                  shape='circle'
                  size='small'
                  danger
                />
              </Popconfirm>
            </Tooltip>
          ) : (
            ''
          )}
        </div>
      ),
    },
  ]

  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className='font-semibold' style={{ color: '#495057' }}>
          Features
        </div>
        <Breadcrumb
          items={[
            {
              title: <HomeOutlined style={{ cursor: 'pointer' }} />,
            },
            {
              title: 'Features',
            },
          ]}
        />
      </div>
    )
  }, [navigate])
  const pagination = {
    current: currentPage,
    pageSize: pageSize,
    total: activity?.length,
    onChange: (page, pageSize) => {
      setCurrentPage(page)
      setPageSize(pageSize)
    },
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  }
  return (
    <>
      <AddType
        open={openAdd}
        setOpen={setOpenAdd}
        access_token={access_token}
        getActivity={getActivity}
      />
      {openEdit === true ? (
        <EditType
          open={openEdit}
          setOpen={setOpenEdit}
          propData={propData}
          access_token={access_token}
        />
      ) : (
        ''
      )}

      <div
        className='mb-2'
        style={{
          borderRadius: '5px',
          background: 'white',
        }}
      >
        <div className='mb-2 px-5  py-4 bg-white shadow-lg rounded-lg border-l-4 border-blue-500'>
          <div className='sm:flex justify-between items-center'>
            {/* Search field container */}
            <div className='w-full md:w-full 2xl:w-5/6 sm:mx-1 md:mx-0'>
              <Search getActivity={getActivity} />
            </div>

            {checkPermission(PERMS.ASSIGNED_USER) ? (
              <Button
                type='primary'
                style={{ background: '#1677ff' }}
                className='cursor-pointer text-white'
                onClick={() => setOpenAdd(true)}
              >
                <PlusOutlined /> add
              </Button>
            ) : (
              ' '
            )}
          </div>
        </div>
      </div>
      <Table
        rowKey={(record) => record._id}
        columns={columns}
        dataSource={activity}
        bordered={false}
        size='small'
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={pagination}
        rowClassName={(record, index) =>
          index % 2 === 0 ? 'even-row' : 'odd-row'
        }
      />
    </>
  )
}

export default Features
