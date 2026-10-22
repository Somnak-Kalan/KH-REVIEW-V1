import {
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    Button,
    Input,
    Modal,
    Pagination,
    Select,
    Table,
    message,
} from 'antd'
import {
    CloseOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'

import { AuthContext } from '../../../../contexts/AuthContext'
import KeywordService from '../../../../services/settings/setups/Keyword'
import useKeywordGroupStore from '../../../../Stores/settings/setups/keyword-group.store'

const PAGE_SIZE_OPTIONS = [
    '10',
    '20',
    '50',
    '100',
]

const DEFAULT_KEYWORD_PAGINATION = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
}

const getErrorMessage = (
    error,
    fallbackMessage
) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallbackMessage
    )
}

const getNameByLanguage = (
    names = [],
    language
) => {
    if (!Array.isArray(names)) {
        return ''
    }

    return (
        names.find((item) => {
            return (
                item?.lang ===
                language
            )
        })?.value?.trim() || ''
    )
}

const normalizeKeyword = (
    item = {}
) => {
    return {
        ...item,

        nameEn:
            item?.nameEn ||
            getNameByLanguage(
                item?.names,
                'en'
            ),

        nameKh:
            item?.nameKh ||
            getNameByLanguage(
                item?.names,
                'kh'
            ),

        searchCount:
            Number(
                item?.searchCount ||
                0
            ),
    }
}

const getResponsePayload = (
    response
) => {
    if (
        Array.isArray(
            response?.data?.data
        ) ||
        response?.data?.pagination
    ) {
        return response.data
    }

    return response || {}
}

