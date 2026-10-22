import { Avatar, Button, Popconfirm, Table, Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileImageOutlined,
} from '@ant-design/icons'
//
import SearchDetail from './Search'
import renderActions from 'components/Icon/MoreOption'

//
const LocationList = (props) => {
  const { isConfirmDelete } = props
  const { access_token } = useContext(AuthContext)
  const navigate = useNavigate()
  const [userList, setUserList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 10
  const generatePhoneNumber = () => {
    let phone = '071'
    // We need 7 more digits to have a total of 10 digits.
    for (let i = 0; i < 7; i++) {
      phone += Math.floor(Math.random() * 10)
    }
    return phone
  }
  const generateUserData = () => {
    const generatedData = []
    // Sample arrays for randomized data
    const categories = ['Category 1', 'Category 2', 'Category 3']
    const provinces = ['Province A', 'Province B', 'Province C']
    const owners = ['Owner 1', 'Owner 2', 'Owner 3']
    const phones = ['+1 555-1234', '+1 555-5678', '+1 555-9101']

    for (let i = 1; i <= 0; i++) {
      generatedData.push({
        key: `place_${i}`,
        // For the "Image" column the Avatar doesn't need a specific image source,
        // it's just using an icon render so we'll keep the name here only for reference.
        name: `Place ${i}`,

        // PP Code - you might want to generate something unique
        pp_code: `PP00${+i}`,

        // Using the same name for both English and Khmer for demonstration,
        // you can adjust as needed.
        location_name_en: `Location Name En ${i}`,
        location_name_kh: `Location Name Kh ${i}`,

        // Location Owner
        location: owners[Math.floor(Math.random() * owners.length)],

        // Province
        province: provinces[Math.floor(Math.random() * provinces.length)],

        // Phone
        phone: generatePhoneNumber(),

        // Category
        category: categories[Math.floor(Math.random() * categories.length)],

        // Created By
        create_by: `User ${i}`,

        // Created At - using a simple date string for illustration.
        created_at: new Date(
          Date.now() - Math.floor(Math.random() * 10000000000)
        ).toLocaleDateString(),

        // You can include any additional fields as needed.
        description: `Description for Place ${i}`,
      })
    }
    setUserList(generatedData)
    setLoading(false)
  }

  useEffect(() => {
    generateUserData()
  }, [])

  const handleView = (record) => {
    navigate('/category/detail')
  }

  const handleDelete = (record) => {
    console.log(`Delete record: ${record.key}`)
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
      dataIndex: 'name',
      key: 'name',
      width: 50,
      align: 'center',
      render: () => (
        <Tooltip title='Click to view image' trigger='click'>
          <Avatar
            shape='square'
            size={24}
            icon={<FileImageOutlined />}
            style={{ cursor: 'pointer' }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'PP Code',
      dataIndex: 'pp_code',
      key: 'pp_code',
      align: 'center',
    },

    {
      title: 'Location Name(En)',
      dataIndex: 'location_name_en',
      key: 'location_name_en',
      render: (text, record) => (
        <span
          className='text-blue-500 cursor-pointer'
          onClick={() => console.log(record)}
        >
          {record.name}
        </span>
      ),
    },
    {
      title: 'Location Name(Kh)',
      dataIndex: 'location_name_kh',
      key: 'location_name_kh',
      render: (text, record) => (
        <span
          className='text-blue-500 cursor-pointer'
          onClick={() => console.log(record)}
        >
          {record.name}
        </span>
      ),
    },
    {
      title: 'Location Owner',
      dataIndex: 'location',
      key: 'location',
      align: 'center',
    },

    {
      title: 'Province',
      dataIndex: 'province',
      key: 'province',
      align: 'center',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      align: 'center',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      align: 'center',
    },
    {
      title: 'Created By',
      dataIndex: 'create_by',
      key: 'hashtags_name',
      align: 'center',
    },
    {
      title: 'Created At',
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
          <Tooltip title='Edit'>
            <Button
              icon={<EditOutlined />}
              shape='circle'
              size='small'
              onClick={() => handleEdit(record)}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
          <Tooltip title='Delete'>
            <Popconfirm
              title='Are you sure you want to delete this record?'
              // onConfirm={() => ConfirmDelete(record)}
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
        </div>
      ),
    },
  ]

  const paginationConfig = {
    current: currentPage,
    pageSize,
    onChange: (page) => setCurrentPage(page),
    total: userList.length,
    showSizeChanger: false,
  }

  return (
    <>
      <div className='mb-4'>
        <SearchDetail />
      </div>
      <Table
        columns={columns}
        dataSource={userList}
        pagination={paginationConfig}
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

export default LocationList
