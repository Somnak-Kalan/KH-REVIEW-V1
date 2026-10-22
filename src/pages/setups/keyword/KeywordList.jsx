import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {
    Button,
    Table,
    Tag,
    Tooltip,
} from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
} from '@ant-design/icons'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import dayjs from 'dayjs'
import AddKeywordModal from './funstions/AddKeywordModal'
import EditKeywordModal from './funstions/EditKeywordModal'
import useKeywordStore from '../../../Stores/settings/setups/keyword.store'

const groupOptions = [
    {
        label:
            'Historical & Cultural Sites',
        value:
            'Historical & Cultural Sites',
    },
    {
        label:
            'Natural Attractions',
        value:
            'Natural Attractions',
    },
    {
        label:
            'Beaches & Islands',
        value:
            'Beaches & Islands',
    },
    {
        label:
            'Markets & Shopping',
        value:
            'Markets & Shopping',
    },
    {
        label:
            'Romantic & Couple Spots',
        value:
            'Romantic & Couple Spots',
    },
]

const mockKeywords = []

const KeywordList = ({
    canManage = false,
    search = '',
    addSignal = 0,
    access_token = '',
}) => {
    const [keywords, setKeywords] =
        useState(mockKeywords)

    const [loading, setLoading] =
        useState(false)

    const [currentPage, setCurrentPage] =
        useState(1)

    const [pageSize, setPageSize] =
        useState(10)

    const [openAdd, setOpenAdd] =
        useState(false)

    const [openEdit, setOpenEdit] =
        useState(false)

    const [
        editingRecord,
        setEditingRecord,
    ] = useState(null)

    const [
        debouncedSearch,
        setDebouncedSearch,
    ] = useState(
        (search || '').trim()
    )

    const {
        keywords: apiKeywords,
        pagination,
        loading: listLoading,
        deleting,
        hasLoaded,
        fetchKeywords,
        deleteKeyword,
    } = useKeywordStore()

    const filteredKeywords =
        useMemo(() => {
            const value = (
                search || '')
                .trim()
                .toLowerCase()

            if (!value) return keywords

            return keywords.filter(
                (item) => {
                    return (
                        item.nameEn
                            ?.toLowerCase()
                            .includes(value) ||
                        item.nameKh
                            ?.toLowerCase()
                            .includes(value) ||
                        item.group
                            ?.toLowerCase()
                            .includes(value)
                    )
                }
            )
        }, [keywords, search])

    useEffect(() => {
        const timer =
            setTimeout(() => {
                setCurrentPage(1)

                setDebouncedSearch(
                    (search || '').trim()
                )
            }, 400)

        return () => {
            clearTimeout(timer)
        }
    }, [search])

    useEffect(() => {

        if (!access_token) return

        fetchKeywords({
            access_token,
            page: currentPage,
            limit: pageSize,


            search: debouncedSearch,
        }).catch(() => {
            // Error state is already handled by the store.
        })
    }, [
        access_token,
        currentPage,
        pageSize,
        debouncedSearch,
        fetchKeywords,
    ])

    useEffect(() => {
        if (hasLoaded) {
            setKeywords(apiKeywords)
        }
    }, [apiKeywords, hasLoaded])

    const lastAddSignalRef =
        useRef(addSignal)

    useEffect(() => {
        if (
            addSignal >
            lastAddSignalRef.current
        ) {
            setEditingRecord(null)
            setOpenAdd(true)
        }
        lastAddSignalRef.current =
            addSignal
    }, [addSignal])

    const renderNo = (
        _,
        __,
        index
    ) => {
        return (
            (currentPage - 1) *
            pageSize +
            index +
            1
        )
    }
    const handleEdit = (record) => {
        setEditingRecord(record)
        setOpenEdit(true)
    }
    const handleDelete = async (
        record
    ) => {
        const result =
            await Swal.fire({
                title: 'Are you sure?',
                text:
                    'Do you really want to delete this keyword?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText:
                    'Yes, delete it!',
                cancelButtonText: 'No',
                confirmButtonColor:
                    '#ef4444',
                cancelButtonColor:
                    '#1677ff',
                reverseButtons: false,
            })

        if (!result.isConfirmed) {
            return
        }

        setLoading(true)

        try {
            await deleteKeyword({
                id: record._id,
                access_token,
            })

            const shouldMoveToPreviousPage =
                keywords.length === 1 &&
                currentPage > 1

            const nextPage =
                shouldMoveToPreviousPage
                    ? currentPage - 1
                    : currentPage

            if (
                nextPage !== currentPage
            ) {
                setCurrentPage(nextPage)
            } else {
                await fetchKeywords({
                    access_token,
                    page: nextPage,
                    limit: pageSize,
                    search:
                        debouncedSearch,

                    force: true,
                })
            }

            await Swal.fire({
                title: 'Deleted!',
                text:
                    'The keyword has been deleted.',
                icon: 'success',
                timer: 1300,
                showConfirmButton: false,
            })
        } catch (error) {
            await Swal.fire({
                title: 'Delete failed!',
                text:
                    error?.response?.data
                        ?.message ||
                    error?.response?.data
                        ?.error ||
                    error?.message ||
                    'Unable to delete this keyword.',
                icon: 'error',
            })
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            title: 'No',
            width: 60,
            align: 'center',
            render: renderNo,
        },
        {
            title: 'Keyword Name',
            dataIndex: 'nameEn',
            key: 'nameEn',
            sorter: (a, b) =>
                (
                    a.nameEn || ''
                ).localeCompare(
                    b.nameEn || ''
                ),
            render: (_, record) => (
                <div className='leading-tight'>
                    <div className=' font-semibold text-[#1E40AF] dark:text-slate-400'>
                        {record.nameEn ||
                            '-'}
                    </div>
                    <div className='text-xs font-semibold  dark:text-slate-400'>
                        {record.nameKh ||
                            '-'}
                    </div>
                </div>
            ),
        },
        {
            title: 'Group',
            dataIndex: 'group',
            key: 'group',

            render: (group) =>
                group ? (
                    <Tag
                        bordered={false}
                        className='m-0 rounded-lg border-0 bg-blue-50 px-4 py-1 text-xs font-normal text-blue-600 dark:bg-blue-950/50 dark:text-blue-300'
                    >
                        {group}
                    </Tag>
                ) : (
                    <span className='text-gray-400 dark:text-slate-500'>
                        -
                    </span>
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
            render: (date) =>
                dayjs(date).format(
                    'YYYY-MM-DD'
                ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <div className='flex items-center justify-center gap-2'>
                    {canManage ? (
                        <>
                            <Tooltip title='Edit'>
                                <Button
                                    size='small'
                                    shape='circle'
                                    icon={
                                        <EditOutlined />
                                    }
                                    onClick={() =>
                                        handleEdit(
                                            record
                                        )
                                    }
                                />
                            </Tooltip>

                            <Tooltip title='Delete'>
                                <Button
                                    size='small'
                                    shape='circle'
                                    danger
                                    icon={
                                        <DeleteOutlined />
                                    }
                                    onClick={() =>
                                        handleDelete(
                                            record
                                        )
                                    }
                                />
                            </Tooltip>
                        </>
                    ) : (
                        <span className='text-gray-400'>
                            No permission
                        </span>
                    )}
                </div>
            ),
        },
    ]

    return (
        <>
            <AddKeywordModal
                open={openAdd}
                onCancel={() => {
                    setOpenAdd(false)
                }}
                keywords={keywords}
                groupOptions={groupOptions}
                access_token={access_token}
            />

            <EditKeywordModal
                open={openEdit}
                record={editingRecord}
                onCancel={() => {
                    setOpenEdit(false)
                    setEditingRecord(null)
                }}
                keywords={keywords}
                groupOptions={groupOptions}
                access_token={access_token}
            />

            <div className='rounded-lg bg-white dark:bg-slate-900'>
                <Table
                    rowKey='_id'
                    columns={columns}
                    dataSource={
                        filteredKeywords
                    }
                    loading={
                        loading ||
                        listLoading ||
                        deleting
                    }
                    scroll={{
                        x: 'max-content',
                    }}
                    pagination={{
                        current:
                            currentPage,

                        pageSize,

                        total:
                            pagination?.total ||
                            0,

                        showSizeChanger:
                            true,

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
                            const isChangingPageSize =
                                size !==
                                pageSize

                            setCurrentPage(
                                isChangingPageSize
                                    ? 1
                                    : page
                            )

                            setPageSize(size)
                        },
                    }}
                />
            </div>
        </>
    )
}

export default KeywordList