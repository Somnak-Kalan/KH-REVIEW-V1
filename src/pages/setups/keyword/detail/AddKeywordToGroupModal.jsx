import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    Button,
    Form,
    Input,
    Modal,
    Pagination,
    Table,
    message,
} from 'antd'
import {
    CloseOutlined,
    LinkOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'

import { AuthContext } from '../../../../contexts/AuthContext'
import KeywordService from '../../../../services/settings/setups/Keyword'
import KeywordGroupService from '../../../../services/settings/setups/KeywordGroup'
import useKeywordGroupStore from '../../../../Stores/settings/setups/keyword-group.store'
import useKeywordStore from '../../../../Stores/settings/setups/keyword.store'

import KeywordCheckField, {
    findDuplicateKeyword,
    getKeywordGroupLabel,
    isDuplicateResponse,
} from '../../../../validation/setting/setup/keyword/KeywordCheckField'

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

const AddKeywordToGroupModal = ({
    open,
    group,
    keywords = [],
    availableKeywords = [],
    onCancel,
    access_token = '',
}) => {
    const [form] =
        Form.useForm()

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
        groupKeywordParams,
        params,
        fetchKeywordGroupKeywords,
        fetchKeywordGroupById,
        fetchKeywordGroups,
    } = useKeywordGroupStore()

    /*
        Use the same keyword-check API
        as Add Keyword and Edit Keyword.
    */
    const {
        checking,
        checkKeyword,
    } = useKeywordStore()

    const [
        activeMode,
        setActiveMode,
    ] = useState(
        'existing'
    )

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

    const [
        addingExisting,
        setAddingExisting,
    ] = useState(false)

    const [
        creatingNew,
        setCreatingNew,
    ] = useState(false)

    /*
        Keep English input state for
        KeywordCheckField suggestions.
    */
    const [
        keywordEn,
        setKeywordEn,
    ] = useState('')

    /*
        Load available ungrouped keywords
        directly inside this modal.
    */
    const [
        availableKeywordRows,
        setAvailableKeywordRows,
    ] = useState([])

    const [
        availableKeywordPagination,
        setAvailableKeywordPagination,
    ] = useState(
        DEFAULT_KEYWORD_PAGINATION
    )

    const [
        availableKeywordLoading,
        setAvailableKeywordLoading,
    ] = useState(false)

    const [
        availableKeywordsHasLoaded,
        setAvailableKeywordsHasLoaded,
    ] = useState(false)

    /*
        Keep the previous prop as fallback only.

        After the API has loaded,
        use the API rows.
    */
    const modalAvailableKeywords =
        availableKeywordsHasLoaded
            ? availableKeywordRows
            : availableKeywords

    /*
        Use the same keyword list for checking
        English and Khmer while creating a new
        keyword inside the selected group.

        Keep the current-group keyword records
        and the available ungrouped keyword
        records together.

        Current-group keywords receive the
        current group name only when they do
        not already contain group information.

        Ungrouped keywords remain ungrouped.
    */
    const keywordCheckRows =
        useMemo(() => {
            const keywordMap =
                new Map()

            const currentGroupKeywords =
                Array.isArray(
                    keywords
                )
                    ? keywords
                    : []

            const ungroupedKeywords =
                Array.isArray(
                    modalAvailableKeywords
                )
                    ? modalAvailableKeywords
                    : []

            currentGroupKeywords
                .map((item) => {
                    return normalizeKeyword({
                        ...item,

                        group:
                            item?.group ||
                            item?.groupInfo ||
                            group?.nameEn ||
                            group?.nameKh ||
                            undefined,
                    })
                })
                .forEach((
                    item,
                    index
                ) => {
                    const key =
                        item?._id ||
                        `${item?.nameEn || ''}-${item?.nameKh || ''}-${index}`

                    keywordMap.set(
                        key,
                        item
                    )
                })

            ungroupedKeywords
                .map(
                    normalizeKeyword
                )
                .forEach((
                    item,
                    index
                ) => {
                    const key =
                        item?._id ||
                        `${item?.nameEn || ''}-${item?.nameKh || ''}-ungrouped-${index}`

                    keywordMap.set(
                        key,
                        item
                    )
                })

            return Array.from(
                keywordMap.values()
            )
        }, [
            keywords,
            modalAvailableKeywords,
            group,
        ])

    const filteredRows =
        useMemo(() => {
            const value =
                String(
                    search ||
                    ''
                )
                    .trim()
                    .toLowerCase()

            /*
                API already handles search after loading.

                Keep local filtering only for fallback
                data before the API finishes.
            */
            if (
                !value ||
                availableKeywordsHasLoaded
            ) {
                return modalAvailableKeywords
            }

            return modalAvailableKeywords
                .filter((item) => {
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
                })
        }, [
            modalAvailableKeywords,
            search,
            availableKeywordsHasLoaded,
        ])

    const paginatedRows =
        useMemo(() => {
            /*
                API data already uses server-side
                pagination after loading.
            */
            if (
                availableKeywordsHasLoaded
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
            availableKeywordsHasLoaded,
        ])

    const availableKeywordTotal =
        availableKeywordsHasLoaded
            ? availableKeywordPagination
                .total
            : filteredRows.length

    const loadAvailableKeywords =
        useCallback(
            async ({
                page =
                currentPage,

                limit =
                pageSize,

                keywordSearch =
                search,
            } = {}) => {
                if (!token) {
                    return
                }

                try {
                    setAvailableKeywordLoading(
                        true
                    )

                    /*
                        API:
                        GET /core/setup/keyword/list
                            ?page=1
                            &limit=10
                            &search=
                            &status=ungrouped
                    */
                    const response =
                        await KeywordService
                            .getKeywordList({
                                access_token:
                                    token,

                                params: {
                                    page,

                                    limit,

                                    search:
                                        keywordSearch
                                            ?.trim(),

                                    status:
                                        'ungrouped',
                                },
                            })

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

                    setAvailableKeywordRows(
                        list.map(
                            normalizeKeyword
                        )
                    )

                    setAvailableKeywordPagination({
                        page:
                            Number(
                                payload
                                    ?.pagination
                                    ?.page ||
                                page
                            ),

                        limit:
                            Number(
                                payload
                                    ?.pagination
                                    ?.limit ||
                                limit
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

                    setAvailableKeywordsHasLoaded(
                        true
                    )
                } catch (
                error
                ) {
                    setAvailableKeywordsHasLoaded(
                        false
                    )

                    message.error(
                        getErrorMessage(
                            error,
                            'Unable to load ungrouped keywords.'
                        )
                    )
                } finally {
                    setAvailableKeywordLoading(
                        false
                    )
                }
            },
            [
                token,
                currentPage,
                pageSize,
                search,
            ]
        )

    /*
        Reset modal state whenever
        the modal opens.
    */
    useEffect(() => {
        if (!open) {
            return
        }

        setActiveMode(
            'existing'
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

        setAddingExisting(
            false
        )

        setCreatingNew(
            false
        )

        setKeywordEn(
            ''
        )

        setAvailableKeywordRows(
            []
        )

        setAvailableKeywordPagination(
            DEFAULT_KEYWORD_PAGINATION
        )

        setAvailableKeywordsHasLoaded(
            false
        )

        form.resetFields()
    }, [
        open,
        form,
    ])

    /*
        Return to page one when searching.
    */
    useEffect(() => {
        setCurrentPage(
            1
        )
    }, [
        search,
    ])

    /*
        Load ungrouped keywords only when
        Use Existing Keyword is active.
    */
    useEffect(() => {
        if (
            !open ||
            activeMode !==
            'existing' ||
            !token
        ) {
            return
        }

        const timeoutId =
            setTimeout(() => {
                loadAvailableKeywords()
            }, 300)

        return () => {
            clearTimeout(
                timeoutId
            )
        }
    }, [
        open,
        activeMode,
        token,
        currentPage,
        pageSize,
        search,
        loadAvailableKeywords,
    ])

    const refreshKeywordGroupData =
        async () => {
            if (
                !group?._id ||
                !token
            ) {
                return
            }

            await Promise.allSettled([
                fetchKeywordGroupKeywords({
                    id:
                        group._id,

                    access_token:
                        token,

                    ...groupKeywordParams,
                }),

                fetchKeywordGroupById({
                    id:
                        group._id,

                    access_token:
                        token,
                }),

                fetchKeywordGroups({
                    access_token:
                        token,

                    ...params,
                }),
            ])
        }

    const handleClose = () => {
        setActiveMode(
            'existing'
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

        setAddingExisting(
            false
        )

        setCreatingNew(
            false
        )

        setKeywordEn(
            ''
        )

        setAvailableKeywordRows(
            []
        )

        setAvailableKeywordPagination(
            DEFAULT_KEYWORD_PAGINATION
        )

        setAvailableKeywordsHasLoaded(
            false
        )

        form.resetFields()

        onCancel?.()
    }

    const handleClearSelected =
        () => {
            setSelectedRowKeys(
                []
            )
        }

    const handleAddExisting =
        async () => {
            if (
                selectedRowKeys
                    .length ===
                0
            ) {
                return
            }

            if (
                !group?._id
            ) {
                message.error(
                    'Keyword group ID is required.'
                )

                return
            }

            try {
                setAddingExisting(
                    true
                )

                /*
                    API:
                    POST /core/setup/keyword-group/{_id}/keywords
                */
                await KeywordGroupService
                    .addExistingKeywordsToGroup({
                        id:
                            group._id,

                        keywordIds:
                            selectedRowKeys,

                        access_token:
                            token,
                    })

                await refreshKeywordGroupData()

                message.success(
                    `${selectedRowKeys.length} keyword${selectedRowKeys.length >
                        1
                        ? 's'
                        : ''
                    } added successfully`
                )

                /*
                    Close modal after successful save.
                */
                handleClose()
            } catch (
            error
            ) {
                message.error(
                    getErrorMessage(
                        error,
                        'Unable to add keyword.'
                    )
                )
            } finally {
                setAddingExisting(
                    false
                )
            }
        }

    const handleCreateAndAdd =
        async () => {
            try {
                const values =
                    await form
                        .validateFields()

                if (
                    !group?._id
                ) {
                    message.error(
                        'Keyword group ID is required.'
                    )

                    return
                }

                /*
                    Check currently loaded English
                    keywords first.
                */
                const foundDuplicateEn =
                    findDuplicateKeyword({
                        keywords:
                            keywordCheckRows,

                        nameEn:
                            values.nameEn,
                    })

                if (
                    foundDuplicateEn
                ) {
                    form.setFields([
                        {
                            name:
                                'nameEn',

                            errors: [
                                `"${values.nameEn}" already exists in group "${getKeywordGroupLabel(
                                    foundDuplicateEn
                                )}"`,
                            ],
                        },
                    ])

                    return
                }

                /*
                    Check currently loaded Khmer
                    keywords first.
                */
                const foundDuplicateKh =
                    findDuplicateKeyword({
                        keywords:
                            keywordCheckRows,

                        value:
                            values.nameKh,

                        fieldName:
                            'nameKh',

                        language:
                            'kh',
                    })

                if (
                    foundDuplicateKh
                ) {
                    form.setFields([
                        {
                            name:
                                'nameKh',

                            errors: [
                                `"${values.nameKh}" already exists in group "${getKeywordGroupLabel(
                                    foundDuplicateKh
                                )}"`,
                            ],
                        },
                    ])

                    return
                }

                /*
                    API:
                    POST /core/setup/keyword/check

                    Check the full keyword database
                    before creating a new keyword.
                */
                const checkResponse =
                    await checkKeyword({
                        access_token:
                            token,

                        nameEn:
                            values.nameEn,

                        nameKh:
                            values.nameKh,
                    })

                if (
                    isDuplicateResponse(
                        checkResponse
                    )
                ) {
                    form.setFields([
                        {
                            name:
                                'nameEn',

                            errors: [
                                `"${values.nameEn}" already exists`,
                            ],
                        },

                        {
                            name:
                                'nameKh',

                            errors: [
                                `"${values.nameKh}" already exists`,
                            ],
                        },
                    ])

                    return
                }

                setCreatingNew(
                    true
                )

                /*
                    API:
                    POST /core/setup/keyword-group/{_id}/keywords/create
                */
                await KeywordGroupService
                    .createKeywordInGroup({
                        id:
                            group._id,

                        access_token:
                            token,

                        payload: {
                            nameEn:
                                values.nameEn,

                            nameKh:
                                values.nameKh,
                        },
                    })

                await refreshKeywordGroupData()

                message.success(
                    'Keyword created and added successfully'
                )

                /*
                    Close modal after successful save.
                */
                handleClose()
            } catch (
            error
            ) {
                /*
                    Ant Design validation errors already
                    appear below the related inputs.
                */
                if (
                    error?.errorFields
                ) {
                    return
                }

                message.error(
                    getErrorMessage(
                        error,
                        'Unable to create keyword.'
                    )
                )
            } finally {
                setCreatingNew(
                    false
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
            open={
                open
            }
            title={`Add Keyword to "${group?.nameEn || '-'}"`}
            onCancel={
                handleClose
            }
            footer={
                null
            }
            width={
                760
            }
            centered
            destroyOnHidden
            className='add-keyword-modal'
        >
            <div className='add-keyword-modal-body flex flex-col'>
                <div className='mb-3 flex items-center justify-between gap-3'>
                    <div className='flex items-center gap-0'>
                        <Button
                            type={
                                activeMode ===
                                    'existing'
                                    ? 'primary'
                                    : 'default'
                            }
                            icon={
                                <LinkOutlined />
                            }
                            onClick={() => {
                                setActiveMode(
                                    'existing'
                                )
                            }}
                            className='rounded-r-none'
                        >
                            Use Existing Keyword
                        </Button>

                        <Button
                            type={
                                activeMode ===
                                    'new'
                                    ? 'primary'
                                    : 'default'
                            }
                            icon={
                                <PlusOutlined />
                            }
                            onClick={() => {
                                setActiveMode(
                                    'new'
                                )
                            }}
                            className='rounded-l-none'
                        >
                            Create New Keyword
                        </Button>
                    </div>

                    {activeMode ===
                        'existing' &&
                        selectedRowKeys.length >
                        0 ? (
                        <button
                            type='button'
                            onClick={
                                handleClearSelected
                            }
                            className='flex absolute top-3 right-16 items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100'
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

                {activeMode ===
                    'existing' ? (
                    <div className='flex min-h-0 flex-1 flex-col'>
                        <Input
                            allowClear
                            prefix={
                                <SearchOutlined className='text-gray-500' />
                            }
                            placeholder='Search ungrouped keywords...'
                            value={
                                search
                            }
                            onChange={(e) => {
                                setSearch(
                                    e.target
                                        .value
                                )
                            }}
                            className='mb-3'
                        />

                        <div className='min-h-0 flex-1'>
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
                                    availableKeywordLoading
                                }
                                scroll={{
                                    x:
                                        'max-content',

                                    y:
                                        300,
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
                        </div>

                        <div className='flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between'>
                            <Pagination
                                current={
                                    currentPage
                                }
                                pageSize={
                                    pageSize
                                }
                                total={
                                    availableKeywordTotal
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
                                    addingExisting
                                }
                                disabled={
                                    addingExisting ||
                                    selectedRowKeys
                                        .length ===
                                    0
                                }
                                onClick={
                                    handleAddExisting
                                }
                            >
                                Add Keyword
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className='flex min-h-0 flex-1 flex-col'>
                        <Form
                            form={
                                form
                            }
                            layout='vertical'
                        >
                            <KeywordCheckField
                                form={
                                    form
                                }
                                keywords={
                                    keywordCheckRows
                                }
                                keywordEn={
                                    keywordEn
                                }
                                setKeywordEn={
                                    setKeywordEn
                                }
                            />

                            <KeywordCheckField
                                form={
                                    form
                                }
                                keywords={
                                    keywordCheckRows
                                }
                                fieldName='nameKh'
                                language='kh'
                                label='Keyword Kh'
                                placeholder='Enter Keyword Kh'
                            />
                        </Form>

                        <div className='mt-1 text-xs text-gray-400'>
                            A new keyword
                            will be created
                            and added to{' '}
                            <span className='rounded bg-blue-50 px-2 py-[2px] font-medium text-blue-600'>
                                {group?.nameEn ||
                                    '-'}
                            </span>
                        </div>

                        <div className='mt-auto flex justify-end gap-2 pt-5'>
                            <Button
                                onClick={
                                    handleClose
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type='primary'
                                icon={
                                    <PlusOutlined />
                                }
                                loading={
                                    creatingNew ||
                                    checking
                                }
                                disabled={
                                    creatingNew ||
                                    checking
                                }
                                onClick={
                                    handleCreateAndAdd
                                }
                            >
                                Create & Add
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <style>
                {`
                    .add-keyword-modal .ant-modal-content {
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .add-keyword-modal .ant-modal-header {
                        margin-bottom: 12px;
                    }

                    .add-keyword-modal .ant-modal-title {
                        font-size: 14px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .add-keyword-modal .ant-modal-body {
                        height: 500px;
                        overflow: hidden;
                    }

                    .add-keyword-modal-body {
                        height: 100%;
                    }

                    .add-keyword-modal .ant-btn {
                        font-size: 12px;
                    }

                    .add-keyword-modal .ant-table {
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .add-keyword-modal .ant-table-thead > tr > th {
                        background: #10182c !important;
                        color: #ffffff !important;
                        font-size: 12px;
                        font-weight: 700;
                        border-bottom: none !important;
                    }

                    .add-keyword-modal .ant-table-tbody > tr > td {
                        font-size: 12px;
                        color: #334155;
                    }

                    .add-keyword-modal .ant-table-selection-column {
                        width: 44px;
                    }

                    .add-keyword-modal .ant-pagination {
                        margin: 0;
                    }

                    .add-keyword-modal .ant-pagination-options {
                        margin-inline-start: 8px;
                    }

                    .add-keyword-modal .ant-form-item-label > label {
                        font-size: 12px;
                        color: #374151;
                    }

                    .add-keyword-modal .ant-form-item-label > label::before {
                        color: #ef4444 !important;
                    }
                `}
            </style>
        </Modal>
    )
}

export default AddKeywordToGroupModal