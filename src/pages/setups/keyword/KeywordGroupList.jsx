import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Table, Tooltip } from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
} from '@ant-design/icons'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import dayjs from 'dayjs'

import AddKeywordGroupModal from './funstions/AddKeywordGroupModal'
import EditKeywordGroupModal from './funstions/EditKeywordGroupModal'
import {
    keywordOptions,
    mockGroups,
} from './data/keywordData'

import useKeywordGroupStore from '../../../Stores/settings/setups/keyword-group.store'

const getNameByLanguage = (names = [], language) => {
    if (!Array.isArray(names)) return ''

    return (
        names.find((item) => item?.lang === language)?.value?.trim() || ''
    )
}

const getKeywordLabel = (keyword) => {
    if (!keyword) return '-'

    if (typeof keyword === 'string') {
        const found = keywordOptions.find((item) => {
            return item.value === keyword
        })

        return found?.label || keyword || '-'
    }

    const nameEn =
        keyword?.nameEn ||
        getNameByLanguage(keyword?.names, 'en')

    const nameKh =
        keyword?.nameKh ||
        getNameByLanguage(keyword?.names, 'kh')

    if (nameEn && nameKh) {
        return `${nameEn} / ${nameKh}`
    }

    return nameEn || nameKh || '-'
}

const getKeywordKey = (keyword, index) => {
    if (typeof keyword === 'string') {
        return `${keyword}-${index}`
    }

    return (
        keyword?._id ||
        `${getKeywordLabel(keyword)}-${index}`
    )
}

const KeywordMiniTag = ({
    keyword,
}) => {
    const label =
        getKeywordLabel(keyword)

    const [en, kh] =
        label.split(' / ')

    return (
        <span className='inline-flex items-center rounded-[3px] bg-blue-50 px-2 py-[2px] text-[11px] leading-none'>
            <span className='font-medium text-blue-600'>
                {en}
            </span>

            {kh ? (
                <>
                    <span className='mx-[3px] text-gray-400'>
                        /
                    </span>

                    <span className='font-medium text-gray-400'>
                        {kh}
                    </span>
                </>
            ) : null}
        </span>
    )
}

