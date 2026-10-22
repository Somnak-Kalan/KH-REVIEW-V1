import { create } from 'zustand'
import CreatorRequestServices from '../../../services/MobileApp/creatorRequst/CreatorRequst'

export const useCreatorRequestStore = create((set, get) => ({
    // ====== STATE ======
    creatorRequests: [],
    creatorRequest: null,

    filters: {
        page: 1,
        size: 10,
        search: '',
        status: '',
        userId: '',
    },

    pagination: {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    },
    summary: {
        totalRequests: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    },

    loading: false,
    error: null,

    creatorRequestsFetchedAt: 0,
    creatorRequestDetailFetchedAt: 0,

    creatorRequestById: {},
    creatorRequestByIdInFlight: {},

    // ====== HELPERS ======
    setFilters: (nextFilters = {}) =>
        set((state) => ({
            filters: {
                ...state.filters,
                ...nextFilters,
            },
        })),

    clearError: () => set({ error: null }),

    resetCreatorRequestState: () =>
        set({
            creatorRequests: [],
            creatorRequest: null,
            filters: {
                page: 1,
                size: 10,
                search: '',
                status: '',
                userId: '',
            },
            pagination: {
                page: 1,
                size: 10,
                total: 0,
                totalPages: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
            },

            loading: false,
            error: null,
            creatorRequestsFetchedAt: 0,
            creatorRequestDetailFetchedAt: 0,
            creatorRequestById: {},
            creatorRequestByIdInFlight: {},
        }),

    // ====== LIST ======
    fetchCreatorRequests: async ({ access_token, doc = {}, force = false } = {}) => {
        const state = get()
        const effectiveFilters = {
            page: doc?.page ?? state.filters?.page ?? 1,
            size: doc?.size ?? state.filters?.size ?? 10,
            search: doc?.search ?? state.filters?.search ?? '',
            status: doc?.status ?? state.filters?.status ?? '',
            userId: doc?.userId ?? state.filters?.userId ?? '',
        }

        const sameFilters =
            Number(state.filters?.page ?? 1) === Number(effectiveFilters.page) &&
            Number(state.filters?.size ?? 10) === Number(effectiveFilters.size) &&
            String(state.filters?.search ?? '') === String(effectiveFilters.search ?? '') &&
            String(state.filters?.status ?? '') === String(effectiveFilters.status ?? '') &&
            String(state.filters?.userId ?? '') === String(effectiveFilters.userId ?? '')

        if (
            !force &&
            sameFilters &&
            Array.isArray(state.creatorRequests) &&
            state.creatorRequests.length > 0
        ) {
            return { data: state.creatorRequests, fromCache: true }
        }

        try {
            set({
                loading: true,
                error: null,
                filters: effectiveFilters,
            })

            const res = await CreatorRequestServices.fetchCreatorRequests({
                access_token,
                doc: effectiveFilters,
            })

            const list =
                res?.data?.docs ||
                res?.data?.creatorRequests ||
                res?.docs ||
                res?.creatorRequests ||
                res?.data ||
                res?.result ||
                []

            const total =
                res?.meta?.pagination?.total ??
                res?.data?.total ??
                res?.pagination?.total ??
                (Array.isArray(list) ? list.length : 0)

            const totalPages =
                res?.meta?.pagination?.totalPages ??
                res?.data?.totalPages ??
                res?.pagination?.totalPages ??
                0

            const currentPage =
                res?.meta?.pagination?.page ??
                res?.data?.page ??
                res?.page ??
                effectiveFilters.page

            const currentSize =
                res?.meta?.pagination?.size ??
                res?.meta?.pagination?.limit ??
                res?.data?.size ??
                res?.data?.limit ??
                res?.size ??
                res?.limit ??
                effectiveFilters.size

            const pending =
                res?.meta?.pagination?.pending ??
                res?.meta?.counts?.pending ??
                res?.data?.pending ??
                0

            const approved =
                res?.meta?.pagination?.approved ??
                res?.meta?.counts?.approved ??
                res?.data?.approved ??
                0

            const rejected =
                res?.meta?.pagination?.rejected ??
                res?.meta?.counts?.rejected ??
                res?.data?.rejected ??
                0

            set({
                creatorRequests: Array.isArray(list) ? list : [],
                pagination: {
                    page: Number(currentPage) || 1,
                    size: Number(currentSize) || 10,
                    total: Number(total) || 0,
                    totalPages: Number(totalPages) || 0,
                    pending: Number(pending) || 0,
                    approved: Number(approved) || 0,
                    rejected: Number(rejected) || 0,
                },
                summary: {
                    totalRequests: res?.meta?.summary?.totalRequests || 0,
                    pending: res?.meta?.summary?.pending || 0,
                    approved: res?.meta?.summary?.approved || 0,
                    rejected: res?.meta?.summary?.rejected || 0,

                },
                creatorRequestsFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== GET BY ID ======
    fetchCreatorRequestById: async ({ access_token, _id, force = false } = {}) => {
        const state = get()
        if (!_id) return null

        const cached = state.creatorRequestById?.[_id]
        if (!force && cached) {
            if (state.creatorRequest?._id !== _id && state.creatorRequest?.id !== _id) {
                set({
                    creatorRequest: cached,
                    creatorRequestDetailFetchedAt: Date.now(),
                })
            }
            return { data: cached, fromCache: true }
        }

        if (!force && (state.creatorRequest?._id === _id || state.creatorRequest?.id === _id)) {
            return { data: state.creatorRequest, fromCache: true }
        }

        const inflightMap = state.creatorRequestByIdInFlight || {}
        if (inflightMap[_id]) return null

        try {
            set({
                loading: true,
                error: null,
                creatorRequestByIdInFlight: { ...inflightMap, [_id]: true },
            })

            const res = await CreatorRequestServices.fetchCreatorRequestById({
                access_token,
                doc: { _id },
            })

            const detail =
                res?.data?.doc ||
                res?.data?.creatorRequest ||
                res?.doc ||
                res?.creatorRequest ||
                res?.data ||
                res?.result ||
                res ||
                null

            const nextCache = get().creatorRequestById || {}

            set({
                creatorRequest: detail,
                creatorRequestById: { ...nextCache, [_id]: detail },
                creatorRequestDetailFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        } finally {
            const current = get().creatorRequestByIdInFlight || {}
            const { [_id]: removed, ...rest } = current
            set({ creatorRequestByIdInFlight: rest })
        }
    },

    // ====== CREATE ======
    createCreatorRequest: async ({ access_token, doc = {} } = {}) => {
        try {
            set({ loading: true, error: null })

            const res = await CreatorRequestServices.createCreatorRequest({
                access_token,
                doc,
            })

            const created =
                res?.data?.doc ||
                res?.data?.creatorRequest ||
                res?.doc ||
                res?.creatorRequest ||
                res?.data ||
                res?.result ||
                null

            const state = get()

            if (created) {
                const createdId = created?._id || created?.id

                set({
                    creatorRequests: Array.isArray(state.creatorRequests)
                        ? [created, ...state.creatorRequests]
                        : [created],
                    creatorRequest: created,
                    creatorRequestById: createdId
                        ? {
                            ...(state.creatorRequestById || {}),
                            [createdId]: created,
                        }
                        : state.creatorRequestById,
                    pagination: {
                        ...state.pagination,
                        total: Number(state.pagination?.total || 0) + 1,
                    },
                    creatorRequestDetailFetchedAt: Date.now(),
                    creatorRequestsFetchedAt: Date.now(),
                    loading: false,
                })
            } else {
                set({ loading: false })
            }

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== UPDATE ======
    updateCreatorRequest: async ({ access_token, doc = {} } = {}) => {
        try {
            set({ loading: true, error: null })

            const res = await CreatorRequestServices.updateCreatorRequest({
                access_token,
                doc,
            })

            const updatedId = doc?._id
            const payloadBody = doc?.body || {}

            let updatedDetail =
                res?.data?.doc ||
                res?.data?.creatorRequest ||
                res?.doc ||
                res?.creatorRequest ||
                res?.data ||
                res?.result ||
                null

            const state = get()

            if (!updatedDetail && updatedId) {
                const oldDetail =
                    state.creatorRequestById?.[updatedId] ||
                    ((state.creatorRequest?._id === updatedId || state.creatorRequest?.id === updatedId)
                        ? state.creatorRequest
                        : null)

                updatedDetail = oldDetail
                    ? {
                        ...oldDetail,
                        ...payloadBody,
                    }
                    : null
            }

            if (updatedId && updatedDetail) {
                const nextById = {
                    ...(state.creatorRequestById || {}),
                    [updatedId]: updatedDetail,
                }

                const nextList = Array.isArray(state.creatorRequests)
                    ? state.creatorRequests.map((item) => {
                        if (item?._id === updatedId || item?.id === updatedId) {
                            return {
                                ...item,
                                ...updatedDetail,
                            }
                        }
                        return item
                    })
                    : []

                set({
                    creatorRequests: nextList,
                    creatorRequest:
                        state.creatorRequest?._id === updatedId || state.creatorRequest?.id === updatedId
                            ? updatedDetail
                            : state.creatorRequest,
                    creatorRequestById: nextById,
                    creatorRequestDetailFetchedAt: Date.now(),
                    creatorRequestsFetchedAt: Date.now(),
                    loading: false,
                })
            } else {
                set({ loading: false })
            }

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== APPROVE ======
    approveCreatorRequest: async ({ access_token, doc = {} } = {}) => {
        try {
            set({ loading: true, error: null })

            const res = await CreatorRequestServices.approveCreatorRequest({
                access_token,
                doc,
            })

            const updatedId = doc?._id
            const payloadBody = doc?.body || {}

            let approvedDetail =
                res?.data?.doc ||
                res?.data?.creatorRequest ||
                res?.doc ||
                res?.creatorRequest ||
                res?.data ||
                res?.result ||
                null

            const state = get()

            if (!approvedDetail && updatedId) {
                const oldDetail =
                    state.creatorRequestById?.[updatedId] ||
                    ((state.creatorRequest?._id === updatedId || state.creatorRequest?.id === updatedId)
                        ? state.creatorRequest
                        : null)

                approvedDetail = oldDetail
                    ? {
                        ...oldDetail,
                        ...payloadBody,
                        status: 'approved',
                    }
                    : null
            }

            if (updatedId && approvedDetail) {
                const nextById = {
                    ...(state.creatorRequestById || {}),
                    [updatedId]: approvedDetail,
                }

                const nextList = Array.isArray(state.creatorRequests)
                    ? state.creatorRequests.map((item) => {
                        if (item?._id === updatedId || item?.id === updatedId) {
                            return {
                                ...item,
                                ...approvedDetail,
                                status: approvedDetail?.status || 'approved',
                            }
                        }
                        return item
                    })
                    : []

                set({
                    creatorRequests: nextList,
                    creatorRequest:
                        state.creatorRequest?._id === updatedId || state.creatorRequest?.id === updatedId
                            ? approvedDetail
                            : state.creatorRequest,
                    creatorRequestById: nextById,
                    creatorRequestDetailFetchedAt: Date.now(),
                    creatorRequestsFetchedAt: Date.now(),
                    loading: false,
                })
            } else {
                set({ loading: false })
            }

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== REJECT ======
    rejectCreatorRequest: async ({ access_token, doc = {} } = {}) => {
        try {
            set({ loading: true, error: null })

            const res = await CreatorRequestServices.rejectCreatorRequest({
                access_token,
                doc,
            })

            const updatedId = doc?._id
            const payloadBody = doc?.body || {}

            let rejectedDetail =
                res?.data?.doc ||
                res?.data?.creatorRequest ||
                res?.doc ||
                res?.creatorRequest ||
                res?.data ||
                res?.result ||
                null

            const state = get()

            if (!rejectedDetail && updatedId) {
                const oldDetail =
                    state.creatorRequestById?.[updatedId] ||
                    ((state.creatorRequest?._id === updatedId || state.creatorRequest?.id === updatedId)
                        ? state.creatorRequest
                        : null)

                rejectedDetail = oldDetail
                    ? {
                        ...oldDetail,
                        ...payloadBody,
                        status: 'rejected',
                    }
                    : null
            }

            if (updatedId && rejectedDetail) {
                const nextById = {
                    ...(state.creatorRequestById || {}),
                    [updatedId]: rejectedDetail,
                }

                const nextList = Array.isArray(state.creatorRequests)
                    ? state.creatorRequests.map((item) => {
                        if (item?._id === updatedId || item?.id === updatedId) {
                            return {
                                ...item,
                                ...rejectedDetail,
                                status: rejectedDetail?.status || 'rejected',
                            }
                        }
                        return item
                    })
                    : []

                set({
                    creatorRequests: nextList,
                    creatorRequest:
                        state.creatorRequest?._id === updatedId || state.creatorRequest?.id === updatedId
                            ? rejectedDetail
                            : state.creatorRequest,
                    creatorRequestById: nextById,
                    creatorRequestDetailFetchedAt: Date.now(),
                    creatorRequestsFetchedAt: Date.now(),
                    loading: false,
                })
            } else {
                set({ loading: false })
            }

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },
}))

export default useCreatorRequestStore