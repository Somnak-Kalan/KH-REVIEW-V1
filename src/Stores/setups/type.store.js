// src/Stores/setups/type.store.js
import { create } from 'zustand'
import TypeServices from '../../services/setup/Type'

export const useTypeStore = create((set, get) => ({
    // ====== STATE ======
    types: [],
    type: null,

    // keep last filters (for cache + auto refetch)
    search: '',
    typeFilter: '',

    loading: false,
    error: null,

    typeFetchedAt: 0,
    typeDetailFetchedAt: 0,
    typeById: {}, // { [id]: detail }
    typeByIdInflight: {}, // { [id]:true}
    // ====== HELPERS ======
    setSearch: (search = '') => set({ search }),
    setTypeFilter: (typeFilter = '') => set({ typeFilter }),
    clearError: () => set({ error: null }),
    resetTypeState: () =>
        set({
            types: [],
            type: null,
            search: '',
            typeFilter: '',
            loading: false,
            error: null,
            typeFetchedAt: 0,
            typeDetailFetchedAt: 0,
        }),

    // ====== LIST (cache like company.store) ======
    fetchType: async ({
        access_token,
        search = '',
        type = '',
        force = false,
    } = {}) => {
        const state = get()
        const effectiveSearch = search ?? ''
        const effectiveType = type ?? ''
        const cacheKey = `${effectiveType}|${effectiveSearch}`

        const cached = state.typesByKey?.[cacheKey]
        if (!force && Array.isArray(cached) && cached.length > 0) {
            return { data: cached, fromCache: true }
        }

        const inFlightMap = state.typeListInflight || {}
        if (!force && inFlightMap[cacheKey]) {
            return { data: state.typesByKey?.[cacheKey] || [], inFlight: true }
        }

        try {
            set({
                loading: true,
                error: null,
                search: effectiveSearch,
                typeFilter: effectiveType,
                typeListInflight: {
                    ...inFlightMap,
                    [cacheKey]: true,
                },
            })

            const res = await TypeServices.fetchType({
                access_token,
                doc: { search: effectiveSearch, type: effectiveType },
            })

            const list =
                res?.data || res?.docs || res?.result || res?.types || res || []

            const normalizedList = Array.isArray(list) ? list : []

            set((state) => ({
                types: normalizedList,
                typesByKey: {
                    ...state.typesByKey,
                    [cacheKey]: normalizedList,
                },
                typeFetchedAt: Date.now(),
                loading: false,
            }))

            return { data: normalizedList, raw: res }
        } catch (error) {
            set({ loading: false, error })
            throw error
        } finally {
            const current = get().typeListInflight || {}
            const { [cacheKey]: _, ...rest } = current
            set({ typeListInflight: rest })
        }
    },

    // ====== GET BY ID ======
    fetchTypeById: async ({ access_token, _id, force = false } = {}) => {
        const state = get()
        if (!_id) return null

        // 1) Cache hit by id
        const cached = state.typeById?.[_id]
        if (!force && cached) {
            if (state.type?._id !== _id) {
                set({ type: cached, typeDetailFetchedAt: Date.now() })
            }
            return { data: cached, fromCache: true }
        }

        // 2) Original cache logic for single detail
        if (!force && state.type?._id === _id) {
            return { data: state.type, fromCache: true }
        }

        // 3) Dedupe same ID request (avoid duplicate API calls)
        const inFlightMap = state.typeByIdInflight || {}
        if (inFlightMap[_id]) return null

        try {
            set({
                loading: true,
                error: null,
                typeByIdInflight: { ...inFlightMap, [_id]: true },
            })

            const res = await TypeServices.fetchTypeById({
                access_token,
                doc: { _id },
            })
            const detail = res

            const nextCache = get().typeById || {}
            set({
                type: detail,
                typeById: { ...nextCache, [_id]: detail },
                typeDetailFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        } finally {
            const current = get().typeByIdInflight || {}
            const { [_id]: _, ...rest } = current
            set({ typeByIdInflight: rest })
        }
    },

    // ====== CREATE (auto refetch like company.store) ======
    createType: async (payload) => {
        try {
            set({ error: null })
            const res = await TypeServices.createType(payload)

            if (res) {
                const search = get().search || ''
                const type = get().typeFilter || ''
                await get().fetchType({
                    access_token: payload.access_token,
                    search,
                    type,
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
    updateType: async (payload) => {
        try {
            set({ error: null })
            const res = await TypeServices.updateType(payload)
            if (res) {
                const search = get().search || ''
                const type = get().typeFilter || ''
                await get().fetchType({
                    access_token: payload.access_token,
                    search,
                    type,
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
    removeType: async (payload) => {
        try {
            set({ error: null })
            const res = await TypeServices.removeType(payload)

            if (res) {
                const search = get().search || ''
                const type = get().typeFilter || ''
                await get().fetchType({
                    access_token: payload.access_token,
                    search,
                    type,
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

export default useTypeStore
