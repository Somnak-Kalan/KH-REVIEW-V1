// src/Stores/settings/setups/keyword.store.js
import { create } from 'zustand'
import KeywordService from '../../../services/settings/setups/Keyword'

const defaultPagination = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
}

const defaultParams = {
    page: 1,
    limit: 10,
    search: '',
    status: '',
    groupId: '',
    sortBy: '',
    sortOrder: '',
}

const getNameByLanguage = (names = [], language) => {
    if (!Array.isArray(names)) return ''

    return (
        names.find((item) => item?.lang === language)?.value?.trim() || ''
    )
}

const getGroupName = (group) => {
    if (!group) return ''

    if (typeof group === 'string') {
        return group
    }

    return (
        group?.nameEn ||
        group?.name ||
        getNameByLanguage(group?.names, 'en') ||
        ''
    )
}

const getCreatedByName = (createdBy) => {
    if (!createdBy) return '-'

    if (typeof createdBy === 'string') {
        return createdBy
    }

    return createdBy?.name || createdBy?.username || '-'
}

const normalizeKeyword = (item = {}) => {
    return {
        ...item,

        // Keep original API objects for future edit and detail integration.
        groupInfo: item?.group || null,
        createdByInfo: item?.createdBy || null,
        updatedByInfo: item?.updatedBy || null,

        // Fields required by your current table UI.
        nameEn:
            item?.nameEn ||
            getNameByLanguage(item?.names, 'en'),

        nameKh:
            item?.nameKh ||
            getNameByLanguage(item?.names, 'kh'),

        group: getGroupName(item?.group),

        searchCount: Number(item?.searchCount || 0),

        createdBy: getCreatedByName(item?.createdBy),
    }
}

const getResponsePayload = (response) => {
    /*
        Support both formats.

        Normal Axios response:
        {
            data: {
                data: [],
                pagination: {}
            }
        }

        Interceptor returns response.data:
        {
            data: [],
            pagination: {}
        }
    */

    if (
        Array.isArray(response?.data?.data) ||
        response?.data?.pagination
    ) {
        return response.data
    }

    return response || {}
}

const isSameParams = (oldParams = {}, newParams = {}) => {
    return (
        Number(oldParams?.page || 1) === Number(newParams?.page || 1) &&
        Number(oldParams?.limit || 10) === Number(newParams?.limit || 10) &&
        (oldParams?.search || '') === (newParams?.search || '') &&
        (oldParams?.status || '') === (newParams?.status || '') &&
        (oldParams?.groupId || '') === (newParams?.groupId || '') &&
        (oldParams?.sortBy || '') === (newParams?.sortBy || '') &&
        (oldParams?.sortOrder || '') === (newParams?.sortOrder || '')
    )
}

