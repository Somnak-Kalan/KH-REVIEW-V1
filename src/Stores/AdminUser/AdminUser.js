import { create } from 'zustand'
import AdminUserServices from '../../services/admin/User' //

const extractUsersArray = (res) => {
    // res might be: axios response data already, or {data: ...}
    const root = res?.data ?? res

    // common shapes:
    // 1) root = []
    if (Array.isArray(root)) return root

    // 2) root = { data: [] }
    if (Array.isArray(root?.data)) return root.data

    // 3) root = { users: [] }
    if (Array.isArray(root?.users)) return root.users

    // 4) root = { data: { users: [] } }
    if (Array.isArray(root?.data?.users)) return root.data.users

    // 5) root = { result: [] } / { docs: [] }
    if (Array.isArray(root?.result)) return root.result
    if (Array.isArray(root?.docs)) return root.docs

    return []
}

export const useAdminUsersStore = create((set, get) => ({
    users: [],
    loading: false,
    error: null,

    //  cache control
    usersFetchedAt: 0, // timestamp
    cacheTTLms: 5 * 60 * 1000, // 5 minutes (change if you want)

    //  strong dedupe
    _inFlightPromise: null,

    fetchUsers: async (access_token, force = false) => {
        if (!access_token) return null

        const state = get()
        const now = Date.now()

        //  1) cache with TTL (prevents route-change refetch)
        if (
            !force &&
            Array.isArray(state.users) &&
            state.users.length > 0 &&
            state.usersFetchedAt &&
            now - state.usersFetchedAt < state.cacheTTLms
        ) {
            return state.users
        }

        //  2) if request is already running, await same promise
        if (state._inFlightPromise) {
            return await state._inFlightPromise
        }

        // create one shared promise
        const p = (async () => {
            set({ loading: true, error: null })

            try {
                const res = await AdminUserServices.fetchUser({ access_token })
                const list = extractUsersArray(res)

                set({
                    users: list,
                    usersFetchedAt: Date.now(),
                    loading: false,
                    _inFlightPromise: null,
                })

                return list
            } catch (e) {
                set({ error: e, loading: false, _inFlightPromise: null })
                return null
            }
        })()

        set({ _inFlightPromise: p })

        return await p
    },

    clearUsers: () =>
        set({
            users: [],
            loading: false,
            error: null,
            usersFetchedAt: 0,
            _inFlightPromise: null,
        }),
}))