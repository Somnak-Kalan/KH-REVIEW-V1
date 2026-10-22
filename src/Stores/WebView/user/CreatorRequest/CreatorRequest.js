import { create } from 'zustand'
import CreatorRequestServices from '../../../../services/webview/user/CreatorRequest/CreatorRequest'

export const useCreatorRequestStore = create((set, get) => ({
    // ====== STATE ======
    creatorRequests: [],
    creatorRequest: null,

    loading: false,
    submitting: false,
    error: null,

    creatorRequestFetchedAt: 0,
    creatorRequestDetailFetchedAt: 0,

    creatorRequestById: {},
    creatorRequestByIdInFlight: {},

    // ====== HELPERS ======
    clearError: () => set({ error: null }),

    resetCreatorRequestState: () =>
        set({
            creatorRequests: [],
            creatorRequest: null,
            loading: false,
            submitting: false,
            error: null,
            creatorRequestFetchedAt: 0,
            creatorRequestDetailFetchedAt: 0,
            creatorRequestById: {},
            creatorRequestByIdInFlight: {},
        }),

    // ====== LIST ======
    fetchCreatorRequest: async ({ access_token, userId, force = false } = {}) => {
        const state = get()

        if (
            !force &&
            Array.isArray(state.creatorRequests) &&
            state.creatorRequests.length > 0
        ) {
            return { data: state.creatorRequests, fromCache: true }
        }

        try {
            set({ loading: true, error: null })

            const res = await CreatorRequestServices.fetchCreatorRequest({
                access_token,
                userId,
            })

            const list =
                res?.data || res?.docs || res?.result || res?.creatorRequests || res || []

            set({
                creatorRequests: Array.isArray(list) ? list : [],
                creatorRequestFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== GET BY ID ======
    fetchCreatorRequestById: async ({
        access_token,
        userId,
        _id,
        force = false,
    } = {}) => {
        const state = get()
        if (!_id) return null

        const cached = state.creatorRequestById?.[_id]
        if (!force && cached) {
            if (state.creatorRequest?._id !== _id) {
                set({
                    creatorRequest: cached,
                    creatorRequestDetailFetchedAt: Date.now(),
                })
            }
            return { data: cached, fromCache: true }
        }

        if (!force && state.creatorRequest?._id === _id) {
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
                userId,
                doc: { _id },
            })

            const detail =
                res?.data ||
                res?.doc ||
                res?.result ||
                res?.creatorRequest ||
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
            const { [_id]: _, ...rest } = current
            set({ creatorRequestByIdInFlight: rest })
        }
    },

    // ====== CREATE ======
    createCreatorRequest: async (payload) => {
        try {
            set({ submitting: true, error: null })

            const res = await CreatorRequestServices.createCreatorRequest(payload)

            set({
                submitting: false,
            })

            return res
        } catch (error) {
            set({
                submitting: false,
                error,
            })
            throw error
        }
    },
}))

export default useCreatorRequestStore