export const useKeywordStore = create((set, get) => ({
    // ====== STATE ======
    keywords: [],
    keyword: null,

    pagination: defaultPagination,
    params: defaultParams,

    // Keep last search for cache and automatic refetch.
    search: '',

    loading: false,
    checking: false,
    creating: false,
    updating: false,
    deleting: false,

    error: null,

    hasLoaded: false,
    keywordFetchedAt: 0,

    // ====== HELPERS ======
    setSearch: (search = '') => set({ search }),

    clearError: () => set({ error: null }),

    resetKeywordState: () =>
        set({
            keywords: [],
            keyword: null,
            pagination: defaultPagination,
            params: defaultParams,
            search: '',
            loading: false,
            checking: false,
            creating: false,
            updating: false,
            deleting: false,
            error: null,
            hasLoaded: false,
            keywordFetchedAt: 0,
        }),

    // ====== LIST + SEARCH + PAGINATION ======
    fetchKeywords: async ({
        access_token = '',
        page = 1,
        limit = 10,
        search,
        status = '',
        groupId = '',
        sortBy = '',
        sortOrder = '',
        force = false,
    } = {}) => {
        /*
            AuthContext may still be loading when the page first renders.
            Do not send the request until the token exists.
        */
        if (!access_token) return null

        const state = get()

        const requestParams = {
            page: Number(page || 1),
            limit: Number(limit || 10),
            search: search ?? state.search ?? '',
            status,
            groupId,
            sortBy,
            sortOrder,
        }

        // Use cache when the same list was already loaded.
        if (
            !force &&
            state.hasLoaded &&
            Array.isArray(state.keywords) &&
            state.keywords.length > 0 &&
            isSameParams(state.params, requestParams)
        ) {
            return {
                data: state.keywords,
                pagination: state.pagination,
                fromCache: true,
            }
        }

        try {
            set({
                loading: true,
                error: null,
                search: requestParams.search,
                params: requestParams,
            })

            const response = await KeywordService.getKeywordList({
                access_token,
                params: requestParams,
            })

            const payload = getResponsePayload(response)

            const list = Array.isArray(payload?.data)
                ? payload.data
                : []

            const normalizedKeywords =
                list.map(normalizeKeyword)

            set({
                keywords: normalizedKeywords,

                pagination: {
                    page: Number(
                        payload?.pagination?.page ||
                        requestParams.page
                    ),

                    limit: Number(
                        payload?.pagination?.limit ||
                        requestParams.limit
                    ),

                    total: Number(
                        payload?.pagination?.total || 0
                    ),

                    totalPages: Number(
                        payload?.pagination?.totalPages || 0
                    ),
                },

                loading: false,
                error: null,
                hasLoaded: true,
                keywordFetchedAt: Date.now(),
            })

            return {
                ...payload,
                data: normalizedKeywords,
            }
        } catch (error) {
            set({
                loading: false,
                error,
                hasLoaded: true,
            })

            throw error
        }
    },

    // ====== CHECK DUPLICATE KEYWORD ======
    checkKeyword: async ({
        access_token = '',
        nameEn = '',
        nameKh = '',
    } = {}) => {
        if (!access_token) {
            throw new Error('Access token is required.')
        }

        try {
            set({
                checking: true,
                error: null,
            })

            const response = await KeywordService.checkKeyword({
                access_token,
                payload: {
                    nameEn: nameEn?.trim(),
                    nameKh: nameKh?.trim(),
                },
            })

            set({
                checking: false,
                error: null,
            })

            return response
        } catch (error) {
            set({
                checking: false,
                error,
            })

            throw error
        }
    },

    // ====== CREATE KEYWORD ======
    createKeyword: async ({
        access_token = '',
        nameEn = '',
        nameKh = '',
        groupId,
    } = {}) => {
        if (!access_token) {
            throw new Error('Access token is required.')
        }

        try {
            set({
                creating: true,
                error: null,
            })

            const response = await KeywordService.createKeyword({
                access_token,
                payload: {
                    nameEn: nameEn?.trim(),
                    nameKh: nameKh?.trim(),

                    /*
                        The group is optional.
                        Send undefined when no group is selected.
                    */
                    groupId: groupId || undefined,
                },
            })

            /*
                Reload the existing page after creation.
                Preserve the current search and pagination values.
            */
            if (response) {
                const currentParams =
                    get().params || defaultParams

                await get().fetchKeywords({
                    access_token,
                    ...currentParams,
                    force: true,
                })
            }

            set({
                creating: false,
                error: null,
            })

            return response
        } catch (error) {
            set({
                creating: false,
                error,
            })

            throw error
        }
    },

    // ====== UPDATE KEYWORD ======
    updateKeyword: async ({
        access_token = '',
        _id,
        nameEn = '',
        nameKh = '',
        groupId,
    } = {}) => {
        if (!access_token) {
            throw new Error('Access token is required.')
        }

        if (!_id) {
            throw new Error('Keyword ID is required.')
        }

        try {
            set({
                updating: true,
                error: null,
            })

            const response = await KeywordService.updateKeyword({
                access_token,
                payload: {
                    _id,
                    nameEn: nameEn?.trim(),
                    nameKh: nameKh?.trim(),

                    /*
                        The group is optional.
                        Send null when clearing the selected group.
                    */
                    groupId: groupId || null,
                },
            })

            /*
                Reload the existing page after editing.
                Preserve the current search and pagination values.
            */
            if (response) {
                const currentParams =
                    get().params || defaultParams

                await get().fetchKeywords({
                    access_token,
                    ...currentParams,
                    force: true,
                })
            }

            set({
                updating: false,
                error: null,
            })

            return response
        } catch (error) {
            set({
                updating: false,
                error,
            })

            throw error
        }
    },

    // ====== DELETE KEYWORD ======
    deleteKeyword: async ({
        id,
        access_token = '',
    } = {}) => {
        if (!id) {
            throw new Error('Keyword ID is required.')
        }

        if (!access_token) {
            throw new Error('Access token is required.')
        }

        try {
            set({
                deleting: true,
                error: null,
            })

            const response = await KeywordService.deleteKeyword({
                id,
                access_token,
            })

            set({
                deleting: false,
                error: null,
            })

            return response
        } catch (error) {
            set({
                deleting: false,
                error,
            })

            throw error
        }
    },
}))

export default useKeywordStore