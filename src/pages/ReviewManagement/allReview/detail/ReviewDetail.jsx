import {
    Alert,
    Avatar,
    Breadcrumb,
    Button,
    Empty,
    Image,
    Skeleton,
    Tag,
    Typography,
    message,
} from 'antd'

import {
    ArrowLeftOutlined,
    CheckCircleFilled,
    EnvironmentFilled,
    HomeOutlined,
    LikeOutlined,
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
    useParams,
} from 'react-router-dom'

import dayjs from 'dayjs'

import {
    AuthContext,
} from '../../../../contexts/AuthContext'

import useReviewStore
    from '../../../../Stores/ReviewManagement/Reviews/All'

import useReviewActionStore
    from '../../../../Stores/ReviewManagement/Reviews/Action'

import ReviewDetailActionMenu
    from '../../../../components/ReviewManagement/allReview/detail/ReviewDetailActionMenu'

import ReviewImagePreviewModal
    from '../../../../components/ReviewManagement/allReview/detail/ReviewImagePreviewModal'

import ReportIcon
    from '../../../../assets/icon/reportIcon/Report.svg'

import {
    ReviewActionModals,
    ReviewReportModal,
} from '../../../../components/ReviewManagement/allReview/detail/modals'

import {
    STATUS_META,
} from '../review.constants'

import './reviewDetail.scss'

const {
    Paragraph,
    Text,
} = Typography

const ACTION_SUCCESS_MESSAGES = {
    edit:
        'Review content updated successfully',

    approve:
        'Review approved successfully',

    hide:
        'Review hidden successfully',

    reject:
        'Review rejected successfully',
}

const REVIEW_REASON_OPTIONS = [
    {
        value: 'GUIDELINES',
        label: 'Violates community guidelines',
    },
    {
        value: 'SPAM',
        label: 'Spam or excessive promotion',
    },
    {
        value: 'MISLEADING',
        label: 'Misleading or false information',
    },
    {
        value: 'OFFENSIVE',
        label: 'Inappropriate or offensive content',
    },
    {
        value: 'IRRELEVANT',
        label: 'Irrelevant to the mentioned place',
    },
    {
        value: 'LOW_QUALITY',
        label: 'Low-quality or unclear content',
    },
    {
        value: 'DUPLICATE',
        label: 'Duplicate or repetitive content',
    },
    {
        value: 'ADVERTISING',
        label: 'Unauthorized advertising',
    },
]

const getReviewReasonLabel = (
    reason
) => {
    if (!reason) {
        return '-'
    }

    const normalizedReason =
        String(reason)
            .trim()
            .toUpperCase()

    const matchedReason =
        REVIEW_REASON_OPTIONS.find(
            (option) => {
                return (
                    option.value ===
                    normalizedReason
                )
            }
        )

    return (
        matchedReason?.label ||
        String(reason)
    )
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

const getMediaUrl = (
    value
) => {
    if (
        typeof value === 'string'
    ) {
        return value
    }

    if (
        !value ||
        typeof value !== 'object'
    ) {
        return ''
    }

    return (
        value?.url ||
        value?.original ||
        value?.medium ||
        value?.thumbnail ||
        value?.imageUrl ||
        value?.path ||
        ''
    )
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
        approve:
            'active',

        approved:
            'active',

        show:
            'active',

        hide:
            'hidden',

        hidden:
            'hidden',

        reject:
            'rejected',

        rejected:
            'rejected',
    }

    return aliases[value] || value
}

/*
 * Format:
 * 2026-02-02 10:15:22 AM
 */
const formatAuditDateTime = (
    date
) => {
    if (!date) {
        return '-'
    }

    const parsedDate =
        dayjs(date)

    if (
        !parsedDate.isValid()
    ) {
        return '-'
    }

    return parsedDate.format(
        'YYYY-MM-DD hh:mm:ss A'
    )
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
        return '-'
    }

    const parsedDate =
        dayjs(date)

    if (
        !parsedDate.isValid()
    ) {
        return '-'
    }

    return parsedDate.format(
        'MMM D, YYYY • hh:mm A'
    )
}

const getPlaceAddress = (
    place
) => {
    const directAddress =
        getDisplayText(
            place?.province?.provinceKh
        ) || ''

    if (directAddress) {
        return directAddress
    }

    const parts = [
        getDisplayText(
            place?.village
        ),

        getDisplayText(
            place?.commune
        ),

        getDisplayText(
            place?.district
        ),

        getDisplayText(
            place?.province
        ),
    ].filter(Boolean)

    return (
        parts.join(', ') ||
        '-'
    )
}

