import { Avatar, Button, Table, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  EyeOutlined,
} from '@ant-design/icons'
//
import TypeFilterOnly from '../../../../components/Filter/setup/TypeFilter'
const SubCategoryList = (props) => {
  const { isConfirmDelete, subCategory } = props
  const navigate = useNavigate()
  const [userList, setUserList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  useEffect(() => {
    setLoading(false)
    setUserList(subCategory)
  }, [subCategory])
  const handleView = (record) => {
    navigate('/sub-category/detail/' + record._id)
  }
  const renderNo = (_, __, index) => {
    return (currentPage - 1) * pageSize + index + 1
  }
  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      width: 50,
      align: 'center',
      render: renderNo,
    },
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'images',
      width: 50,
      align: 'center',
      render: (record) => (
        <Avatar
          shape='square'
          size={35}
          src={record?.find(img => img?.includes('original'))}
          style={{ cursor: 'pointer', marginLeft: '10px' }}
        />

      ),
    },
    {
      title: 'Title',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <>
          <div className='text-sm text-gray-700 '>
            <p onClick={() => handleView(record)} className='text-sm font-semibold hover:text-blue-500 cursor-pointer truncate w-48'>
              {record?.nameEn}
            </p>
            <p onClick={() => handleView(record)} className='text-xs text-gray-500 truncate w-48 hover:text-blue-500 cursor-pointer truncate w-48'>
              {record?.nameKh}
            </p>
          </div>

        </>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      render: (text, record) => (
        <>
          {record?.description && record?.description !== 'undefined' ? (
            <Tooltip title={record?.description}>
              <p className='text-sm text-gray-700 truncate w-48'>{record?.description}</p>
            </Tooltip>
          ) : (
            <span className='text-sm text-gray-500'>...</span>
          )}

        </>
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'created_by',
      key: 'created_by',
      align: 'center',
    },
    {
      title: 'CreatedAt',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      hidden: isConfirmDelete,
      width: 50,
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

        </div>
      ),
    },
  ]

  const pagination = {
    current: currentPage,
    pageSize: pageSize,
    total: userList?.length,
    onChange: (page, pageSize) => {
      setCurrentPage(page)
      setPageSize(pageSize)
    },
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  }

  return (
    <>
      <div className='mb-5'>
        <TypeFilterOnly />
      </div>

      <Table
        rowKey={(record) => record?._id || record?.id || record?.key}
        columns={columns}
        dataSource={userList}
        pagination={pagination}
        bordered={false}
        size='small'
        loading={loading}
        scroll={{ x: 'max-content' }}
        className='custom-table-category'
        rowClassName={(record, index) =>
          index % 2 === 0 ? 'even-row' : 'odd-row'
        }
      />
    </>
  )
}

export default SubCategoryList
