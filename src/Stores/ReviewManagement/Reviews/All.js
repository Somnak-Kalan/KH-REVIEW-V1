import {
    create,
} from 'zustand'

import AllReviewServices
    from '../../../services/ReviewManagement/reviews/All'

const initialStats = {
    total: 0,
    pending: 0,
    active: 0,
    hidden: 0,
    rejected: 0,
}

const initialPagination = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
}

const initialDetailPagination = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
}

const getErrorMessage = (
    error
) => {
    return (
        error?.response
            ?.data?.message ||
        error?.response
            ?.data?.error ||
        error?.response
            ?.data?.msg ||
        error?.message ||
        'Something went wrong'
    )
}

const getResponseBody = (
    response
) => {
    if (
        response?.success !==
        undefined
    ) {
        return response
    }

    if (
        response?.data?.success !==
        undefined
    ) {
        return response.data
    }

    return (
        response?.data ||
        response ||
        {}
    )
}

const getReviewItems = (
    result
) => {
    if (
        Array.isArray(
            result
        )
    ) {
        return result
    }

    if (
        Array.isArray(
            result?.data
        )
    ) {
        return result.data
    }

    if (
        Array.isArray(
            result?.items
        )
    ) {
        return result.items
    }

    if (
        Array.isArray(
            result?.results
        )
    ) {
        return result.results
    }

    if (
        Array.isArray(
            result?.reviews
        )
    ) {
        return result.reviews
    }

    if (
        Array.isArray(
            result?.result?.data
        )
    ) {
        return result.result.data
    }

    return []
}

const getReviewDetail = (
    result
) => {
    if (
        !result
    ) {
        return null
    }

    if (
        result?.data?.review &&
        typeof result.data.review ===
        'object'
    ) {
        return result.data.review
    }

    if (
        result?.data?.detail &&
        typeof result.data.detail ===
        'object'
    ) {
        return result.data.detail
    }

    if (
        result?.data &&
        !Array.isArray(
            result.data
        ) &&
        typeof result.data ===
        'object'
    ) {
        return result.data
    }

    if (
        result?.review &&
        typeof result.review ===
        'object'
    ) {
        return result.review
    }

    if (
        result?.detail &&
        typeof result.detail ===
        'object'
    ) {
        return result.detail
    }

    if (
        result?.result?.data &&
        !Array.isArray(
            result.result.data
        )
    ) {
        return result.result.data
    }

    if (
        result?.result &&
        !Array.isArray(
            result.result
        ) &&
        typeof result.result ===
        'object'
    ) {
        return result.result
    }

    if (
        Array.isArray(
            result?.data
        )
    ) {
        return (
            result.data[0] ||
            null
        )
    }

    if (
        result?._id
    ) {
        return result
    }

    return null
}

const getPagination = (
    value,
    fallback = initialPagination
) => {
    const pagination =
        value &&
            typeof value ===
            'object'
            ? value
            : {}

    const page =
        Number(
            pagination?.page ??
            fallback.page
        ) ||
        fallback.page

    const limit =
        Number(
            pagination?.limit ??
            fallback.limit
        ) ||
        fallback.limit

    const total =
        Number(
            pagination?.total ??
            fallback.total
        ) ||
        0

    const calculatedPages =
        limit > 0
            ? Math.ceil(
                total / limit
            )
            : 0

    const totalPages =
        Number(
            pagination
                ?.totalPages ??
            calculatedPages
        ) ||
        calculatedPages

    return {
        page,
        limit,
        total,
        totalPages,
    }
}

const countByStatus = (
    reviews,
    statuses
) => {
    return reviews.filter(
        (
            review
        ) => {
            const status =
                String(
                    review?.status ||
                    ''
                )
                    .trim()
                    .toLowerCase()

            return statuses.includes(
                status
            )
        }
    ).length
}

