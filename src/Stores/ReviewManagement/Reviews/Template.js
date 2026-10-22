import { create } from 'zustand'

import TemplateReviewServices
    from '../../../services/ReviewManagement/reviews/Template'

const CACHE_TIME =
    2 * 60 * 1000

const pendingRequests =
    new Map()

const responseCache =
    new Map()

const initialPagination = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
}

const getErrorMessage = (
    error
) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Something went wrong'
    )
}

const getCachedData = (
    key
) => {
    const cached =
        responseCache.get(key)

    if (!cached) {
        return null
    }

    const expired =
        Date.now() - cached.time >
        CACHE_TIME

    if (expired) {
        responseCache.delete(key)
        return null
    }

    return cached.data
}

const runRequest = async (
    key,
    request,
    force = false
) => {
    if (!force) {
        const cached =
            getCachedData(key)

        if (cached) {
            return cached
        }
    }

    if (
        pendingRequests.has(key)
    ) {
        return pendingRequests.get(
            key
        )
    }

    const promise = request()
        .then((response) => {
            responseCache.set(key, {
                data: response,
                time: Date.now(),
            })

            return response
        })
        .finally(() => {
            pendingRequests.delete(
                key
            )
        })

    pendingRequests.set(
        key,
        promise
    )

    return promise
}

/**
 * Supports both:
 *
 * 1. Axios response:
 *    {
 *        data: {
 *            success: true,
 *            data: [],
 *            pagination: {}
 *        }
 *    }
 *
 * 2. Service response:
 *    {
 *        success: true,
 *        data: [],
 *        pagination: {}
 *    }
 */
const unwrapResponse = (
    response
) => {
    const isAxiosResponse =
        response &&
        typeof response ===
        'object' &&
        response?.status !==
        undefined &&
        response?.headers !==
        undefined &&
        response?.data !==
        undefined

    if (isAxiosResponse) {
        return response.data
    }

    return response
}

const normalizeCategory = (
    category = {}
) => {
    return {
        ...category,

        _id:
            category?._id ||
            category?.id ||
            '',

        id:
            category?.id ||
            category?._id ||
            '',

        nameEn:
            category?.nameEn ||
            category?.name_en ||
            '',

        nameKh:
            category?.nameKh ||
            category?.name_kh ||
            '',
    }
}

const normalizeCriterion = (
    criterion = {},
    index = 0
) => {
    const weight = Number(
        criterion?.weightPercent ??
        criterion?.weight ??
        0
    )

    return {
        ...criterion,

        _id:
            criterion?._id ||
            criterion?.id ||
            criterion?.key ||
            `criterion-${index}`,

        id:
            criterion?.id ||
            criterion?._id ||
            criterion?.key ||
            `criterion-${index}`,

        key:
            criterion?.key ||
            `criterion-${index}`,

        nameEn:
            criterion?.nameEn ||
            criterion?.name_en ||
            criterion?.name ||
            '',

        nameKh:
            criterion?.nameKh ||
            criterion?.name_kh ||
            '',

        /**
         * Your component currently reads:
         * dimension.weight
         */
        weight,

        /**
         * Keep the original API field too.
         */
        weightPercent: weight,

        orderNumber:
            Number(
                criterion
                    ?.orderNumber ??
                criterion?.order ??
                index + 1
            ),
    }
}

