import React, { useMemo, useState } from 'react'
import { Button, Dropdown, Table, Tooltip, Typography } from 'antd'
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons'

import { FaEllipsisV } from "react-icons/fa";

const { Text } = Typography
import TableHeader from '../../../../../../widgets/TableHeader'
const defaultData = [
    {
        _id: '1',
        placeId: 'PP2150',
        status: 'Active',
        propertyNameEn: 'Meylee Auto',
        propertyNameKh: 'មុី ម៉ីឡេអូតូ',
        image:
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&auto=format&fit=crop&q=60',
        role: 'Owner',
        category: 'សេវាកម្មយានយន្ត',
        cityProvince: 'Phnom Penh',
    },
    {
        _id: '2',
        placeId: 'PP2150',
        status: 'Active',
        propertyNameEn: 'Happy Family BBQ & SOUP SUKI',
        propertyNameKh: 'Happy Family BBQ & SOUP SUKI',
        image:
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=60',
        role: 'Admin',
        category: 'អាហារនិងភេសជ្ជៈ',
        cityProvince: 'Phnom Penh',
    },
]

const TabBusinessPlaceUserProfile = ({
    data = defaultData,
    loading = false,
    onView,
    onEdit,
    onDelete,
}) => {
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    const tableData = useMemo(() => {
        return Array.isArray(data) ? data : []
    }, [data])

    const handleView = (record) => {
        onView?.(record)
    }

    const handleEdit = (record) => {
        onEdit?.(record)
    }

    const handleDelete = (record) => {
        onDelete?.(record)
    }

    const getMenuItems = (record) => [
        {
            key: 'view',
            label: 'View',
            icon: <EyeOutlined style={{ color: 'green' }} />,
            onClick: () => handleView(record),
        },
        {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => handleEdit(record),
        },
        {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined style={{ color: 'red' }} />,
            onClick: () => handleDelete(record),
        },
    ]

    const columns = [
        {
            title: <span className='table-header'></span>,
            dataIndex: 'actionMenu',
            key: 'actionMenu',
            width: 60,
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={{ items: getMenuItems(record) }}
                    trigger={['click']}
                    placement='bottomLeft'
                >
                    <Button
                        type='text'
                        icon={<FaEllipsisV rotate={90} />}
                        className='!text-gray-700'
                    />
                </Dropdown>
            ),
        },
        {
            title: <span className='table-header'>Place ID</span>,
            dataIndex: 'placeId',
            key: 'placeId',
            width: 120,
            align: 'center',
            render: (text) => (
                <Text className='font-medium text-[14px] text-slate-500'>{text || '-'}</Text>
            ),
        },
        {
            title: <span className='table-header'>Status</span>,
            dataIndex: 'status',
            key: 'status',
            width: 130,
            align: 'center',
            render: (text) => (
                <span
                    style={{
                        background: text === 'Active' ? '#69c51f' : '#d9d9d9',
                        color: '#fff',
                        padding: '2px 14px',
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: 12,
                        display: 'inline-block',
                        minWidth: 72,
                        textAlign: 'center',
                    }}
                >
                    {text || '-'}
                </span>
            ),
        },
        {
            title: <span className='table-header'>Property Profile</span>,
            dataIndex: 'propertyProfile',
            key: 'propertyProfile',
            align: 'left',
            width: 420,
            render: (_, record) => (
                <div
                    className='flex items-center'
                    style={{
                        gap: 12,
                        justifyContent: 'flex-start',
                    }}
                >
                    <div
                        style={{
                            width: 60,
                            height: 40,
                            minWidth: 30,
                            borderRadius: 5,
                            overflow: 'hidden',
                            border: '1px solid #E5E7EB',
                            background: '#F3F4F6',
                        }}
                    >
                        <img
                            src={record?.image}
                            alt={record?.propertyNameEn || 'property'}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    </div>

                    <div
                        className='cursor-pointer'
                        onClick={() => handleView(record)}
                        style={{ lineHeight: 1.25, textAlign: 'left' }}
                    >
                        <div
                            className='hover:underline'
                            style={{
                                color: '#1E40AF',
                                fontWeight: 700,
                                fontSize: 14,
                            }}
                        >
                            {record?.propertyNameEn || '-'}
                        </div>

                        <div
                            style={{
                                color: '#6B7280',
                                fontSize: 14,
                                fontWeight: 500,
                                marginTop: 2,
                            }}
                        >
                            {record?.propertyNameKh || ''}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: <span className='table-header'>Role</span>,
            dataIndex: 'role',
            key: 'role',
            width: 140,
            align: 'center',
            render: (text) => (
                <span
                    style={{
                        background: '#fff',
                        color: '#333',
                        padding: '0px 14px',
                        borderRadius: 14,
                        border: '1px solid #D9D9D9',
                        fontWeight: 500,
                        fontSize: 14,
                        display: 'inline-block',
                        minWidth: 74,
                        textAlign: 'center',
                    }}
                >
                    {text || '-'}
                </span>
            ),
        },
        {
            title: <span className='table-header'>Category</span>,
            dataIndex: 'category',
            key: 'category',
            width: 180,
            align: 'center',
            render: (text) => (
                <Text className='font-medium text-[14px] text-slate-500'>{text || '-'}</Text>
            ),
        },
        {
            title: <span className='table-header'>City/Province</span>,
            dataIndex: 'cityProvince',
            key: 'cityProvince',
            width: 180,
            align: 'center',
            render: (text) => (
                <Text className='font-medium text-[14px] text-slate-500'>{text || '-'}</Text>
            ),
        },
    ]

    const pagination = {
        current: currentPage,
        pageSize,
        total: tableData?.length || 0,
        onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
        },
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomRight'],
    }

    return (
        <>
            <TableHeader total={tableData?.length} label="Total Amount">
                <div className=''>
                    <Table
                        rowKey={(record) => record?._id}
                        columns={columns}
                        dataSource={tableData}
                        pagination={pagination}
                        bordered={false}
                        size='small'
                        scroll={{ x: 'max-content' }}
                        loading={loading}
                        className='business-place-user-profile-table'
                        locale={{
                            emptyText: 'No business place found',
                        }}
                    />
                </div>
            </TableHeader>
        </>
    )
}

export default TabBusinessPlaceUserProfile