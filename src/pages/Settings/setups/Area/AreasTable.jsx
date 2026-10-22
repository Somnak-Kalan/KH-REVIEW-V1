import React, { useMemo } from 'react'
import { Avatar, Popconfirm, Space, Table, Typography, Tooltip, Button } from 'antd'
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons'
import StatusTag from '../../../../components/Area/dashboard/StatusTag'
import dayjs from 'dayjs'

const { Text } = Typography

const formatTypeTitle = (v) =>
    (v ?? '')
        .toString()
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())

export default function AreasTable({
    data = [],
    onView,
    onEdit,
    onDelete,
    checkPermission,
    PERMS,
    ImageLoading,
    loading: loadingList
}) {
    const columns = useMemo(
        () => [
            {
                title: 'Area',
                dataIndex: 'name',
                key: 'area',
                render: (_, record) => (
                    <Space>
                        <Avatar
                            shape="square"
                            size={44}
                            src={record?.cover?.url}
                            style={{ borderRadius: 10 }}
                        />

                        <div
                            style={{ lineHeight: 1.2, minWidth: 0 }}
                            className="cursor-pointer"
                            onClick={() => onView(record)}
                        >
                            {/* Name EN + KH */}
                            <Text strong className="text-blue-800 dark:text-slate-200">
                                {record?.nameEn || ''}
                                {record?.nameKh ? (
                                    <Text className="dark:text-slate-400" type="secondary">
                                        {' '}
                                        — {record.nameKh}
                                    </Text>
                                ) : null}
                            </Text>

                            {/* Description */}
                            <div style={{ maxWidth: 520 }}>
                                <Text
                                    type="secondary"
                                    ellipsis
                                    className="dark:text-slate-400"
                                >
                                    {record?.descriptionEn || record?.description || ''}
                                </Text>
                            </div>
                        </div>
                    </Space>
                ),
            },

            {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (v) => (
                    <span className="text-slate-700 dark:text-slate-300">
                        {formatTypeTitle(v)}
                    </span>
                ),
            },

            {
                title: 'Province',
                key: 'province',
                render: (_, record) => {
                    const p = record?.province || {}
                    const en = p?.provinceEn || ''
                    const kh = p?.provinceKh || ''
                    return (
                        <div style={{ lineHeight: 1.2, minWidth: 0 }}>
                            <Text strong className="dark:text-slate-200">
                                {en}
                            </Text>
                            {kh ? (
                                <div>
                                    <Text type="secondary" className="dark:text-slate-400">
                                        {kh}
                                    </Text>
                                </div>
                            ) : null}
                        </div>
                    )
                },
            },

            {
                title: 'District',
                key: 'district',
                render: (_, record) => {
                    const d = record?.district || {}
                    const en = d?.districtEn || ''
                    const kh = d?.districtKh || ''
                    return (
                        <div style={{ lineHeight: 1.2, minWidth: 0 }}>
                            <Text strong className="dark:text-slate-200">
                                {en}
                            </Text>
                            {kh ? (
                                <div>
                                    <Text type="secondary" className="dark:text-slate-400">
                                        {kh}
                                    </Text>
                                </div>
                            ) : null}
                        </div>
                    )
                },
            },

            {
                title: 'Places',
                dataIndex: 'placesCount',
                key: 'placeCount',
                render: (_, r) => (
                    <Space size={6} className="text-slate-700 dark:text-slate-300">
                        <EnvironmentOutlined style={{ fontSize: 14 }} />
                        <span>{r?.placeCount} places</span>
                    </Space>
                ),
            },

            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (v) => <StatusTag value={v} />,
            },

            {
                title: 'Created',
                key: 'created',
                render: (_, r) => (
                    <div style={{ lineHeight: 1.2 }}>
                        <div className="text-slate-700 dark:text-slate-200">
                            {dayjs(r.createdAt).format('MM-DD-YYYY')}
                        </div>
                        <Text type="secondary" className="dark:text-slate-400">
                            by {r.createdBy}
                        </Text>
                    </div>
                ),
            },

            {
                title: <span className="table-header dark:text-slate-200">Action</span>,
                dataIndex: 'action',
                key: 'action',
                align: 'center',
                width: 50,
                render: (_, record) => (
                    <div className="flex justify-center">
                        <Tooltip title="View">
                            <Button
                                icon={<EyeOutlined style={{ color: 'green' }} />}
                                shape="circle"
                                size="small"
                                onClick={() => onView(record)}
                                style={{ marginRight: 8 }}
                            />
                        </Tooltip>

                        <Tooltip
                            title={
                                checkPermission(PERMS.ASSIGNED_USER)
                                    ? 'Edit'
                                    : 'You don’t have permission '
                            }
                        >
                            <Button
                                disabled={!checkPermission(PERMS.ASSIGNED_USER)}
                                icon={<EditOutlined />}
                                shape="circle"
                                size="small"
                                onClick={() => onEdit(record)}
                                style={{ marginRight: 8 }}
                            />
                        </Tooltip>

                        {checkPermission(PERMS.ASSIGNED_USER) ? (
                            <Tooltip title="Delete">
                                <Popconfirm
                                    title="Are you sure you want to delete this record?"
                                    onConfirm={() => onDelete(record)}
                                    okText="Yes"
                                    cancelText="No"
                                    placement="top"
                                >
                                    <Button
                                        icon={<DeleteOutlined />}
                                        shape="circle"
                                        size="small"
                                        danger
                                    />
                                </Popconfirm>
                            </Tooltip>
                        ) : (
                            <Tooltip title="You don’t have permission">
                                <Button
                                    disabled
                                    icon={<DeleteOutlined />}
                                    shape="circle"
                                    size="small"
                                />
                            </Tooltip>
                        )}
                    </div>
                ),
            },
        ],
        [onView, onEdit, onDelete, checkPermission, PERMS]
    )

    return (
        <div style={{ position: 'relative' }}>
            {loadingList && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.6)',
                    }}
                >
                    <ImageLoading overlay={false} size={60} logoSize={25} />
                </div>
            )}
            <Table
                rowKey={(r) => r.id}
                columns={columns}
                size="small"
                scroll={{ x: 'max-content' }}
                dataSource={data}
                pagination={false}
                className="dark:bg-slate-900 dark:text-slate-200"
            />
        </div>


    )
}
