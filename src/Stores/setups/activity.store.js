// src/Stores/setups/activity.store.js
import { create } from 'zustand'
import ActivityServices from '../../services/setup/Activity'

export const useActivityStore = create((set, get) => ({
    // ====== STATE ======
    activities: [],
    activity: null,

    // keep last search (for cache + auto refetch)
    search: '',

    loading: false,
    error: null,

    activityFetchedAt: 0,
    activityDetailFetchedAt: 0,

    // ====== HELPERS ======
    setSearch: (search = '') => set({ search }),
    clearError: () => set({ error: null }),
    resetActivityState: () =>
        set({
            activities: [],
            activity: null,
            search: '',
            loading: false,
            error: null,
            activityFetchedAt: 0,
            activityDetailFetchedAt: 0,
        }),

    // ====== LIST (cache like company.store) ======
    fetchActivity: async ({ access_token, search = '', force = false } = {}) => {
        const state = get()
        const effectiveSearch = search ?? state.search ?? ''

        // cache (only when same search)
        if (
            !force &&
            state.search === effectiveSearch &&
            Array.isArray(state.activities) &&
            state.activities.length > 0
        ) {
            return { data: state.activities, fromCache: true }
        }

        try {
            set({ loading: true, error: null, search: effectiveSearch })

            // IMPORTANT: services expect { access_token, doc: { search } }
            const res = await ActivityServices.fetchActivity({
                access_token,
                doc: { search: effectiveSearch },
            })

            // flexible response shape
            const list =
                res?.data ||
                res?.docs ||
                res?.result ||
                res?.activities ||
                res?.activity ||
                res ||
                []

            set({
                activities: Array.isArray(list) ? list : [],
                activityFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== GET BY ID ======
    fetchActivityById: async ({ access_token, _id, force = true } = {}) => {
        const state = get()
        if (!force && state.activity?._id === _id) {
            return { data: state.activity, fromCache: true }
        }

        try {
            set({ loading: true, error: null })

            const res = await ActivityServices.fetchActivityById({
                access_token,
                doc: { _id },
            })

            const detail =
                res?.data || res?.doc || res?.result || res?.activity || res || null

            set({
                activity: detail,
                activityDetailFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== CREATE (auto refetch like company.store) ======
    createActivity: async (payload) => {
        try {
            set({ error: null })
            const res = await ActivityServices.createActivity(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchActivity({
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
    updateActivity: async (payload) => {
        try {
            set({ error: null })
            const res = await ActivityServices.updateActivity(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchActivity({
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
    removeActivity: async (payload) => {
        try {
            set({ error: null })
            const res = await ActivityServices.removeActivity(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchActivity({
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

export default useActivityStore
