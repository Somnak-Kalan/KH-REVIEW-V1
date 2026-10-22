// src/Stores/setups/privacy.store.js
import { create } from 'zustand'
import PrivacyServices from '../../services/setup/Privacy'

export const usePrivacyStore = create((set, get) => ({
    // ====== STATE ======
    privacies: [],
    privacy: null,

    // keep last search (for cache + auto refetch)
    search: '',

    loading: false,
    error: null,

    privacyFetchedAt: 0,
    privacyDetailFetchedAt: 0,
    //  Caching logic for privacy by id
    privacyById: {}, // { [id]: privacy }
    privacyByIdInFlight: {}, // { [id]: true }

    // ====== HELPERS ======
    setSearch: (search = '') => set({ search }),
    clearError: () => set({ error: null }),
    resetPrivacyState: () =>
        set({
            privacies: [],
            privacy: null,
            search: '',
            loading: false,
            error: null,
            privacyFetchedAt: 0,
            privacyDetailFetchedAt: 0,
        }),

    // ====== LIST (cache like company.store) ======
    fetchPrivacy: async ({ access_token, doc = {}, search, force = false } = {}) => {
        const state = get()

        const effectiveSearch = search ?? doc?.search ?? state.search ?? ''

        // cache
        if (
            !force &&
            state.search === effectiveSearch &&
            Array.isArray(state.privacies) &&
            state.privacies.length > 0
        ) {
            return { data: state.privacies, fromCache: true }
        }

        try {
            set({ loading: true, error: null, search: effectiveSearch })

            const res = await PrivacyServices.fetchPrivacy({
                access_token,
                doc: { search: effectiveSearch },
            })

            const list =
                res?.data ||
                res?.docs ||
                res?.result ||
                res?.privacies ||
                res?.privacy ||
                res ||
                []

            set({
                privacies: Array.isArray(list) ? list : [],
                privacyFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },


    // ====== GET BY ID (use cache and dedupe) ======
    fetchPrivacyById: async ({ access_token, _id, force = false } = {}) => {
        const state = get()
        if (!_id) return null

        // 1) Check cache before making API request
        const cached = state.privacyById?.[_id]
        if (!force && cached) {
            if (state.privacy?._id !== _id) {
                set({ privacy: cached, privacyDetailFetchedAt: Date.now() })
            }
            return { data: cached, fromCache: true }
        }

        // 2) Prevent duplicate requests for the same ID (deduplication)
        const inFlightMap = state.privacyByIdInFlight || {}
        if (inFlightMap[_id]) return null

        try {
            set({
                loading: true,
                error: null,
                privacyByIdInFlight: { ...inFlightMap, [_id]: true },
            })

            const res = await PrivacyServices.fetchPrivacyById({
                access_token,
                doc: { _id },
            })

            const detail =
                res?.data ||
                res?.doc ||
                res?.result ||
                res?.privacy ||
                res ||
                null

            const nextCache = get().privacyById || {}
            set({
                privacy: detail,
                privacyById: { ...nextCache, [_id]: detail },
                privacyDetailFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        } finally {
            const current = get().privacyByIdInFlight || {}
            const { [_id]: _, ...rest } = current
            set({ privacyByIdInFlight: rest })
        }
    },
    // ====== CREATE (auto refetch like company.store) ======
    createPrivacy: async (payload) => {
        try {
            set({ error: null })
            const res = await PrivacyServices.createPrivacy(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchPrivacy({
                    access_token: payload.access_token,
                    search,
                    force: true,
                })
            }

            return res
        } catch (error) {
            set({ error })
            throw error
        }
    },

    // ====== UPDATE (auto refetch like company.store) ======
    updatePrivacy: async (payload) => {
        try {
            set({ error: null })
            const res = await PrivacyServices.updatePrivacy(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchPrivacy({
                    access_token: payload.access_token,
                    search,
                    force: true,
                })
            }

            return res
        } catch (error) {
            set({ error })
            throw error
        }
    },

    // ====== REMOVE (auto refetch like company.store) ======
    removePrivacy: async (payload) => {
        try {
            set({ error: null })
            const res = await PrivacyServices.removePrivacy(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchPrivacy({
                    access_token: payload.access_token,
                    search,
                    force: true,
                })
            }

            return res
        } catch (error) {
            set({ error })
            throw error
        }
    },
}))

export default usePrivacyStore
