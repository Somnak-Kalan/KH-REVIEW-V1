import {
    useCallback,
} from 'react'

import {
    useNavigate,
} from 'react-router-dom'

import {
    Avatar,
    Image,
    Tag,
} from 'antd'

import {
    ExclamationCircleOutlined,
    LikeOutlined,
    StarFilled,
} from '@ant-design/icons'

import dayjs from 'dayjs'

import ReviewActionMenu
    from '../../../../../../components/ReviewManagement/allReview/ReviewActionMenu'

import {
    REVIEW_STATUS_META,
} from '../review.constants'

import {
    getLikeCount,
    getRatingBreakdown,
    getReportCount,
    getReviewContent,
    getReviewerInformation,
    getReviewPhotos,
    getReviewRating,
    normalizeReviewStatus,
} from '../review.utils'

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
        createdDate.isAfter(
            now
        )
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

const ReviewCard = ({
    review,
    updatingId,
    onAction,
    onOpenReports,
    onView
}) => {
    const navigate =
        useNavigate()

    const reviewer =
        getReviewerInformation(
            review
        )

    const photos =
        getReviewPhotos(
            review
        )

    const rating =
        getReviewRating(
            review
        )

    const breakdown =
        getRatingBreakdown(
            review
        )

    const reportCount =
        getReportCount(
            review
        )

    const reviewContent =
        getReviewContent(
            review
        )

    const likeCount =
        getLikeCount(
            review
        )

    const status =
        normalizeReviewStatus(
            review?.status
        )

    const statusMeta =
        REVIEW_STATUS_META?.[
        status
        ] ||
        REVIEW_STATUS_META
            ?.inactive || {
            label:
                'Inactive',

            color:
                'default',

            className:
                'inactive',
        }

    const reviewId =
        review?._id ||
        review?.id

    const actionReview = {
        ...review,

        status,
    }

    const reviewerInitial =
        String(
            reviewer?.name ||
            '?'
        )
            .trim()
            .charAt(0)
            .toUpperCase()

    const isUpdating =
        Boolean(
            reviewId &&
            updatingId ===
            reviewId
        )

    const safeRating =
        Number(
            rating
        )

    const safeBreakdown =
        Array.isArray(
            breakdown
        )
            ? breakdown
            : []

    const safePhotos =
        Array.isArray(
            photos
        )
            ? photos
            : []

    const safeReportCount =
        Number(
            reportCount
        )

    const safeLikeCount =
        Number(
            likeCount
        )

    const statusClassName =
        `property-review-status-${status}`

    const handleOpenDetail =
        useCallback(
            (
                selectedReview
            ) => {
                const selectedReviewId =
                    selectedReview
                        ?._id ||
                    selectedReview
                        ?.id ||
                    reviewId

                if (
                    !selectedReviewId
                ) {
                    return
                }

                navigate(
                    `/all-review/detail/${selectedReviewId}`
                )
            },
            [
                navigate,
                reviewId,
            ]
        )

    const handleOpenReports =
        useCallback(() => {
            onOpenReports?.(
                review
            )
        }, [
            onOpenReports,
            review,
        ])

    return (
        <article className='property-review-card'>
            <div className='property-review-card-header'>
                <div className='property-review-user'>
                    <Avatar
                        size={
                            32
                        }
                        src={
                            reviewer
                                ?.avatar ||
                            undefined
                        }
                    >
                        {
                            reviewerInitial
                        }
                    </Avatar>

                    <div className='property-review-user-content'>
                        <div className='property-review-user-name-row'>
                            <strong className='property-review-user-name'>
                                {reviewer
                                    ?.name ||
                                    'Unknown reviewer'}
                            </strong>

                            <span className='property-review-created-time'>
                                {formatReviewCreatedAt(
                                    review
                                        ?.createdAt ||
                                    review
                                        ?.created_at
                                )}
                            </span>
                        </div>

                        {reviewer
                            ?.username ? (
                            <span className='property-review-user-username'>
                                @{String(
                                    reviewer
                                        .username
                                ).replace(
                                    /^@/,
                                    ''
                                )}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className='property-review-card-actions'>
                    <Tag
                        className={`property-review-status-tag ${statusClassName}`}
                        color={
                            statusMeta
                                .color
                        }
                    >
                        {
                            statusMeta
                                .label
                        }
                    </Tag>

                    <div className='property-review-score'>
                        <StarFilled />

                        <strong>
                            {Number.isFinite(
                                safeRating
                            )
                                ? safeRating.toFixed(
                                    1
                                )
                                : '0.0'}
                        </strong>
                    </div>

                    <ReviewActionMenu
                        review={
                            actionReview
                        }
                        loading={
                            isUpdating
                        }
                        placement='bottomRight'
                        onView={
                            onView
                        }
                        onAction={(
                            action,
                            selectedReview
                        ) => {
                            onAction?.(
                                action,
                                selectedReview ||
                                actionReview
                            )
                        }}
                    />
                </div>
            </div>

            {Number.isFinite(
                safeReportCount
            ) &&
                safeReportCount >
                0 ? (
                <button
                    type='button'
                    className='property-review-report-alert'
                    onClick={
                        handleOpenReports
                    }
                >
                    <ExclamationCircleOutlined />

                    <span>
                        Reported by{' '}
                        {
                            safeReportCount
                        }{' '}
                        {safeReportCount ===
                            1
                            ? 'user'
                            : 'users'}
                    </span>
                </button>
            ) : null}

            {safeBreakdown.length >
                0 ? (
                <div className='property-review-rating-breakdown'>
                    {safeBreakdown.map(
                        (
                            category,
                            index
                        ) => {
                            const categoryScore =
                                Number(
                                    category
                                        ?.score ??
                                    category
                                        ?.star
                                )

                            const categoryLabel =
                                category
                                    ?.label ||
                                category
                                    ?.name ||
                                category
                                    ?.nameEn ||
                                category
                                    ?.nameKh ||
                                `Criteria ${index + 1}`

                            return (
                                <span
                                    key={
                                        category
                                            ?.key ||
                                        category
                                            ?._id ||
                                        `rating-${index}`
                                    }
                                    className='property-review-rating-item'
                                >
                                    <span>
                                        {
                                            categoryLabel
                                        }{' '}

                                        <strong>
                                            {Number.isFinite(
                                                categoryScore
                                            )
                                                ? categoryScore.toFixed(
                                                    1
                                                )
                                                : '0.0'}
                                        </strong>
                                    </span>

                                    {index <
                                        safeBreakdown.length -
                                        1 ? (
                                        <span className='property-review-rating-divider'>
                                            |
                                        </span>
                                    ) : null}
                                </span>
                            )
                        }
                    )}
                </div>
            ) : null}

            {reviewContent ? (
                <p className='property-review-description'>
                    {
                        reviewContent
                    }
                </p>
            ) : (
                <p className='property-review-description property-review-description-empty'>
                    No review comment
                </p>
            )}

            {safePhotos.length >
                0 ? (
                <Image.PreviewGroup>
                    <div className='property-review-images'>
                        {safePhotos.map(
                            (
                                photo,
                                index
                            ) => (
                                <Image
                                    key={`${reviewId || 'review'}-${photo}-${index}`}
                                    src={
                                        photo
                                    }
                                    alt={`Review ${index + 1}`}
                                    className='property-review-image'
                                    rootClassName='property-review-image-root'
                                    fallback='https://placehold.co/150x110?text=Image'
                                />
                            )
                        )}
                    </div>
                </Image.PreviewGroup>
            ) : null}

            <div className='property-review-footer'>
                <LikeOutlined />

                <span>
                    {Number.isFinite(
                        safeLikeCount
                    )
                        ? safeLikeCount
                        : 0}
                </span>
            </div>
        </article>
    )
}

export default ReviewCard