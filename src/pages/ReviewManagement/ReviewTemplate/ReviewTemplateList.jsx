import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    Alert,
    Breadcrumb,
    Button,
    Table,
    Tag,
    Tooltip,
} from 'antd'

import {
    EyeOutlined,
    HomeOutlined,
} from '@ant-design/icons'

import {
    useNavigate,
    useOutletContext,
} from 'react-router-dom'

import { AuthContext }
    from '../../../contexts/AuthContext'

import TableHeader
    from '../../../widgets/TableHeader'

import useTemplateReviewStore
    from '../../../Stores/ReviewManagement/Reviews/Template.js'

import ReviewTemplateDetail
    from './ReviewTemplateDetail'

const getTotalWeight = (
    dimensions = []
) => {
    return dimensions.reduce(
        (total, dimension) => {
            return total +
                Number(
                    dimension?.weight || 0
                )
        },
        0
    )
}

const ReviewTemplateList = () => {
    const navigate = useNavigate()
    const outletContext =
        useOutletContext()

    const { access_token } =
        useContext(AuthContext)

    const setDisplayEmitContent =
        outletContext
            ?.setDisplayEmitContent

    const [openDetail, setOpenDetail] =
        useState(false)

    const templateReviews =
        useTemplateReviewStore(
            (state) =>
                state.templateReviews
        )

    const templateReviewDetail =
        useTemplateReviewStore(
            (state) =>
                state.templateReviewDetail
        )

    const pagination =
        useTemplateReviewStore(
            (state) =>
                state.pagination
        )

    const listLoading =
        useTemplateReviewStore(
            (state) =>
                state.listLoading
        )

    const detailLoading =
        useTemplateReviewStore(
            (state) =>
                state.detailLoading
        )

    const error =
        useTemplateReviewStore(
            (state) =>
                state.error
        )

    const fetchTemplateReviews =
        useTemplateReviewStore(
            (state) =>
                state.fetchTemplateReviews
        )

    const fetchTemplateReviewById =
        useTemplateReviewStore(
            (state) =>
                state.fetchTemplateReviewById
        )

    const clearTemplateReviewDetail =
        useTemplateReviewStore(
            (state) =>
                state.clearTemplateReviewDetail
        )

    const handleHomeClick =
        useCallback(() => {
            navigate('/')
        }, [navigate])

    const loadTemplateList =
        useCallback(
            (
                page = 1,
                limit = 20
            ) => {
                if (!access_token) {
                    return
                }

                fetchTemplateReviews({
                    access_token,
                    page,
                    limit,
                }).catch(() => {
                    // Error is handled
                    // inside Zustand store.
                })
            },
            [
                access_token,
                fetchTemplateReviews,
            ]
        )

    const handleOpenDetail =
        useCallback(
            (record) => {
                const templateId =
                    record?._id ||
                    record?.id

                if (
                    !templateId ||
                    !access_token
                ) {
                    return
                }

                setOpenDetail(true)

                fetchTemplateReviewById({
                    access_token,
                    templateId,
                    page: 1,
                    limit: 20,
                }).catch(() => {
                    // Error is handled
                    // inside Zustand store.
                })
            },
            [
                access_token,
                fetchTemplateReviewById,
            ]
        )

    const handleCloseDetail =
        useCallback(() => {
            setOpenDetail(false)
            clearTemplateReviewDetail()
        }, [
            clearTemplateReviewDetail,
        ])

    const handleTableChange =
        useCallback(
            (tablePagination) => {
                const selectedLimit =
                    tablePagination?.pageSize ||
                    pagination.limit

                const pageSizeChanged =
                    selectedLimit !==
                    pagination.limit

                const selectedPage =
                    pageSizeChanged
                        ? 1
                        : tablePagination
                            ?.current || 1

                loadTemplateList(
                    selectedPage,
                    selectedLimit
                )
            },
            [
                loadTemplateList,
                pagination.limit,
            ]
        )

    const renderSubCategories =
        useCallback((record) => {
            const subCategories =
                record?.subCategories || []

            const displayCount =
                record?.tagDisplayCount || 2

            const visibleItems =
                subCategories.slice(
                    0,
                    displayCount
                )

            const hiddenItems =
                subCategories.slice(
                    displayCount
                )

            if (
                subCategories.length === 0
            ) {
                return (
                    <span
                        style={{
                            color: '#8c8c8c',
                            fontSize: 12,
                        }}
                    >
                        No sub-category
                    </span>
                )
            }

            return (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 4,
                    }}
                >
                    {visibleItems.map(
                        (
                            item,
                            index
                        ) => {
                            const itemId =
                                item?._id ||
                                item?.id ||
                                index

                            const nameEn =
                                item?.nameEn ||
                                item?.name_en ||
                                '-'

                            const nameKh =
                                item?.nameKh ||
                                item?.name_kh ||
                                ''

                            const label =
                                nameKh
                                    ? `${nameEn} - ${nameKh}`
                                    : nameEn

                            return (
                                <Tag
                                    key={itemId}
                                    bordered={false}
                                    style={{
                                        margin: 0,
                                        padding:
                                            '2px 7px',
                                        color:
                                            '#2458d3',
                                        background:
                                            '#eef4ff',
                                        borderRadius: 4,
                                        fontSize: 11,
                                        lineHeight:
                                            '18px',
                                    }}
                                >
                                    {label}
                                </Tag>
                            )
                        }
                    )}

                    {hiddenItems.length >
                        0 ? (
                        <Tooltip
                            title={hiddenItems
                                .map(
                                    (item) =>
                                        item
                                            ?.nameEn ||
                                        item
                                            ?.name_en ||
                                        '-'
                                )
                                .join(', ')}
                        >
                            <Tag
                                bordered={false}
                                style={{
                                    margin: 0,
                                    padding:
                                        '2px 7px',
                                    color:
                                        '#4b5563',
                                    background:
                                        '#eaf4fb',
                                    borderRadius: 4,
                                    fontSize: 11,
                                    lineHeight:
                                        '18px',
                                    cursor:
                                        'default',
                                }}
                            >
                                +{hiddenItems.length}
                                {' '}more
                            </Tag>
                        </Tooltip>
                    ) : null}
                </div>
            )
        }, [])

    useEffect(() => {
        if (!access_token) {
            return
        }

        loadTemplateList(1, 20)
    }, [
        access_token,
        loadTemplateList,
    ])

    useEffect(() => {
        if (
            typeof setDisplayEmitContent !==
            'function'
        ) {
            return
        }

        setDisplayEmitContent(
            <div className='flex justify-between my-3'>
                <Breadcrumb
                    items={[
                        {
                            title: (
                                <HomeOutlined
                                    onClick={
                                        handleHomeClick
                                    }
                                    style={{
                                        cursor:
                                            'pointer',
                                    }}
                                />
                            ),
                        },
                        {
                            title: (
                                <span>
                                    Review Management
                                </span>
                            ),
                        },
                        {
                            title: (
                                <span>
                                    Review Template
                                </span>
                            ),
                        },
                    ]}
                />
            </div>
        )
    }, [
        handleHomeClick,
        setDisplayEmitContent,
    ])

    const columns = useMemo(
        () => [
            {
                title: (
                    <span className='table-header'>
                        Review Templates
                    </span>
                ),
                dataIndex:
                    'templateName',
                key: 'templateName',
                width: 230,
                render: (
                    templateName,
                    record
                ) => {
                    const name =
                        templateName ||
                        record?.template_name ||
                        record?.name ||
                        '-'

                    return (
                        <span
                            style={{
                                color: '#262626',
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                        >
                            {name}
                        </span>
                    )
                },
            },
            {
                title: (
                    <span className='table-header'>
                        Used by Categories
                    </span>
                ),
                dataIndex:
                    'subCategories',
                key: 'subCategories',
                render: (
                    _,
                    record
                ) => {
                    return renderSubCategories(
                        record
                    )
                },
            },
            {
                title: (
                    <span className='table-header'>
                        Dimensions
                    </span>
                ),
                dataIndex:
                    'dimensions',
                key: 'dimensions',
                width: 100,
                align: 'center',
                render: (
                    dimensions
                ) => {
                    return (
                        <span
                            style={{
                                color: '#262626',
                                fontSize: 12,
                            }}
                        >
                            {
                                dimensions
                                    ?.length || 0
                            }
                        </span>
                    )
                },
            },
            {
                title: (
                    <span className='table-header'>
                        Total Weight
                    </span>
                ),
                key: 'totalWeight',
                width: 120,
                align: 'center',
                render: (
                    _,
                    record
                ) => {
                    const totalWeight =
                        getTotalWeight(
                            record
                                ?.dimensions
                        )

                    const isComplete =
                        totalWeight === 100

                    return (
                        <Tag
                            bordered={false}
                            style={{
                                margin: 0,
                                color:
                                    isComplete
                                        ? '#52c41a'
                                        : '#d48806',
                                background:
                                    isComplete
                                        ? '#f6ffed'
                                        : '#fffbe6',
                                borderRadius: 4,
                                fontSize: 11,
                            }}
                        >
                            {totalWeight}%
                        </Tag>
                    )
                },
            },
            {
                title: (
                    <span className='table-header'>
                        Action
                    </span>
                ),
                key: 'action',
                width: 120,
                align: 'center',
                render: (
                    _,
                    record
                ) => {
                    return (
                        <Button
                            size='small'
                            icon={
                                <EyeOutlined />
                            }
                            onClick={() =>
                                handleOpenDetail(
                                    record
                                )
                            }
                            style={{
                                minWidth: 100,
                                height: 28,
                                borderRadius: 5,
                                fontSize: 12,
                                color: '#262626',
                                background:
                                    '#ffffff',
                            }}
                        >
                            View Details
                        </Button>
                    )
                },
            },
        ],
        [
            handleOpenDetail,
            renderSubCategories,
        ]
    )

    const displayError =
        !access_token
            ? 'Access token is missing'
            : error

    return (
        <>
            <TableHeader
                total={
                    pagination.total ||
                    templateReviews.length
                }
                label='Total Amount'
            >
                {displayError ? (
                    <Alert
                        type='error'
                        showIcon
                        message={
                            displayError
                        }
                        style={{
                            marginBottom: 12,
                        }}
                    />
                ) : null}

                <Table
                    rowKey={(
                        record,
                        index
                    ) => {
                        return (
                            record?._id ||
                            record?.id ||
                            index
                        )
                    }}
                    columns={columns}
                    dataSource={
                        templateReviews
                    }
                    loading={
                        listLoading
                    }
                    bordered={false}
                    size='small'
                    scroll={{
                        x: 'max-content',
                    }}
                    className='custom-table-review-template'
                    rowClassName={(
                        _,
                        index
                    ) => {
                        return index % 2 ===
                            0
                            ? 'even-row'
                            : 'odd-row'
                    }}
                    pagination={{
                        current:
                            pagination.page,
                        pageSize:
                            pagination.limit,

                        showSizeChanger:
                            true,
                        pageSizeOptions: [
                            '10',
                            '20',
                            '50',
                        ],

                    }}
                    onChange={
                        handleTableChange
                    }
                    locale={{
                        emptyText:
                            'No review template available',
                    }}
                />
            </TableHeader>

            <ReviewTemplateDetail
                open={openDetail}
                template={
                    templateReviewDetail
                }
                loading={
                    detailLoading
                }
                onClose={
                    handleCloseDetail
                }
            />
        </>
    )
}

export default ReviewTemplateList