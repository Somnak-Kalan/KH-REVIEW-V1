import React from 'react'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  MoreOutlined,
  RetweetOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Menu, Popconfirm, Tooltip } from 'antd'

const CategorySearch = ({ record, handleView, handleDelete }) => {
  const menu = (
    <Menu>
      <Menu.Item key='view' onClick={() => handleView(record)}>
        <EyeOutlined style={{ color: 'green', marginRight: 8 }} />
        View
      </Menu.Item>
      <Menu.Item key='edit' >
        <EditOutlined style={{ marginRight: 8 }} />
        Edit
      </Menu.Item>
      <Menu.Item key='delete'>
        <Popconfirm
          title='Are you sure you want to delete this record?'
          onConfirm={() => handleDelete(record)}
          okText='Yes'
          cancelText='No'
          placement='topRight'
        >
          <DeleteOutlined style={{ color: 'red', marginRight: 8 }} />
          Delete
        </Popconfirm>
      </Menu.Item>
    </Menu>
  )

  return (
    <div className='flex justify-center'>
      <Dropdown menu={menu} trigger={['click']} placement='bottomRight'>
        <RetweetOutlined
          style={{
            fontSize: '18px',
            color: '#1890ff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', // Adding box-shadow here
            padding: '5px', // Optional: Add padding to make the shadow more noticeable
            borderRadius: '4px', // Optional: Rounded corners for a better visual effect
          }}
        />
      </Dropdown>
    </div>
  )
}

export default CategorySearch
