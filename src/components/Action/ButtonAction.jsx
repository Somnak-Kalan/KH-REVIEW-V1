import React from 'react'
import { Dropdown, Button } from 'antd'
import {
    MoreOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons'

const PERMS = {
    ASSIGNED_USER: 'ASSIGNED_USER',
}

const checkPermission = (perm) => {
    return perm === PERMS.ASSIGNED_USER
}

// Reusable menu function
const getMenu = (record, handleEdit, handleView, handDelete) => ({
    items: [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View',
            onClick: () => handleView(record),
            className: 'no-hover-bg',
            style: { color: 'green' },
        },
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit',
            onClick: () => handleEdit(record),
            disabled: !checkPermission(PERMS.ASSIGNED_USER),
            className: 'no-hover-bg',
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete',
            onClick: () => handDelete(record),
            disabled: !checkPermission(PERMS.ASSIGNED_USER),
            className: 'no-hover-bg',
            style: { color: 'red' },
        },
    ],
})

// Example component usage
const ActionMenu = ({ record, handleEdit, handleView, handDelete }) => {
    return (
        <Dropdown menu={getMenu(record, handleEdit, handleView, handDelete)} trigger={['click']}>
            <Button
                shape="circle"
                icon={<MoreOutlined />}
                size="small"
                className="bg-white bg-opacity-80"
            />
        </Dropdown>
    )
}

export default ActionMenu