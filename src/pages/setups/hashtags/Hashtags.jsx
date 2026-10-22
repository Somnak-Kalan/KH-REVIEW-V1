import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../contexts/AuthContext'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { Button, Row, Col, Table, Tooltip, Popconfirm } from 'antd'
import '@fortawesome/fontawesome-free/css/all.min.css'
import dayjs from 'dayjs'
import ConfirmRemove from './ConfirmRemove'
import Search from './Search'
import AddHashtags from './Add'
import EditHashtags from './Edit'
import { PERMS } from '../../../constants/permission/perms'
// imp
const Mention = () => {
  const { access_token, checkPermission } = useContext(AuthContext)
  const { collapsed, setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()
  //CHECK PERMISSION
  useEffect(() => {
    if (!checkPermission(PERMS.HASHTAGS_MANAGEMENT)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])
  if (!checkPermission(PERMS.HASHTAGS_MANAGEMENT)) {
    return null
  }
  //END CHECK PERMISSION
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const generateData = () => {
    // const generatedData = []
    // for (let i = 1; i <= 10; i++) {
    //   generatedData.push({
    //     key: `item_${i}`,
    //     hashtags_name_en: `Hashtag EN ${i}`,
    //     hashtags_name_kh: `Hashtag KH ${i}`,
    //     description: `This is a description for Hashtag ${i}`,
    //     createdAt: dayjs().format('YYYY-MM-DD'),
    //   })
    // }
    // setData(generatedData)
    setLoading(false)
  }

  useEffect(() => {
    generateData()
  }, [])

  const columns = [
    {
      title: 'Hashtags Name (En)',
      dataIndex: 'hashtags_name_en',
      key: 'hashtags_name_en',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Hashtags Name (Kh)',
      dataIndex: 'hashtags_name_kh',
      key: 'hashtags_name_kh',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'CreatedAt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (text, record) => (
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
            ' '
          )}

          {checkPermission(PERMS.ASSIGNED_USER) ? (
            <Tooltip title='Delete'>
              <Popconfirm
                title='Are you sure you want to delete this record?'
                onConfirm={() => ConfirmRemove(record)}
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

  const pagination = {
    current: currentPage,
    pageSize: pageSize,
    total: data.length,
    onChange: (page, pageSize) => {
      setCurrentPage(page)
      setPageSize(pageSize)
    },
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  }

  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className='font-semibold' style={{ color: '#495057' }}>
          Hashtags
        </div>
      </div>
    )
  }, [navigate])
  //
  const addMention = () => {
    setOpenAdd(true)
  }
  const handleEdit = () => {
    setOpenEdit(true)
  }
  //
  return (
    <>
      {/*  */}

      <AddHashtags open={openAdd} setOpen={setOpenAdd} />
      <EditHashtags open={openEdit} setOpen={setOpenEdit} />

      {/*  */}
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
              <Search />
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
              'You don’t have permission '
            )}
          </div>
        </div>
      </div>

      <div className='relative'>
        <div>
          <Table
            rowKey={(record) => record.key} // Use 'key' as rowKey
            scroll={{ x: 'max-content' }}
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={pagination}
          />
        </div>
      </div>
    </>
  )
}

export default Mention
