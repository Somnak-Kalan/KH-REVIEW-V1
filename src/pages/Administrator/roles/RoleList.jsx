import React, { useContext, useEffect, useState } from 'react'
import { Table, Dropdown, Button, Space, Tooltip } from 'antd'
import {
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  EllipsisOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
//
import { AuthContext } from '../../../contexts/AuthContext'
import AdminRoleServices from '../../../services/admin/Role'
import { PERMS } from '../../../constants/permission/perms'

const Roles = (props) => {
  const { setPropData, search } = props
  const { username, access_token, checkPermission } = useContext(AuthContext)
  const navigate = useNavigate()

  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Fetch roles from API
  const getRoles = async () => {
    try {
      const rolesData = await AdminRoleServices.fetchRole({ access_token })
      if (rolesData) {
        const rolesWithKeys = rolesData.map((role, index) => ({
          ...role,
          key: role._id || index,
        }))
        setRoles(rolesWithKeys)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRoles()
  }, [access_token])

  // Filter roles based on search term
  const handleSearch = () => {
    if (!search) {
      return roles
    }
    const search_text = search.toLowerCase().replace(/\s+/g, '')
    return roles.filter((item) => {
      const title = item?.name
        ? item.name.toLowerCase().replace(/\s+/g, '')
        : ''
      const user_name = item?.username
        ? item.username.toLowerCase().replace(/\s+/g, '')
        : ''
      return title.includes(search_text) || user_name.includes(search_text)
    })
  }

  // Render row number based on current page and pageSize
  const renderNo = (_, __, index) => {
    return (currentPage - 1) * pageSize + index + 1
  }

  // Action handlers
  const handleView = (record) => {
    navigate(`/administrator/role/form/${record._id}`)
  }

  const handleDelete = (record) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this role?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33', // Red color for delete
      cancelButtonColor: '#3085d6', // Blue color for cancel
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await AdminRoleServices.deleteRole({ _id: record._id, access_token })
          getRoles()
          Swal.fire({
            title: 'Deleted!',
            text: 'Role has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          })
        } catch (error) {
          warning({
            content: error?.response?.data?.msg || 'Role deletion failed',
          })
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete role.',
            icon: 'error',
            timer: 1500,
            showConfirmButton: false,
          })
        }
      }
    })
  }

  // Pagination configuration with size changer
  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: handleSearch().length,
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
      title: 'Title',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <a
          href=''
          onClick={(e) => {
            e.preventDefault()
            handleView(record)
          }}
          style={{ color: '#007BFF' }}
        >
          {record?.name}
        </a>
      ),
    },
    {
      title: 'User Name',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      align: 'center',
      render: (record) => (

        <Space size="small">


          <Tooltip title="View Role">

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





          <Tooltip title="Delete Role">


            <Button


              type="default"


              shape="circle"


              danger


              icon={

                <DeleteOutlined />

              }


              onClick={() => handleDelete(record)}


            />


          </Tooltip>



        </Space>

      )
    },
  ]

  return (
    <Table
      rowKey={(row) => row._id || row.key}
      // rowSelection={getRowSelection()}
      columns={columns}
      dataSource={handleSearch()}
      pagination={paginationConfig}
      size='small'
      loading={loading}
      scroll={{ x: 'max-content' }}
    />
  )
}

export default Roles
