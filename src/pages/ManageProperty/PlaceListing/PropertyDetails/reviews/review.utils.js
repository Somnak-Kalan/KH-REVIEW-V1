import dayjs
    from 'dayjs'

import {
    REVIEW_RATING_CATEGORIES,
    REVIEW_REASON_OPTIONS,
} from './review.constants'

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

export const normalizeReviewStatus = (
    status
) => {
    const normalizedStatus =
        String(
            status ||
            'inactive'
        )
            .trim()
            .toLowerCase()

    const statusAliases = {
        approve:
            'active',

        approved:
            'active',

        visible:
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

    return (
        statusAliases[
        normalizedStatus
        ] ||
        normalizedStatus
    )
}

export const getReviewReasonLabel = (
    reason
) => {
    if (!reason) {
        return '-'
    }

    const reasonValue =
        typeof reason ===
            'object'
            ? (
                reason?.value ||
                reason?.code ||
                reason?.reason ||
                reason?.name ||
                ''
            )
            : reason

    const normalizedReason =
        String(
            reasonValue
        )
            .trim()
            .toUpperCase()

    const matchedReason =
        (
            REVIEW_REASON_OPTIONS ||
            []
        ).find(
            (
                option
            ) => {
                return (
                    String(
                        option?.value ||
                        ''
                    )
                        .trim()
                        .toUpperCase() ===
                    normalizedReason
                )
            }
        )

    return (
        matchedReason?.label ||
        String(
            reasonValue
        ) ||
        '-'
    )
}

export const getMediaUrl = (
    media
) => {
    if (
        typeof media ===
        'string'
    ) {
        return media
    }

    if (
        !media ||
        typeof media !==
        'object'
    ) {
        return ''
    }

    return (
        media?.url ||
        media?.original ||
        media?.medium ||
        media?.thumbnail ||
        media?.imageUrl ||
        media?.path ||
        ''
    )
}

export const getReviewPhotos = (
    review
) => {
    const mediaSource =
        review?.images ||
        review?.photos ||
        review?.media ||
        []

    if (
        !Array.isArray(
            mediaSource
        )
    ) {
        return []
    }

    return mediaSource
        .map(
            getMediaUrl
        )
        .filter(
            Boolean
        )
}

export const getReviewerInformation = (
    review
) => {
    const reviewer =
        review?.reviewer &&
            typeof review.reviewer ===
            'object'
            ? review.reviewer
            : review?.user &&
                typeof review.user ===
                'object'
                ? review.user
                : {}

    const name =
        reviewer?.nickname ||
        reviewer?.fullName ||
        reviewer?.name ||
        reviewer?.username ||
        review?.reviewerName ||
        'Unknown reviewer'

    const username =
        reviewer?.username ||
        reviewer?.email ||
        review?.reviewerUsername ||
        ''

    const avatar =
        reviewer?.profilePicture ||
        reviewer?.profileImage ||
        reviewer?.avatar ||
        reviewer?.photo ||
        getMediaUrl(
            review?.reviewerAvatar
        )

    return {
        id:
            reviewer?._id ||
            reviewer?.id ||
            null,

        name:
            String(
                name ||
                'Unknown reviewer'
            ),

        username:
            String(
                username ||
                ''
            ),

        avatar:
            avatar ||
            '',
    }
}

export const getReviewRating = (
    review
) => {
    return getSafeNumber(
        review?.star ??
        review?.rating ??
        review?.userRating,
        0
    )
}

export const getReviewContent = (
    review
) => {
    const content =
        review?.comment ??
        review?.review ??
        review?.content ??
        ''

    return String(
        content
    ).trim()
}

export const getLikeCount = (
    review
) => {
    return getSafeNumber(
        review?.helpfulCount ??
        review?.likeCount ??
        review?.likes,
        0
    )
}

export const getReviewReports = (
    review
) => {
    const source =
        review?.reports ||
        review?.reportList ||
        review?.reportedUsers ||
        []

    const reports =
        Array.isArray(
            source
        )
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
            const reporter =
                report?.reportedBy ||
                report?.reporter ||
                report?.user ||
                {}

            const reportedBy =
                typeof reporter ===
                    'string'
                    ? reporter
                    : (
                        reporter?.nickname ||
                        reporter?.fullName ||
                        reporter?.name ||
                        reporter?.username ||
                        reporter?.email ||
                        report?.reportedByName ||
                        report?.reporterName ||
                        'Unknown user'
                    )

            const reasonCode =
                report?.reason ||
                report?.reportReason ||
                report?.reasonCode ||
                ''

            return {
                ...report,

                key:
                    report?._id ||
                    report?.id ||
                    `report-${index}`,

                no:
                    index + 1,

                reportedBy,

                reasonCode,

                reason:
                    getReviewReasonLabel(
                        reasonCode
                    ),

                createdAt:
                    report?.createdAt ||
                    report?.reportedAt ||
                    null,
            }
        }
    )
}

