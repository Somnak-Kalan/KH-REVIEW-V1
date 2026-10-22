import { create } from 'zustand'
import BannerService from '../../services/post/banner/Banner' //  adjust path if needed

const initialState = {
    // data
    list: [],
    total: 0,
    pagination: null,
    summaryStatus: {
        total: 0,
        active: 0,
        inactive: 0,
        expired: 0,
    },

    detail: null,

    // switch hide/show (keep your old field)
    hideStatus: null,

    //  ADD: cache status per token (THIS is the fix)
    // { [tokenKey]: { raw: any, ts: number } }
    switchCacheByToken: {},

    // status
    loading: {
        list: false,
        detail: false,
        create: false,
        update: false,
        remove: false,
        switch: false,
        reorder: false,
    },

    error: null,
    lastResponse: null,

    //  ADD: cache / dedupe (prevents refetch on route change)
    lastListKey: '',
    listInFlight: false,
    listInFlightKey: '',
    lastSwitchKey: '',
    switchInFlight: false,

    //  ADD: dedupe per token
    switchInFlightByToken: {}, // { [tokenKey]: true/false }
}

export const useBannerStore = create((set, get) => {
    const setLoading = (key, value) =>
        set((s) => ({ loading: { ...s.loading, [key]: value } }))

    const run = async (loadingKey, fn, onSuccess) => {
        setLoading(loadingKey, true)
        set({ error: null })
        try {
            const res = await fn()
            set({ lastResponse: res })
            if (onSuccess) onSuccess(res)
            setLoading(loadingKey, false)
            return res
        } catch (e) {
            set({ error: e })
            setLoading(loadingKey, false)
            throw e
        }
    }

    return {
        ...initialState,

        // -----------------------------
        // LIST
        // -----------------------------
        listBanner: async ({ access_token, doc }) => {
            const key = JSON.stringify({
                access_token: access_token || '',
                doc: doc || {},
            })

            const force = !!doc?.force || !!doc?._force

            //  cache hit: if route changes and comes back, no refetch
            if (!force && get().lastListKey === key && (get().list?.length || 0) > 0) {
                return {
                    data: get().list || [],
                    pagination: get().pagination || null,
                    summary: get().summaryStatus || null,
                    cached: true,
                }
            }

            //  block duplicate same request
            if (get().listInFlight && get().listInFlightKey === key) return null

            set({ listInFlight: true, listInFlightKey: key })

            try {
                const res = await run('list', () => BannerService.ListBanner({ access_token, doc }), (res) => {
                    set({
                        list: res?.data || [],
                        pagination: res?.pagination || null,
                        total: res?.pagination?.total ?? 0,
                        summaryStatus: res?.summary || null,

                        //  save key for cache
                        lastListKey: key,
                    })
                })
                return res
            } finally {
                set({ listInFlight: false, listInFlightKey: '' })
            }
        },

        // -----------------------------
        // DETAIL (GET by id)
        // -----------------------------
        fetchBannerById: async ({ access_token, id }) =>
            run('detail', () => BannerService.fetchBannerById({ access_token, bannerId: id }), (res) => {
                set({ detail: res?.data || res || null })
            }),

        fetchBannerDetailById: async (payload) =>
            run('detail', () => BannerService.fetchBannerDetailById(payload), (res) => {
                set({ detail: res?.data || res || null })
            }),

        clearDetail: () => set({ detail: null }),

        // -----------------------------
        // CREATE
        // -----------------------------
        createBanner: async ({ access_token, formData }) =>
            run('create', () => BannerService.CreateBanner({ access_token, formData })),

        // -----------------------------
        // UPDATE
        // -----------------------------
        updateBanner: async ({ access_token, id, formData }) =>
            run('update', () => BannerService.UpdateBanner({ access_token, id, formData })),

        // -----------------------------
        // DELETE
        // -----------------------------
        deleteBannerById: async ({ access_token, id }) =>
            run('remove', () => BannerService.deleteBannerById({ access_token, id }), () => {
                const { list } = get()
                set({ list: list.filter((x) => x?._id !== id) })
            }),

        // -----------------------------
        // SWITCH OFF/ON
        // -----------------------------
        switchOffOn: async ({ access_token, doc }) =>
            run('switch', () => BannerService.swithOffOn({ access_token, doc })),

        fetchStatusSwitch: async ({ access_token }) => {
            //  DO NOT key by access_token (because refresh_token changes it often)
            // Keep one cache for current app session
            const key = 'BANNER_STATUS_SWITCH_CACHE'

            const force = false

            //  cache hit: if we already have hideStatus, return it (ignore token changes)
            if (!force && get().hideStatus != null) {
                // keep lastSwitchKey updated (optional)
                if (get().lastSwitchKey !== key) set({ lastSwitchKey: key })
                return { data: get().hideStatus, cached: true }
            }

            //  block duplicate
            if (get().switchInFlight) return null

            set({ switchInFlight: true })

            try {
                const res = await run('switch', () => BannerService.fetchStatusSwitch({ access_token }), (res) => {
                    set({
                        hideStatus: res?.data ?? res ?? null,
                        lastSwitchKey: key,
                    })
                })
                return res
            } finally {
                set({ switchInFlight: false })
            }
        },

        // -----------------------------
        // REORDER
        // -----------------------------
        updateBannerOrders: async ({ access_token, doc }) =>
            run('reorder', () => BannerService.updateBannerOrders({ access_token, doc })),
    }
})