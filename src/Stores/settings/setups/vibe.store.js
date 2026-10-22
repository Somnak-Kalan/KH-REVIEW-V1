import { create } from 'zustand'

import VibeService from '../../../services/settings/setups/Vibe'

const getErrorMessage = (error) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.data ||
        error?.message ||
        'Something went wrong'
    )
}

const extractList = (response) => {
    if (Array.isArray(response?.data)) {
        return response.data
    }

    if (Array.isArray(response?.result)) {
        return response.result
    }

    if (Array.isArray(response?.docs)) {
        return response.docs
    }

    if (Array.isArray(response)) {
        return response
    }

    return []
}

const extractDetail = (response) => {
    return (
        response?.data ||
        response?.result ||
        response?.doc ||
        response?.vibe ||
        response ||
        null
    )
}

const useVibeStore = create((set, get) => ({
    vibes: [],
    vibeDetail: null,

    search: '',
    error: null,

    loading: false,
    detailLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,

    setSearch: (search) => {
        set({
            search: String(search || ''),
        })
    },

    clearError: () => {
        set({
            error: null,
        })
    },

    clearVibeDetail: () => {
        set({
            vibeDetail: null,
        })
    },

    fetchVibes: async ({
        access_token,
        doc = {},
        silent = false,
    }) => {
        if (!access_token) {
            return []
        }

        const search = String(doc?.search || '').trim()

        if (!silent) {
            set({
                loading: true,
            })
        }

        set({
            search,
            error: null,
        })

        try {
            const response = await VibeService.Get_Vibe_List({
                access_token,
                doc: {
                    search,
                },
            })

            const list = extractList(response)

            set({
                vibes: list,
            })

            return list
        } catch (error) {
            const message = getErrorMessage(error)

            set({
                error: message,
            })

            throw error
        } finally {
            if (!silent) {
                set({
                    loading: false,
                })
            }
        }
    },

    fetchVibeById: async ({ access_token, _id }) => {
        if (!access_token || !_id) {
            return null
        }

        set({
            detailLoading: true,
            error: null,
            vibeDetail: null,
        })

        try {
            const response = await VibeService.Get_Vibe_By_Id({
                access_token,
                _id,
            })

            const detail = extractDetail(response)

            set({
                vibeDetail: detail,
            })

            return detail
        } catch (error) {
            const message = getErrorMessage(error)

            set({
                error: message,
                vibeDetail: null,
            })

            throw error
        } finally {
            set({
                detailLoading: false,
            })
        }
    },

    createVibe: async ({ access_token, doc }) => {
        if (!access_token || !doc) {
            return false
        }

        set({
            createLoading: true,
            error: null,
        })

        try {
            const response = await VibeService.Create_Vibe({
                access_token,
                doc,
            })

            await get()
                .fetchVibes({
                    access_token,
                    doc: {
                        search: get().search,
                    },
                    silent: true,
                })
                .catch(() => null)

            return response
        } catch (error) {
            const message = getErrorMessage(error)

            set({
                error: message,
            })

            throw error
        } finally {
            set({
                createLoading: false,
            })
        }
    },

    updateVibe: async ({ access_token, doc }) => {
        if (!access_token || !doc?._id) {
            return false
        }

        set({
            updateLoading: true,
            error: null,
        })

        try {
            const response = await VibeService.Update_Vibe({
                access_token,
                doc,
            })

            set((state) => ({
                vibes: state.vibes.map((item) =>
                    item?._id === doc._id
                        ? {
                            ...item,
                            nameEn: doc.nameEn,
                            nameKh: doc.nameKh,
                            description: doc.description,
                        }
                        : item
                ),
                vibeDetail:
                    state.vibeDetail?._id === doc._id
                        ? {
                            ...state.vibeDetail,
                            nameEn: doc.nameEn,
                            nameKh: doc.nameKh,
                            description: doc.description,
                        }
                        : state.vibeDetail,
            }))

            await get()
                .fetchVibes({
                    access_token,
                    doc: {
                        search: get().search,
                    },
                    silent: true,
                })
                .catch(() => null)

            return response
        } catch (error) {
            const message = getErrorMessage(error)

            set({
                error: message,
            })

            throw error
        } finally {
            set({
                updateLoading: false,
            })
        }
    },

    deleteVibe: async ({ access_token, _id }) => {
        if (!access_token || !_id) {
            return false
        }

        set({
            deleteLoading: true,
            error: null,
        })

        try {
            const response = await VibeService.Delete_Vibe({
                access_token,
                _id,
            })

            set((state) => ({
                vibes: state.vibes.filter((item) => item?._id !== _id),
                vibeDetail:
                    state.vibeDetail?._id === _id
                        ? null
                        : state.vibeDetail,
            }))

            await get()
                .fetchVibes({
                    access_token,
                    doc: {
                        search: get().search,
                    },
                    silent: true,
                })
                .catch(() => null)

            return response
        } catch (error) {
            const message = getErrorMessage(error)

            set({
                error: message,
            })

            throw error
        } finally {
            set({
                deleteLoading: false,
            })
        }
    },

    resetVibeStore: () => {
        set({
            vibes: [],
            vibeDetail: null,
            search: '',
            error: null,
            loading: false,
            detailLoading: false,
            createLoading: false,
            updateLoading: false,
            deleteLoading: false,
        })
    },
}))

export default useVibeStore