const normalizeReports = (
    review
) => {
    const source =
        review?.reports ||
        review?.reportList ||
        review?.reportedUsers ||
        []

    const reports =
        Array.isArray(source)
            ? source
            : Array.isArray(
                source?.data
            )
                ? source.data
                : []

    return reports.map(
        (
            report,
            index
        ) => {
            const reasonCode =
                getDisplayText(
                    report?.reason
                ) ||
                getDisplayText(
                    report?.reportReason
                ) ||
                getDisplayText(
                    report?.description
                ) ||
                ''

            return {
                ...report,

                _id:
                    report?._id ||
                    report?.id ||
                    `report-${index}`,

                reportedBy:
                    getUserName(
                        report?.reportedBy
                    ) ||
                    getUserName(
                        report?.user
                    ) ||
                    getUserName(
                        report?.reporter
                    ) ||
                    getDisplayText(
                        report?.reportedByName
                    ) ||
                    'Unknown user',

                reasonCode,

                reason:
                    getReviewReasonLabel(
                        reasonCode
                    ),
            }
        }
    )
}

const normalizeReviewDetail = (
    value
) => {
    if (
        !value ||
        typeof value !== 'object'
    ) {
        return null
    }

    const reviewer =
        value?.reviewer &&
            typeof value.reviewer ===
            'object'
            ? value.reviewer
            : null

    const place =
        value?.place &&
            typeof value.place ===
            'object'
            ? value.place
            : {}

    const category =
        value?.place?.subCategory



    const media =
        value?.images ||
        value?.photos ||
        value?.media ||
        []

    const photos =
        Array.isArray(media)
            ? media
                .map(
                    getMediaUrl
                )
                .filter(Boolean)
            : []

    const ratingSource =
        String(
            place?.ratingSource ||
            value?.ratingSource ||
            ''
        )
            .trim()
            .toLowerCase()

    const isGoogleReview =
        !reviewer &&
        ratingSource ===
        'google'

    const reviewerName =
        getUserName(
            reviewer
        ) ||
        getDisplayText(
            value?.reviewerName
        ) ||
        (
            isGoogleReview
                ? 'Google Maps'
                : 'Unknown reviewer'
        )

    const reviewerUsername =
        reviewer?.username ||
        reviewer?.email ||
        getDisplayText(
            value?.reviewerUsername
        ) ||
        (
            isGoogleReview
                ? 'Imported review'
                : ''
        )

    const reviewerAvatar =
        reviewer?.profilePicture ||
        reviewer?.profileImage ||
        reviewer?.avatar ||
        reviewer?.photo ||
        getMediaUrl(
            value?.reviewerAvatar
        )

    const placeNameEn =
        getDisplayText(
            place?.nameEn
        ) ||

        '-'
    const placeNameKh =
        getDisplayText(
            place?.nameKh
        ) ||
        '-'

    const placeCategory =
        getDisplayText(
            category
        ) ||
        '-'
    const rawCriteria =
        value
            ?.reviewTemplate
            ?.criteria

    const criteria =
        Array.isArray(
            rawCriteria
        )
            ? [
                ...rawCriteria,
            ].sort(
                (
                    first,
                    second
                ) => {
                    return (
                        getSafeNumber(
                            first?.orderNumber
                        ) -
                        getSafeNumber(
                            second?.orderNumber
                        )
                    )
                }
            )
            : []

    const placeImage =
        getMediaUrl(
            place?.media?.image?.[0]
        ) ||
        ''


    const subCategories =
        Array.isArray(
            place?.subCategory
        )
            ? place.subCategory
            : []

    const locationTags =
        subCategories
            .map(
                (
                    subCategory
                ) => {
                    return {
                        _id:
                            subCategory?._id,

                        nameEn:
                            String(
                                subCategory
                                    ?.nameEn ||
                                ''
                            ).trim(),

                        nameKh:
                            String(
                                subCategory
                                    ?.nameKh ||
                                ''
                            ).trim(),
                    }
                }
            )
            .filter(
                (
                    subCategory
                ) => {
                    return (
                        subCategory
                            .nameEn ||
                        subCategory
                            .nameKh
                    )
                }
            )

    const moderationSource =
        value?.moderation ||
        {}

    const moderatedBy =
        moderationSource?.moderatedBy ||
        value?.moderatedBy ||
        null

    const moderationReasonCode =
        getDisplayText(
            moderationSource?.reason
        ) ||
        getDisplayText(
            value?.moderationReason
        ) ||
        getDisplayText(
            value?.reason
        ) ||
        ''
    const createdBySource =
        value?.createdBy ||
        value?.created_by ||
        moderationSource?.createdBy ||
        moderationSource?.created_by ||
        reviewer ||
        null


    const updatedBySource =
        value?.editedBy || ''


    const moderation = {
        lastAction:
            moderationSource?.lastAction ||
            null,

        lastActionAt:
            moderationSource?.lastActionAt ||
            null,

        reasonCode:
            moderationReasonCode,

        reasonLabel:
            getReviewReasonLabel(
                moderationReasonCode
            ),

        moderatedBy:
            getUserName(
                moderatedBy
            ),

        approvedBy:
            getUserName(
                moderationSource?.approvedBy
            ) ||
            getUserName(
                value?.approvedBy
            ) ||
            (
                moderationSource?.approvedAt
                    ? getUserName(
                        moderatedBy
                    )
                    : ''
            ),

        approvedAt:
            moderationSource?.approvedAt ||
            value?.approvedAt ||
            null,

        hiddenBy:
            getUserName(
                moderationSource?.hiddenBy
            ) ||
            getUserName(
                value?.hiddenBy
            ) ||
            (
                moderationSource?.hiddenAt
                    ? getUserName(
                        moderatedBy
                    )
                    : ''
            ),

        hiddenAt:
            moderationSource?.hiddenAt ||
            value?.hiddenAt ||
            null,

        rejectedBy:
            getUserName(
                moderationSource?.rejectedBy
            ) ||
            getUserName(
                value?.rejectedBy
            ) ||
            (
                moderationSource?.rejectedAt
                    ? getUserName(
                        moderatedBy
                    )
                    : ''
            ),

        rejectedAt:
            moderationSource?.rejectedAt ||
            value?.rejectedAt ||
            null,

        createdAt:
            value?.createdAt ||
            moderationSource?.createdAt ||
            null,

        updatedAt:
            value?.updatedAt ||
            moderationSource?.updatedAt ||
            null,

        createdBy:
            getUserName(
                createdBySource
            ) ||
            reviewerName ||
            '-',

        updatedBy:
            getUserName(
                updatedBySource
            ) ||
            '',
    }

    return {
        ...value,

        statusKey:
            normalizeStatus(
                value?.status
            ),

        editedAt:
            value?.editedAt ||
            null,

        reviewer,
        reviewerName,
        reviewerUsername,
        reviewerAvatar,

        place,
        placeNameEn,
        placeNameKh,
        placeCategory,

        review:
            getDisplayText(
                value?.comment
            ) ||
            getDisplayText(
                value?.review
            ) ||
            getDisplayText(
                value?.content
            ),

        photos,

        star:
            getSafeNumber(
                value?.star
            ),

        placeRating:
            getSafeNumber(
                place?.star ??
                place?.rating ??
                value?.placeRating
            ),

        likeCount:
            getSafeNumber(
                value?.helpfulCount ??
                value?.likeCount
            ),

        criteria,

        reports:
            normalizeReports(
                value
            ),

        moderation,

        location: {
            nameEn:
                placeNameEn,
            nameKh:
                placeNameKh,

            description:
                getDisplayText(
                    place?.description
                ) ||
                placeCategory,

            image:
                placeImage,

            verified:
                Boolean(
                    place?.verified ??
                    place?.isVerified
                ),

            tags:
                locationTags,

            address:
                getPlaceAddress(
                    place
                ),
        },
    }
}

