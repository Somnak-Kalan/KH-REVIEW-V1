import { create } from 'zustand'
import Swal from 'sweetalert2'
import TaskPropertyServices from '../../../services/ManageProperty/PlaceListing/Task'

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

export const useTaskCommentStore = create((set, get) => ({
    data: [],
    pagination: {
        currentPage: 1,
        pageSize: 10,
        totalRecords: 0,
    },

    loading: false,
    saving: false,
    deleting: false,
    error: null,

    //  cache / dedupe across route switch
    lastKey: '', // last request key (filters)
    inFlight: false, // prevent double-call
    lastFetchedAt: 0, // optional

    //  LIST (with cache)
    fetchCommentList: async (access_token, doc = {}, opts = {}) => {
        if (!access_token) return null

        const key = JSON.stringify(doc || {})
        const { force = false } = opts

        //  if same filters and already have data -> don't refetch
        if (!force && get().lastKey === key && (get().data?.length || 0) > 0) {
            return { data: get().data, pagination: get().pagination, cached: true }
        }

        //  block duplicate call while in flight
        if (get().inFlight) return null

        set({ loading: true, error: null, inFlight: true })

        try {
            const res = await TaskPropertyServices.GetCommentProperty({
                access_token,
                doc,
            })

            const list = Array.isArray(res?.data) ? res.data : []
            const pg = res?.pagination || null

            set({
                data: list,
                pagination: {
                    currentPage: pg?.currentPage || doc?.page || 1,
                    pageSize: pg?.pageSize || doc?.limit || 10,
                    totalRecords: pg?.totalRecords || list.length,
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
            showError(e, 'Failed to load tasks')
            return null
        }
    },

    // optional helpers
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
    clearError: () => set({ error: null }),
}))