const normalizeTemplate = (
    template = {}
) => {
    const rawCategories =
        Array.isArray(
            template?.categories
        )
            ? template.categories
            : Array.isArray(
                template
                    ?.subCategories
            )
                ? template
                    .subCategories
                : []

    const rawCriteria =
        Array.isArray(
            template?.criteria
        )
            ? template.criteria
            : Array.isArray(
                template?.dimensions
            )
                ? template
                    .dimensions
                : []

    const categories =
        rawCategories.map(
            normalizeCategory
        )

    const criteria =
        rawCriteria
            .map(
                normalizeCriterion
            )
            .sort(
                (
                    first,
                    second
                ) => {
                    return (
                        first
                            .orderNumber -
                        second
                            .orderNumber
                    )
                }
            )

    const totalWeight =
        criteria.reduce(
            (
                total,
                criterion
            ) => {
                return (
                    total +
                    Number(
                        criterion
                            ?.weight ||
                        0
                    )
                )
            },
            0
        )

    return {
        ...template,

        _id:
            template?._id ||
            template?.id ||
            '',

        id:
            template?.id ||
            template?._id ||
            '',

        /**
         * API field.
         */
        nameEn:
            template?.nameEn ||
            template
                ?.templateName ||
            template?.name ||
            '',

        nameKh:
            template?.nameKh ||
            '',

        /**
         * Your current table reads:
         * record.templateName
         */
        templateName:
            template
                ?.templateName ||
            template?.nameEn ||
            template?.name ||
            '-',

        template_name:
            template
                ?.template_name ||
            template?.nameEn ||
            template
                ?.templateName ||
            '-',

        /**
         * API fields.
         */
        categories,
        criteria,

        /**
         * Current UI aliases.
         */
        subCategories:
            categories,

        dimensions:
            criteria,

        tagDisplayCount:
            template
                ?.tagDisplayCount ??
            2,

        totalWeight,

        status:
            template?.status ||
            'Inactive',

        version:
            Number(
                template?.version ||
                1
            ),
    }
}

const extractListData = (
    response,
    fallbackPage = 1,
    fallbackLimit = 20
) => {
    const body =
        unwrapResponse(response) ||
        {}

    let rawItems = []

    if (
        Array.isArray(body)
    ) {
        rawItems = body
    } else if (
        Array.isArray(
            body?.data
        )
    ) {
        rawItems = body.data
    } else if (
        Array.isArray(
            body?.items
        )
    ) {
        rawItems = body.items
    } else if (
        Array.isArray(
            body?.results
        )
    ) {
        rawItems =
            body.results
    } else if (
        Array.isArray(
            body?.data?.items
        )
    ) {
        rawItems =
            body.data.items
    } else if (
        Array.isArray(
            body
                ?.data
                ?.results
        )
    ) {
        rawItems =
            body.data.results
    }

    const rawPagination =
        body?.pagination ||
        body?.meta ||
        body?.data
            ?.pagination ||
        body?.data?.meta ||
        {}

    const page =
        Number(
            rawPagination
                ?.page ??
            fallbackPage
        ) || 1

    const limit =
        Number(
            rawPagination
                ?.limit ??
            rawPagination
                ?.pageSize ??
            fallbackLimit
        ) || 20

    const total =
        Number(
            rawPagination
                ?.total ??
            body?.total ??
            body?.data
                ?.total ??
            rawItems.length
        ) || 0

    const totalPages =
        Number(
            rawPagination
                ?.totalPages ??
            body?.totalPages ??
            body?.data
                ?.totalPages ??
            Math.ceil(
                total / limit
            )
        ) || 0

    return {
        items:
            rawItems.map(
                normalizeTemplate
            ),

        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    }
}

const extractDetailData = (
    response
) => {
    const body =
        unwrapResponse(response)

    if (!body) {
        return null
    }

    let detail = body

    if (
        body?.data &&
        !Array.isArray(
            body.data
        )
    ) {
        detail = body.data
    } else if (
        body?.result &&
        !Array.isArray(
            body.result
        )
    ) {
        detail =
            body.result
    }

    if (
        !detail ||
        typeof detail !==
        'object' ||
        Array.isArray(detail)
    ) {
        return null
    }

    return normalizeTemplate(
        detail
    )
}

