import {
    Avatar,
    Breadcrumb,
    Rate,
    Space,
    Table,
    Tag,
    Typography,
    message,
} from 'antd'

import {
    HomeOutlined,
    StarFilled,
} from '@ant-design/icons'

import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    useNavigate,
    useOutletContext,
} from 'react-router-dom'

import dayjs from 'dayjs'

import {
    AuthContext,
} from '../../../contexts/AuthContext'

import useReviewStore
    from '../../../Stores/ReviewManagement/Reviews/All'

import useReviewActionStore
    from '../../../Stores/ReviewManagement/Reviews/Action'

import ReviewStats
    from '../../../components/ReviewManagement/allReview/ReviewStats'

import ReviewFilters
    from '../../../components/ReviewManagement/allReview/ReviewFilters'

import ReviewActionMenu
    from '../../../components/ReviewManagement/allReview/ReviewActionMenu'

import {
    ReviewActionModals,
} from '../../../components/ReviewManagement/allReview/detail/modals'

import {
    DEFAULT_REVIEW_FILTERS,
    STATUS_META,
} from './review.constants'

import './allReview.scss'

const {
    Text,
} = Typography

const ACTION_SUCCESS_MESSAGES = {
    edit:
        'Review content updated successfully',

    approve:
        'Review approved successfully',

    reject:
        'Review rejected successfully',

    hide:
        'Review hidden successfully',
}

const getDisplayText = (
    value
) => {
    if (
        value === null ||
        value === undefined
    ) {
        return ''
    }

    if (
        typeof value === 'string' ||
        typeof value === 'number'
    ) {
        return String(value)
    }

    if (
        typeof value !== 'object'
    ) {
        return ''
    }

    return (
        value?.nameEn ||
        value?.nameKh ||
        value?.nickname ||
        value?.fullName ||
        value?.username ||
        value?.name ||
        value?.title ||
        value?.text ||
        value?.content ||
        ''
    )
}

const getSafeNumber = (
    value,
    fallback = 0
) => {
    const number =
        Number(value)

    if (
        Number.isNaN(number) ||
        !Number.isFinite(number)
    ) {
        return fallback
    }

    return number
}

const normalizeStatus = (
    status
) => {
    const value =
        String(
            status ||
            'inactive'
        )
            .trim()
            .toLowerCase()

    const aliases = {
        approve: 'active',
        approved: 'active',
        show: 'active',

        hide: 'hidden',
        hidden: 'hidden',

        reject: 'rejected',
        rejected: 'rejected',
    }

    return aliases[value] || value
}

const getApiStatus = (
    value
) => {
    const options = {
        all:
            'All',

        visible:
            'Active',

        active:
            'Active',

        pending:
            'Pending',

        hidden:
            'Hidden',

        hide:
            'Hidden',

        rejected:
            'Rejected',

        reject:
            'Rejected',
    }

    const key =
        String(
            value ||
            'all'
        )
            .trim()
            .toLowerCase()

    return options[key] || 'All'
}

const getApiReviewType = (
    value
) => {
    const options = {
        all:
            'All',

        withphoto:
            'WithPhoto',

        with_photo:
            'WithPhoto',

        'with-photo':
            'WithPhoto',

        withoutphoto:
            'WithoutPhoto',

        without_photo:
            'WithoutPhoto',

        'without-photo':
            'WithoutPhoto',
    }

    const key =
        String(
            value ||
            'all'
        )
            .trim()
            .toLowerCase()

    return options[key] || 'All'
}

const getInitials = (
    name = ''
) => {
    const initials =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => {
                return word
                    .charAt(0)
                    .toUpperCase()
            })
            .join('')

    return initials || '?'
}

const getUserName = (
    value
) => {
    if (!value) {
        return ''
    }

    if (
        typeof value === 'string'
    ) {
        return value
    }

    return (
        value?.nickname ||
        value?.fullName ||
        value?.name ||
        value?.username ||
        value?.email ||
        ''
    )
}