const ReviewDetail = () => {
    const {
        id,
    } = useParams()

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
     * Detail API store
     */
    const rawReviewDetail =
        useReviewStore(
            (state) =>
                state.reviewDetail
        )

    const detailLoading =
        useReviewStore(
            (state) =>
                state.detailLoading
        )

    const detailError =
        useReviewStore(
            (state) =>
                state.detailError
        )

    const fetchReviewDetail =
        useReviewStore(
            (state) =>
                state.fetchReviewDetail
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

    const [
        activeAction,
        setActiveAction,
    ] = useState('')

    const [
        openReports,
        setOpenReports,
    ] = useState(false)

    const [
        openImagePreview,
        setOpenImagePreview,
    ] = useState(false)

    const [
        selectedImageIndex,
        setSelectedImageIndex,
    ] = useState(0)

    const reviewDetail =
        useMemo(() => {
            return normalizeReviewDetail(
                rawReviewDetail
            )
        }, [
            rawReviewDetail,
        ])

    const loadReviewDetail =
        useCallback(
            async (
                force = false
            ) => {
                if (
                    !access_token ||
                    !id
                ) {
                    return
                }

                try {
                    await fetchReviewDetail({
                        access_token,

                        id,

                        force,

                        doc: {
                            page:
                                1,

                            limit:
                                20,
                        },
                    })
                } catch (
                error
                ) {
                    console.error(
                        'Unable to load review detail:',
                        error
                    )
                }
            },
            [
                access_token,
                fetchReviewDetail,
                id,
            ]
        )

    useEffect(() => {
        loadReviewDetail(
            true
        )
    }, [
        loadReviewDetail,
    ])

    useEffect(() => {
        setActiveAction('')
        setOpenReports(false)
        setOpenImagePreview(false)
        setSelectedImageIndex(0)
    }, [
        id,
    ])

    useEffect(() => {
        setDisplayEmitContent?.(
            <div className='flex items-center justify-between gap-4 py-3'>
                <div className='flex items-center gap-2'>
                    <Button
                        size='small'
                        icon={
                            <ArrowLeftOutlined
                                style={{
                                    color:
                                        '#FF4D4F',
                                }}
                            />
                        }
                        onClick={() => {
                            navigate(
                                '/allReview'
                            )
                        }}
                    />

                    <span className='text-xs font-medium text-gray-600 dark:text-slate-300'>
                        Review details
                    </span>
                </div>

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
                            title: (
                                <span
                                    className='cursor-pointer transition-colors hover:text-blue-500'
                                    onClick={() => {
                                        navigate(
                                            '/all-review'
                                        )
                                    }}
                                >
                                    Review Management
                                </span>
                            ),
                        },
                        {
                            title:
                                'Detail',
                        },
                    ]}
                />
            </div>
        )
    }, [
        navigate,
        setDisplayEmitContent,
    ])

    const handleBack =
        useCallback(() => {
            navigate(
                '/allReview'
            )
        }, [
            navigate,
        ])

    const handleOpenReviewer =
        useCallback(() => {
            const reviewerId =
                reviewDetail
                    ?.reviewer
                    ?._id

            if (!reviewerId) {
                return
            }

            window.open(
                `/app/user/profile/${reviewerId}`,
                '_blank',
                'noopener,noreferrer'
            )
        }, [
            reviewDetail
                ?.reviewer
                ?._id,
        ])

    const handleOpenPlace =
        useCallback(() => {
            const placeId =
                reviewDetail
                    ?.place
                    ?._id

            if (!placeId) {
                return
            }

            window.open(
                `/property/${placeId}`,
                '_blank',
                'noopener,noreferrer'
            )
        }, [
            reviewDetail
                ?.place
                ?._id,
        ])

    const handleOpenImagePreview =
        useCallback(
            (
                index
            ) => {
                setSelectedImageIndex(
                    index
                )

                setOpenImagePreview(
                    true
                )
            },
            []
        )

    const handleAction =
        useCallback(
            (
                action
            ) => {
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
                reviewDetail?._id
            ) {
                return
            }

            setActiveAction('')
        }, [
            reviewDetail?._id,
            updatingId,
        ])

    const handleSaveReview =
        useCallback(
            async (
                changes = {}
            ) => {
                if (
                    !reviewDetail?._id
                ) {
                    return
                }

                try {
                    const payload = {
                        access_token,

                        id:
                            reviewDetail._id,
                    }

                    /*
                     * Comment was changed or removed.
                     */
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

                    /*
                     * One or more images were removed.
                     */
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

                    await loadReviewDetail(
                        true
                    )
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
                loadReviewDetail,
                reviewDetail?._id,
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
                    !reviewDetail?._id ||
                    !action
                ) {
                    return
                }

                try {
                    await updateReviewStatus({
                        access_token,

                        id:
                            reviewDetail._id,

                        action,

                        targetStatus,

                        reason:
                            reason ||
                            '',

                        doc: {
                            page:
                                1,

                            limit:
                                20,
                        },
                    })

                    message.success(
                        ACTION_SUCCESS_MESSAGES[
                        action
                        ] ||
                        'Review updated successfully'
                    )

                    setActiveAction('')

                    await loadReviewDetail(
                        true
                    )
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
                loadReviewDetail,
                reviewDetail?._id,
                updateReviewStatus,
            ]
        )

    if (
        detailLoading &&
        !reviewDetail
    ) {
        return (
            <div className='review-detail-page w-full pb-5'>
                <div className='rounded-lg bg-white p-5 dark:bg-slate-900'>
                    <Skeleton
                        active
                        avatar
                        paragraph={{
                            rows:
                                10,
                        }}
                    />
                </div>
            </div>
        )
    }

    if (
        detailError &&
        !reviewDetail
    ) {
        return (
            <div className='review-detail-page w-full pb-5'>
                <div className='rounded-lg bg-white p-5 dark:bg-slate-900'>
                    <Alert
                        type='error'
                        showIcon
                        message='Unable to load review detail'
                        description={
                            detailError
                        }
                        action={
                            <Button
                                size='small'
                                danger
                                onClick={() => {
                                    loadReviewDetail(
                                        true
                                    )
                                }}
                            >
                                Retry
                            </Button>
                        }
                    />
                </div>
            </div>
        )
    }

    if (!reviewDetail) {
        return (
            <div className='flex min-h-[450px] items-center justify-center rounded-lg bg-white p-5 dark:bg-slate-900'>
                <Empty description='Review detail not found'>
                    <Button
                        type='primary'
                        onClick={
                            handleBack
                        }
                    >
                        Back to reviews
                    </Button>
                </Empty>
            </div>
        )
    }

    const statusKey =
        reviewDetail
            .statusKey

    const statusMeta =
        STATUS_META?.[
        statusKey
        ] ||
        STATUS_META
            ?.inactive || {
            color:
                'default',

            label:
                reviewDetail
                    ?.status ||
                'Inactive',
        }

    const photos =
        reviewDetail
            .photos ||
        []

    const reports =
        reviewDetail
            .reports ||
        []

    const criteria =
        reviewDetail
            .criteria ||
        []

    const moderation =
        reviewDetail
            .moderation ||
        {}

    /*
     * This must be inside the component.
     *
     * In your previous code it was created inside
     * normalizeReviewDetail(), so JSX could not access it.
     */
    const hasRealUpdate =
        Boolean(
            moderation?.updatedAt
        ) &&
        (
            !moderation?.createdAt ||
            !dayjs(
                moderation.updatedAt
            ).isSame(
                dayjs(
                    moderation.createdAt
                )
            )
        )

    const location =
        reviewDetail
            .location ||
        {}

    const actionLoading =
        updatingId ===
        reviewDetail._id

    const canOpenReviewer =
        Boolean(
            reviewDetail
                ?.reviewer
                ?._id
        )

    const canOpenPlace =
        Boolean(
            reviewDetail
                ?.place
                ?._id
        )

    const hasBeenEdited =
        reviewDetail?.editedAt !== '' &&
        reviewDetail?.editedAt !== null &&
        reviewDetail?.editedAt !== undefined
    const hasModerationValue = (
        value
    ) => {
        if (
            value === null ||
            value === undefined
        ) {
            return false
        }

        if (
            typeof value ===
            'string'
        ) {
            const normalizedValue =
                value.trim()

            return (
                normalizedValue !== '' &&
                normalizedValue !== '-'
            )
        }

        return true
    }

    const hasActiveModeration =
        statusKey === 'active' &&
        (
            hasModerationValue(
                moderation?.approvedBy
            ) ||
            hasModerationValue(
                moderation?.approvedAt
            )
        )

    const hasHiddenModeration =
        statusKey === 'hidden' &&
        (
            hasModerationValue(
                moderation?.reasonCode
            ) ||
            hasModerationValue(
                moderation?.hiddenBy
            ) ||
            hasModerationValue(
                moderation?.hiddenAt
            )
        )

    const hasRejectedModeration =
        statusKey === 'rejected' &&
        (
            hasModerationValue(
                moderation?.reasonCode
            ) ||
            hasModerationValue(
                moderation?.rejectedBy
            ) ||
            hasModerationValue(
                moderation?.rejectedAt
            )
        )

    const shouldShowModeration =
        hasActiveModeration ||
        hasHiddenModeration ||
        hasRejectedModeration
    return (
        <div className='review-detail-page w-full pb-5'>
            <div className='rounded-lg bg-white p-4 dark:bg-slate-900'>
                <div className='flex w-full items-start justify-between gap-4'>
                    <div className='flex min-w-0 flex-1 items-center gap-3'>
                        <Avatar
                            size={43}
                            src={
                                reviewDetail
                                    ?.reviewerAvatar ||
                                undefined
                            }
                        >
                            {getInitials(
                                reviewDetail
                                    ?.reviewerName
                            )}
                        </Avatar>

                        <div className='min-w-0 flex-1'>
                            <div className='flex min-w-0 items-center gap-2'>
                                <button
                                    type='button'
                                    disabled={
                                        !canOpenReviewer
                                    }
                                    onClick={
                                        handleOpenReviewer
                                    }
                                    className='max-w-[180px] truncate border-0 bg-transparent p-0 text-left text-[14px] font-semibold text-gray-900 hover:text-blue-500 disabled:cursor-default dark:text-slate-100'
                                >
                                    {reviewDetail
                                        ?.reviewerName ||
                                        '-'}
                                </button>

                                <span className='h-4 w-px shrink-0 bg-gray-300 dark:bg-slate-600' />

                                <span className='shrink-0 whitespace-nowrap text-[12px] text-gray-400'>
                                    {formatReviewCreatedAt(
                                        reviewDetail
                                            ?.createdAt
                                    )}
                                </span>

                                {hasBeenEdited ? (
                                    <span
                                        className='shrink-0 cursor-help whitespace-nowrap text-[12px] text-gray-400'
                                        title={`Edited at ${formatDateTime(
                                            reviewDetail
                                                ?.editedAt
                                        )}`}
                                    >
                                        (edited)
                                    </span>
                                ) : null}
                            </div>

                            <div className='mt-0.5 truncate text-[12px] text-gray-400'>
                                {reviewDetail
                                    ?.reviewerUsername
                                    ? `@${String(
                                        reviewDetail
                                            .reviewerUsername
                                    ).replace(
                                        /^@/,
                                        ''
                                    )}`
                                    : '-'}
                            </div>
                        </div>
                    </div>

                    <div className='flex shrink-0 items-center gap-2 overflow-visible'>
                        <Tag
                            color={
                                statusMeta
                                    .color
                            }
                            className='m-0 min-w-12 shrink-0 rounded-full border-0 px-2 text-center text-[11px]'
                        >
                            {getDisplayText(
                                statusMeta
                                    .label
                            ) ||
                                reviewDetail
                                    .status ||
                                'Inactive'}
                        </Tag>

                        <ReviewDetailActionMenu
                            review={
                                reviewDetail
                            }
                            loading={
                                actionLoading
                            }
                            onAction={
                                handleAction
                            }
                        />
                    </div>
                </div>

                <div className='mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]'>
                    <section className='min-w-0 lg:pr-5'>
                        <div className='flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center'>
                            <div className='flex flex-wrap items-center gap-2 text-[11px] text-gray-600 dark:text-slate-300'>
                                {criteria.length >
                                    0 ? (
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

                                            /*
                                             * Your API returns star,
                                             * not score.
                                             */
                                            const score =
                                                getSafeNumber(
                                                    criterion
                                                        ?.star ??
                                                    criterion
                                                        ?.score
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
                                                    className='inline-flex items-center gap-2'
                                                >
                                                    {index >
                                                        0 ? (
                                                        <span className='h-3 w-px bg-gray-300 dark:bg-slate-600' />
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
                                ) : (
                                    <span className='text-gray-400'>
                                        No rating breakdown
                                    </span>
                                )}
                            </div>

                            {reviewDetail
                                .star >
                                0 ? (
                                <div className='inline-flex items-center gap-1 whitespace-nowrap text-[15px] font-semibold text-gray-900 dark:text-slate-100'>
                                    <StarFilled
                                        style={{
                                            color:
                                                '#FFB237',

                                            fontSize:
                                                17,
                                        }}
                                    />

                                    {reviewDetail
                                        .star
                                        .toFixed(
                                            1
                                        )}
                                </div>
                            ) : null}
                        </div>

                        <Paragraph className='!mb-3 !mt-4 max-w-[720px] !text-[11px] !leading-6 !text-gray-700 dark:!text-slate-300'>
                            {reviewDetail
                                .review ||
                                'No review description'}
                        </Paragraph>

                        {photos.length >
                            0 ? (
                            <div className='flex flex-wrap gap-1'>
                                {photos.map(
                                    (
                                        photo,
                                        index
                                    ) => (
                                        <button
                                            key={`${reviewDetail._id}-${photo}-${index}`}
                                            type='button'
                                            className='group relative h-[88px] w-[88px] overflow-hidden rounded-md border-0 bg-gray-100 p-0 outline-none ring-blue-500 transition hover:opacity-90 focus-visible:ring-2 dark:bg-slate-800'
                                            onClick={() => {
                                                handleOpenImagePreview(
                                                    index
                                                )
                                            }}
                                        >
                                            <img
                                                src={
                                                    photo
                                                }
                                                alt={`Review ${index + 1}`}
                                                className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-105'
                                                onError={(
                                                    event
                                                ) => {
                                                    event.currentTarget.style.display =
                                                        'none'
                                                }}
                                            />
                                        </button>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className='rounded-md border border-dashed border-gray-200 px-4 py-5 text-center text-[11px] text-gray-400 dark:border-slate-700'>
                                No review photos
                            </div>
                        )}

                        <div className='mt-3 flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400'>
                            <LikeOutlined />

                            <span>
                                {reviewDetail
                                    .likeCount}
                            </span>
                        </div>

                        <div className='text-[10px] leading-[16px] text-gray-700 dark:text-slate-300'>
                            <div className='flex flex-wrap items-baseline gap-x-1 mb-1'>
                                <strong>
                                    Created at:
                                </strong>

                                <span>
                                    {formatAuditDateTime(
                                        moderation?.createdAt
                                    )}
                                </span>

                                <span>
                                    By
                                </span>

                                <strong>
                                    {moderation?.createdBy ||
                                        '-'}
                                </strong>
                            </div>

                            <div className='flex flex-wrap items-baseline gap-x-1 '>
                                <strong>
                                    Updated at:
                                </strong>

                                {hasRealUpdate ? (
                                    <>
                                        <span>
                                            {formatAuditDateTime(
                                                moderation?.updatedAt
                                            )}
                                        </span>

                                        <span>
                                            By
                                        </span>

                                        <strong>
                                            {moderation?.updatedBy ||
                                                '-'}
                                        </strong>
                                    </>
                                ) : (
                                    <span>-</span>
                                )}
                            </div>
                        </div>

                    </section>

                    <div className='mt-6 min-w-0 border-t border-gray-200 pt-5 dark:border-slate-700 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0'>
                        {
                            reports.length > 0 && (

                                <button
                                    type='button'
                                    className='flex min-h-8 w-full items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-left text-[11px] text-red-500 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30'
                                    onClick={() => {
                                        setOpenReports(
                                            true
                                        )
                                    }}
                                >
                                    <img
                                        src={
                                            ReportIcon
                                        }
                                        alt=''
                                    />

                                    <span>
                                        Reported by{' '}
                                        {
                                            reports.length
                                        }{' '}

                                        {reports.length ===
                                            1
                                            ? 'user'
                                            : 'users'}
                                    </span>
                                </button>
                            )
                        }

                        <div className='mt-3 rounded-lg bg-blue-50 p-3 dark:bg-slate-800'>
                            <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100'>
                                <EnvironmentFilled />

                                <span>
                                    Location
                                </span>
                            </div>

                            <div className='flex gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900'>
                                {location
                                    ?.image ? (
                                    <Image
                                        preview={
                                            false
                                        }
                                        src={
                                            location
                                                .image
                                        }
                                        width={72}
                                        height={72}
                                        className='min-w-[72px] overflow-hidden rounded-md'
                                        style={{
                                            objectFit:
                                                'cover',
                                        }}
                                    />
                                ) : (
                                    <div className='flex h-[72px] w-[72px] min-w-[72px] items-center justify-center rounded-md bg-gray-100 text-[10px] text-gray-400 dark:bg-slate-800'>
                                        No image
                                    </div>
                                )}

                                <button
                                    type='button'
                                    disabled={
                                        !canOpenPlace
                                    }
                                    onClick={
                                        handleOpenPlace
                                    }
                                    className='min-w-0 flex-1 border-0 bg-transparent p-0 text-left disabled:cursor-default'
                                >
                                    <div className=' items-center gap-1 text-[11px] font-semibold text-gray-900 hover:text-blue-500 dark:text-slate-100'>
                                        <div className='min-w-0'>
                                            <p className='m-0 truncate p-0 text-[11px] font-semibold text-gray-900 hover:text-blue-500 dark:text-slate-100'>
                                                {location?.nameEn ||
                                                    '-'}
                                            </p>

                                            <p className='m-0 truncate p-0 text-[10px] text-gray-500 dark:text-slate-400'>
                                                {location?.nameKh ||
                                                    '-'}
                                            </p>
                                        </div>

                                        {location
                                            ?.verified ? (
                                            <CheckCircleFilled className='shrink-0 text-blue-500' />
                                        ) : null}
                                    </div>



                                    <div className='mt-1 flex flex-wrap gap-1'>
                                        {location?.tags?.length >
                                            0 ? (
                                            location.tags.map(
                                                (
                                                    subCategory,
                                                    index
                                                ) => (
                                                    <span
                                                        key={
                                                            subCategory
                                                                ?._id ||
                                                            `${subCategory?.nameEn}-${index}`
                                                        }
                                                        className='rounded-sm bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-500 dark:bg-blue-950/40'
                                                        title={
                                                            subCategory
                                                                ?.nameEn ||
                                                            ''
                                                        }
                                                    >
                                                        {subCategory
                                                            ?.nameKh ||
                                                            subCategory
                                                                ?.nameEn ||
                                                            '-'}
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <span className='text-[9px] text-gray-400'>

                                            </span>
                                        )}
                                    </div>

                                    <div className='mt-2 flex items-center gap-1 text-[9px] text-gray-500 dark:text-slate-400'>
                                        <EnvironmentFilled />

                                        <span className='truncate'>
                                            {location
                                                ?.address ||
                                                '-'}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {shouldShowModeration ? (
                    <div
                        className={[
                            'mt-7 rounded-md border p-3 text-[11px] leading-5 text-gray-600 dark:text-slate-300',

                            statusKey === 'active'
                                ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                                : '',

                            statusKey === 'hidden' ||
                                statusKey === 'rejected'
                                ? 'border-red-300 bg-red-50 dark:bg-red-950/20'
                                : '',
                        ].join(' ')}
                    >
                        {statusKey === 'active' ? (
                            <>
                                {hasModerationValue(
                                    moderation?.approvedBy
                                ) ? (
                                    <div>
                                        Approved By:{' '}

                                        <strong>
                                            {moderation.approvedBy}
                                        </strong>
                                    </div>
                                ) : null}

                                {hasModerationValue(
                                    moderation?.approvedAt
                                ) ? (
                                    <div>
                                        Approved At:{' '}

                                        <strong>
                                            {formatDateTime(
                                                moderation.approvedAt
                                            )}
                                        </strong>
                                    </div>
                                ) : null}
                            </>
                        ) : null}

                        {statusKey === 'hidden' ? (
                            <>
                                {hasModerationValue(
                                    moderation?.reasonCode
                                ) ? (
                                    <div>
                                        Reason:{' '}

                                        <strong
                                            title={
                                                moderation.reasonCode
                                            }
                                        >
                                            {moderation
                                                ?.reasonLabel ||
                                                moderation
                                                    ?.reasonCode}
                                        </strong>
                                    </div>
                                ) : null}

                                {hasModerationValue(
                                    moderation?.hiddenBy
                                ) ? (
                                    <div>
                                        Hide By:{' '}

                                        <strong>
                                            {moderation.hiddenBy}
                                        </strong>
                                    </div>
                                ) : null}

                                {hasModerationValue(
                                    moderation?.hiddenAt
                                ) ? (
                                    <div>
                                        Hide At:{' '}

                                        <strong>
                                            {formatDateTime(
                                                moderation.hiddenAt
                                            )}
                                        </strong>
                                    </div>
                                ) : null}
                            </>
                        ) : null}

                        {statusKey === 'rejected' ? (
                            <>
                                {hasModerationValue(
                                    moderation?.reasonCode
                                ) ? (
                                    <div>
                                        Reason:{' '}

                                        <strong
                                            title={
                                                moderation.reasonCode
                                            }
                                        >
                                            {moderation
                                                ?.reasonLabel ||
                                                moderation
                                                    ?.reasonCode}
                                        </strong>
                                    </div>
                                ) : null}

                                {hasModerationValue(
                                    moderation?.rejectedBy
                                ) ? (
                                    <div>
                                        Rejected By:{' '}

                                        <strong>
                                            {moderation.rejectedBy}
                                        </strong>
                                    </div>
                                ) : null}

                                {hasModerationValue(
                                    moderation?.rejectedAt
                                ) ? (
                                    <div>
                                        Rejected At:{' '}

                                        <strong>
                                            {formatDateTime(
                                                moderation.rejectedAt
                                            )}
                                        </strong>
                                    </div>
                                ) : null}
                            </>
                        ) : null}
                    </div>
                ) : null}
            </div>

            <ReviewActionModals
                action={
                    activeAction
                }
                review={
                    reviewDetail
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

            <ReviewImagePreviewModal
                open={
                    openImagePreview
                }
                images={
                    photos
                }
                initialIndex={
                    selectedImageIndex
                }
                onClose={() => {
                    setOpenImagePreview(
                        false
                    )
                }}
            />

            <ReviewReportModal
                open={
                    openReports
                }
                reports={
                    reports
                }
                onCancel={() => {
                    setOpenReports(
                        false
                    )
                }}
            />
        </div>
    )
}
export default ReviewDetail