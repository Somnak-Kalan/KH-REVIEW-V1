import { create } from 'zustand'
import Swal from 'sweetalert2'
import PlaceServices from '../../services/ManageProperty/PlaceListing/AllProperty'

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

//  helper: accepts [] OR {data:[]} OR {data:{data:[]}} OR {data:{places:[]}} etc.
const normalizeList = (v) => {
    if (Array.isArray(v)) return v
    if (Array.isArray(v?.data)) return v.data
    if (Array.isArray(v?.data?.data)) return v.data.data
    if (Array.isArray(v?.data?.locations)) return v.data.locations
    if (Array.isArray(v?.places)) return v.places
    return []
}

//  helper for reviews response: { success, pagination, data: [] }
const normalizeReviewsList = (res) => {
    if (Array.isArray(res)) return res
    if (Array.isArray(res?.data)) return res.data
    return []
}

export const usePlacesStore = create((set, get) => ({
    placesList: [],
    placeDetail: null,
    pagination: null,

    //  reviews state
    reviewsList: [],
    reviewsPagination: null,
    reviewsLoading: false,

    loading: false,
    saving: false,
    deleting: false,
    error: null,

    //  LIST
    fetchPlaces: async (access_token, filters = {}) => {
        if (!access_token) return null
        set({ loading: true, error: null })
        try {
            const res = await PlaceServices.fetchAllProperty({ access_token, filters })

            const list = normalizeList(res)
            const pagination =
                res?.data?.pagination || res?.pagination || res?.data?.meta || res?.meta || null

            set({ placesList: list, pagination, loading: false })
            return list
        } catch (e) {
            set({ error: e, loading: false })
            return null
        }
    },

    //  DETAIL
    fetchPlaceById: async (access_token, doc) => {
        if (!access_token || !doc) return null
        set({ loading: true, error: null })
        try {
            const res = await PlaceServices.fetchNonBusinessPropertyById({ access_token, doc })
            const detail = Array.isArray(res?.data) ? res.data[0] : res?.data ?? res

            set({ placeDetail: detail || null, loading: false })
            return detail
        } catch (e) {
            set({ error: e, loading: false })
            return null
        }
    },

    createPlace: async (access_token, formData) => {
        if (!access_token || !formData) return null
        set({ saving: true, error: null })
        try {
            const res = await PlaceServices.createNonBusinessProperty({
                access_token,
                doc: formData,
            })
            showSuccess('Place created')
            return res
        } catch (e) {
            set({ error: e })
            showError(e, 'Failed to create place')
            return null
        } finally {
            set({ saving: false })
        }
    },

    updatePlace: async (access_token, formData) => {
        if (!access_token || !formData) return null
        set({ saving: true, error: null })
        try {
            const res = await PlaceServices.updateNonBusinessProperty({
                access_token,
                doc: formData,
            })
            showSuccess('Place updated')
            return res
        } catch (e) {
            set({ error: e })
            showError(e, 'Failed to update place')
            return null
        } finally {
            set({ saving: false })
        }
    },

    updatePlaceInformation: async (access_token, doc) => {
        if (!access_token || !doc?._id) return null
        set({ saving: true, error: null })
        try {
            const res = await PlaceServices.updatePropertyInformation({ access_token, doc })
            showSuccess('Information updated')
            return res
        } catch (e) {
            set({ error: e })
            showError(e, 'Failed to update information')
            return null
        } finally {
            set({ saving: false })
        }
    },

    updatePlaceAddress: async (access_token, doc) => {
        if (!access_token || !doc?._id) return null
        set({ saving: true, error: null })
        try {
            const res = await PlaceServices.updatePropertyAddress({ access_token, doc })
            showSuccess('Address updated')
            return res
        } catch (e) {
            set({ error: e })
            showError(e, 'Failed to update address')
            return null
        } finally {
            set({ saving: false })
        }
    },

    updatePlaceThumbnail: async (access_token, _id, formData) => {
        if (!access_token || !_id || !formData) return null
        set({ saving: true, error: null })
        try {
            const res = await PlaceServices.updatePropertyThumbnail({
                access_token,
                _id,
                doc: formData,
            })
            showSuccess('Image updated')
            return res
        } catch (e) {
            set({ error: e })
            return null
        } finally {
            set({ saving: false })
        }
    },

    updatePlaceVideo: async (access_token, _id, formData) => {
        if (!access_token || !_id || !formData) return null
        set({ saving: true, error: null })
        try {
            const res = await PlaceServices.updatePropertyVideo({
                access_token,
                _id,
                doc: formData,
            })
            showSuccess('Video updated')
            return res
        } catch (e) {
            set({ error: e })
            return null
        } finally {
            set({ saving: false })
        }
    },

    /**
     *  fetch reviews by place code (BMC0001)
     * response: { success, pagination, data: [] }
     */
    fetchPlaceReviews: async (access_token, code, params = { page: 1, limit: 10 }) => {
        if (!access_token || !code) return null

        set({ reviewsLoading: true, error: null })
        try {
            const res = await PlaceServices.fetchPlaceReviewList({
                access_token,
                code,
                params,
            })


            const list = normalizeReviewsList(res)
            const pagination = res?.pagination || res?.data?.pagination || null

            set({
                reviewsList: list,
                reviewsPagination: pagination,
                reviewsLoading: false,
            })

            return list
        } catch (e) {
            set({ error: e, reviewsLoading: false })
            return null
        }
    },

    clearPlaceDetail: () => set({ placeDetail: null }),
    clearError: () => set({ error: null }),

    clearReviews: () => set({ reviewsList: [], reviewsPagination: null }),
}))
//  ALIAS export (your ReviewTabs imports this)
export const useAllPropertyStore = usePlacesStore