const getCreatorName = (
    record
) => {
    return (
        getDisplayText(
            record?.creatorName
        ) ||
        getUserName(
            record?.createdBy
        ) ||
        getUserName(
            record?.creator
        ) ||
        getUserName(
            record?.reviewer
        )
    )
}

const getUpdaterName = (
    record
) => {
    return (
        getUserName(
            record?.editedBy
        ) || '-'

    )
}

const getMediaUrl = (
    item
) => {
    if (
        typeof item === 'string'
    ) {
        return item
    }

    if (
        !item ||
        typeof item !== 'object'
    ) {
        return ''
    }

    return (
        item?.url ||
        item?.original ||
        item?.medium ||
        item?.thumbnail ||
        item?.path ||
        item?.imageUrl ||
        ''
    )
}

const getPhotos = (
    record
) => {
    const media =
        record?.images ||
        record?.photos ||
        record?.media ||
        []

    if (
        !Array.isArray(media)
    ) {
        return []
    }

    return media
        .map(
            getMediaUrl
        )
        .filter(Boolean)
}

const formatReviewCreatedAt = (
    date
) => {
    if (!date) {
        return '-'
    }

    const createdDate =
        dayjs(date)

    if (
        !createdDate.isValid()
    ) {
        return '-'
    }

    const now =
        dayjs()

    if (
        createdDate.isAfter(now)
    ) {
        return 'Just now'
    }

    const seconds =
        now.diff(
            createdDate,
            'second'
        )

    if (seconds < 1) {
        return 'Just now'
    }

    if (seconds < 60) {
        return `${seconds}s ago`
    }

    const minutes =
        now.diff(
            createdDate,
            'minute'
        )

    if (minutes < 60) {
        return `${minutes} min ago`
    }

    const hours =
        now.diff(
            createdDate,
            'hour'
        )

    if (hours < 24) {
        return `${hours}h ago`
    }

    const days =
        now.diff(
            createdDate,
            'day'
        )

    if (days < 7) {
        return `${days}d ago`
    }

    const years =
        now.diff(
            createdDate,
            'year'
        )

    if (years < 1) {
        return createdDate.format(
            'D MMM'
        )
    }

    return createdDate.format(
        'D MMM, YYYY'
    )
}

const formatDateTime = (
    date
) => {
    if (!date) {
        return ''
    }

    const parsedDate =
        dayjs(date)

    if (
        !parsedDate.isValid()
    ) {
        return ''
    }

    return parsedDate.format(
        'YYYY-MM-DD hh:mm:ss A'
    )
}

const normalizeReview = (
    item
) => {
    const place =
        item?.place &&
            typeof item.place ===
            'object'
            ? item.place
            : {}

    const category =
        item?.placeCategory ||
        place?.category ||
        item?.category ||
        null

    const reviewer =
        item?.reviewer &&
            typeof item.reviewer ===
            'object'
            ? item.reviewer
            : null

    const ratingSource =
        String(
            place?.ratingSource ||
            item?.ratingSource ||
            ''
        )
            .trim()
            .toLowerCase()

    const isGoogleReview =
        !reviewer &&
        ratingSource ===
        'google'

    return {
        ...item,
        place,
        reviewer,
        placeName:
            getDisplayText(
                item?.placeName
            ) ||
            getDisplayText(
                place?.nameEn
            ) ||
            getDisplayText(
                place?.nickname
            ) ||
            getDisplayText(
                place?.nameKh
            ) ||
            getDisplayText(
                place?.name
            ),

        placeCategory:
            getDisplayText(
                category
            ),

        reviewerName:
            getDisplayText(
                item?.reviewerName
            ) ||
            getUserName(
                reviewer
            ) ||
            (
                isGoogleReview
                    ? 'Google Maps'
                    : 'Unknown reviewer'
            ),

        reviewerUsername:
            getDisplayText(
                item?.reviewerUsername
            ) ||
            reviewer?.username ||
            reviewer?.email ||
            (
                isGoogleReview
                    ? 'Imported review'
                    : ''
            ),

        reviewerAvatar:
            item?.reviewerAvatar ||
            reviewer?.profilePicture ||
            reviewer?.profileImage ||
            reviewer?.avatar ||
            reviewer?.photo ||
            '',

        review:
            getDisplayText(
                item?.comment
            ) ||
            getDisplayText(
                item?.review
            ) ||
            getDisplayText(
                item?.content
            ),

        star:
            getSafeNumber(
                item?.star
            ),

        helpfulCount:
            getSafeNumber(
                item?.helpfulCount
            ),
    }
}

