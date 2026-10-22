import { create } from 'zustand'
import Swal from 'sweetalert2'
import ProvinceServices from '../../services/setup/Province'

//  SAME STYLE AS YOUR BANNER ALERT
const showSuccess = ({ title = 'Success!', text = '', onClose }) => {
    Swal.fire({
        icon: 'success',
        title,
        text,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        willClose: () => {
            if (typeof onClose === 'function') onClose()
        },
    })
}

const showErrorAlert = (err, title = 'Failed', fallback = 'Something went wrong!') => {
    Swal.fire({
        icon: 'error',
        title,
        text: err?.response?.data?.message || err?.message || fallback,
    })
}

export const useProvinceStore = create((set, get) => ({
    provinces: [],
    provinceDetail: null,

    loading: false,
    saving: false,
    error: null,

    _lastSearch: '',

    //  ADD: detail cache + dedupe
    _provinceDetailById: {},       // { [id]: detail }
    _provinceDetailInFlight: {},   // { [id]: true }

    //  "FETCH ONCE" (CACHE)
    fetchProvincesOnce: async (access_token) => {
        const cached = get().provinces
        if (Array.isArray(cached) && cached.length > 0) return cached

        return await get().fetchProvinces(access_token, '')
    },

    //  LIST (same concept: fetch by search and store)
    fetchProvinces: async (access_token, search = '') => {
        // if (!access_token) return null
        set({ loading: true, error: null, _lastSearch: search })

        try {
            const res = await ProvinceServices.fetchProvince({
                access_token,
                doc: { search },
            })

            const list =
                (Array.isArray(res?.data) && res.data) ||
                (Array.isArray(res?.data?.data) && res.data.data) ||
                (Array.isArray(res) && res) ||
                []

            set({ provinces: list, loading: false })
            return list
        } catch (err) {
            set({ error: err, loading: false })
            // showErrorAlert(err, 'Load Failed', 'Failed to load provinces')
            return null
        }
    },

    //  always request API (optional helper)
    forceRefreshProvinces: async (access_token, search = '') => {
        return await get().fetchProvinces(access_token, search)
    },

    //  DETAIL
    fetchProvinceById: async (access_token, id) => {
        if (!access_token || !id) return null

        //  cache hit by id -> NO API
        const cached = get()._provinceDetailById?.[id]
        if (cached) {
            // keep old state updated
            if (get().provinceDetail == null || get().provinceDetail?._id !== id) {
                set({ provinceDetail: cached })
            }
            return cached
        }

        //  block duplicate same id
        const inflight = get()._provinceDetailInFlight || {}
        if (inflight[id]) return null

        set({
            loading: true,
            error: null,
            _provinceDetailInFlight: { ...inflight, [id]: true },
        })

        try {
            const res = await ProvinceServices.fetchProvinceById({
                access_token,
                doc: { _id: id },
            })

            const detail = res?.data ?? res

            const cacheMap = get()._provinceDetailById || {}
            set({
                provinceDetail: detail || null,
                loading: false,
                _provinceDetailById: { ...cacheMap, [id]: detail || null },
            })

            return detail
        } catch (err) {
            set({ error: err, loading: false })
            showErrorAlert(err, 'Load Failed', 'Failed to load province detail')
            return null
        } finally {
            const inflight2 = get()._provinceDetailInFlight || {}
            const { [id]: _, ...rest } = inflight2
            set({ _provinceDetailInFlight: rest })
        }
    },

    //  UPDATE (supports JSON or multipart/form-data)
    updateProvince: async (access_token, doc, options = {}) => {
        if (!access_token || !doc) return null
        set({ saving: true, error: null })

        try {
            const res = await ProvinceServices.UpdateProvince({ access_token, doc })
            set({ saving: false })

            //  refresh list after update (same as your code)
            const search = get()._lastSearch || ''
            await get().fetchProvinces(access_token, search)

            //  refresh detail if we have _id
            const id = doc?._id
            if (id) {
                //  if you want force refresh after update, clear cache for that id first
                const cacheMap = get()._provinceDetailById || {}
                const { [id]: __, ...rest } = cacheMap
                set({ _provinceDetailById: rest })

                await get().fetchProvinceById(access_token, id)
            }

            showSuccess({
                title: options?.title || 'Province Updated!',
                text: options?.text || 'Province has been successfully updated.',
                onClose: options?.onClose,
            })

            return res
        } catch (err) {
            set({ error: err, saving: false })
            showErrorAlert(err, 'Update Failed', 'Failed to update province')
            return null
        }
    },

    // helpers
    clearProvinceDetail: () => set({ provinceDetail: null }),
    clearError: () => set({ error: null }),
}))

export default useProvinceStore