const useTemplateReviewStore =
    create((set, get) => ({
        templateReviews: [],

        templateReviewDetail:
            null,

        pagination: {
            ...initialPagination,
        },

        listLoading: false,

        detailLoading: false,

        error: null,

        fetchTemplateReviews:
            async ({
                access_token,
                page = 1,
                limit = 20,
                force = false,
                ...filters
            } = {}) => {
                if (
                    !access_token
                ) {
                    set({
                        error:
                            'Access token is required',

                        listLoading:
                            false,
                    })

                    return null
                }

                const params = {
                    page,
                    limit,
                    ...filters,
                }

                const filterKey =
                    JSON.stringify(
                        params
                    )

                const requestKey =
                    `review-template-list-${filterKey}`

                set({
                    listLoading:
                        true,

                    error: null,
                })

                try {
                    const response =
                        await runRequest(
                            requestKey,

                            () => {
                                return TemplateReviewServices
                                    .ListTemplateReview({
                                        access_token,
                                        doc: params,
                                    })
                            },

                            force
                        )

                    const result =
                        extractListData(
                            response,
                            page,
                            limit
                        )

                    set({
                        templateReviews:
                            result.items,

                        pagination:
                            result.pagination,

                        error: null,
                    })

                    return result
                } catch (error) {
                    const message =
                        getErrorMessage(
                            error
                        )

                    set({
                        templateReviews:
                            [],

                        pagination: {
                            page,
                            limit,
                            total: 0,
                            totalPages:
                                0,
                        },

                        error:
                            message,
                    })

                    throw error
                } finally {
                    set({
                        listLoading:
                            false,
                    })
                }
            },

        fetchTemplateReviewById:
            async ({
                access_token,
                templateId,
                force = false,
            } = {}) => {
                if (
                    !access_token
                ) {
                    set({
                        error:
                            'Access token is required',

                        detailLoading:
                            false,
                    })

                    return null
                }

                if (
                    !templateId
                ) {
                    set({
                        error:
                            'Template ID is required',

                        detailLoading:
                            false,
                    })

                    return null
                }

                const requestKey =
                    `review-template-detail-${templateId}`

                set({
                    detailLoading:
                        true,

                    templateReviewDetail:
                        null,

                    error: null,
                })

                try {
                    const response =
                        await runRequest(
                            requestKey,

                            () => {
                                return TemplateReviewServices
                                    .GetTemplateReviewById({
                                        access_token,

                                        doc: {
                                            _id:
                                                templateId,
                                        },
                                    })
                            },

                            force
                        )

                    const detail =
                        extractDetailData(
                            response
                        )

                    if (!detail) {
                        throw new Error(
                            'Review template detail was not found'
                        )
                    }

                    set({
                        templateReviewDetail:
                            detail,

                        error: null,
                    })

                    return detail
                } catch (error) {
                    const message =
                        getErrorMessage(
                            error
                        )

                    set({
                        templateReviewDetail:
                            null,

                        error:
                            message,
                    })

                    throw error
                } finally {
                    set({
                        detailLoading:
                            false,
                    })
                }
            },

        setTemplateReviewDetail:
            (
                template
            ) => {
                set({
                    templateReviewDetail:
                        template
                            ? normalizeTemplate(
                                template
                            )
                            : null,
                })
            },

        clearTemplateReviewCache:
            () => {
                responseCache.clear()
                pendingRequests.clear()
            },

        clearTemplateReviewListCache:
            () => {
                const keys = [
                    ...responseCache
                        .keys(),
                ]

                keys.forEach(
                    (key) => {
                        if (
                            key.startsWith(
                                'review-template-list-'
                            )
                        ) {
                            responseCache.delete(
                                key
                            )
                        }
                    }
                )
            },

        clearTemplateReviewDetailCache:
            (
                templateId
            ) => {
                if (
                    templateId
                ) {
                    responseCache.delete(
                        `review-template-detail-${templateId}`
                    )

                    return
                }

                const keys = [
                    ...responseCache
                        .keys(),
                ]

                keys.forEach(
                    (key) => {
                        if (
                            key.startsWith(
                                'review-template-detail-'
                            )
                        ) {
                            responseCache.delete(
                                key
                            )
                        }
                    }
                )
            },

        clearTemplateReviewDetail:
            () => {
                set({
                    templateReviewDetail:
                        null,
                })
            },

        clearTemplateReviews:
            () => {
                set({
                    templateReviews:
                        [],

                    pagination: {
                        ...initialPagination,
                    },
                })
            },

        clearError: () => {
            set({
                error: null,
            })
        },

        resetTemplateReviewStore:
            () => {
                responseCache.clear()
                pendingRequests.clear()

                set({
                    templateReviews:
                        [],

                    templateReviewDetail:
                        null,

                    pagination: {
                        ...initialPagination,
                    },

                    listLoading:
                        false,

                    detailLoading:
                        false,

                    error: null,
                })
            },
    }))

export default useTemplateReviewStore