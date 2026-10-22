// src/Stores/ManageProperty/ReviewImport/ImportReview.store.js
import { create } from 'zustand'
import Swal from 'sweetalert2'
import ReviewImportNonBusinessServices from '../../../services/ManageProperty/PlaceListing/ReviewImport'

const showSuccess = (title) => {
    Swal.fire({
        icon: 'success',
        title,
        timer: 1200,
        showConfirmButton: false,
    })
}

const showError = (error, fallback = 'Something went wrong') => {
    const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback

    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
    })
}

//  IMPORTANT: declare variable first, then export named + default
const useImportReviewStore = create((set, get) => ({
    data: [],
    detail: null,

    pagination: {
        currentPage: 1,
        pageSize: 10,
        totalRecords: 0,
    },

    loading: false,
    saving: false,
    deleting: false,
    error: null,

    // cache / dedupe
    lastKey: '',
    inFlight: false,
    lastFetchedAt: 0,

    // LIST (with cache)
    fetchReviewImportList: async (access_token, doc = {}, opts = {}) => {
        if (!access_token) return null

        const key = JSON.stringify(doc || {})
        const { force = false } = opts

        //  if same filters and already have data -> don't refetch
        if (!force && get().lastKey === key && (get().data?.length || 0) > 0) {
            //  return same response-shape your component expects
            return {
                data: {
                    places: get().data,
                    pagination: get().pagination,
                },
                cached: true,
            }
        }

        // block duplicate call while in flight
        if (get().inFlight) return null

        set({ loading: true, error: null, inFlight: true })

        try {
            const res = await ReviewImportNonBusinessServices.fetchReviewImportNonBusiness({
                access_token,
                doc,
            })

            const list =
                res?.data?.places ||
                res?.data?.locations ||
                res?.data ||
                res?.records ||
                res

            const normalizedList = Array.isArray(list) ? list : []
            const pg = res?.data?.pagination || res?.pagination || null

            set({
                data: normalizedList,
                pagination: {
                    currentPage: pg?.currentPage || doc?.page || 1,
                    pageSize: pg?.pageSize || doc?.limit || 10,
                    totalRecords: pg?.totalRecords || normalizedList.length,
                },
                loading: false,
                lastKey: key,
                lastFetchedAt: Date.now(),
                inFlight: false,
            })

            return res
        } catch (e) {
            set({
                error: e,
                loading: false,
                inFlight: false,
                lastKey: '', // allow retry
            })
            showError(e, 'Failed to load review import list')
            return null
        }
    },

    // GET DETAIL (by id)
    fetchReviewImportById: async (access_token, doc = {}) => {
        if (!access_token) return null

        set({ loading: true, error: null })
        try {
            const res = await ReviewImportNonBusinessServices.fetchReviewImportNonBusinessById({
                access_token,
                doc,
            })

            set({
                detail: res?.data || res,
                loading: false,
            })

            return res
        } catch (e) {
            set({
                error: e,
                loading: false,
            })
            showError(e, 'Failed to load place detail')
            return null
        }
    },

    // UPDATE / SAVE
    updateImportReview: async (access_token, doc = {}) => {
        if (!access_token) return null

        set({ saving: true, error: null })
        try {
            const res = await ReviewImportNonBusinessServices.updateImportReviewNonBusiness({
                access_token,
                doc,
            })

            set({ saving: false })
            showSuccess('Saved successfully')
            return res
        } catch (e) {
            set({ error: e, saving: false })
            showError(e, 'Failed to save')
            return null
        }
    },

    // helpers
    clearCache: () =>
        set({
            lastKey: '',
            lastFetchedAt: 0,
        }),
    clearData: () =>
        set({
            data: [],
            pagination: { currentPage: 1, pageSize: 10, totalRecords: 0 },
        }),
    clearDetail: () => set({ detail: null }),
    clearError: () => set({ error: null }),
}))

export { useImportReviewStore }
export default useImportReviewStore