const TransferKeywordModal = ({
    open,
    keyword,
    keywords = [],
    currentGroup,
    groups = [],
    onCancel,
    onSuccess,
    access_token = '',
}) => {
    const {
        access_token:
        contextAccessToken,
    } = useContext(
        AuthContext
    )

    const token =
        access_token ||
        contextAccessToken

    const {
        transferGroups,
        transferLoading,
        transferring,
        transferOptionsHasLoaded,
        fetchTransferOptions,
        transferKeywordsToGroup,
    } = useKeywordGroupStore()

    const [
        targetGroupId,
        setTargetGroupId,
    ] = useState()

    const [
        search,
        setSearch,
    ] = useState('')

    const [
        selectedRowKeys,
        setSelectedRowKeys,
    ] = useState([])

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1)

    const [
        pageSize,
        setPageSize,
    ] = useState(10)

    /*
        These keywords belong to the
        current keyword group.
    */
    const [
        groupedKeywords,
        setGroupedKeywords,
    ] = useState([])

    const [
        groupedPagination,
        setGroupedPagination,
    ] = useState(
        DEFAULT_KEYWORD_PAGINATION
    )

    const [
        groupedKeywordsLoading,
        setGroupedKeywordsLoading,
    ] = useState(false)

    const isSingleKeywordMode =
        Boolean(
            keyword?._id
        )

    /*
        Load groups from API after opening
        the modal.

        Keep groups from the parent component
        only as fallback.
    */
    const allGroups =
        transferOptionsHasLoaded
            ? transferGroups
            : groups

    /*
        Show all groups in the dropdown.

        Disable the current group because
        keywords already belong to it.
    */
    const targetGroups =
        useMemo(() => {
            return allGroups
                .filter((item) => {
                    return Boolean(
                        item?._id
                    )
                })
                .map((item) => {
                    const isCurrentGroup =
                        item._id ===
                        currentGroup?._id

                    return {
                        label:
                            isCurrentGroup
                                ? `${item.nameEn} (Current group)`
                                : item.nameEn,

                        value:
                            item._id,

                        disabled:
                            isCurrentGroup,
                    }
                })
        }, [
            allGroups,
            currentGroup?._id,
        ])

    /*
        When transfer opens from one keyword row,
        display only that keyword.

        When transfer opens from the detail-page
        button, display keywords in the current group.
    */
    const keywordRows =
        useMemo(() => {
            if (
                isSingleKeywordMode
            ) {
                return keyword
                    ? [
                        keyword,
                    ]
                    : []
            }

            return (
                groupedKeywords ||
                []
            )
        }, [
            isSingleKeywordMode,
            keyword,
            groupedKeywords,
        ])

    /*
        Group keyword search is handled by API.

        Single keyword search remains local because
        there is only one keyword in that mode.
    */
    const filteredRows =
        useMemo(() => {
            const value =
                String(
                    search ||
                    ''
                )
                    .trim()
                    .toLowerCase()

            if (
                !value ||
                !isSingleKeywordMode
            ) {
                return keywordRows
            }

            return keywordRows.filter(
                (item) => {
                    return (
                        item.nameEn
                            ?.toLowerCase()
                            .includes(
                                value
                            ) ||
                        item.nameKh
                            ?.toLowerCase()
                            .includes(
                                value
                            )
                    )
                }
            )
        }, [
            keywordRows,
            search,
            isSingleKeywordMode,
        ])

    /*
        Group keywords are already paginated by API.

        Only single-keyword mode uses frontend
        pagination.
    */
    const paginatedRows =
        useMemo(() => {
            if (
                !isSingleKeywordMode
            ) {
                return filteredRows
            }

            const startIndex =
                (
                    currentPage -
                    1
                ) *
                pageSize

            const endIndex =
                startIndex +
                pageSize

            return filteredRows.slice(
                startIndex,
                endIndex
            )
        }, [
            filteredRows,
            currentPage,
            pageSize,
            isSingleKeywordMode,
        ])

    const selectedTargetGroup =
        useMemo(() => {
            return (
                allGroups.find(
                    (item) => {
                        return (
                            item._id ===
                            targetGroupId
                        )
                    }
                ) ||
                null
            )
        }, [
            allGroups,
            targetGroupId,
        ])

    const sourceGroupName =
        currentGroup?.nameEn ||
        '-'

    const keywordTotal =
        isSingleKeywordMode
            ? filteredRows.length
            : groupedPagination.total

    /*
        Load all keyword groups for the
        target-group dropdown.
    */
    useEffect(() => {
        if (!open) return

        if (
            !currentGroup?._id ||
            !token
        ) {
            return
        }

        fetchTransferOptions({
            fromGroupId:
                currentGroup._id,

            access_token:
                token,
        }).catch((error) => {
            message.error(
                getErrorMessage(
                    error,
                    'Unable to load transfer options.'
                )
            )
        })
    }, [
        open,
        currentGroup?._id,
        token,
        fetchTransferOptions,
    ])

    /*
        Reset modal state whenever
        the modal opens.
    */
    useEffect(() => {
        if (!open) return

        setTargetGroupId(
            undefined
        )

        setSearch(
            ''
        )

        setCurrentPage(
            1
        )

        setPageSize(
            10
        )

        setGroupedKeywords(
            []
        )

        setGroupedPagination(
            DEFAULT_KEYWORD_PAGINATION
        )

        if (
            isSingleKeywordMode &&
            keyword?._id
        ) {
            setSelectedRowKeys([
                keyword._id,
            ])
        } else {
            setSelectedRowKeys(
                []
            )
        }
    }, [
        open,
        isSingleKeywordMode,
        keyword,
    ])

    /*
        Return to the first page when
        searching.
    */
    useEffect(() => {
        setCurrentPage(
            1
        )
    }, [
        search,
    ])


    useEffect(() => {

        if (
            !open ||
            isSingleKeywordMode ||
            !token ||
            !currentGroup?._id
        ) {
            return
        }

        let ignore =
            false

        const timeoutId =
            setTimeout(
                async () => {
                    try {
                        setGroupedKeywordsLoading(
                            true
                        )

                        const response =
                            await KeywordService
                                .getKeywordList({
                                    access_token:
                                        token,

                                    params: {
                                        page:
                                            currentPage,

                                        limit:
                                            pageSize,

                                        search:
                                            search
                                                ?.trim(),

                                        groupId:
                                            currentGroup
                                                ._id,
                                    },
                                })

                        if (
                            ignore
                        ) {
                            return
                        }

                        const payload =
                            getResponsePayload(
                                response
                            )

                        const list =
                            Array.isArray(
                                payload?.data
                            )
                                ? payload.data
                                : []

                        const normalizedKeywords =
                            list.map(
                                normalizeKeyword
                            )

                        setGroupedKeywords(
                            normalizedKeywords
                        )

                        setGroupedPagination({
                            page:
                                Number(
                                    payload
                                        ?.pagination
                                        ?.page ||
                                    currentPage
                                ),

                            limit:
                                Number(
                                    payload
                                        ?.pagination
                                        ?.limit ||
                                    pageSize
                                ),

                            total:
                                Number(
                                    payload
                                        ?.pagination
                                        ?.total ||
                                    0
                                ),

                            totalPages:
                                Number(
                                    payload
                                        ?.pagination
                                        ?.totalPages ||
                                    0
                                ),
                        })
                    } catch (
                    error
                    ) {
                        if (
                            ignore
                        ) {
                            return
                        }

                        message.error(
                            getErrorMessage(
                                error,
                                'Unable to load keywords in this group.'
                            )
                        )
                    } finally {
                        if (
                            !ignore
                        ) {
                            setGroupedKeywordsLoading(
                                false
                            )
                        }
                    }
                },
                300
            )

        return () => {
            ignore =
                true

            clearTimeout(
                timeoutId
            )
        }
    }, [
        open,
        isSingleKeywordMode,
        token,
        currentGroup?._id,
        currentPage,
        pageSize,
        search,
    ])

    const handleClose = () => {
        setTargetGroupId(
            undefined
        )

        setSearch(
            ''
        )

        setSelectedRowKeys(
            []
        )

        setCurrentPage(
            1
        )

        setPageSize(
            10
        )

        setGroupedKeywords(
            []
        )

        setGroupedPagination(
            DEFAULT_KEYWORD_PAGINATION
        )

        onCancel?.()
    }

    const handleClearSelected = () => {
        setSelectedRowKeys(
            []
        )
    }

    const handleSubmit = async () => {
        if (
            selectedRowKeys
                .length ===
            0
        ) {
            message.warning(
                'Please select at least one keyword.'
            )

            return
        }

        if (
            !currentGroup?._id
        ) {
            message.error(
                'Current keyword group ID is required.'
            )

            return
        }

        /*
            The source group is always the
            current group.

            When no target group is selected,
            keywords move to Ungrouped.
        */
        const fromGroupId =
            currentGroup._id

        try {
            await transferKeywordsToGroup({
                keywordIds:
                    selectedRowKeys,

                fromGroupId,

                targetGroupId:
                    targetGroupId ||
                    null,

                access_token:
                    token,
            })

            const targetName =
                selectedTargetGroup
                    ?.nameEn ||
                'Ungrouped'

            message.success(
                `${selectedRowKeys.length} keyword${selectedRowKeys.length >
                    1
                    ? 's'
                    : ''
                } transferred to ${targetName} successfully`
            )

            onSuccess?.({
                keywordIds:
                    selectedRowKeys,

                fromGroupId,

                targetGroupId:
                    targetGroupId ||
                    null,

                targetGroup:
                    selectedTargetGroup,
            })

            handleClose()
        } catch (
        error
        ) {
            message.error(
                getErrorMessage(
                    error,
                    'Unable to transfer keyword.'
                )
            )
        }
    }

    const handlePaginationChange = (
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

        setPageSize(
            size
        )
    }

    const columns = [
        {
            title:
                'No',

            width:
                70,

            align:
                'center',

            render: (
                _,
                __,
                index
            ) => {
                return (
                    (
                        currentPage -
                        1
                    ) *
                    pageSize +
                    index +
                    1
                )
            },
        },
        {
            title:
                'Keyword Name',

            dataIndex:
                'nameEn',

            key:
                'nameEn',

            sorter: (
                a,
                b
            ) => {
                return (
                    a.nameEn ||
                    ''
                ).localeCompare(
                    b.nameEn ||
                    ''
                )
            },

            render: (
                _,
                record
            ) => (
                <div className='leading-tight'>
                    <div className='cursor-pointer font-semibold text-blue-700 hover:underline'>
                        {record.nameEn ||
                            '-'}
                    </div>

                    <div className='text-xs font-semibold text-gray-500'>
                        {record.nameKh ||
                            '-'}
                    </div>
                </div>
            ),
        },
        {
            title:
                'Search Count',

            dataIndex:
                'searchCount',

            key:
                'searchCount',

            width:
                160,

            align:
                'center',

            render: (
                value
            ) => {
                return (
                    value ||
                    0
                )
            },
        },
    ]

    return (
        <Modal
            open={open}
            title='Transfer keyword'
            onCancel={
                handleClose
            }
            footer={null}
            width={760}
            centered
            destroyOnHidden
            className='transfer-keyword-modal'
        >
            <div className='space-y-3'>
                <div>
                    <div className='mb-2 text-xs font-medium text-gray-700'>
                        Select group to transfer
                    </div>

                    <Select
                        allowClear
                        showSearch
                        value={
                            targetGroupId
                        }
                        loading={
                            transferLoading
                        }
                        placeholder='Select a group or leave ungrouped'
                        options={
                            targetGroups
                        }
                        optionFilterProp='label'
                        onChange={
                            setTargetGroupId
                        }
                        className='w-full'
                    />
                </div>

                <Input
                    allowClear
                    prefix={
                        <SearchOutlined className='text-gray-500' />
                    }
                    placeholder='Search keywords...'
                    value={
                        search
                    }
                    onChange={(e) => {
                        setSearch(
                            e.target
                                .value
                        )
                    }}
                />

                <div className='flex items-center justify-between gap-3'>
                    <div className='flex items-center gap-2 text-xs text-gray-700'>
                        <span>
                            Keywords in{' '}
                            <span className='font-semibold text-gray-900'>
                                {
                                    sourceGroupName
                                }
                            </span>
                        </span>

                        <span className='rounded-full bg-blue-600 px-2 py-[1px] text-[11px] font-semibold text-white'>
                            {
                                keywordTotal
                            }
                        </span>
                    </div>

                    {selectedRowKeys.length >
                        0 ? (
                        <button
                            type='button'
                            onClick={
                                handleClearSelected
                            }
                            className='flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100'
                        >
                            <span>
                                {
                                    selectedRowKeys
                                        .length
                                }{' '}
                                selected
                            </span>

                            <CloseOutlined />
                        </button>
                    ) : null}
                </div>

                <Table
                    size='small'
                    rowKey='_id'
                    columns={
                        columns
                    }
                    dataSource={
                        paginatedRows
                    }
                    loading={
                        transferLoading ||
                        groupedKeywordsLoading
                    }
                    scroll={{
                        x:
                            'max-content',
                    }}
                    pagination={
                        false
                    }
                    rowSelection={{
                        type:
                            'checkbox',

                        selectedRowKeys,

                        preserveSelectedRowKeys:
                            true,

                        onChange:
                            setSelectedRowKeys,
                    }}
                />

                <div className='flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between'>
                    <Pagination
                        current={
                            currentPage
                        }
                        pageSize={
                            pageSize
                        }
                        total={
                            keywordTotal
                        }
                        showSizeChanger
                        pageSizeOptions={
                            PAGE_SIZE_OPTIONS
                        }
                        onChange={
                            handlePaginationChange
                        }
                        onShowSizeChange={
                            handlePaginationChange
                        }
                    />

                    <Button
                        type='primary'
                        icon={
                            <PlusOutlined />
                        }
                        loading={
                            transferring
                        }
                        disabled={
                            transferring ||
                            selectedRowKeys
                                .length ===
                            0
                        }
                        onClick={
                            handleSubmit
                        }
                    >
                        Transfer keyword
                    </Button>
                </div>
            </div>

            <style>
                {`
                    .transfer-keyword-modal .ant-modal-content {
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .transfer-keyword-modal .ant-modal-header {
                        margin-bottom: 16px;
                    }

                    .transfer-keyword-modal .ant-modal-title {
                        font-size: 14px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .transfer-keyword-modal .ant-table {
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .transfer-keyword-modal .ant-table-thead > tr > th {
                        background: #10182c !important;
                        color: #ffffff !important;
                        font-size: 12px;
                        font-weight: 700;
                        border-bottom: none !important;
                    }

                    .transfer-keyword-modal .ant-table-tbody > tr > td {
                        font-size: 12px;
                        color: #334155;
                    }

                    .transfer-keyword-modal .ant-table-selection-column {
                        width: 44px;
                    }

                    .transfer-keyword-modal .ant-pagination {
                        margin: 0;
                    }

                    .transfer-keyword-modal .ant-pagination-options {
                        margin-inline-start: 8px;
                    }
                `}
            </style>
        </Modal>
    )
}

export default TransferKeywordModal