export const getReportCount = (
    review
) => {
    const explicitCount =
        review?.reportCount ??
        review?.reportsCount ??
        review?.totalReports

    if (
        explicitCount !==
        undefined &&
        explicitCount !==
        null &&
        explicitCount !==
        ''
    ) {
        return getSafeNumber(
            explicitCount,
            0
        )
    }

    return getReviewReports(
        review
    ).length
}

export const getRatingBreakdown = (
    review
) => {
    const criteriaSource =
        review
            ?.reviewTemplate
            ?.criteria ||
        review?.criteria ||
        []

    if (
        Array.isArray(
            criteriaSource
        ) &&
        criteriaSource.length >
        0
    ) {
        return [
            ...criteriaSource,
        ]
            .map(
                (
                    criterion,
                    index
                ) => {
                    return {
                        key:
                            criterion?.key ||
                            criterion?._id ||
                            `criterion-${index}`,

                        label:
                            criterion?.nameKh ||
                            criterion?.nameEn ||
                            criterion?.label ||
                            criterion?.name ||
                            criterion?.key ||
                            `Criteria ${index + 1}`,

                        score:
                            getSafeNumber(
                                criterion?.star ??
                                criterion?.rating ??
                                criterion?.value,
                                0
                            ),

                        orderNumber:
                            getSafeNumber(
                                criterion?.orderNumber,
                                index
                            ),
                    }
                }
            )
            .sort(
                (
                    first,
                    second
                ) => {
                    return (
                        first.orderNumber -
                        second.orderNumber
                    )
                }
            )
    }

    const breakdown =
        review?.ratingBreakdown &&
            typeof review.ratingBreakdown ===
            'object'
            ? review.ratingBreakdown
            : {}

    return (
        REVIEW_RATING_CATEGORIES ||
        []
    )
        .map(
            (
                category,
                index
            ) => {
                return {
                    key:
                        category.key,

                    label:
                        category.label,

                    score:
                        getSafeNumber(
                            breakdown?.[
                            category.key
                            ] ??
                            review?.[
                            category.key
                            ],
                            0
                        ),

                    orderNumber:
                        index,
                }
            }
        )
        .filter(
            (
                item
            ) => {
                return (
                    item.score >
                    0
                )
            }
        )
}

export const formatReviewTime = (
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

    if (
        seconds <
        60
    ) {
        return 'Just now'
    }

    const minutes =
        now.diff(
            createdDate,
            'minute'
        )

    if (
        minutes <
        60
    ) {
        return `${minutes}m ago`
    }

    const hours =
        now.diff(
            createdDate,
            'hour'
        )

    if (
        hours <
        24
    ) {
        return `${hours}h ago`
    }

    const days =
        now.diff(
            createdDate,
            'day'
        )

    if (
        days <
        7
    ) {
        return `${days}d ago`
    }

    const years =
        now.diff(
            createdDate,
            'year'
        )

    if (
        years <
        1
    ) {
        return createdDate.format(
            'D MMM'
        )
    }

    return createdDate.format(
        'D MMM, YYYY'
    )
}

export const formatReportDate = (
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
        'YYYY-MM-DD'
    )
}

export const getAverageReviewRating = (
    reviews = []
) => {
    if (
        !Array.isArray(
            reviews
        ) ||
        reviews.length ===
        0
    ) {
        return 0
    }

    const ratings =
        reviews
            .map(
                getReviewRating
            )
            .filter(
                (
                    rating
                ) => {
                    return (
                        rating >
                        0
                    )
                }
            )

    if (
        ratings.length ===
        0
    ) {
        return 0
    }

    const totalRating =
        ratings.reduce(
            (
                total,
                rating
            ) => {
                return (
                    total +
                    rating
                )
            },
            0
        )

    return (
        totalRating /
        ratings.length
    )
}

const normalizeSummaryCriteria = (
    summarySource
) => {
    const criteria =
        summarySource?.criteria ||
        summarySource
            ?.ratingBreakdown
            ?.criteria ||
        summarySource
            ?.averageRatingBreakdown
            ?.criteria ||
        []

    if (
        !Array.isArray(
            criteria
        )
    ) {
        return []
    }

    return criteria.map(
        (
            criterion,
            index
        ) => {
            return {
                key:
                    criterion?.key ||
                    criterion?._id ||
                    `criterion-${index}`,

                label:
                    criterion?.nameKh ||
                    criterion?.nameEn ||
                    criterion?.label ||
                    criterion?.name ||
                    criterion?.key ||
                    `Criteria ${index + 1}`,

                score:
                    getSafeNumber(
                        criterion?.score ??
                        criterion?.average ??
                        criterion?.rating ??
                        criterion?.value,
                        0
                    ),

                orderNumber:
                    getSafeNumber(
                        criterion?.orderNumber,
                        index
                    ),
            }
        }
    )
}

