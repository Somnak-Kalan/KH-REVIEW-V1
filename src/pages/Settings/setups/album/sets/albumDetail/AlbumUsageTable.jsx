import React, {
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    Card,
    Empty,
    Input,
    Table,
    Tag,
} from 'antd'

import {
    SearchOutlined,
} from '@ant-design/icons'

import {
    formatDate,
    getAlbumSetName,
    getArrayText,
    getDisplayKhmer,
    getDisplayName,
    getImageUrl,
    getStatusColor,
    getUserName,
} from './albumDetail.utils'

// =========================================
// Component
// =========================================

const AlbumUsageTable = ({
    album,

    places = [],

    total = 0,

    page = 1,

    limit = 10,

    keyword = '',

    loading = false,

    onSearch,

    onPaginationChange,
}) => {
    // =========================================
    // Search Input
    // =========================================

    const [
        searchPlace,
        setSearchPlace,
    ] = useState(
        keyword
    )

    // =========================================
    // Keep Search Input In Sync
    // =========================================

    useEffect(() => {
        setSearchPlace(
            keyword || ''
        )
    }, [
        keyword,
    ])

    // =========================================
    // Debounced API Search
    // =========================================

    useEffect(() => {
        const nextKeyword =
            String(
                searchPlace ||
                ''
            ).trim()

        const currentKeyword =
            String(
                keyword ||
                ''
            ).trim()

        if (
            nextKeyword ===
            currentKeyword
        ) {
            return undefined
        }

        const timer =
            setTimeout(
                () => {
                    onSearch?.(
                        nextKeyword
                    )
                },
                400
            )

        return () => {
            clearTimeout(
                timer
            )
        }
    }, [
        searchPlace,
        keyword,
        onSearch,
    ])

    // =========================================
    // Safe Place Array
    // =========================================

    const placeList =
        useMemo(() => {
            return Array.isArray(
                places
            )
                ? places
                : []
        }, [
            places,
        ])

    // =========================================
    // Album Set Name
    // =========================================

    const albumSetName =
        useMemo(
            () =>
                getAlbumSetName(
                    album
                ),
            [
                album,
            ]
        )

    // =========================================
    // Total Records
    // =========================================

    const placeUsageCount =
        useMemo(() => {
            const number =
                Number(
                    total
                )

            if (
                Number.isFinite(
                    number
                ) &&
                number >= 0
            ) {
                return number
            }

            return placeList
                .length
        }, [
            total,
            placeList,
        ])

    // =========================================
    // Safe Pagination Values
    // =========================================

    const currentPage =
        useMemo(() => {
            const value =
                Number(
                    page
                )

            return (
                Number.isFinite(
                    value
                ) &&
                value > 0
            )
                ? value
                : 1
        }, [
            page,
        ])

    const currentPageSize =
        useMemo(() => {
            const value =
                Number(
                    limit
                )

            return (
                Number.isFinite(
                    value
                ) &&
                value > 0
            )
                ? value
                : 10
        }, [
            limit,
        ])

    // =========================================
    // Columns
    // =========================================

    const columns =
        useMemo(
            () => [
                // =================================
                // No
                // =================================

                {
                    title:
                        'No',

                    key:
                        'no',

                    width:
                        60,

                    fixed:
                        'left',

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
                            currentPageSize +
                            index +
                            1
                        )
                    },
                },

                // =================================
                // Place ID
                // =================================

                {
                    title:
                        'Place ID',

                    dataIndex:
                        'placeId',

                    key:
                        'placeId',

                    width:
                        100,

                    render:
                        value => (
                            <span className='font-medium text-slate-500 dark:text-slate-300'>
                                {value ||
                                    '-'}
                            </span>
                        ),
                },

                // =================================
                // Status
                // =================================

                {
                    title:
                        'Status',

                    dataIndex:
                        'status',

                    key:
                        'status',

                    width:
                        100,

                    render:
                        value => (
                            <Tag
                                color={
                                    getStatusColor(
                                        value
                                    )
                                }
                                bordered={
                                    false
                                }
                                className='m-0'
                            >
                                {value ||
                                    '-'}
                            </Tag>
                        ),
                },

                // =================================
                // Property Profile
                // =================================

                {
                    title:
                        'Property Profile',

                    key:
                        'propertyProfile',

                    width:
                        250,

                    render: (
                        _,
                        record
                    ) => {
                        const imageUrl =
                            getImageUrl(
                                record
                            )

                        const detailUrl =
                            `/property/${record?._id}`

                        const openDetail =
                            () => {
                                window.open(
                                    detailUrl,
                                    '_blank',
                                    'noopener,noreferrer'
                                )
                            }

                        return (
                            <div
                                className='flex min-w-[210px] items-center gap-2'
                                onClick={
                                    openDetail
                                }
                                style={{
                                    cursor:
                                        'pointer',
                                }}
                            >
                                <div className='h-[42px] w-[58px] shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800'>
                                    {imageUrl
                                        ? (
                                            <img
                                                src={
                                                    imageUrl
                                                }
                                                alt={
                                                    record
                                                        ?.nameEn ||
                                                    ''
                                                }
                                                loading='lazy'
                                                decoding='async'
                                                className='h-full w-full object-cover'
                                            />
                                        )
                                        : (
                                            <div className='flex h-full w-full items-center justify-center text-[9px] text-slate-400'>
                                                No image
                                            </div>
                                        )}
                                </div>

                                <div className='min-w-0'>
                                    <div className='truncate text-[12px] font-semibold text-blue-800 dark:text-blue-400'>
                                        {record
                                            ?.nameEn ||
                                            record
                                                ?.nickname ||
                                            '-'}
                                    </div>

                                    <div className='mt-[2px] truncate text-[11px] text-slate-500 dark:text-slate-400'>
                                        {record
                                            ?.nameKh ||
                                            record
                                                ?.nameEn ||
                                            '-'}
                                    </div>
                                </div>
                            </div>
                        )
                    },
                },

                // =================================
                // Ownership
                // =================================

                {
                    title:
                        'Ownership',

                    dataIndex:
                        'ownership',

                    key:
                        'ownership',

                    width:
                        110,

                    render:
                        value => (
                            <span className='text-slate-500 dark:text-slate-300'>
                                {value ||
                                    '-'}
                            </span>
                        ),
                },

                // =================================
                // Category
                // =================================

                {
                    title:
                        'Category',

                    key:
                        'category',

                    width:
                        150,

                    render: (
                        _,
                        record
                    ) => {
                        const category =
                            record?.mainCategory ||
                            record?.category

                        return (
                            <div className='leading-tight'>
                                <div className='font-medium text-slate-600 dark:text-slate-300'>
                                    {getDisplayName(
                                        category
                                    )}
                                </div>

                                <div className='mt-1 text-[11px] text-slate-400 dark:text-slate-500'>
                                    {getDisplayKhmer(
                                        category
                                    )}
                                </div>
                            </div>
                        )
                    },
                },

                // =================================
                // Sub Category
                // =================================

                {
                    title:
                        'Sub Category',

                    key:
                        'subCategory',

                    width:
                        190,

                    render: (
                        _,
                        record
                    ) => (
                        <div className='leading-tight'>
                            <div className='font-medium text-slate-600 dark:text-slate-300'>
                                {getArrayText(
                                    record
                                        ?.subCategory,
                                    'en'
                                )}
                            </div>

                            <div className='mt-1 text-[11px] text-slate-400 dark:text-slate-500'>
                                {getArrayText(
                                    record
                                        ?.subCategory,
                                    'kh'
                                )}
                            </div>
                        </div>
                    ),
                },

                // =================================
                // Type Of Place
                // =================================

                {
                    title:
                        'Type Of Place',

                    key:
                        'typeOfPlace',

                    width:
                        170,

                    render: (
                        _,
                        record
                    ) => (
                        <div className='leading-tight'>
                            <div className='font-medium text-slate-600 dark:text-slate-300'>
                                {getArrayText(
                                    record
                                        ?.typeOfPlace,
                                    'en'
                                )}
                            </div>

                            <div className='mt-1 text-[11px] text-slate-400 dark:text-slate-500'>
                                {getArrayText(
                                    record
                                        ?.typeOfPlace,
                                    'kh'
                                )}
                            </div>
                        </div>
                    ),
                },

                // =================================
                // Province
                // =================================

                {
                    title:
                        'City/Province',

                    key:
                        'province',

                    width:
                        140,

                    render: (
                        _,
                        record
                    ) => (
                        <div className='leading-tight'>
                            <div className='font-medium text-slate-600 dark:text-slate-300'>
                                {record
                                    ?.address
                                    ?.location
                                    ?.provinceEn ||
                                    '-'}
                            </div>

                            <div className='mt-1 text-[11px] text-slate-400 dark:text-slate-500'>
                                {record
                                    ?.address
                                    ?.location
                                    ?.provinceKh ||
                                    ''}
                            </div>
                        </div>
                    ),
                },

                // =================================
                // District
                // =================================

                {
                    title:
                        'District/Khan',

                    key:
                        'district',

                    width:
                        140,

                    render: (
                        _,
                        record
                    ) => (
                        <div className='leading-tight'>
                            <div className='font-medium text-slate-600 dark:text-slate-300'>
                                {record
                                    ?.address
                                    ?.location
                                    ?.districtEn ||
                                    '-'}
                            </div>

                            <div className='mt-1 text-[11px] text-slate-400 dark:text-slate-500'>
                                {record
                                    ?.address
                                    ?.location
                                    ?.districtKh ||
                                    ''}
                            </div>
                        </div>
                    ),
                },

                // =================================
                // Commune
                // =================================

                {
                    title:
                        'Commune/Sangkat',

                    key:
                        'commune',

                    width:
                        160,

                    render: (
                        _,
                        record
                    ) => (
                        <div className='leading-tight'>
                            <div className='font-medium text-slate-600 dark:text-slate-300'>
                                {record
                                    ?.address
                                    ?.location
                                    ?.communeEn ||
                                    '-'}
                            </div>

                            <div className='mt-1 text-[11px] text-slate-400 dark:text-slate-500'>
                                {record
                                    ?.address
                                    ?.location
                                    ?.communeKh ||
                                    ''}
                            </div>
                        </div>
                    ),
                },

                // =================================
                // Updated By
                // =================================

                {
                    title:
                        'Updated By',

                    key:
                        'updatedBy',

                    width:
                        120,

                    render: (
                        _,
                        record
                    ) => (
                        <span className='text-slate-500 dark:text-slate-300'>
                            {getUserName(
                                record
                                    ?.updatedBy
                            )}
                        </span>
                    ),
                },

                // =================================
                // Created By
                // =================================

                {
                    title:
                        'Created By',

                    key:
                        'createdBy',

                    width:
                        120,

                    render: (
                        _,
                        record
                    ) => (
                        <span className='text-slate-500 dark:text-slate-300'>
                            {getUserName(
                                record
                                    ?.createdBy
                            )}
                        </span>
                    ),
                },

                // =================================
                // Created At
                // =================================

                {
                    title:
                        'Created At',

                    dataIndex:
                        'createdAt',

                    key:
                        'createdAt',

                    width:
                        130,

                    render:
                        value => (
                            <span className='text-slate-500 dark:text-slate-300'>
                                {formatDate(
                                    value
                                )}
                            </span>
                        ),
                },
            ],
            [
                currentPage,
                currentPageSize,
            ]
        )

    // =========================================
    // Render
    // =========================================

    return (
        <>
            {/* ================================= */}
            {/* Search */}
            {/* ================================= */}

            <Card
                className='my-2 dark:border-slate-700 dark:bg-slate-900'
                styles={{
                    body: {
                        padding:
                            16,
                    },
                }}
            >
                <Input
                    allowClear
                    value={
                        searchPlace
                    }
                    prefix={
                        <SearchOutlined className='text-blue-500' />
                    }
                    placeholder='Search place'
                    className='max-w-[310px]'
                    onChange={
                        event => {
                            setSearchPlace(
                                event
                                    .target
                                    .value
                            )
                        }
                    }
                />
            </Card>

            {/* ================================= */}
            {/* Usage Table */}
            {/* ================================= */}

            <Card
                className='my-2 dark:border-slate-700 dark:bg-slate-900'
                styles={{
                    body: {
                        padding:
                            '18px 20px 24px',
                    },
                }}
            >
                {/* ============================= */}
                {/* Title */}
                {/* ============================= */}

                <div className='mb-4 flex flex-wrap items-center gap-2'>
                    <span className='text-[14px] font-semibold text-gray-800 dark:text-slate-200'>
                        Place use Album “

                        {album
                            ?.nameEn ||
                            'Album'}

                        ”

                        {albumSetName
                            ? ` in set "${albumSetName}"`
                            : ''}
                    </span>

                    <span className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-semibold text-white'>
                        {
                            placeUsageCount
                        }
                    </span>
                </div>

                {/* ============================= */}
                {/* Table */}
                {/* ============================= */}

                <Table
                    size='small'

                    bordered={
                        false
                    }

                    loading={
                        loading
                    }

                    columns={
                        columns
                    }

                    dataSource={
                        placeList
                    }

                    rowKey={(
                        record,
                        index
                    ) =>
                        record?._id ||
                        record?.id ||
                        record
                            ?.placeId ||
                        index
                    }

                    scroll={{
                        x:
                            1750,
                    }}

                    locale={{
                        emptyText: (
                            <Empty
                                description={
                                    keyword
                                        ? 'No place found'
                                        : 'No place uses this album'
                                }
                            />
                        ),
                    }}

                    pagination={{
                        // API:
                        // currentPage
                        current:
                            currentPage,

                        // API:
                        // pageSize
                        pageSize:
                            currentPageSize,

                        // API:
                        // totalRecords
                        total:
                            placeUsageCount,

                        showSizeChanger:
                            true,

                        pageSizeOptions: [
                            '10',
                            '20',
                            '50',
                            '100',
                        ],




                        onChange: (
                            nextPage,
                            nextPageSize
                        ) => {
                            // =====================
                            // Change page size
                            // =====================

                            if (
                                nextPageSize !==
                                currentPageSize
                            ) {
                                onPaginationChange?.(
                                    1,
                                    nextPageSize
                                )

                                return
                            }

                            // =====================
                            // Change page
                            // =====================

                            onPaginationChange?.(
                                nextPage,
                                nextPageSize
                            )
                        },
                    }}
                />
            </Card>
        </>
    )
}

export default AlbumUsageTable