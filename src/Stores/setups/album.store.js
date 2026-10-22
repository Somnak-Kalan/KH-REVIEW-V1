import { create } from 'zustand'
import AlbumServices from '../../services/setup/Album'

const extractAlbumsArray = (res) => {
    const root = res?.data ?? res

    // common shapes:
    if (Array.isArray(root)) return root
    if (Array.isArray(root?.data)) return root.data
    if (Array.isArray(root?.albums)) return root.albums
    if (Array.isArray(root?.album)) return root.album
    if (Array.isArray(root?.docs)) return root.docs
    if (Array.isArray(root?.result)) return root.result

    // some APIs: { data: { albums: [] } }
    if (Array.isArray(root?.data?.albums)) return root.data.albums

    return []
}

export const useAlbumStore = create((set, get) => ({
    // ====== STATE ======
    albums: [],
    album: null,

    // keep last search (for cache + auto refetch)
    search: '',

    loading: false,
    error: null,

    albumFetchedAt: 0,
    albumDetailFetchedAt: 0,

    //  prevent route-change refetch
    cacheTTLms: 5 * 60 * 1000, // 5 minutes (change if you want)

    //  strong dedupe (one request shared)
    _inFlightPromise: null,

    // ====== HELPERS ======
    setSearch: (search = '') => set({ search }),
    clearError: () => set({ error: null }),
    resetAlbumState: () =>
        set({
            albums: [],
            album: null,
            search: '',
            loading: false,
            error: null,
            albumFetchedAt: 0,
            albumDetailFetchedAt: 0,
            _inFlightPromise: null,
        }),

    // ====== LIST ======
    fetchAlbum: async ({ access_token, search = '', force = false } = {}) => {
        const state = get()
        const now = Date.now()
        const effectiveSearch = search ?? state.search ?? ''

        //  cache (same search + TTL + already has data)
        if (
            !force &&
            state.search === effectiveSearch &&
            Array.isArray(state.albums) &&
            state.albums.length > 0 &&
            state.albumFetchedAt &&
            now - state.albumFetchedAt < state.cacheTTLms
        ) {
            // IMPORTANT: return wrapper, but DO NOT store wrapper in state
            return { data: state.albums, fromCache: true }
        }

        //  dedupe in-flight (prevents multiple calls from many components)
        if (state._inFlightPromise) {
            const list = await state._inFlightPromise
            return { data: Array.isArray(list) ? list : [], fromCache: false }
        }

        const p = (async () => {
            set({ loading: true, error: null, search: effectiveSearch })

            try {
                const res = await AlbumServices.fetchAlbum({
                    access_token,
                    doc: { search: effectiveSearch },
                })

                const list = extractAlbumsArray(res)

                set({
                    albums: list,
                    albumFetchedAt: Date.now(),
                    loading: false,
                    _inFlightPromise: null,
                })

                return list
            } catch (error) {
                set({ loading: false, error, _inFlightPromise: null })
                throw error
            }
        })()

        set({ _inFlightPromise: p })

        const list = await p
        return { data: Array.isArray(list) ? list : [], fromCache: false }
    },

    // ====== GET BY ID ======
    fetchAlbumById: async ({ access_token, _id, force = true } = {}) => {
        const state = get()
        if (!force && state.album?._id === _id) {
            return { data: state.album, fromCache: true }
        }

        set({ loading: true, error: null })
        try {
            const res = await AlbumServices.fetchAlbumById({
                access_token,
                doc: { _id },
            })

            const detail = res?.data ?? res ?? null

            set({
                album: detail,
                albumDetailFetchedAt: Date.now(),
                loading: false,
            })

            return res
        } catch (error) {
            set({ loading: false, error })
            throw error
        }
    },

    // ====== CREATE ======
    createAlbum: async (payload) => {
        try {
            set({ error: null })
            const res = await AlbumServices.createAlbum(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchAlbum({
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

    // ====== UPDATE ======
    updateAlbum: async (payload) => {
        try {
            set({ error: null })
            const res = await AlbumServices.updateAlbum(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchAlbum({
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

    // ====== REMOVE ======
    removeAlbum: async (payload) => {
        try {
            set({ error: null })
            const res = await AlbumServices.removeAlbum(payload)

            if (res) {
                const search = get().search || ''
                await get().fetchAlbum({
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

export default useAlbumStore