export const getAverageRatingBreakdown = (
    summarySource = {},
    reviews = []
) => {
    const summaryCriteria =
        normalizeSummaryCriteria(
            summarySource
        )

    if (
        summaryCriteria.length >
        0
    ) {
        return [
            ...summaryCriteria,
        ].sort(
            (
                first,
                second
            ) => {
                return (
                    first.orderNumber -
                    second.orderNumber
                )
            }
        )
    }

    const totals =
        new Map()

    if (
        Array.isArray(
            reviews
        )
    ) {
        reviews.forEach(
            (
                review
            ) => {
                const criteria =
                    getRatingBreakdown(
                        review
                    )

                criteria.forEach(
                    (
                        criterion
                    ) => {
                        const currentValue =
                            totals.get(
                                criterion.key
                            ) || {
                                ...criterion,

                                total:
                                    0,

                                count:
                                    0,
                            }

                        currentValue.total +=
                            getSafeNumber(
                                criterion.score,
                                0
                            )

                        currentValue.count +=
                            1

                        totals.set(
                            criterion.key,
                            currentValue
                        )
                    }
                )
            }
        )
    }

    return Array.from(
        totals.values()
    )
        .map(
            (
                item
            ) => {
                return {
                    key:
                        item.key,

                    label:
                        item.label,

                    orderNumber:
                        item.orderNumber,

                    score:
                        item.count >
                            0
                            ? (
                                item.total /
                                item.count
                            )
                            : 0,
                }
            }
        )
        .sort(
            (
                first,
                second
            ) => {
                return (
                    first.orderNumber -
                    second.orderNumber
                )
            }
        )
}

export const getStatusCounts = (
    reviews = [],
    apiStats = {},
    total = 0
) => {
    const source =
        apiStats?.counts ||
        apiStats?.statusCounts ||
        apiStats ||
        {}

    const getApiCount = (
        key
    ) => {
        const upperCaseKey =
            key.toUpperCase()

        const capitalizedKey =
            key.charAt(0)
                .toUpperCase() +
            key.slice(1)

        const directValue =
            source?.[key] ??
            source?.[
            upperCaseKey
            ] ??
            source?.[
            capitalizedKey
            ]

        if (
            directValue ===
            undefined ||
            directValue ===
            null ||
            directValue ===
            ''
        ) {
            return null
        }

        const numericValue =
            Number(
                directValue
            )

        if (
            !Number.isFinite(
                numericValue
            )
        ) {
            return null
        }

        return numericValue
    }

    const calculated = {
        all:
            Array.isArray(
                reviews
            )
                ? reviews.length
                : 0,

        pending:
            0,

        active:
            0,

        hidden:
            0,

        rejected:
            0,
    }

    if (
        Array.isArray(
            reviews
        )
    ) {
        reviews.forEach(
            (
                review
            ) => {
                const status =
                    normalizeReviewStatus(
                        review?.status
                    )

                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            calculated,
                            status
                        )
                ) {
                    calculated[
                        status
                    ] += 1
                }
            }
        )
    }

    const apiAll =
        getApiCount(
            'all'
        )

    const apiPending =
        getApiCount(
            'pending'
        )

    const apiActive =
        getApiCount(
            'active'
        )

    const apiVisible =
        getApiCount(
            'visible'
        )

    const apiHidden =
        getApiCount(
            'hidden'
        )

    const apiRejected =
        getApiCount(
            'rejected'
        )

    const numericTotal =
        Number(
            total
        )

    const resolvedTotal =
        Number.isFinite(
            numericTotal
        ) &&
            numericTotal >
            0
            ? numericTotal
            : calculated.all

    return {
        all:
            apiAll !== null
                ? apiAll
                : resolvedTotal,

        pending:
            apiPending !== null
                ? apiPending
                : calculated.pending,

        active:
            apiActive !== null
                ? apiActive
                : apiVisible !== null
                    ? apiVisible
                    : calculated.active,

        hidden:
            apiHidden !== null
                ? apiHidden
                : calculated.hidden,

        rejected:
            apiRejected !== null
                ? apiRejected
                : calculated.rejected,
    }
}

export const matchesReviewFilters = (
    review,
    filters = {}
) => {
    if (
        filters?.withReport &&
        getReportCount(
            review
        ) === 0
    ) {
        return false
    }

    if (
        filters?.withImage &&
        getReviewPhotos(
            review
        ).length === 0
    ) {
        return false
    }

    return true
}