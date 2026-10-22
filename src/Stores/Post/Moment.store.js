import { create } from 'zustand'
import MomentService from '../../services/post/moments/Moments'

const POST_TYPE = 'PhotoPost'
const VIDEO_TYPE = 'VideoPost'

const normalizeType = (type) => {
    const value = String(type || '').trim().toLowerCase()

    if (value === 'videopost' || value === 'video') return VIDEO_TYPE
    if (value === 'photopost' || value === 'post') return POST_TYPE

    return POST_TYPE
}

const pickList = (res) => res?.data ?? res?.list ?? res?.items ?? []
const pickTotal = (res) => res?.pagination?.total ?? res?.total ?? res?.count ?? 0

const pickInteractionList = (res) =>
    res?.data?.interactions ??
    res?.data?.list ??
    res?.data?.items ??
    res?.interactions ??
    res?.list ??
    res?.items ??
    (Array.isArray(res?.data) ? res.data : [])

const pickInteractionTotal = (res) =>
    res?.data?.pagination?.total ??
    res?.pagination?.total ??
    res?.data?.total ??
    res?.total ??
    res?.count ??
    0

const pickInteractionPagination = (res) =>
    res?.data?.pagination ?? res?.pagination ?? null

export const useMomentStore = create((set, get) => ({
    // ====== STATE ======
    listPost: [],
    totalPost: 0,
    paginationPost: null,
    summaryPost: null,
    searchPost: '',
    filtersPost: {},

    listVideo: [],
    totalVideo: 0,
    paginationVideo: null,
    summaryVideo: null,
    searchVideo: '',
    filtersVideo: {},

    detail: null,
    hashtagSuggestions: [],
    totalStatus: null,
    lastResponse: null,

    // ====== MOMENT INTERACTIONS ======
    listMomentInteractions: [],
    totalMomentInteractions: 0,
    paginationMomentInteractions: null,
    summaryMomentInteractions: null,
    filtersMomentInteractions: {},
    momentInteractionMomentId: null,
    momentOwner:{},

    loading: false,
    loadingDetail: false,
    loadingCreate: false,
    loadingUpdate: false,
    loadingDelete: false,
    loadingHide: false,
    loadingApprove: false,
    loadingActive: false,
    loadingHashtags: false,
    loadingMomentInteractions: false,

    error: null,

    momentFetchedAtPost: 0,
    momentFetchedAtVideo: 0,
    momentDetailFetchedAt: 0,
    momentInteractionsFetchedAt: 0,

    momentById: {},
    momentByIdInFlight: {},

    // ====== HELPERS ======
    clearError: () => set({ error: null }),

    reset: () =>
        set({
            listPost: [],
            totalPost: 0,
            paginationPost: null,
            summaryPost: null,
            searchPost: '',
            filtersPost: {},

            listVideo: [],
            totalVideo: 0,
            paginationVideo: null,
            summaryVideo: null,
            searchVideo: '',
            filtersVideo: {},

            detail: null,
            hashtagSuggestions: [],
            totalStatus: null,
            lastResponse: null,

            listMomentInteractions: [],
            totalMomentInteractions: 0,
            paginationMomentInteractions: null,
            summaryMomentInteractions: null,
            filtersMomentInteractions: {},
            momentInteractionMomentId: null,

            loading: false,
            loadingDetail: false,
            loadingCreate: false,
            loadingUpdate: false,
            loadingDelete: false,
            loadingHide: false,
            loadingApprove: false,
            loadingActive: false,
            loadingHashtags: false,
            loadingMomentInteractions: false,

            error: null,

            momentFetchedAtPost: 0,
            momentFetchedAtVideo: 0,
            momentDetailFetchedAt: 0,
            momentInteractionsFetchedAt: 0,

            momentById: {},
            momentByIdInFlight: {},
        }),

    setPostSearch: (search = '') => set({ searchPost: search }),
    setVideoSearch: (search = '') => set({ searchVideo: search }),

    hasLoadedType: (type) => {
        const normalizedType = normalizeType(type)
        const state = get()

        if (normalizedType === POST_TYPE) {
            return Array.isArray(state.listPost) && state.listPost.length > 0
        }

        if (normalizedType === VIDEO_TYPE) {
            return Array.isArray(state.listVideo) && state.listVideo.length > 0
        }

        return false
    },

    // ====== LIST ======
    ListMoment: async ({ access_token, doc = {}, force = false } = {}) => {
        const type = normalizeType(doc?.type)
        const state = get()

        const effectiveSearch =
            doc?.search ??
            (type === POST_TYPE ? state.searchPost : state.searchVideo) ??
            ''

        const finalDoc = {
            ...doc,
            type,
            search: effectiveSearch,
        }

        if (type === POST_TYPE) {
            const sameFilters =
                JSON.stringify(state.filtersPost || {}) === JSON.stringify(finalDoc || {})

            if (!force && sameFilters && Array.isArray(state.listPost) && state.listPost.length > 0) {
                return { data: state.listPost, fromCache: true }
            }
        }

        if (type === VIDEO_TYPE) {
            const sameFilters =
                JSON.stringify(state.filtersVideo || {}) === JSON.stringify(finalDoc || {})

            if (!force && sameFilters && Array.isArray(state.listVideo) && state.listVideo.length > 0) {
                return { data: state.listVideo, fromCache: true }
            }
        }

        try {
            set({ loading: true, error: null })

            const res = await MomentService.ListMoment({
                access_token,
                doc: finalDoc,
            })

            const list = pickList(res)
            const total = pickTotal(res)

            if (type === POST_TYPE) {
                set({
                    listPost: Array.isArray(list) ? list : [],
                    totalPost: total,
                    paginationPost: res?.pagination ?? null,
                    summaryPost: res?.summary ?? null,
                    searchPost: effectiveSearch,
                    filtersPost: finalDoc,
                    momentFetchedAtPost: Date.now(),
                    totalStatus: res,
                    lastResponse: res,
                    loading: false,
                })
            } else {
                set({
                    listVideo: Array.isArray(list) ? list : [],
                    totalVideo: total,
                    paginationVideo: res?.pagination ?? null,
                    summaryVideo: res?.summary ?? null,
                    searchVideo: effectiveSearch,
                    filtersVideo: finalDoc,
                    momentFetchedAtVideo: Date.now(),
                    totalStatus: res,
                    lastResponse: res,
                    loading: false,
                })
            }

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== MOMENT INTERACTIONS ======
    ListMomentInteractions: async ({ access_token, id, doc = {}, force = false } = {}) => {
        const state = get()

        if (!id) return null

        const finalDoc = {
            actionType: doc?.actionType ?? '',
            page: doc?.page ?? 1,
            size: doc?.size ?? 20,
        }

        const sameMoment = state.momentInteractionMomentId === id
        const sameFilters =
            JSON.stringify(state.filtersMomentInteractions || {}) === JSON.stringify(finalDoc || {})

        if (
            !force &&
            sameMoment &&
            sameFilters &&
            Array.isArray(state.listMomentInteractions) &&
            state.listMomentInteractions.length > 0
        ) {
            return {
                data: state.listMomentInteractions,
                pagination: state.paginationMomentInteractions,
                total: state.totalMomentInteractions,
                fromCache: true,
            }
        }

        try {
            set({
                loadingMomentInteractions: true,
                error: null,
            })

            const res = await MomentService.ListMomentInteractions({
                access_token,
                id,
                doc: finalDoc,
            })            
            const list = pickInteractionList(res)
            const total = pickInteractionTotal(res)
            const pagination = pickInteractionPagination(res)

            set({
                listMomentInteractions: Array.isArray(list) ? list : [],
                momentOwner: 
        res?.momentOwner ||
        res?.data?.momentOwner ||
        {},
                totalMomentInteractions: total,
                paginationMomentInteractions: pagination,
                summaryMomentInteractions: res?.data?.summary ?? res?.summary ?? null,
                filtersMomentInteractions: finalDoc,
                momentInteractionMomentId: id,
                momentInteractionsFetchedAt: Date.now(),
                lastResponse: res,
                loadingMomentInteractions: false,
            })

            return res
        } catch (error) {
            set({
                loadingMomentInteractions: false,
                error,
            })
            throw error
        }
    },

    // ====== GET BY ID ======
    fetchMomentById: async ({ access_token, _id, force = false } = {}) => {
        const state = get()
        if (!_id) return null

        const cached = state.momentById?.[_id]
        if (!force && cached) {
            if (state.detail?._id !== _id) {
                set({
                    detail: cached,
                    momentDetailFetchedAt: Date.now(),
                })
            }
            return { data: cached, fromCache: true }
        }

        if (!force && state.detail?._id === _id) {
            return { data: state.detail, fromCache: true }
        }

        const inflightMap = state.momentByIdInFlight || {}
        if (inflightMap[_id]) {
            return { data: state.momentById?.[_id] || null }
        }
        try {
            set({
                loadingDetail: true,
                error: null,
                momentByIdInFlight: { ...inflightMap, [_id]: true },
            })

            const res = await MomentService.fetchMomentById({
                access_token,
                doc: { _id },
            })

            const detail = res?.data ?? res?.detail ?? res ?? null
            const nextCache = get().momentById || {}

            set({
                detail,
                momentById: { ...nextCache, [_id]: detail },
                momentDetailFetchedAt: Date.now(),
                lastResponse: res,
                loadingDetail: false,
            })

            return res

            // return res
        } catch (error) {
            set({ loadingDetail: false, error })
            throw error
        } finally {
            const current = get().momentByIdInFlight || {}
            const { [_id]: _, ...rest } = current
            set({ momentByIdInFlight: rest })
        }
    },

    // ====== HASHTAGS ======
    FilterHastages: async (payload) => {
        try {
            set({ loadingHashtags: true, error: null })

            const res = await MomentService.FilterHastages(payload)

            set({
                hashtagSuggestions: res?.data ?? res?.list ?? res?.items ?? [],
                lastResponse: res,
                loadingHashtags: false,
            })

            return res
        } catch (error) {
            set({ loadingHashtags: false, error })
            throw error
        }
    },

    // ====== REFRESH HELPERS ======
    refreshPostList: async (access_token) => {
        const state = get()
        const filters = state.filtersPost || {}

        if (!Object.keys(filters).length) return null

        return await get().ListMoment({
            access_token,
            doc: {
                ...filters,
                type: POST_TYPE,
            },
            force: true,
        })
    },

    refreshVideoList: async (access_token) => {
        const state = get()
        const filters = state.filtersVideo || {}

        if (!Object.keys(filters).length) return null

        return await get().ListMoment({
            access_token,
            doc: {
                ...filters,
                type: VIDEO_TYPE,
            },
            force: true,
        })
    },

    refreshLoadedLists: async (access_token) => {
        const state = get()

        if (state.filtersPost && Object.keys(state.filtersPost).length > 0) {
            await get().refreshPostList(access_token)
        }

        if (state.filtersVideo && Object.keys(state.filtersVideo).length > 0) {
            await get().refreshVideoList(access_token)
        }
    },

    refreshMomentInteractions: async (access_token) => {
        const state = get()
        const filters = state.filtersMomentInteractions || {}
        const id = state.momentInteractionMomentId

        if (!id || !Object.keys(filters).length) return null

        return await get().ListMomentInteractions({
            access_token,
            id,
            doc: filters,
            force: true,
        })
    },

    // ====== CREATE ======
    CreateMoment: async (payload) => {
        try {
            set({ loadingCreate: true, error: null })

            const res = await MomentService.CreateMoment(payload)

            set({
                lastResponse: res,
                loadingCreate: false,
            })

            const type = normalizeType(payload?.doc?.type || payload?.type)

            if (type === POST_TYPE) {
                await get().refreshPostList(payload?.access_token)
            } else {
                await get().refreshVideoList(payload?.access_token)
            }

            return res
        } catch (error) {
            set({ loadingCreate: false, error })
            throw error
        }
    },

    // ====== UPDATE ======
    UpdateMoment: async (payload) => {
        try {
            set({ loadingUpdate: true, error: null })

            const res = await MomentService.UpdateMoment(payload)

            set({
                lastResponse: res,
                loadingUpdate: false,
            })

            const type = normalizeType(payload?.doc?.type || payload?.type)

            if (type === POST_TYPE) {
                await get().refreshPostList(payload?.access_token)
            } else {
                await get().refreshVideoList(payload?.access_token)
            }

            return res
        } catch (error) {
            set({ loadingUpdate: false, error })
            throw error
        }
    },

    // ====== DELETE ======
    deleteMoment: async (payload) => {
        try {
            set({ loadingDelete: true, error: null })

            const res = await MomentService.deleteMomentById(payload)

            set({
                lastResponse: res,
                loadingDelete: false,
            })

            await get().refreshLoadedLists(payload?.access_token)

            return res
        } catch (error) {
            set({ loadingDelete: false, error })
            throw error
        }
    },

    // ====== HIDE ======
    hiddenMoment: async (payload) => {
        try {
            set({ loadingHide: true, error: null })

            const res = await MomentService.hiddenMoment(payload)

            set({
                lastResponse: res,
                loadingHide: false,
            })

            await get().refreshLoadedLists(payload?.access_token)

            return res
        } catch (error) {
            set({ loadingHide: false, error })
            throw error
        }
    },

    // ====== APPROVE ======
    approveMoment: async (payload) => {
        try {
            set({ loadingApprove: true, error: null })

            const res = await MomentService.approveMoment(payload)

            set({
                lastResponse: res,
                loadingApprove: false,
            })

            await get().refreshLoadedLists(payload?.access_token)

            return res
        } catch (error) {
            set({ loadingApprove: false, error })
            throw error
        }
    },
    activeMoment: async (payload) => {

        try {

            set({
                loadingActive: true,
                error: null
            })


            const res = await MomentService.activeMoment(payload)





            set({

                lastResponse: res,

                loadingActive: false,

            })

            await get().refreshLoadedLists(payload?.access_token)
            return res


        } catch (error) {

            set({
                loadingActive: false,
                error
            })

            throw error
        }

    },

}))

export default useMomentStore