import { create } from 'zustand'
import Swal from 'sweetalert2'
import AreaServices from '../../services/setup/Area' //  change path if needed

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

export const useAreasStore = create((set, get) => ({
    areas: [],
    areaDetail: null,
    assignablePlaces: [],

    loading: false,
    saving: false,
    deleting: false,
    error: null,
    _areaDetailById: {},       // { [id]: detail }
    _areaDetailInFlight: {},   // { [id]: true }
    fetchAreas: async (access_token, doc = {}, force = false) => {
        const state = get()

        // If data is already cached and force is not set to true, use cached data
        if (!force && state.areas?.length > 0) {
            return { data: state.areas, fromCache: true }
        }

        if (!access_token) return null
        set({ loading: true, error: null })

        try {
            const res = await AreaServices.fetchAreas({ access_token, doc })

            // Standardize the response (common patterns)
            const list =
                (Array.isArray(res?.data) && res.data) ||
                (Array.isArray(res?.data?.data) && res.data.data) ||
                (Array.isArray(res) && res) ||
                []

            set({ areas: list, loading: false })
            return list
        } catch (e) {
            set({ error: e, loading: false })
            return null
        }
    },

    // DETAIL
    fetchAreaById: async (access_token, id, force = false) => {
        if (!access_token || !id) return null

        // Cache hit by id -> No API call if data is available
        const cached = get()._areaDetailById?.[id]
        if (cached && !force) {
            // Keep the old state updated if the current areaDetail is not already set
            if (get().areaDetail == null || get().areaDetail?._id !== id) {
                set({ areaDetail: cached })
            }
            return cached
        }

        // Block duplicate requests for the same id
        const inflight = get()._areaDetailInFlight || {}
        if (inflight[id]) return null

        set({
            loading: true,
            error: null,
            _areaDetailInFlight: { ...inflight, [id]: true },
        })

        try {
            // API request
            const res = await AreaServices.fetchAreaById({
                access_token,
                doc: { _id: id },
            })

            const detail = res?.data ?? res

            // Cache the result
            const cacheMap = get()._areaDetailById || {}
            set({
                areaDetail: detail || null,
                loading: false,
                _areaDetailById: { ...cacheMap, [id]: detail || null },
            })

            return detail
        } catch (err) {
            set({ error: err, loading: false })
            showError(err, 'Load Failed', 'Failed to load area detail')
            return null
        } finally {
            // Clean up the inflight state
            const inflight2 = get()._areaDetailInFlight || {}
            const { [id]: _, ...rest } = inflight2
            set({ _areaDetailInFlight: rest })
        }
    },

    //  CREATE (multipart/form-data)
    // doc = FormData (recommended)
    createArea: async (access_token, doc) => {

        if (!access_token || !doc) return null
        set({ saving: true, error: null })
        try {
            const res = await AreaServices.createArea({ access_token, doc })
            showSuccess('Area created')
            set({ saving: false })
            // refresh list (optional but useful)
            await get().fetchAreas(access_token)
            return res
        } catch (e) {
            set({ error: e, saving: false })
            showError(e, 'Failed to create area')
            return null
        }
        finally {
            set({ saving: false })
        }
    },

    //  UPDATE (text fields only) JSON
    // doc example: { _id, nameEn, order, status }
    updateAreaTextOnly: async (access_token, doc) => {
        if (!access_token || !doc?._id) return null
        set({ saving: true, error: null })
        try {
            const res = await AreaServices.updateArea({ access_token, doc })
            showSuccess('Area updated')
            set({ saving: false })

            // update local list quickly (optional)
            const areas = get().areas || []
            const next = areas.map((a) =>
                (a?._id || a?.id) === doc._id ? { ...a, ...doc } : a
            )
            set({ areas: next })

            await get().fetchAreas(access_token)
            await get().fetchAreaById(access_token, doc?._id)

            return res
        } catch (e) {
            set({ error: e, saving: false })
            showError(e, 'Failed to update area')
            return null
        }
    },

    //  UPDATE (new cover image) multipart/form-data
    // doc must contain _id and FormData fields (cover, lat, lng, etc.)
    updateAreaCover: async (access_token, doc) => {
        if (!access_token || !doc?._id) return null
        set({ saving: true, error: null })
        try {
            const res = await AreaServices.updateAreaCoverOnly({ access_token, doc })
            showSuccess('Cover updated')
            set({ saving: false })

            // refresh detail/list (optional)
            await get().fetchAreas(access_token)
            await get().fetchAreaById(access_token, doc?._id)

            return res
        } catch (e) {
            set({ error: e, saving: false })
            showError(e, 'Failed to update cover')
            return null
        }
    },

    //  DELETE
    removeArea: async (access_token, id) => {
        if (!access_token || !id) return null
        set({ deleting: true, error: null })
        try {
            const res = await AreaServices.removeArea({
                access_token,
                doc: { _id: id },
            })
            showSuccess('Area deleted')
            set({ deleting: false })
            await get().fetchAreas(access_token)
            return res
        } catch (e) {
            set({ error: e, deleting: false })
            showError(e, 'Failed to delete area')
            return null
        }
    },

    //  GET assignable places
    fetchAssignablePlaces: async (access_token, areaId) => {
        if (!access_token || !areaId) return null
        set({ loading: true, error: null })
        try {
            const res = await AreaServices.getAssignablePlaces({
                access_token,
                doc: { _id: areaId },
            })
            const places = res?.data ?? res
            set({
                assignablePlaces: Array.isArray(places) ? places : [],
                loading: false,
            })
            return places
        } catch (e) {
            set({ error: e, loading: false })
            showError(e, 'Failed to load assignable places')
            return null
        }
    },

    //  ASSIGN places to area (JSON)
    assignPlacesToArea: async (access_token, areaId, placeIds = []) => {
        if (!access_token || !areaId) return null
        set({ saving: true, error: null })
        try {

            const res = await AreaServices.assignPlacesToArea({
                access_token,
                doc: { _id: areaId, placeIds },
            })

            const doc = areaId
            await get().fetchAreaById(access_token, doc)

            showSuccess('Places assigned')
            set({ saving: false })
            return res
        } catch (e) {
            set({ error: e, saving: false })
            showError(e, 'Failed to assign places')
            return null
        }
    },

    //  REMOVE places from area (JSON)
    removePlacesFromArea: async (access_token, areaId, placeIds = []) => {
        if (!access_token || !areaId) return null
        set({ saving: true, error: null })
        try {
            const res = await AreaServices.removePlacesFromArea({
                access_token,
                doc: { _id: areaId, placeIds },
            })
            const doc = areaId
            await get().fetchAreaById(access_token, doc)
            showSuccess('Places removed')
            set({ saving: false })
            return res
        } catch (e) {
            set({ error: e, saving: false })
            showError(e, 'Failed to remove places')
            return null
        }
    },

    // optional helpers
    clearAreaDetail: () => set({ areaDetail: null }),
    clearAssignablePlaces: () => set({ assignablePlaces: [] }),
    clearError: () => set({ error: null }),
}))