const AllReview = () => {
    const {
        access_token,
    } = useContext(
        AuthContext
    )

    const navigate =
        useNavigate()

    const outletContext =
        useOutletContext()

    const setDisplayEmitContent =
        outletContext
            ?.setDisplayEmitContent

    /*
     * List API store
     */
    const storeReviews =
        useReviewStore(
            (state) =>
                state.reviews
        )

    const total =
        useReviewStore(
            (state) =>
                state.total
        )

    const stats =
        useReviewStore(
            (state) =>
                state.stats
        )

    const loading =
        useReviewStore(
            (state) =>
                state.loading
        )

    const fetchReviews =
        useReviewStore(
            (state) =>
                state.fetchReviews
        )

    /*
     * Action API store
     */
    const updatingId =
        useReviewActionStore(
            (state) =>
                state.updatingId
        )

    const updateReviewStatus =
        useReviewActionStore(
            (state) =>
                state.updateReviewStatus
        )

    const updateReviewContent =
        useReviewActionStore(
            (state) =>
                state.updateReviewContent
        )

    const reviews =
        useMemo(() => {
            if (
                !Array.isArray(
                    storeReviews
                )
            ) {
                return []
            }

            return storeReviews.map(
                normalizeReview
            )
        }, [
            storeReviews,
        ])

    const [
        filters,
        setFilters,
    ] = useState({
        ...DEFAULT_REVIEW_FILTERS,
    })

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1)

    const [
        pageSize,
        setPageSize,
    ] = useState(10)

    const [
        selectedReview,
        setSelectedReview,
    ] = useState(null)

    const [
        activeAction,
        setActiveAction,
    ] = useState('')

    useEffect(() => {
        setDisplayEmitContent?.(
            <div className='review-page-breadcrumb'>
                <Breadcrumb
                    items={[
                        {
                            title: (
                                <HomeOutlined
                                    className='cursor-pointer'
                                    onClick={() => {
                                        navigate(
                                            '/'
                                        )
                                    }}
                                />
                            ),
                        },
                        {
                            title:
                                'Review Management',
                        },
                        {
                            title:
                                'All Review',
                        },
                    ]}
                />
            </div>
        )
    }, [
        navigate,
        setDisplayEmitContent,
    ])

    const loadReviews =
        useCallback(
            async () => {
                if (
                    !access_token
                ) {
                    return
                }

                const dateRange =
                    filters?.dateRange ||
                    []

                const doc = {
                    page:
                        currentPage,

                    limit:
                        pageSize,

                    status:
                        getApiStatus(
                            filters
                                ?.status
                        ),

                    reviewType:
                        getApiReviewType(
                            filters
                                ?.reviewType
                        ),
                }

                const categoryValue =
                    filters?.categoryId ||
                    filters?.category

                const categoryId =
                    typeof categoryValue ===
                        'object'
                        ? categoryValue
                            ?._id ||
                        categoryValue
                            ?.value
                        : categoryValue

                const searchText =
                    String(
                        filters?.search ||
                        ''
                    ).trim()

                if (searchText) {
                    doc.search =
                        searchText
                }

                if (
                    categoryId &&
                    String(
                        categoryId
                    )
                        .trim()
                        .toLowerCase() !==
                    'all'
                ) {
                    doc.categoryId =
                        categoryId
                }

                if (
                    filters?.rating &&
                    filters.rating !==
                    'all'
                ) {
                    const rating =
                        Number(
                            filters.rating
                        )

                    if (
                        !Number.isNaN(
                            rating
                        )
                    ) {
                        doc.userRating = rating
                    }
                }

                if (
                    dateRange?.[0]
                ) {
                    doc.startDate =
                        dayjs(
                            dateRange[0]
                        ).format(
                            'YYYY-MM-DD'
                        )
                }

                if (
                    dateRange?.[1]
                ) {
                    doc.endDate =
                        dayjs(
                            dateRange[1]
                        ).format(
                            'YYYY-MM-DD'
                        )
                }

                try {
                    await fetchReviews({
                        access_token,
                        doc,
                    })
                } catch (
                error
                ) {
                    message.error(
                        error?.response
                            ?.data
                            ?.msg ||
                        error?.response
                            ?.data
                            ?.message ||
                        error?.message ||
                        'Unable to load reviews'
                    )
                }
            },
            [
                access_token,
                currentPage,
                fetchReviews,
                filters,
                pageSize,
            ]
        )

    useEffect(() => {
        if (
            !access_token
        ) {
            return undefined
        }

        const timer =
            window.setTimeout(
                () => {
                    loadReviews()
                },
                350
            )

        return () => {
            window.clearTimeout(
                timer
            )
        }
    }, [
        access_token,
        loadReviews,
    ])

    const handleFilterChange =
        useCallback(
            (
                nextFilters
            ) => {
                setFilters(
                    nextFilters
                )

                setCurrentPage(1)
            },
            []
        )

    const handleStatisticClick =
        useCallback(
            (
                status
            ) => {
                setFilters(
                    (
                        previous
                    ) => ({
                        ...previous,

                        status,
                    })
                )

                setCurrentPage(1)
            },
            []
        )

    const handleOpenDetail =
        useCallback(
            (
                review
            ) => {
                if (
                    !review?._id
                ) {
                    return
                }

                navigate(
                    `/all-review/detail/${review._id}`
                )
            },
            [
                navigate,
            ]
        )

    const handleOpenAction =
        useCallback(
            (
                action,
                review
            ) => {
                if (
                    !review?._id ||
                    !action
                ) {
                    return
                }

                setSelectedReview(
                    review
                )

                setActiveAction(
                    action
                )
            },
            []
        )

    const handleCloseAction =
        useCallback(() => {
            if (
                updatingId ===
                selectedReview?._id
            ) {
                return
            }

            setActiveAction('')

            setSelectedReview(
                null
            )
        }, [
            selectedReview?._id,
            updatingId,
        ])

    const handleSaveReview =
        useCallback(
            async (
                changes = {}
            ) => {
                if (
                    !selectedReview?._id
                ) {
                    return
                }

                try {
                    const payload = {
                        access_token,

                        id:
                            selectedReview._id,
                    }

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                changes,
                                'comment'
                            )
                    ) {
                        payload.comment =
                            changes.comment
                    }

                    if (
                        Array.isArray(
                            changes
                                ?.removeMedia
                        ) &&
                        changes
                            .removeMedia
                            .length >
                        0
                    ) {
                        payload.removeMedia =
                            changes.removeMedia
                    }

                    await updateReviewContent(
                        payload
                    )

                    message.success(
                        'Review content updated successfully'
                    )

                    setActiveAction('')

                    setSelectedReview(
                        null
                    )

                    await loadReviews()
                } catch (
                error
                ) {
                    message.error(
                        error?.response
                            ?.data
                            ?.message ||
                        error?.response
                            ?.data
                            ?.error ||
                        error?.message ||
                        'Unable to update review content'
                    )
                }
            },
            [
                access_token,
                loadReviews,
                selectedReview?._id,
                updateReviewContent,
            ]
        )
    const handleConfirmAction =
        useCallback(
            async ({
                action,
                targetStatus,
                reason,
            }) => {
                if (
                    !selectedReview?._id ||
                    !action
                ) {
                    return
                }

                try {
                    await updateReviewStatus({
                        access_token,

                        id:
                            selectedReview._id,

                        action,

                        targetStatus,

                        reason:
                            reason ||
                            '',

                        doc: {
                            page:
                                currentPage,

                            limit:
                                pageSize,
                        },
                    })

                    message.success(
                        ACTION_SUCCESS_MESSAGES[
                        action
                        ] ||
                        'Review status updated successfully'
                    )

                    setActiveAction('')

                    setSelectedReview(
                        null
                    )

                    await loadReviews()
                } catch (
                error
                ) {
                    message.error(
                        error?.response
                            ?.data
                            ?.message ||
                        error?.response
                            ?.data
                            ?.error ||
                        error?.message ||
                        'Unable to update review status'
                    )
                }
            },
            [
                access_token,
                currentPage,
                loadReviews,
                pageSize,
                selectedReview?._id,
                updateReviewStatus,
            ]
        )

    const renderMedia =
        useCallback(
            (
                _,
                record
            ) => {
                const photos =
                    getPhotos(
                        record
                    )

                if (
                    !photos.length
                ) {
                    return (
                        <span className='review-empty-value'>
                            -
                        </span>
                    )
                }

                const visiblePhotos =
                    photos.slice(
                        0,
                        2
                    )

                return (
                    <button
                        type='button'
                        className='review-media-button'
                        onClick={() => {
                            handleOpenDetail(
                                record
                            )
                        }}
                    >
                        <span className='review-media-preview' >
                            {visiblePhotos.map(
                                (
                                    photo,
                                    index
                                ) => (

                                    <img
                                        key={`${record?._id}-${photo}-${index}`}
                                        src={
                                            photo
                                        }
                                        alt={`Review media ${index + 1}`}
                                        className='review-media-thumbnail'
                                        style={{
                                            zIndex:
                                                visiblePhotos.length -
                                                index,
                                        }}
                                        onError={(
                                            event
                                        ) => {
                                            event.currentTarget.style.display =
                                                'none'
                                        }}
                                    />
                                )
                            )}
                        </span>

                        <span className='review-media-count'>
                            {
                                photos.length
                            }{' '}
                            {photos.length ===
                                1
                                ? 'photo'
                                : 'photos'}
                        </span>
                    </button>
                )
            },
            [
                handleOpenDetail,
            ]
        )

    const renderCreatedAt =
        useCallback(
            (
                _,
                record
            ) => {
                const creatorName =
                    getCreatorName(
                        record
                    )

                const createdDate =
                    formatDateTime(
                        record?.createdAt
                    )

                if (
                    !creatorName &&
                    !createdDate
                ) {
                    return (
                        <span className='review-empty-value'>
                            -
                        </span>
                    )
                }

                return (
                    <div className='review-date-information'>
                        {creatorName ? (
                            <p className='review-date-user'>
                                by{' '}
                                {
                                    creatorName
                                }
                            </p>
                        ) : null}

                        {createdDate ? (
                            <span className='review-date-value'>
                                {
                                    createdDate
                                }
                            </span>
                        ) : null}
                    </div>
                )
            },
            []
        )

    const renderUpdatedAt =
        useCallback(
            (
                _,
                record
            ) => {
                const updaterName =
                    getUpdaterName(
                        record
                    )

                const updatedDate =
                    formatDateTime(
                        record?.updatedAt
                    )

                if (
                    !updaterName &&
                    !updatedDate
                ) {
                    return (
                        <span className='review-empty-value'>
                            -
                        </span>
                    )
                }

                return (
                    <div className='review-date-information'>
                        {updaterName ? (
                            <p className='review-date-user'>
                                by{' '}
                                {
                                    updaterName
                                }
                            </p>
                        ) : null}

                        {updatedDate ? (
                            <span className='review-date-value'>
                                {
                                    updatedDate
                                }
                            </span>
                        ) : null}
                    </div>
                )
            },
            []
        )

    const columns =
        useMemo(
            () => [
                {
                    title:
                        '',

                    key:
                        'action',

                    width:
                        48,

                    align:
                        'center',

                    render: (
                        _,
                        record
                    ) => (
                        <ReviewActionMenu
                            review={
                                record
                            }
                            loading={
                                updatingId ===
                                record?._id
                            }
                            onView={
                                handleOpenDetail
                            }
                            onAction={
                                handleOpenAction
                            }
                        />
                    ),
                },
                {
                    title:
                        'Status',

                    dataIndex:
                        'status',

                    key:
                        'status',

                    width:
                        105,

                    render: (
                        status
                    ) => {
                        const key =
                            normalizeStatus(
                                status
                            )

                        const statusMeta =
                            STATUS_META?.[
                            key
                            ] ||
                            STATUS_META
                                ?.inactive || {
                                color:
                                    'default',

                                label:
                                    getDisplayText(
                                        status
                                    ) ||
                                    'Inactive',
                            }

                        return (
                            <Tag
                                color={
                                    statusMeta
                                        .color
                                }
                                className='review-status-tag'
                            >
                                {getDisplayText(
                                    statusMeta
                                        .label
                                ) ||
                                    'Inactive'}
                            </Tag>
                        )
                    },
                },
                {
                    title:
                        'Rating',

                    dataIndex:
                        'star',

                    key:
                        'rating',

                    width:
                        240,

                    render: (
                        _,
                        record
                    ) => {
                        const criteria =
                            Array.isArray(
                                record
                                    ?.reviewTemplate
                                    ?.criteria
                            )
                                ? [
                                    ...record
                                        .reviewTemplate
                                        .criteria,
                                ].sort(
                                    (
                                        first,
                                        second
                                    ) => {
                                        return (
                                            getSafeNumber(
                                                first
                                                    ?.orderNumber
                                            ) -
                                            getSafeNumber(
                                                second
                                                    ?.orderNumber
                                            )
                                        )
                                    }
                                )
                                : []

                        return (
                            <button
                                type='button'
                                className='group  flex   items-center  relative block w-full cursor-pointer border-0 bg-transparent p-0 pb-2 text-left after:rounded-full after:bg-blue-500 after:duration-200'
                                onClick={() => {
                                    handleOpenDetail(
                                        record
                                    )
                                }}
                            >
                                <div>

                                    <div>

                                        <div className='flex  items-center gap-1.5'>
                                            <Rate
                                                style={{
                                                    color:
                                                        '#FFB237',

                                                    fontSize:
                                                        12,
                                                }}
                                                disabled
                                                allowHalf
                                                value={
                                                    record
                                                        ?.star
                                                }
                                                className='!text-sm'
                                            />

                                            <span className='text-[12px] font-medium text-slate-600 transition-colors group-hover:text-blue-500 dark:text-slate-300'>
                                                {getSafeNumber(
                                                    record
                                                        ?.star
                                                ).toFixed(
                                                    1
                                                )}
                                            </span>

                                            <span className='truncate text-[12px] text-slate-400 transition-colors group-hover:text-blue-500'>
                                                {formatReviewCreatedAt(
                                                    record
                                                        ?.createdAt
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='mt-2  flex items-center gap-1.5 whitespace-nowrap text-[10px] text-slate-600 transition-colors group-hover:text-blue-500 dark:text-slate-300'>
                                        {criteria.length >
                                            0 && (
                                                criteria.map(
                                                    (
                                                        criterion,
                                                        index
                                                    ) => {
                                                        const name =
                                                            criterion
                                                                ?.nameKh ||
                                                            criterion
                                                                ?.nameEn ||
                                                            criterion
                                                                ?.key ||
                                                            `Criteria ${index + 1}`

                                                        const score =
                                                            getSafeNumber(
                                                                criterion
                                                                    ?.star
                                                            )

                                                        return (
                                                            <span
                                                                key={
                                                                    criterion
                                                                        ?.key ||
                                                                    criterion
                                                                        ?._id ||
                                                                    `${name}-${index}`
                                                                }
                                                                className='inline-flex items-center gap-1.5'
                                                            >
                                                                {index >
                                                                    0 ? (
                                                                    <span className='text-slate-300'>
                                                                        |
                                                                    </span>
                                                                ) : null}

                                                                <span>

                                                                    {
                                                                        name
                                                                    }{' '}
                                                                    {score.toFixed(
                                                                        1
                                                                    )}
                                                                </span>
                                                            </span>
                                                        )
                                                    }
                                                )

                                            )}
                                    </div>
                                </div>
                            </button>
                        )
                    },
                },

                {
                    title:
                        'Reviewer',

                    dataIndex:
                        'reviewerName',

                    key:
                        'reviewerName',


                    width:
                        300,
                    render: (
                        _,
                        record
                    ) => {
                        const reviewerName =
                            getDisplayText(
                                record
                                    ?.reviewerName
                            ) ||
                            'Unknown reviewer'

                        const username =
                            getDisplayText(
                                record
                                    ?.reviewerUsername
                            ) ||
                            '-'

                        const canOpenReviewer =
                            Boolean(
                                record
                                    ?.reviewer
                                    ?._id
                            )

                        return (
                            <Space
                                size={
                                    10
                                }
                            >
                                <Avatar
                                    size={
                                        34
                                    }
                                    src={
                                        record
                                            ?.reviewerAvatar ||
                                        undefined
                                    }
                                >
                                    {getInitials(
                                        reviewerName
                                    )}
                                </Avatar>

                                <div
                                    className={`reviewer-information ${canOpenReviewer
                                        ? 'cursor-pointer'
                                        : 'cursor-default'
                                        }`}
                                    onClick={() => {
                                        if (!canOpenReviewer) {
                                            return
                                        }

                                        window.open(
                                            `/app/user/profile/${record.reviewer._id}`,
                                            '_blank',
                                            'noopener,noreferrer'
                                        )
                                    }}
                                >
                                    <span className='reviewer-name'>
                                        {reviewerName}
                                    </span>

                                    <span className='reviewer-username'>
                                        @{String(username).replace(/^@/, '')}
                                    </span>
                                </div>
                            </Space>
                        )
                    },
                },
                {
                    title:
                        'Place',

                    dataIndex:
                        'placeName',

                    key:
                        'placeName',

                    width:
                        300,

                    render: (
                        _,
                        record
                    ) => {
                        const placeRating =
                            getSafeNumber(
                                record
                                    ?.place
                                    ?.star
                            )

                        const placeName =
                            getDisplayText(
                                record
                                    ?.placeName
                            ) ||
                            '-'

                        const categoryName =
                            getDisplayText(
                                record
                                    ?.placeCategory
                            ) ||
                            '-'

                        const canOpenPlace =
                            Boolean(
                                record
                                    ?.place
                                    ?._id
                            )

                        return (
                            <div className='review-place-button'>
                                <span className='review-place-top'>
                                    <button
                                        type='button'
                                        disabled={
                                            !canOpenPlace
                                        }
                                        onClick={() => {
                                            if (
                                                !canOpenPlace
                                            ) {
                                                return
                                            }

                                            window.open(
                                                `/property/${record.place._id}`,
                                                '_blank',
                                                'noopener,noreferrer'
                                            )
                                        }}
                                        className='review-place-name border-0 bg-transparent p-0 text-left hover:text-blue-400 disabled:cursor-default'
                                    >
                                        {
                                            placeName
                                        }

                                        {placeRating >
                                            0 ? (
                                            <>
                                                <span>

                                                    <span className='mx-1'>
                                                        |
                                                    </span>

                                                    <span className='review-place-rating'>
                                                        <StarFilled
                                                            style={{
                                                                color:
                                                                    '#FFB237',

                                                                fontSize:
                                                                    12,
                                                            }}
                                                        />

                                                        <span>
                                                            {placeRating.toFixed(
                                                                1
                                                            )}
                                                        </span>
                                                    </span>
                                                </span>
                                            </>
                                        ) : null}
                                    </button>

                                </span>

                                <span className='review-place-category'>
                                    {
                                        categoryName
                                    }
                                </span>
                            </div>
                        )
                    },
                },
                {
                    title:
                        'Review',

                    dataIndex:
                        'review',

                    key:
                        'review',

                    width:
                        380,

                    render: (
                        _,
                        record
                    ) => (
                        <button
                            type='button'
                            className='review-text-button'
                            onClick={() => {
                                handleOpenDetail(
                                    record
                                )
                            }}
                        >
                            {getDisplayText(

                                record
                                    ?.review
                            ) ||
                                '-'}
                        </button>
                    ),
                },
                {
                    title:
                        'Media',

                    dataIndex:
                        'images',

                    key:
                        'images',

                    width:
                        175,

                    render:
                        renderMedia,
                },
                {
                    title:
                        'Created At',

                    dataIndex:
                        'createdAt',

                    key:
                        'createdAt',

                    width:
                        210,

                    render:
                        renderCreatedAt,
                },
                {
                    title:
                        'Updated At',

                    dataIndex:
                        'updatedAt',

                    key:
                        'updatedAt',

                    width:
                        210,

                    render:
                        renderUpdatedAt,
                },
            ],
            [
                handleOpenAction,
                handleOpenDetail,
                renderCreatedAt,
                renderMedia,
                renderUpdatedAt,
                updatingId,
            ]
        )

    const pagination =
        useMemo(
            () => ({
                current:
                    currentPage,

                pageSize,

                total,

                showSizeChanger:
                    true,

                showQuickJumper:
                    total >
                    pageSize,


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
                    const nextSize =
                        Number(
                            size
                        ) ||
                        10

                    const sizeChanged =
                        nextSize !==
                        pageSize

                    setPageSize(
                        nextSize
                    )

                    setCurrentPage(
                        sizeChanged
                            ? 1
                            : page
                    )
                },
            }),
            [
                currentPage,
                pageSize,
                total,
            ]
        )

    const actionLoading =
        updatingId ===
        selectedReview?._id

    return (
        <div className='review-management-page'>
            <div className='review-management-card'>
                <ReviewStats
                    stats={
                        stats
                    }
                    activeStatus={
                        filters
                            .status
                    }
                    onSelectStatus={
                        handleStatisticClick
                    }
                />

                <ReviewFilters
                    filters={
                        filters
                    }
                    onChange={
                        handleFilterChange
                    }
                />

                <Table
                    rowKey={(
                        record
                    ) =>
                        record?._id ||
                        record?.id ||
                        record?.placeId
                    }
                    columns={
                        columns
                    }
                    dataSource={
                        reviews
                    }
                    loading={
                        loading
                    }
                    pagination={
                        pagination
                    }
                    size='small'
                    bordered={
                        false
                    }
                    scroll={{
                        x:
                            1900,
                    }}
                    className='review-management-table'
                    locale={{
                        emptyText:
                            'No reviews found',
                    }}
                    onRow={(
                        record
                    ) => ({
                        onDoubleClick:
                            () => {
                                handleOpenDetail(
                                    record
                                )
                            },
                    })}
                />
            </div>

            <ReviewActionModals
                action={
                    activeAction
                }
                review={
                    selectedReview
                }
                loading={
                    actionLoading
                }
                onClose={
                    handleCloseAction
                }
                onSaveReview={
                    handleSaveReview
                }
                onConfirmAction={
                    handleConfirmAction
                }
            />
        </div>
    )
}

export default AllReview