const KeywordGroupList = ({
    canManage = false,
    search = '',
    addSignal = 0,
    tableOnly = false,
    access_token = '',
}) => {
    const navigate = useNavigate()

    const [groups, setGroups] =
        useState(mockGroups)

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
        selectedRecord,
        setSelectedRecord,
    ] = useState(null)

    const [
        debouncedSearch,
        setDebouncedSearch,
    ] = useState(
        (search || '').trim()
    )

    const {
        groups: apiGroups,
        pagination,
        loading: listLoading,
        deleting,
        hasLoaded,
        fetchKeywordGroups,
        deleteKeywordGroup,
    } = useKeywordGroupStore()

    const filteredGroups =
        useMemo(() => {
            const value = (
                search || ''
            )
                .trim()
                .toLowerCase()

            if (!value) return groups

            return groups.filter(
                (item) => {
                    const keywordText =
                        item.keywords
                            ?.map(
                                (keyword) =>
                                    getKeywordLabel(
                                        keyword
                                    )
                            )
                            ?.join(' ')
                            ?.toLowerCase() ||
                        ''

                    return (
                        item.nameEn
                            ?.toLowerCase()
                            .includes(value) ||
                        item.nameKh
                            ?.toLowerCase()
                            .includes(value) ||
                        keywordText.includes(
                            value
                        )
                    )
                }
            )
        }, [groups, search])

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
        /*
            Wait until AuthContext provides the token.
            Send an empty string when the search input is cleared.
        */
        if (!access_token) return

        fetchKeywordGroups({
            access_token,
            page: currentPage,
            limit: pageSize,
            search: debouncedSearch,
        }).catch(() => {
            // Error state is already stored in Zustand.
        })
    }, [
        access_token,
        currentPage,
        pageSize,
        debouncedSearch,
        fetchKeywordGroups,
    ])

    useEffect(() => {
        if (hasLoaded) {
            setGroups(apiGroups)
        }
    }, [
        apiGroups,
        hasLoaded,
    ])

    const lastAddSignalRef =
        useRef(addSignal)

    useEffect(() => {
        if (
            addSignal >
            lastAddSignalRef.current
        ) {
            setSelectedRecord(null)
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

    const handleView = (record) => {
        navigate(
            `/keyword/group/${record._id}`,
            {
                state: {
                    group: record,
                },
            }
        )
    }

    const handleEdit = (record) => {
        setSelectedRecord(record)
        setOpenEdit(true)
    }

    const handleDelete = async (
        record
    ) => {
        const result =
            await Swal.fire({
                title: 'Are you sure?',
                text:
                    'Do you really want to delete this group keyword?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText:
                    'Yes, delete it!',
                cancelButtonText:
                    'No',
                confirmButtonColor:
                    '#ef4444',
                cancelButtonColor:
                    '#1677ff',
            })

        if (!result.isConfirmed) {
            return
        }

        setLoading(true)

        try {
            await deleteKeywordGroup({
                id: record._id,
                access_token,
                moveKeywordsToUngrouped: true,
            })

            const shouldMoveToPreviousPage =
                groups.length === 1 &&
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
                await fetchKeywordGroups({
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
                    'The group keyword has been deleted.',
                icon: 'success',
                timer: 1300,
                showConfirmButton:
                    false,
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
                    'Unable to delete this group keyword.',
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
            title: 'Group Name',
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
                    <div
                        className='cursor-pointer font-semibold text-[#1E40AF] dark:text-[#60A5FA] hover:underline'
                        onClick={() =>
                            handleView(
                                record
                            )
                        }
                    >
                        {record.nameEn ||
                            '-'}
                    </div>

                    <div className='text-xs font-semibold text-gray-500 dark:text-slate-400'>
                        {record.nameKh ||
                            '-'}
                    </div>
                </div>
            ),
        },
        {
            title: 'Keywords',
            dataIndex: 'keywords',
            key: 'keywords',
            render: (_, record) => {
                const keywords =
                    Array.isArray(
                        record?.keywords
                    )
                        ? record.keywords
                        : []

                const visibleKeywords =
                    keywords.slice(0, 3)

                const hiddenKeywords =
                    keywords.slice(3)

                const hiddenCount =
                    Number(
                        record?.moreKeywordCount ||
                        0
                    ) ||
                    hiddenKeywords.length

                return (
                    <div className='flex flex-wrap items-center gap-1'>
                        {visibleKeywords.map(
                            (
                                keyword,
                                index
                            ) => (
                                <KeywordMiniTag
                                    key={getKeywordKey(
                                        keyword,
                                        index
                                    )}
                                    keyword={
                                        keyword
                                    }
                                />
                            )
                        )}

                        {hiddenCount >
                            0 ? (
                            <Tooltip
                                title={
                                    hiddenKeywords.length >
                                        0 ? (
                                        <div className='max-w-[260px] space-y-1'>
                                            {hiddenKeywords.map(
                                                (
                                                    keyword,
                                                    index
                                                ) => (
                                                    <div
                                                        key={getKeywordKey(
                                                            keyword,
                                                            index
                                                        )}
                                                    >
                                                        {getKeywordLabel(
                                                            keyword
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        `${hiddenCount} more keywords`
                                    )
                                }
                            >
                                <span className='inline-flex cursor-pointer items-center rounded-[3px] bg-gray-100 px-2 py-[2px] text-[11px] font-medium leading-none text-gray-600 hover:bg-gray-200'>
                                    +{' '}
                                    {
                                        hiddenCount
                                    }{' '}
                                    more
                                </span>
                            </Tooltip>
                        ) : null}
                    </div>
                )
            },
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
            width: 150,
            render: (_, record) => (
                <div className='flex items-center justify-center gap-2'>
                    <Tooltip title='View'>
                        <Button
                            size='small'
                            shape='circle'
                            icon={
                                <EyeOutlined
                                    style={{
                                        color:
                                            'green',
                                    }}
                                />
                            }
                            onClick={() =>
                                handleView(
                                    record
                                )
                            }
                        />
                    </Tooltip>

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
                    ) : null}
                </div>
            ),
        },
    ]

    const tableNode = (
        <Table
            rowKey='_id'
            columns={columns}
            dataSource={
                filteredGroups
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
                    hasLoaded
                        ? pagination?.total ||
                        0
                        : filteredGroups.length,

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
    )

    return (
        <>
            <AddKeywordGroupModal
                open={openAdd}
                onCancel={() => {
                    setOpenAdd(false)
                }}
                groups={groups}
                access_token={
                    access_token
                }
            />

            <EditKeywordGroupModal
                open={openEdit}
                record={
                    selectedRecord
                }
                onCancel={() => {
                    setOpenEdit(false)
                    setSelectedRecord(
                        null
                    )
                }}
                groups={groups}
                access_token={
                    access_token
                }
            />

            {tableOnly ? (
                tableNode
            ) : (
                <div className='rounded-lg bg-white dark:bg-slate-900'>
                    {tableNode}
                </div>
            )}
        </>
    )
}

export default KeywordGroupList