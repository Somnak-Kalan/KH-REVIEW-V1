// bannerColumns.jsx
import React from 'react'
import { Tag, Space, Tooltip, Button, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined, ShareAltOutlined, ExportOutlined, MessageOutlined } from '@ant-design/icons'
export const getBannerColumns = ({ getStatusColor, checkPermission, PERMS, handleEdit, handleView }) => [
    {
        title: 'Ads Title',
        dataIndex: 'bannerDetails',
        key: 'bannerDetails',
        render: (text) => (
            <div>
                <div onClick={() => handleView(text)} className="font-semibold text-sm text-gray-900 hover:text-blue-500 cursor-pointer">{text.split('\n')[0]}</div>
                <div onClick={() => handleView(text)} className="text-gray-500 text-xs cursor-pointer">{text.split('\n')[3]}</div>
            </div>
        ),
    },
    {
        title: 'Provinces',
        dataIndex: 'provinces',
        key: 'provinces',
        render: (text) => (
            <span className='text-sm'>{text || '-'}</span>
        )
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
            getStatusColor(status)
        ),
    }
    ,
    {
        title: 'Engagement',
        key: 'performance',
        render: (_, record) => (
            <div className='text-xs space-y-1'>
                <div className='flex items-center gap-2'>
                    <span role='img' aria-label='view'><EyeOutlined className='text-blue-500' /> </span> 0
                    <span role='img' aria-label='click'>
                        <svg width='12' height='12' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <circle cx='12' cy='12' r='10' stroke='#4CAF50' stroke-width='2' />
                            <circle cx='12' cy='12' r='6' stroke='#4CAF50' stroke-width='2' />
                            <circle cx='12' cy='12' r='2' fill='#4CAF50' />
                        </svg>
                    </span> 0
                    <span role='img' aria-label='share'>
                        <ShareAltOutlined />
                    </span> 0
                    <div>
                        <span role='img' aria-label='details' className='text-purple-600 cursor-pointer flex items-center gap-1'>
                            <ExportOutlined style={{ width: '10px' }} /> {(record?.details ?? 0)} details
                        </span>
                        {
                            Object.keys(record?.place || {}).length === 0 ? (
                                ''
                            ) : <div className=' items-center gap-2 mt-1'>
                                <div className='flex'>
                                    <span role='img' aria-label='chat' className='text-green-500 flex items-center gap-1'>
                                        <MessageOutlined style={{ width: '10px' }} /> {(record?.chats ?? 0)}
                                    </span>
                                </div>
                            </div>

                        }
                    </div>
                </div>
            </div>
        ),
    },
    {
        title: 'Created By',
        dataIndex: 'createdBy',
        key: 'createdBy',
    },
    {
        title: 'Actions',
        key: 'actions',
        align: 'center',
        render: (_, record) => (
            <div className='flex justify-center gap-2'>
                <Tooltip title='View'>
                    <Button
                        icon={<EyeOutlined style={{ color: 'green', width: '12px' }} />}
                        shape='circle'
                        style={{ width: '12px' }}
                        size='small'
                        onClick={() => handleView(record)}
                    />
                </Tooltip>
                <Tooltip title='Edit'>
                    <Button
                        icon={<EditOutlined />}
                        shape='circle'
                        size='small'
                        onClick={() => handleEdit(record)}
                        disabled={!checkPermission(PERMS.ASSIGNED_USER)}
                    />
                </Tooltip>
                <Popconfirm
                    title='Are you sure you want to delete this record?'
                    onConfirm={() => showAlert({ record, access_token, getBannerList: () => getBannerList(activeTab, currentTabState) })}
                    okText='Yes'
                    cancelText='No'
                >
                    <Button
                        icon={<DeleteOutlined />}
                        shape='circle'
                        size='small'
                        danger
                        disabled={!checkPermission(PERMS.ASSIGNED_USER)}
                    />
                </Popconfirm>
            </div>
        ),
    },
]
