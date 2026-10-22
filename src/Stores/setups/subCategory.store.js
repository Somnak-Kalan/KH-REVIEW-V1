// src/Stores/setups/subCategory.store.js
import { create } from 'zustand'
import SubCategoryServices from '../../services/setup/SubCategory'

export const useSubCategoryStore = create((set, get) => ({
    // ====== STATE ======
    subCategories: [],
    subCategory: null,

    // keep last search (for cache + auto refetch)
    search: '',

    loadingList: false,
    error: null,

    subCategoryFetchedAt: 0,
    subCategoryDetailFetchedAt: 0,
    subCategoryById: {}, // { [id]: detail }
    subCategoryByIdInFlight: {}, // { [id]: true }
    // ====== HELPERS ======
    setSearch: (search = '') => set({ search }),
    clearError: () => set({ error: null }),
    resetSubCategoryState: () =>
        set({
            subCategories: [],
            subCategory: null,
            search: '',
            loadingList: false,
            error: null,
            subCategoryFetchedAt: 0,
            subCategoryDetailFetchedAt: 0,
        }),

    // ====== LIST (cache like company.store) ======
    fetchSubCategory: async ({ access_token, doc = {}, search, force = false } = {}) => {
        const state = get()

        const effectiveSearch = search ?? doc?.search ?? state.search ?? ''

        // cache (only when same search)
        if (
            !force &&
            state.search === effectiveSearch &&
            Array.isArray(state.subCategories) &&
            state.subCategories.length > 0
        ) {
            return { data: state.subCategories, fromCache: true }
        }

        try {
            set({ loadingList: true, error: null, search: effectiveSearch })

            const res = await SubCategoryServices.fetchSubCategory({
                access_token,
                doc: { search: effectiveSearch },
            })

            const list =
                res?.data ||
                res?.docs ||
                res?.result ||
                res?.subCategories ||
                res?.subCategory ||
                res ||
                []

            set({
                subCategories: Array.isArray(list) ? list : [],
                subCategoryFetchedAt: Date.now(),
                loadingList: false,
            })

            return res
        } catch (error) {
            set({ loadingList: false, error })
            throw error
        }
    },


    // ====== GET BY ID ======
    fetchSubCategoryById: async ({ access_token, _id, force = false } = {}) => {
        const state = get()
        if (!_id) return null

        //  1) cache hit by id
        const cached = state.subCategoryById?.[_id]
        if (!force && cached) {
            // keep your old single detail state updated
            if (state.subCategory?._id !== _id) {
                set({
                    subCategory: cached,
                    subCategoryDetailFetchedAt: Date.now(),
                })
            }
            return { data: cached, fromCache: true }
        }

        //  2) your original single-cache
        if (!force && state.subCategory?._id === _id) {
            return { data: state.subCategory, fromCache: true }
        }

        //  3) dedupe same id request
        const inflightMap = state.subCategoryByIdInFlight || {}
        if (inflightMap[_id]) return null

        try {
            set({
                loadingList: true,
                error: null,
                subCategoryByIdInFlight: { ...inflightMap, [_id]: true },
            })

            const res = await SubCategoryServices.fetchSubCategoryById({
                access_token,
                doc: { _id },
            })

            const detail =
                res?.data ||
                res?.doc ||
                res?.result ||
                res?.subCategory ||
                res?.subcategory ||
                res ||
                null

            const nextCache = get().subCategoryById || {}
            set({
                subCategory: detail,
                subCategoryById: { ...nextCache, [_id]: detail },
                subCategoryDetailFetchedAt: Date.now(),
                loadingList: false,
            })

            return res
        } catch (error) {
            set({ loadingList: false, error })
            throw error
        } finally {
            const current = get().subCategoryByIdInFlight || {}
            const { [_id]: _, ...rest } = current
            set({ subCategoryByIdInFlight: rest })
        }
    },

    // ====== CREATE (auto refetch like company.store) ======
    createSubCategory: async (payload) => {
        try {
            set({ error: null })
            const res = await SubCategoryServices.createSubCategory(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchSubCategory({
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
    updateSubCategory: async (payload) => {
        try {
            set({ error: null })
            const res = await SubCategoryServices.updateSubCategory(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchSubCategory({
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
    removeSubCategory: async (payload) => {
        try {
            set({ error: null })
            const res = await SubCategoryServices.removeSubCategory(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchSubCategory({
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

export default useSubCategoryStore
