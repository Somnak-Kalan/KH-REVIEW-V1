
import React from 'react'
import { Dropdown, Button } from 'antd'
import {
    EyeOutlined,
    PlusCircleOutlined,
    StopOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    MoreOutlined,
} from '@ant-design/icons'

const normalizeStatus = (status) => {
    return String(status || '').toLowerCase().trim()
}

export const getMomentActionItems = (status) => {
    const s = normalizeStatus(status)

    // ACTIVE
    if (s === 'active') {
        return [
            {
                key: 'view',
                label: 'View post',
                icon: <EyeOutlined style={{ color: '#1677ff' }} />,
            },
            {
                key: 'add_more_mention',
                label: 'Add more mention',
                icon: <PlusCircleOutlined style={{ color: '#52c41a' }} />,
            },
            {
                key: 'hide',
                label: 'Hide post',
                icon: <StopOutlined style={{ color: '#8c8c8c' }} />,
            },
        ]
    }

    // UNDER REVIEW
    if (s === 'under_review' || s === 'under review' || s === 'pending' || s === 'review') {
        return [
            {
                key: 'view',
                label: 'View post',
                icon: <EyeOutlined style={{ color: '#1677ff' }} />,
            },
            {
                key: 'approve',
                label: 'Approve post',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            },
            {
                key: 'add_more_mention',
                label: 'Add more mention',
                icon: <PlusCircleOutlined style={{ color: '#52c41a' }} />,
            },
            {
                key: 'delete',
                label: 'Delete post',
                icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                danger: true,
            },
        ]
    }

    // HIDE / HIDDEN
    if (s === 'hide' || s === 'hidden') {
        return [
            {
                key: 'view',
                label: 'View post',
                icon: <EyeOutlined style={{ color: '#1677ff' }} />,
            },
            {
                key: 'active',
                label: 'Active post',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            },
            {
                key: 'delete',
                label: 'Delete post',
                icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                danger: true,
            },
        ]
    }

    // DEFAULT
    return [
        {
            key: 'view',
            label: 'View post',
            icon: <EyeOutlined style={{ color: '#1677ff' }} />,
        },
    ]
}

const MomentDetailActions = ({ status, onAction }) => {
    const items = getMomentActionItems(status)

    return (
        <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
                items,
                onClick: ({ key }) => onAction?.(key),
            }}
        >
            <Button
                type="text"
                icon={<MoreOutlined />}
                style={{
                    width: 30,
                    height: 30,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                }}
            />
        </Dropdown>
    )
}

export default MomentDetailActions