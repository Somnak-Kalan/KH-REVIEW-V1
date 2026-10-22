import { create } from 'zustand'
import AppUserServices from '../../../services/MobileApp/User/User'

export const useAppUserStore = create((set, get) => ({
    // ====== STATE ======
    users: [],
    user: null,

    // keep last filters for cache + auto refetch
    filters: {
        page: 1,
        size: 20,
        search: '',
        status: '',
        gender: '',
        startDate: '',
        endDate: '',
    },

    pagination: {
        page: 1,
        size: 20,
        total: 0,
        totalPages: 0,
    },

    loading: false,
    error: null,

    usersFetchedAt: 0,
    userDetailFetchedAt: 0,

    userById: {}, // { [id]: detail }
    userByIdInFlight: {}, // { [id]: true }

    // ====== HELPERS ======
    setFilters: (nextFilters = {}) =>
        set((state) => ({
            filters: {
                ...state.filters,
                ...nextFilters,
            },
        })),

    clearError: () => set({ error: null }),

    resetUserState: () =>
        set({
            users: [],
            user: null,
            filters: {
                page: 1,
                size: 20,
                search: '',
                status: '',
                gender: '',
                startDate: '',
                endDate: '',
            },
            pagination: {
                page: 1,
                size: 20,
                total: 0,
                totalPages: 0,
            },
            loading: false,
            error: null,
            usersFetchedAt: 0,
            userDetailFetchedAt: 0,
            userById: {},
            userByIdInFlight: {},
        }),

    // ====== LIST ======
    fetchAppUsers: async ({ access_token, doc = {}, force = false } = {}) => {
        const state = get()

        const effectiveFilters = {
            page: doc?.page ?? state.filters?.page ?? 1,
            size: doc?.size ?? state.filters?.size ?? 20,
            search: doc?.search ?? state.filters?.search ?? '',
            status: doc?.status ?? state.filters?.status ?? '',
            gender: doc?.gender ?? state.filters?.gender ?? '',
            startDate: doc?.startDate ?? state.filters?.startDate ?? '',
            endDate: doc?.endDate ?? state.filters?.endDate ?? '',
            isBusinessOwner: doc?.isBusinessOwner ?? state.filters?.isBusinessOwner ?? '',
            isRestrictedUser: doc?.isRestrictedUser ?? state.filters?.isRestrictedUser ?? '',
            userType: doc?.userType ?? state.filters?.userType ?? '',
        }

        const sameFilters =
            Number(state.filters?.page ?? 1) === Number(effectiveFilters.page) &&
            Number(state.filters?.size ?? 20) === Number(effectiveFilters.size) &&
            String(state.filters?.search ?? '') === String(effectiveFilters.search ?? '') &&
            String(state.filters?.status ?? '') === String(effectiveFilters.status ?? '') &&
            String(state.filters?.gender ?? '') === String(effectiveFilters.gender ?? '') &&
            String(state.filters?.startDate ?? '') === String(effectiveFilters.startDate ?? '') &&
            String(state.filters?.endDate ?? '') === String(effectiveFilters.endDate ?? '') &&
            String(state.filters?.isRestrictedUser ?? '') === String(effectiveFilters.isRestrictedUser ?? '') &&
            String(state.filters?.userType ?? '') === String(effectiveFilters.userType ?? '')
        if (
            !force &&
            sameFilters &&
            Array.isArray(state.users) &&
            state.users.length > 0
        ) {
            return { data: state.users, fromCache: true }
        }

        try {
            set({
                loading: true,
                error: null,
                filters: effectiveFilters,
            })

            const res = await AppUserServices.fetchAppUsers({
                access_token,
                doc: effectiveFilters,
            })

            const list =
                res?.data?.docs ||
                res?.data?.users ||
                res?.docs ||
                res?.users ||
                res?.data ||
                res?.result ||
                []

            const active =
                res?.meta?.pagination?.active ??
                (Array.isArray(list) ? list.length : 0)
            const inactive =
                res?.meta?.pagination?.inactive ??
                (Array.isArray(list) ? list.length : 0)
            const total =
                res?.meta?.pagination?.total ??
                (Array.isArray(list) ? list.length : 0)

            const totalPages =
                res?.meta?.pagination?.totalPages ??
                res?.totalPages ??
                res?.pagination?.totalPages ??
                0

            const currentPage =
                res?.meta?.pagination?.page ??
                res?.data?.page ??
                res?.page ??
                effectiveFilters.page

            const currentSize =
                res?.meta?.pagination?.size ??
                res?.data?.size ??
                res?.size ??
                effectiveFilters.size

            set({
                users: Array.isArray(list) ? list : [],
                pagination: {
                    page: Number(currentPage) || 1,
                    size: Number(currentSize) || 20,
                    total: Number(total) || 0,
                    active: Number(active) || 0,
                    inactive: Number(inactive) || 0,
                    totalPages: Number(totalPages) || 0,
                },
                usersFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== GET BY ID ======
    fetchAppUserById: async ({ access_token, _id, force = false } = {}) => {
        const state = get()
        if (!_id) return null

        // 1) cache hit by id
        const cached = state.userById?.[_id]
        if (!force && cached) {
            if (state.user?._id !== _id && state.user?.id !== _id) {
                set({
                    user: cached,
                    userDetailFetchedAt: Date.now(),
                })
            }
            return { data: cached, fromCache: true }
        }

        // 2) old single-detail cache
        if (!force && (state.user?._id === _id || state.user?.id === _id)) {
            return { data: state.user, fromCache: true }
        }

        // 3) dedupe same id request
        const inflightMap = state.userByIdInFlight || {}
        if (inflightMap[_id]) return null

        try {
            set({
                loading: true,
                error: null,
                userByIdInFlight: { ...inflightMap, [_id]: true },
            })

            const res = await AppUserServices.fetchAppUserById({
                access_token,
                doc: { _id },
            })

            const detail =
                res?.data?.doc ||
                res?.data?.user ||
                res?.doc ||
                res?.user ||
                res?.data ||
                res?.result ||
                res ||
                null

            const nextCache = get().userById || {}

            set({
                user: detail,
                userById: { ...nextCache, [_id]: detail },
                userDetailFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        } finally {
            const current = get().userByIdInFlight || {}
            const { [_id]: removed, ...rest } = current
            set({ userByIdInFlight: rest })
        }
    },

    // ====== UPDATE ======
    updateAppUser: async ({ access_token, doc = {} } = {}) => {
        try {
            set({ loading: true, error: null })

            const res = await AppUserServices.updateAppUser({
                access_token,
                doc,
            })

            const updatedId = doc?._id
            const payloadBody = doc?.body || {}

            let updatedDetail =
                res?.data?.doc ||
                res?.data?.user ||
                res?.doc ||
                res?.user ||
                res?.data ||
                res?.result ||
                null

            const state = get()

            // if api does not return full updated doc, merge with old cache/detail
            if (!updatedDetail && updatedId) {
                const oldDetail =
                    state.userById?.[updatedId] ||
                    ((state.user?._id === updatedId || state.user?.id === updatedId) ? state.user : null)

                updatedDetail = oldDetail
                    ? {
                        ...oldDetail,
                        ...payloadBody,
                    }
                    : null
            }

            if (updatedId && updatedDetail) {
                const nextUserById = {
                    ...(state.userById || {}),
                    [updatedId]: updatedDetail,
                }

                const nextUsers = Array.isArray(state.users)
                    ? state.users.map((item) => {
                        if (item?._id === updatedId || item?.id === updatedId) {
                            return {
                                ...item,
                                ...updatedDetail,
                            }
                        }
                        return item
                    })
                    : []

                set({
                    users: nextUsers,
                    user:
                        state.user?._id === updatedId || state.user?.id === updatedId
                            ? updatedDetail
                            : state.user,
                    userById: nextUserById,
                    userDetailFetchedAt: Date.now(),
                    loading: false,
                })
            } else {
                set({ loading: false })
            }

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== REMOVE ======
    removeAppUser: async ({ access_token, doc = {} } = {}) => {
        try {
            set({ loading: true, error: null })

            const res = await AppUserServices.removeAppUser({
                access_token,
                doc,
            })

            const removedId = doc?._id

            if (removedId) {
                const state = get()
                const nextUsers = Array.isArray(state.users)
                    ? state.users.filter((item) => item?._id !== removedId && item?.id !== removedId)
                    : []

                const nextUserById = { ...(state.userById || {}) }
                delete nextUserById[removedId]

                set({
                    users: nextUsers,
                    user:
                        state.user?._id === removedId || state.user?.id === removedId
                            ? null
                            : state.user,
                    userById: nextUserById,
                    pagination: {
                        ...state.pagination,
                        total: Math.max(0, Number(state.pagination?.total || 0) - 1),
                    },
                    loading: false,
                })
            } else {
                set({ loading: false })
            }

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },
}))

export default useAppUserStore