const getReviewStats = ({
    result,
    reviews,
    total,
}) => {
    const apiStats =
        result?.summary ||
        result?.stats ||
        {}

    return {
        total:
            Number(
                apiStats?.total ??
                total
            ) ||
            0,

        pending:
            Number(
                apiStats?.pending ??
                countByStatus(
                    reviews,
                    [
                        'pending',
                    ]
                )
            ) ||
            0,

        active:
            Number(
                apiStats?.active ??
                apiStats
                    ?.approved ??
                countByStatus(
                    reviews,
                    [
                        'active',
                        'approved',
                    ]
                )
            ) ||
            0,

        hidden:
            Number(
                apiStats?.hidden ??
                countByStatus(
                    reviews,
                    [
                        'hidden',
                    ]
                )
            ) ||
            0,

        rejected:
            Number(
                apiStats?.rejected ??
                countByStatus(
                    reviews,
                    [
                        'rejected',
                    ]
                )
            ) ||
            0,
    }
}

const useReviewStore =
    create(
        (
            set,
            get
        ) => ({
            reviews: [],

            total: 0,

            pagination: {
                ...initialPagination,
            },

            stats: {
                ...initialStats,
            },

            loading: false,

            reviewDetail: null,

            detailLoading: false,

            detailError: null,

            detailPagination: {
                ...initialDetailPagination,
            },

            reviewDetailById: {},

            updatingId: null,

            error: null,

            fetchReviews:
                async ({
                    access_token,
                    doc = {},
                } = {}) => {
                    if (
                        !access_token
                    ) {
                        set({
                            error:
                                'Access token is required',

                            loading:
                                false,
                        })

                        return null
                    }

                    set({
                        loading:
                            true,

                        error:
                            null,
                    })

                    try {
                        const response =
                            await AllReviewServices
                                .ListAllReview({
                                    access_token,
                                    doc,
                                })

                        const result =
                            getResponseBody(
                                response
                            )

                        const reviews =
                            getReviewItems(
                                result
                            )

                        const pagination =
                            getPagination(
                                result
                                    ?.pagination ||
                                result
                                    ?.meta,
                                {
                                    page:
                                        Number(
                                            doc
                                                ?.page
                                        ) ||
                                        1,

                                    limit:
                                        Number(
                                            doc
                                                ?.limit
                                        ) ||
                                        10,

                                    total:
                                        reviews
                                            .length,

                                    totalPages:
                                        0,
                                }
                            )

                        const total =
                            Number(
                                pagination
                                    ?.total ??
                                result
                                    ?.total ??
                                reviews
                                    .length
                            ) ||
                            0

                        const stats =
                            getReviewStats({
                                result,
                                reviews,
                                total,
                            })

                        set({
                            reviews,
                            total,
                            pagination,
                            stats,

                            loading:
                                false,

                            error:
                                null,
                        })

                        return result
                    } catch (
                    error
                    ) {
                        set({
                            reviews:
                                [],

                            total:
                                0,

                            pagination: {
                                ...initialPagination,
                            },

                            stats: {
                                ...initialStats,
                            },

                            loading:
                                false,

                            error:
                                getErrorMessage(
                                    error
                                ),
                        })

                        throw error
                    }
                },

            fetchReviewDetail:
                async ({
                    access_token,
                    id,
                    _id,
                    doc = {},
                    force = false,
                } = {}) => {
                    const reviewId =
                        id ||
                        _id

                    if (
                        !access_token
                    ) {
                        const error =
                            new Error(
                                'Access token is required'
                            )

                        set({
                            detailLoading:
                                false,

                            detailError:
                                error.message,
                        })

                        throw error
                    }

                    if (
                        !reviewId
                    ) {
                        const error =
                            new Error(
                                'Review ID is required'
                            )

                        set({
                            detailLoading:
                                false,

                            detailError:
                                error.message,
                        })

                        throw error
                    }

                    const requestedPage =
                        Number(
                            doc?.page
                        ) ||
                        1

                    const requestedLimit =
                        Number(
                            doc?.limit
                        ) ||
                        20

                    const cached =
                        get()
                            .reviewDetailById?.[
                        reviewId
                        ]

                    if (
                        !force &&
                        cached?.data &&
                        cached
                            ?.pagination
                            ?.page ===
                        requestedPage &&
                        cached
                            ?.pagination
                            ?.limit ===
                        requestedLimit
                    ) {
                        set({
                            reviewDetail:
                                cached.data,

                            detailPagination:
                                cached.pagination,

                            detailLoading:
                                false,

                            detailError:
                                null,
                        })

                        return {
                            success:
                                true,

                            data:
                                cached.data,

                            pagination:
                                cached.pagination,

                            fromCache:
                                true,
                        }
                    }

                    set(
                        (
                            state
                        ) => ({
                            reviewDetail:
                                state
                                    .reviewDetail
                                    ?._id ===
                                    reviewId
                                    ? state
                                        .reviewDetail
                                    : null,

                            detailLoading:
                                true,

                            detailError:
                                null,
                        })
                    )

                    try {
                        const response =
                            await AllReviewServices
                                .GetReviewDetail({
                                    access_token,

                                    id:
                                        reviewId,

                                    doc: {
                                        page:
                                            requestedPage,

                                        limit:
                                            requestedLimit,

                                        ...doc,
                                    },
                                })

                        const result =
                            getResponseBody(
                                response
                            )

                        const detail =
                            getReviewDetail(
                                result
                            )

                        if (
                            !detail
                        ) {
                            throw new Error(
                                'Review detail was not found'
                            )
                        }

                        const pagination =
                            getPagination(
                                result
                                    ?.pagination ||
                                result
                                    ?.data
                                    ?.pagination ||
                                detail
                                    ?.pagination ||
                                result
                                    ?.meta,
                                {
                                    page:
                                        requestedPage,

                                    limit:
                                        requestedLimit,

                                    total:
                                        0,

                                    totalPages:
                                        0,
                                }
                            )

                        const currentCache =
                            get()
                                .reviewDetailById ||
                            {}

                        set({
                            reviewDetail:
                                detail,

                            detailPagination:
                                pagination,

                            reviewDetailById:
                            {
                                ...currentCache,

                                [reviewId]:
                                {
                                    data:
                                        detail,

                                    pagination,
                                },
                            },

                            detailLoading:
                                false,

                            detailError:
                                null,
                        })

                        return result
                    } catch (
                    error
                    ) {
                        set({
                            reviewDetail:
                                null,

                            detailLoading:
                                false,

                            detailError:
                                getErrorMessage(
                                    error
                                ),
                        })

                        throw error
                    }
                },

            updateReviewStatus:
                async () => {
                    throw new Error(
                        'Update review status API is not connected yet'
                    )
                },

            updateReviewContent:
                async () => {
                    throw new Error(
                        'Update review API is not connected yet'
                    )
                },

            clearReviewDetail:
                () => {
                    set({
                        reviewDetail:
                            null,

                        detailLoading:
                            false,

                        detailError:
                            null,

                        detailPagination: {
                            ...initialDetailPagination,
                        },
                    })
                },

            removeReviewDetailCache:
                (
                    reviewId
                ) => {
                    if (
                        !reviewId
                    ) {
                        return
                    }

                    const cache =
                        get()
                            .reviewDetailById ||
                        {}

                    const {
                        [reviewId]:
                        removedItem,

                        ...remainingCache
                    } =
                        cache

                    void removedItem

                    set({
                        reviewDetailById:
                            remainingCache,
                    })
                },

            clearReviews:
                () => {
                    set({
                        reviews:
                            [],

                        total:
                            0,

                        pagination: {
                            ...initialPagination,
                        },

                        stats: {
                            ...initialStats,
                        },

                        error:
                            null,
                    })
                },

            clearError:
                () => {
                    set({
                        error:
                            null,

                        detailError:
                            null,
                    })
                },
        })
    )

export default useReviewStore