import {
    Button,
    Popconfirm,
    Table,
    Tooltip,
} from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import TableHeader from '../../../../widgets/TableHeader'
import RemoveIcon from '../../../../assets/icon/user/actionIcon/remove.svg'

const KeywordGroupDetailTable = ({
    group,
    keywords = [],
    loading = false,
    currentPage = 1,
    pageSize = 10,
    total = 0,
    onPageChange,
    onEdit,
    onRemove,
    onDelete,
}) => {
    const columns = [
        {
            title: 'No',
            width: 60,
            align: 'center',
            render: (_, __, index) => {
                return (
                    (currentPage - 1) *
                    pageSize +
                    index +
                    1
                )
            },
        },
        {
            title: 'Keyword Name',
            dataIndex: 'nameEn',
            key: 'nameEn',
            sorter: (a, b) => {
                return (
                    a.nameEn || ''
                ).localeCompare(
                    b.nameEn || ''
                )
            },
            render: (_, record) => (
                <div className='leading-tight'>
                    <div className='cursor-pointer font-semibold text-[#1E40AF] dark:text-[#60A5FA] '>
                        {record.nameEn || '-'}
                    </div>

                    <div className='text-xs font-semibold text-gray-500 dark:text-slate-400'>
                        {record.nameKh || '-'}
                    </div>
                </div>
            ),
        },
        {
            title: 'Search Count',
            dataIndex: 'searchCount',
            key: 'searchCount',
            align: 'center',
        },
        {
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy',
            align: 'center',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            render: (date) => {
                return date
                    ? dayjs(date).format(
                        'YYYY-MM-DD'
                    )
                    : '-'
            },
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 150,
            render: (_, record) => (
                <div className='flex items-center justify-center gap-2'>
                    <Tooltip title='Edit'>
                        <Button
                            size='small'
                            shape='circle'
                            icon={<EditOutlined />}
                            onClick={() => {
                                onEdit?.(record)
                            }}
                        />
                    </Tooltip>

                    <Popconfirm
                        title='Remove from group?'
                        description='This keyword will become ungrouped.'
                        okText='Remove'
                        cancelText='Cancel'
                        placement='topRight'
                        onConfirm={() => {
                            onRemove?.(record)
                        }}
                    >
                        <Tooltip >
                            <Button
                                size='small'
                                shape='circle'
                                icon={
                                    <img
                                        src={RemoveIcon}
                                        alt='remove keyword from group'
                                    />
                                }
                            />
                        </Tooltip>
                    </Popconfirm>

                    <Tooltip >
                        <Button
                            size='small'
                            shape='circle'
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                onDelete?.(record)
                            }}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ]

    return (
        <TableHeader
            total={
                <span className='rounded-full bg-blue-600 px-2 py-[1px] text-xs font-semibold text-white'>
                    {total}
                </span>
            }
            prefixText={`Keywords in "${group?.nameEn || '-'}"`}
        >
            <Table
                rowKey='_id'
                columns={columns}
                dataSource={keywords}
                loading={loading}
                scroll={{
                    x: 'max-content',
                }}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    pageSizeOptions: [
                        '10',
                        '20',
                        '50',
                        '100',
                    ],
                    onChange: (
                        page,
                        size
                    ) => {
                        onPageChange?.(
                            page,
                            size
                        )
                    },
                }}
            />
        </TableHeader>
    )
}

export default KeywordGroupDetailTable