import React, { useEffect, useState, useContext } from 'react'
import { Table, Dropdown, Button, Modal, Space, Tag, Tooltip } from 'antd'
import {
  EyeOutlined,
  DeleteOutlined,
  StopOutlined,
} from '@ant-design/icons'
import AdminUserServices from '../../../services/admin/User'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { PERMS } from '../../../constants/permission/perms'
import { AuthContext } from '../../../contexts/AuthContext'
const Users = (props) => {
  const { setPropData, search } = props
  const navigate = useNavigate()
  const { username, access_token, checkPermission } = useContext(AuthContext)

  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const getUser = async () => {
    try {
      const usersData = await AdminUserServices.fetchUser({ access_token })
      if (usersData) {
        setUsers(usersData)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error(error)
    }
  }
  useEffect(() => {
    getUser()
  }, [access_token])

  // Row selection (radio type)
  const getRowSelection = () => ({
    type: 'radio',
    selectedRowKeys,
    onChange: (_, selectedRows) => {
      const newSelectedRowKeys = selectedRows.map((row) => row._id)
      setSelectedRowKeys(newSelectedRowKeys)
      setPropData(selectedRows[0])
    },
  })

  // Search function – filter users based on search input
  const handleSearch = () => {
    if (!search) {
      return users
    }
    const search_text = search.toLowerCase().replace(/\s+/g, '')
    const filteredData = users.filter((item) => {
      const user_name = item.username
        ? item.username.toLowerCase().replace(/\s+/g, '')
        : ''
      const department_name = item.departmentTitle
        ? item.departmentTitle.toLowerCase().replace(/\s+/g, '')
        : ''
      const position_name = item.positionTitle
        ? item.positionTitle.toLowerCase().replace(/\s+/g, '')
        : ''
      return (
        user_name.includes(search_text) ||
        department_name.includes(search_text) ||
        position_name.includes(search_text)
      )
    })
    return filteredData
  }

  // Render row number based on current page and pageSize
  const renderNo = (_, __, index) => {
    return (currentPage - 1) * pageSize + index + 1
  }

  // Pagination configuration with dropdown options for pageSize
  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: handleSearch()?.length,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: (page, size) => {
      setCurrentPage(page)
      if (size !== pageSize) {
        setPageSize(size)
      }
    },
    onShowSizeChange: (current, size) => {
      setCurrentPage(1)
      setPageSize(size)
    },
  }

  // Action handlers for dropdown menu
  const handleEdit = (record) => {
    console.log('Edit user:', record)
  }
  const handleView = (record) => {
    navigate(`/administrator/user/${record?._id}/info`)
  }
  const getUserById = async (record) => {

    try {
      // Example: fetch user by ID (implement as needed)
      const doc = { _id: record._id }
      const userData = await AdminUserServices.fetchUserById({ doc, access_token })
      return userData
    } catch (error) {
      console.error(error)
      return null
    }
  }
  const handleDelete = (record) => {

    Swal.fire({

      title: 'Inactive User?',

      text: `Are you sure you want to inactive "${record?.username}"?`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'Inactive',

      cancelButtonText: 'Cancel',

      confirmButtonColor: '#ff4d4f',

      cancelButtonColor: '#1890ff',

      reverseButtons: true,

    }).then(async (result) => {


      if (result.isConfirmed) {


        try {


          const userData = await getUserById(record)


          const doc = {

            _id: userData?._id,

            firstName: userData?.firstName,

            lastName: userData?.lastName,

            gender: userData?.gender,

            departmentTitle: userData?.departmentTitle,

            staffCode: userData?.staffCode,

            positionTitle: userData?.positionTitle,

            status: 'Inactive'

          }



          await AdminUserServices.updateUserInfo({

            doc,

            access_token,

          })



          getUser()



          Swal.fire({

            title: 'Inactive Successfully',

            text: 'The user has been set to inactive.',

            icon: 'success',

            timer: 1500,

            showConfirmButton: false

          })



        } catch (error) {


          Swal.fire({

            title: 'Failed',

            text:

              error.response?.data?.msg ||

              'Unable to inactive user',

            icon: 'error',

            confirmButtonText: 'OK'

          })


        }


      }


    })

  }


  const renderAction = (record) => (

    <Space size="small">

      <Tooltip title="View User">

        <Button

          type="default"

          shape="circle"

          icon={
            <EyeOutlined
              style={{
                color: '#1890ff'
              }}
            />
          }

          onClick={() => handleView(record)}

          style={{
            borderColor: '#1890ff',
          }}

        />

      </Tooltip>





      {
        record?.status?.toLowerCase() === 'active'
        &&

        (

          <Tooltip title="Inactive User">

            <Button

              type="default"

              shape="circle"

              danger

              icon={
                <StopOutlined />
              }

              onClick={() => handleDelete(record)}

            />

          </Tooltip>

        )

      }


    </Space>

  )
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
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      render: (_, record) => (
        <a
          href=''
          onClick={(e) => {
            e.preventDefault()
            handleView(record)
          }}
          style={{ color: '#007BFF' }}
        >
          {record?.username}
        </a>
      ),
    },
    {
      title: 'Staff Code',
      dataIndex: 'staffCode',
      key: 'staffCode',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Department',
      dataIndex: 'departmentTitle',
      key: 'departmentTitle',
    },
    {
      title: 'Position',
      dataIndex: 'positionTitle',
      key: 'positionTitle',
    },


    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = ''
        switch (status?.toLowerCase()) {
          case 'active':
            color = 'green'
            break
          case 'inactive':
            color = 'volcano'
            break

          default:
            color = 'default'
        }

        return <Tag color={color}>{status}</Tag>
      }
    },
    {
      title: 'Created By',
      dataIndex: 'created_by',
      key: 'created_by',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (_, record) => dayjs(record?.createdAt).format('YYYY-MM-DD'),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: renderAction,
    },
  ]

  return (
    <>
      <Table
        rowKey={(row) => row._id}
        columns={columns}
        dataSource={handleSearch()}
        pagination={paginationConfig}
        size='small'
        loading={loading}
        scroll={{ x: 'max-content' }}
      />
    </>
  )
}

export default Users
