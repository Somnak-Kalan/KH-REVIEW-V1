// src/Stores/ManageProperty/AllProperty/
// PropertyDetail/Review.store.js

import {
    create,
} from 'zustand'

import PlaceReviewService
    from '../../../../services/ManageProperty/PlaceListing/PropertyDetail/Review'

const initialPagination = {
    current:
        1,

    pageSize:
        20,

    total:
        0,
}

const getErrorMessage = (
    error
) => {
    return (
        error?.response
            ?.data?.msg ||
        error?.response
            ?.data?.message ||
        error?.response
            ?.data?.error ||
        error?.message ||
        'Unable to load place reviews'
    )
}

const getResponseBody = (
    response
) => {
    if (
        !response ||
        typeof response !==
        'object'
    ) {
        return {}
    }

    if (
        response?.success !==
        undefined
    ) {
        return response
    }

    if (
        response?.data &&
        typeof response.data ===
        'object' &&
        !Array.isArray(
            response.data
        )
    ) {
        return response.data
    }

    return response
}

const getReviewItems = (
    response
) => {
    const body =
        getResponseBody(
            response
        )

    const candidates = [
        body?.data,
        body?.reviews,
        body?.items,
        body?.results,
        body?.docs,
        body?.list,

        body?.data?.data,
        body?.data?.reviews,
        body?.data?.items,
        body?.data?.results,
        body?.data?.docs,
        body?.data?.list,
    ]

    const items =
        candidates.find(
            Array.isArray
        )

    return (
        items ||
        []
    )
}

const getPaginationSource = (
    response
) => {
    const body =
        getResponseBody(
            response
        )

    return (
        body?.pagination ||
        body?.meta ||
        body?.data?.pagination ||
        body?.data?.meta ||
        body?.data ||
        body ||
        {}
    )
}

const getReviewSummary = (
    response
) => {
    const body =
        getResponseBody(
            response
        )

    return (
        body?.ratingSummary ||
        body?.reviewSummary ||
        body?.summary ||
        body?.data?.ratingSummary ||
        body?.data?.reviewSummary ||
        body?.data?.summary ||
        {}
    )
}

const getReviewStats = (
    response
) => {
    const body =
        getResponseBody(
            response
        )

    return (
        body?.stats ||
        body?.counts ||
        body?.statusCounts ||
        body?.data?.stats ||
        body?.data?.counts ||
        body?.data?.statusCounts ||
        {}
    )
}

const removeEmptyCacheValues = (
    values = {}
) => {
    return Object.fromEntries(
        Object.entries(
            values
        ).filter(
            (
                [
                    ,
                    value,
                ]
            ) => {
                const normalizedValue =
                    String(
                        value ??
                        ''
                    )
                        .trim()
                        .toLowerCase()

                return (
                    value !== undefined &&
                    value !== null &&
                    value !== '' &&
                    normalizedValue !==
                    'all'
                )
            }
        )
    )
}

const buildReviewCacheKey = ({
    placeId,
    doc = {},
}) => {
    return JSON.stringify(
        removeEmptyCacheValues({
            placeId,

            page:
                Number(
                    doc?.page
                ) ||
                1,

            limit:
                Number(
                    doc?.limit
                ) ||
                20,

            status:
                doc?.status,

            userRating:
                doc?.userRating,

            reviewType:
                doc?.reviewType,

            sort:
                doc?.sort ||
                'latest',
        })
    )
}

const usePlaceReviewStore =
    create(
        (
            set,
            get
        ) => ({
            reviewList:
                [],

            reviewPagination: {
                ...initialPagination,
            },

            reviewSummary:
                {},

            reviewStats:
                {},

            reviewsLoading:
                false,

            reviewsError:
                null,

            reviewsCacheKey:
                '',

            fetchPlaceReviewList:
                async ({
                    access_token,
                    placeId,
                    doc = {},
                    force = false,
                } = {}) => {
                    if (!access_token) {
                        throw new Error(
                            'Access token is required'
                        )
                    }

                    if (!placeId) {
                        throw new Error(
                            'Place ID is required'
                        )
                    }

                    const cacheKey =
                        buildReviewCacheKey({
                            placeId,
                            doc,
                        })

                    const currentState =
                        get()

                    if (
                        !force &&
                        currentState
                            .reviewsCacheKey ===
                        cacheKey &&
                        currentState
                            .reviewList
                            .length >
                        0
                    ) {
                        return {
                            reviews:
                                currentState
                                    .reviewList,

                            pagination:
                                currentState
                                    .reviewPagination,

                            summary:
                                currentState
                                    .reviewSummary,

                            stats:
                                currentState
                                    .reviewStats,
                        }
                    }

                    set({
                        reviewsLoading:
                            true,

                        reviewsError:
                            null,
                    })

                    try {
                        const response =
                            await PlaceReviewService
                                .getPlaceReviewList({
                                    access_token,
                                    placeId,
                                    doc,
                                })

                        const reviews =
                            getReviewItems(
                                response
                            )

                        const paginationSource =
                            getPaginationSource(
                                response
                            )

                        const current =
                            Number(
                                paginationSource
                                    ?.current ||
                                paginationSource
                                    ?.page ||
                                paginationSource
                                    ?.currentPage ||
                                doc?.page
                            ) ||
                            1

                        const pageSize =
                            Number(
                                paginationSource
                                    ?.pageSize ||
                                paginationSource
                                    ?.limit ||
                                paginationSource
                                    ?.perPage ||
                                doc?.limit
                            ) ||
                            20

                        const totalValue =
                            paginationSource
                                ?.total ??
                            paginationSource
                                ?.totalCount ??
                            paginationSource
                                ?.count ??
                            response?.total ??
                            reviews.length

                        const total =
                            Number(
                                totalValue
                            )

                        const reviewPagination = {
                            ...paginationSource,

                            current,

                            pageSize,

                            total:
                                Number.isFinite(
                                    total
                                )
                                    ? total
                                    : reviews.length,
                        }

                        const reviewSummary =
                            getReviewSummary(
                                response
                            )

                        const reviewStats =
                            getReviewStats(
                                response
                            )

                        set({
                            reviewList:
                                reviews,

                            reviewPagination,

                            reviewSummary,

                            reviewStats,

                            reviewsLoading:
                                false,

                            reviewsError:
                                null,

                            reviewsCacheKey:
                                cacheKey,
                        })

                        return {
                            reviews,

                            pagination:
                                reviewPagination,

                            summary:
                                reviewSummary,

                            stats:
                                reviewStats,
                        }
                    } catch (
                    error
                    ) {
                        const errorMessage =
                            getErrorMessage(
                                error
                            )

                        set({
                            reviewsLoading:
                                false,

                            reviewsError:
                                errorMessage,
                        })

                        throw error
                    }
                },

            clearReviewList:
                () => {
                    set({
                        reviewList:
                            [],

                        reviewPagination: {
                            ...initialPagination,
                        },

                        reviewSummary:
                            {},

                        reviewStats:
                            {},

                        reviewsLoading:
                            false,

                        reviewsError:
                            null,

                        reviewsCacheKey:
                            '',
                    })
                },
        })
    )

export default usePlaceReviewStore