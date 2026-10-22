import React, { useContext, useEffect, useState } from 'react'
import { Table, Dropdown, Button, Space, Tooltip } from 'antd'
import {
  EyeOutlined,
  DeleteOutlined,
  EllipsisOutlined,
} from '@ant-design/icons'
import Swal from 'sweetalert2'
//
import { AuthContext } from '../../../contexts/AuthContext'
import ModuleServices from '../../../services/admin/module'
import { useNavigate } from 'react-router-dom'

const ModuleList = (props) => {
  const { setPropData, search, warning, success } = props
  const { access_token, checkPermission } = useContext(AuthContext)
  const navigate = useNavigate()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [loading, setLoading] = useState(true)
  const [moduleList, setModuleList] = useState([])
  // Fetch Module List
  const getModuleList = async () => {
    try {
      const modules = await ModuleServices.fetchModule({ access_token })
      setModuleList(modules)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching modules:', error)

      setLoading(false)
    }
  }

  useEffect(() => {
    getModuleList()
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

  // Filter modules based on search term
  const handleSearch = () => {
    if (!search) {
      return moduleList
    }
    const search_text = search.toLowerCase().replace(/\s+/g, '')
    return moduleList.filter((item) => {
      const title = item.name ? item.name.toLowerCase().replace(/\s+/g, '') : ''
      const department = item.department
        ? item.department.toLowerCase().replace(/\s+/g, '')
        : ''
      return title.includes(search_text) || department.includes(search_text)
    })
  }
  const renderNo = (_, __, index) => {
    return (currentPage - 1) * pageSize + index + 1
  }
  // Handle view module action
  const Handle_View_Module = (record) => {
    navigate(`/administrator/module/form/${record?._id}`)
  }
  const handleDelete = (record) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this module?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await ModuleServices.deleteModule({ _id: record._id, access_token })
          getModuleList()
          Swal.fire({
            title: 'Deleted!',
            text: 'Module has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          })
        } catch (error) {
          console.error('Error deleting module:', error)
          warning({
            content: error?.response?.data?.msg || 'Module deletion failed',
          })
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete module.',
            icon: 'error',
            timer: 1500,
            showConfirmButton: false,
          })
        }
      }
    })
  }

  // Pagination configuration
  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: handleSearch().length,
    onChange: (page) => setCurrentPage(page),
    showSizeChanger: false,
  }

  // Table columns including the Action column
  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'No',
      width: 50,
      align: 'center',
      render: renderNo,
    },
    {
      title: 'Title',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <span
          className='text-blue-500 cursor-pointer'
          onClick={() => Handle_View_Module(record)}
        >
          {record.name}
        </span>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
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


          <Tooltip title="View Module">

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

              onClick={() => Handle_View_Module(record)}

              style={{
                borderColor: '#1890ff',
              }}

            />

          </Tooltip>





          <Tooltip title="Delete Module">

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
      rowKey={(row) => row._id}
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
export default ModuleList
