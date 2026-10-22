// src/Stores/setups/amenity.store.js
import { create } from 'zustand'
import AmenityServices from '../../services/setup/Amenity'

export const useAmenityStore = create((set, get) => ({
    // ====== STATE ======
    amenities: [],
    amenity: null,

    // keep last search (for cache + auto refetch)
    search: '',

    loading: false,
    error: null,

    amenityFetchedAt: 0,
    amenityDetailFetchedAt: 0,

    // ADD: cache by id and dedupe requests
    amenityById: {}, // { [id]: amenity }
    amenityByIdInFlight: {}, // { [id]: true }
    // ====== HELPERS ======
    setSearch: (search = '') => set({ search }),
    clearError: () => set({ error: null }),
    resetAmenityState: () =>
        set({
            amenities: [],
            amenity: null,
            search: '',
            loading: false,
            error: null,
            amenityFetchedAt: 0,
            amenityDetailFetchedAt: 0,
        }),

    // ====== LIST (cache like company.store) ======
    fetchAmenity: async ({ access_token, search = '', force = false } = {}) => {
        const state = get()
        const effectiveSearch = search ?? state.search ?? ''

        // cache (only when same search)
        if (
            !force &&
            state.search === effectiveSearch &&
            Array.isArray(state.amenities) &&
            state.amenities.length > 0
        ) {
            return { data: state.amenities, fromCache: true }
        }

        try {
            set({ loading: true, error: null, search: effectiveSearch })

            // services expect { access_token, doc: { search } }
            const res = await AmenityServices.fetchAmenity({
                access_token,
                doc: { search: effectiveSearch },
            })

            const list =
                res?.data ||
                res?.docs ||
                res?.result ||
                res?.amenities ||
                res?.amenity ||
                res ||
                []

            set({
                amenities: Array.isArray(list) ? list : [],
                amenityFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== GET BY ID (use cache and dedupe) ======
    fetchAmenityById: async ({ access_token, _id, force = false } = {}) => {
        const state = get()
        if (!_id) return null

        // 1) Cache hit by id
        const cached = state.amenityById?.[_id]
        if (!force && cached) {
            if (state.amenity?._id !== _id) {
                set({ amenity: cached, amenityDetailFetchedAt: Date.now() })
            }
            return { data: cached, fromCache: true }
        }

        // 2) Prevent duplicate requests (deduplication)
        const inFlightMap = state.amenityByIdInFlight || {}
        if (inFlightMap[_id]) return null

        try {
            set({
                loading: true,
                error: null,
                amenityByIdInFlight: { ...inFlightMap, [_id]: true },
            })

            const res = await AmenityServices.fetchAmenityById({
                access_token,
                doc: { _id },
            })

            const detail =
                res?.data ||
                res?.doc ||
                res?.result ||
                res?.amenity ||
                res ||
                null

            const nextCache = get().amenityById || {}
            set({
                amenity: detail,
                amenityById: { ...nextCache, [_id]: detail },
                amenityDetailFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        } finally {
            const current = get().amenityByIdInFlight || {}
            const { [_id]: _, ...rest } = current
            set({ amenityByIdInFlight: rest })
        }
    },


    // ====== CREATE (auto refetch like company.store) ======
    createAmenity: async (payload) => {
        try {
            set({ error: null })
            const res = await AmenityServices.createAmenity(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchAmenity({
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
    updateAmenity: async (payload) => {
        try {
            set({ error: null })
            const res = await AmenityServices.updateAmenity(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchAmenity({
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
    removeAmenity: async (payload) => {
        try {
            set({ error: null })
            const res = await AmenityServices.removeAmenity(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchAmenity({
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

export default useAmenityStore
