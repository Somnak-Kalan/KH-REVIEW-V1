import React from 'react'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import { Dropdown, Popconfirm } from 'antd'

const MoreOutline = ({
  record,
  isView,
  isEdit,
  isDelete,
  setOpenEdit,
  onView,
}) => {
  // Create the base items array
  const items = []

  // Conditionally add the "View" item if isView is true
  if (isView) {
    items.push({
      key: 'view',
      label: (
        <div
          onClick={() => onView(record)}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <EyeOutlined style={{ color: 'green', marginRight: 8 }} />
          View
        </div>
      ),
    })
  }

  // Add the other items
  if (isEdit) {
    items.push({
      key: 'edit',
      label: (
        <div
          onClick={() => setOpenEdit(true)}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <EditOutlined style={{ marginRight: 8 }} />
          Edit
        </div>
      ),
    })
  }
  if (isDelete) {
    items.push({
      key: 'delete',
      label: (
        <Popconfirm
          title='Are you sure you want to delete this record?'
          onConfirm={() => handleDelete(record)}
          okText='Yes'
          cancelText='No'
          placement='topRight'
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DeleteOutlined style={{ color: 'red', marginRight: 8 }} />
            Delete
          </div>
        </Popconfirm>
      ),
    })
  }

  return (
    <div className='flex justify-center'>
      <Dropdown menu={{ items }} trigger={['click']} placement='bottomRight'>
        <MoreOutlined />
      </Dropdown>
    </div>
  )
}

export default MoreOutline
