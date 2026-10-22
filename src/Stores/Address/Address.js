import { create } from 'zustand'
import Swal from 'sweetalert2'
import SettingOtherAddressOptServices from '../../services/options/settings/other/address/Address'
import AddressProvinceOptOnly from '../../services/options/Address'
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

//  convert API data -> AntD Select options [{label,value}]
const mapToOptions = (arr = []) =>
    (Array.isArray(arr) ? arr : []).map((x) => ({
        label:
            x?.label ||
            x?.districtEn + '-' + x?.districtKh ||
            x?.name ||
            x?.title ||
            '---',
        value: x?.value || x?.provinceId || x?.districtId,
        raw: x, // keep original object if you need later
    }))

//  module-level in-flight promises (survive route changes / StrictMode)
let PROVINCE_INFLIGHT = null
const DISTRICT_INFLIGHT = new Map() // key: provinceId -> Promise
const COMMUNE_INFLIGHT = new Map() // key: districtId -> Promise

export const useAddressOptStore = create((set, get) => ({
    provinces: [],
    districts: [],
    communes: [],
    provincesOnly: [],
    loadingProvinces: false,
    loadingDistricts: false,
    loadingCommunes: false,

    error: null,

    //  Province options
    fetchProvinceOpts: async (access_token) => {
        if (!access_token) return null
        //  1) cache: if already loaded, don't call API again
        const cached = get().provinces
        if (Array.isArray(cached) && cached.length > 0) return cached

        //  2) in-flight: if already requesting, await same promise
        if (PROVINCE_INFLIGHT) return await PROVINCE_INFLIGHT

        set({ loadingProvinces: true, error: null })

        PROVINCE_INFLIGHT = (async () => {
            try {
                const data = await SettingOtherAddressOptServices.getProvinceOpt({
                    access_token,
                })

                set({
                    provinces: data || [],
                    loadingProvinces: false,
                })

                return data
            } catch (e) {
                set({ error: e, loadingProvinces: false })
                showError(e, 'Failed to load provinces')
                return null
            } finally {
                PROVINCE_INFLIGHT = null
            }
        })()

        return await PROVINCE_INFLIGHT
    },
    fetchProvinceOptsOnly: async (access_token) => {
        if (!access_token) return null
        //  1) cache: if already loaded, don't call API again
        const cached = get().provinces
        if (Array.isArray(cached) && cached.length > 0) return cached

        //  2) in-flight: if already requesting, await same promise
        if (PROVINCE_INFLIGHT) return await PROVINCE_INFLIGHT

        set({ loadingProvinces: true, error: null })

        PROVINCE_INFLIGHT = (async () => {
            try {
                const data = await AddressProvinceOptOnly.getProvinceOpt({
                    access_token,
                })

                set({
                    provincesOnly: data || [],
                    loadingProvinces: false,
                })

                return data
            } catch (e) {
                set({ error: e, loadingProvinces: false })
                showError(e, 'Failed to load provinces')
                return null
            } finally {
                PROVINCE_INFLIGHT = null
            }
        })()

        return await PROVINCE_INFLIGHT
    },

    //  District options by provinceId
    fetchDistrictOpts: async (access_token, provinceId) => {
        if (!access_token || !provinceId) return null

        //  cache by provinceId (optional but useful)
        // if you want cache per province, keep a map in state instead
        // but without changing concept: just prevent duplicate concurrent calls
        if (DISTRICT_INFLIGHT.has(provinceId)) return await DISTRICT_INFLIGHT.get(provinceId)

        // reset lower level options (your original behavior)
        set({
            loadingDistricts: true,
            error: null,
            districts: [],
            communes: [],
        })

        const p = (async () => {
            try {
                const data = await SettingOtherAddressOptServices.getDistrictOpt({
                    access_token,
                    doc: { id: provinceId },
                })

                set({
                    districts: mapToOptions(data),
                    loadingDistricts: false,
                })

                return data
            } catch (e) {
                set({ error: e, loadingDistricts: false })
                showError(e, 'Failed to load districts')
                return null
            } finally {
                DISTRICT_INFLIGHT.delete(provinceId)
            }
        })()

        DISTRICT_INFLIGHT.set(provinceId, p)
        return await p
    },

    //  Commune options by districtId
    fetchCommuneOpts: async (access_token, districtId) => {
        if (!access_token || !districtId) return null

        if (COMMUNE_INFLIGHT.has(districtId)) return await COMMUNE_INFLIGHT.get(districtId)

        set({
            loadingCommunes: true,
            error: null,
            communes: [],
        })

        const p = (async () => {
            try {
                const data = await SettingOtherAddressOptServices.getCommuneOpt({
                    access_token,
                    doc: { id: districtId },
                })

                set({
                    communes: mapToOptions(data),
                    loadingCommunes: false,
                })

                return data
            } catch (e) {
                set({ error: e, loadingCommunes: false })
                showError(e, 'Failed to load communes')
                return null
            } finally {
                COMMUNE_INFLIGHT.delete(districtId)
            }
        })()

        COMMUNE_INFLIGHT.set(districtId, p)
        return await p
    },

    // helpers
    clearDistricts: () => set({ districts: [], communes: [] }),
    clearCommunes: () => set({ communes: [] }),

    //  when you clear all, also clear inflight (optional but safe)
    clearAll: () => {
        PROVINCE_INFLIGHT = null
        DISTRICT_INFLIGHT.clear()
        COMMUNE_INFLIGHT.clear()
        set({ provinces: [], districts: [], communes: [], error: null })
    },

    clearError: () => set({ error: null }),
}))