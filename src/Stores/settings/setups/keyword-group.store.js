import { create } from 'zustand'

import KeywordGroupService from '../../../services/settings/setups/KeywordGroup'

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
}

const getNameByLanguage = (
    names = [],
    language
) => {
    if (!Array.isArray(names)) {
        return ''
    }

    return (
        names.find((item) => {
            return (
                item?.lang === language
            )
        })?.value?.trim() || ''
    )
}

const getCreatedByName = (
    createdBy
) => {
    if (!createdBy) return '-'

    if (
        typeof createdBy ===
        'string'
    ) {
        return createdBy
    }

    return (
        createdBy?.name ||
        createdBy?.username ||
        '-'
    )
}

const normalizeKeyword = (
    item = {},
    groupId = ''
) => {
    if (
        typeof item ===
        'string'
    ) {
        return {
            _id: item,
            nameEn: item,
            nameKh: '',
            searchCount: 0,
            createdBy: '-',
            createdAt: '',
            groupId,
            group: groupId,
        }
    }

    const normalizedGroupId =
        item?.groupId ||
        item?.group?._id ||
        groupId

    return {
        ...item,

        nameEn:
            item?.nameEn ||
            getNameByLanguage(
                item?.names,
                'en'
            ),

        nameKh:
            item?.nameKh ||
            getNameByLanguage(
                item?.names,
                'kh'
            ),

        searchCount:
            Number(
                item?.searchCount ||
                0
            ),

        createdBy:
            getCreatedByName(
                item?.createdBy
            ),

        groupId:
            normalizedGroupId,

        group:
            normalizedGroupId,
    }
}

const normalizeKeywordGroup = (
    item = {}
) => {
    return {
        ...item,
        createdByInfo:
            item?.createdBy ||
            null,

        updatedByInfo:
            item?.updatedBy ||
            null,

        nameEn:
            item?.nameEn ||
            getNameByLanguage(
                item?.names,
                'en'
            ),

        nameKh:
            item?.nameKh ||
            getNameByLanguage(
                item?.names,
                'kh'
            ),

        keywords:
            Array.isArray(
                item?.keywordPreview
            )
                ? item.keywordPreview
                : Array.isArray(
                    item?.keywords
                )
                    ? item.keywords
                    : [],

        keywordCount:
            Number(
                item?.keywordCount ||
                0
            ),

        moreKeywordCount:
            Number(
                item?.moreKeywordCount ||
                0
            ),

        createdBy:
            getCreatedByName(
                item?.createdBy
            ),
    }
}

const extractListPayload = ({
    response,
    requestParams,
}) => {
    const payload =
        response?.data ??
        response

    const list =
        Array.isArray(payload)
            ? payload
            : Array.isArray(
                payload?.data
            )
                ? payload.data
                : Array.isArray(
                    payload?.docs
                )
                    ? payload.docs
                    : []

    const pagination =
        !Array.isArray(payload) &&
            payload?.pagination
            ? payload.pagination
            : {}

    return {
        data: list,

        pagination: {
            page:
                Number(
                    pagination?.page ||
                    requestParams?.page ||
                    1
                ),

            limit:
                Number(
                    pagination?.limit ||
                    requestParams?.limit ||
                    10
                ),

            total:
                Number(
                    pagination?.total ??
                    list.length
                ),

            totalPages:
                Number(
                    pagination?.totalPages ??
                    (
                        list.length > 0
                            ? 1
                            : 0
                    )
                ),
        },
    }
}

const extractDetailPayload = (
    response
) => {
    const payload =
        response?.data ??
        response

    return (
        payload?.data ||
        payload?.group ||
        payload?.result ||
        payload ||
        null
    )
}

export const useKeywordGroupStore =
    create((set, get) => ({
        // ====== GROUP STATE ======
        groups: [],
        group: null,

        pagination:
            defaultPagination,

        params:
            defaultParams,

        loading: false,
        detailLoading: false,
        creating: false,
        updating: false,
        deleting: false,

        error: null,
        hasLoaded: false,

        // ====== GROUP KEYWORD TABLE ======
        groupKeywords: [],

        groupKeywordPagination:
            defaultPagination,

        groupKeywordParams:
            defaultParams,

        groupKeywordsLoading:
            false,

        groupKeywordsHasLoaded:
            false,

        groupKeywordsGroupId:
            '',

        // ====== TRANSFER MODAL ======
        transferGroups: [],
        transferKeywords: [],

        transferLoading:
            false,

        transferring:
            false,

        transferOptionsHasLoaded:
            false,

        clearError: () => {
            set({
                error: null,
            })
        },

        resetKeywordGroupState:
            () => {
                set({
                    groups: [],
                    group: null,

                    pagination:
                        defaultPagination,

                    params:
                        defaultParams,

                    loading:
                        false,

                    detailLoading:
                        false,

                    creating:
                        false,

                    updating:
                        false,

                    deleting:
                        false,

                    error:
                        null,

                    hasLoaded:
                        false,

                    groupKeywords:
                        [],

                    groupKeywordPagination:
                        defaultPagination,

                    groupKeywordParams:
                        defaultParams,

                    groupKeywordsLoading:
                        false,

                    groupKeywordsHasLoaded:
                        false,

                    groupKeywordsGroupId:
                        '',

                    transferGroups:
                        [],

                    transferKeywords:
                        [],

                    transferLoading:
                        false,

                    transferring:
                        false,

                    transferOptionsHasLoaded:
                        false,
                })
            },

        // ====== LIST GROUPS ======
        fetchKeywordGroups:
            async ({
                access_token = '',
                page = 1,
                limit = 10,
                search = '',
            } = {}) => {
                if (
                    !access_token
                ) {
                    return null
                }

                const requestParams = {
                    page:
                        Number(
                            page || 1
                        ),

                    limit:
                        Number(
                            limit || 10
                        ),

                    search:
                        search || '',
                }

                try {
                    set({
                        loading:
                            true,

                        error:
                            null,

                        params:
                            requestParams,
                    })

                    const response =
                        await KeywordGroupService
                            .getKeywordGroupList({
                                access_token,

                                params:
                                    requestParams,
                            })

                    const payload =
                        extractListPayload({
                            response,

                            requestParams,
                        })

                    const groups =
                        payload.data.map(
                            normalizeKeywordGroup
                        )

                    set({
                        groups,

                        pagination:
                            payload.pagination,

                        loading:
                            false,

                        error:
                            null,

                        hasLoaded:
                            true,
                    })

                    return {
                        ...payload,
                        data:
                            groups,
                    }
                } catch (
                error
                ) {
                    set({
                        loading:
                            false,

                        error,
                    })

                    throw error
                }
            },

        // ====== GROUP DETAIL ======
        fetchKeywordGroupById:
            async ({
                id,
                access_token = '',
            } = {}) => {
                if (
                    !id ||
                    !access_token
                ) {
                    return null
                }

                try {
                    set({
                        detailLoading:
                            true,

                        error:
                            null,
                    })

                    const response =
                        await KeywordGroupService
                            .getKeywordGroupDetail({
                                id,

                                access_token,
                            })

                    const payload =
                        extractDetailPayload(
                            response
                        )

                    const group =
                        payload
                            ? normalizeKeywordGroup(
                                payload
                            )
                            : null

                    set({
                        group,

                        detailLoading:
                            false,

                        error:
                            null,
                    })

                    return {
                        data:
                            group,
                    }
                } catch (
                error
                ) {
                    set({
                        detailLoading:
                            false,

                        error,
                    })

                    throw error
                }
            },

        // ====== KEYWORDS INSIDE GROUP ======
        fetchKeywordGroupKeywords:
            async ({
                id,
                access_token = '',
                page = 1,
                limit = 10,
                search = '',
            } = {}) => {
                if (
                    !id ||
                    !access_token
                ) {
                    return null
                }

                const requestParams = {
                    page:
                        Number(
                            page || 1
                        ),

                    limit:
                        Number(
                            limit || 10
                        ),

                    search:
                        search || '',
                }

                try {
                    set({
                        groupKeywordsLoading:
                            true,

                        error:
                            null,

                        groupKeywordParams:
                            requestParams,

                        groupKeywordsGroupId:
                            id,
                    })

                    const response =
                        await KeywordGroupService
                            .getKeywordGroupKeywords({
                                id,

                                access_token,

                                params:
                                    requestParams,
                            })

                    const payload =
                        extractListPayload({
                            response,

                            requestParams,
                        })

                    const keywords =
                        payload.data.map(
                            (item) => {
                                return normalizeKeyword(
                                    item,
                                    id
                                )
                            }
                        )

                    set({
                        groupKeywords:
                            keywords,

                        groupKeywordPagination:
                            payload.pagination,

                        groupKeywordsLoading:
                            false,

                        groupKeywordsHasLoaded:
                            true,

                        groupKeywordsGroupId:
                            id,

                        error:
                            null,
                    })

                    return {
                        ...payload,

                        data:
                            keywords,
                    }
                } catch (
                error
                ) {
                    set({
                        groupKeywordsLoading:
                            false,

                        error,
                    })

                    throw error
                }
            },

        // ====== LOAD TRANSFER OPTIONS ======
        fetchTransferOptions:
            async ({
                fromGroupId,
                access_token = '',
            } = {}) => {
                if (
                    !fromGroupId
                ) {
                    throw new Error(
                        'Source group ID is required.'
                    )
                }

                if (
                    !access_token
                ) {
                    throw new Error(
                        'Access token is required.'
                    )
                }

                const requestParams = {
                    page:
                        1,

                    /*
                        Load all options for the modal.
                        Adjust this value only when
                        your backend has a lower limit.
                    */
                    limit:
                        1000,

                    search:
                        '',
                }

                try {
                    set({
                        transferLoading:
                            true,

                        transferOptionsHasLoaded:
                            false,

                        error:
                            null,
                    })

                    const [
                        groupResponse,
                        keywordResponse,
                    ] =
                        await Promise.all([
                            KeywordGroupService
                                .getKeywordGroupList({
                                    access_token,

                                    params:
                                        requestParams,
                                }),

                            KeywordGroupService
                                .getKeywordGroupKeywords({
                                    id:
                                        fromGroupId,

                                    access_token,

                                    params:
                                        requestParams,
                                }),
                        ])

                    const groupPayload =
                        extractListPayload({
                            response:
                                groupResponse,

                            requestParams,
                        })

                    const keywordPayload =
                        extractListPayload({
                            response:
                                keywordResponse,

                            requestParams,
                        })

                    set({
                        transferGroups:
                            groupPayload
                                .data
                                .map(
                                    normalizeKeywordGroup
                                ),

                        transferKeywords:
                            keywordPayload
                                .data
                                .map(
                                    (item) => {
                                        return normalizeKeyword(
                                            item,

                                            fromGroupId
                                        )
                                    }
                                ),

                        transferLoading:
                            false,

                        transferOptionsHasLoaded:
                            true,

                        error:
                            null,
                    })
                } catch (
                error
                ) {
                    set({
                        transferLoading:
                            false,

                        transferOptionsHasLoaded:
                            true,

                        error,
                    })

                    throw error
                }
            },

        // ====== TRANSFER KEYWORDS ======
        transferKeywordsToGroup:
            async ({
                keywordIds = [],
                fromGroupId,
                targetGroupId,
                access_token = '',
            } = {}) => {
                if (
                    !Array.isArray(
                        keywordIds
                    ) ||
                    keywordIds.length ===
                    0
                ) {
                    throw new Error(
                        'At least one keyword is required.'
                    )
                }

                if (
                    !fromGroupId
                ) {
                    throw new Error(
                        'Source group ID is required.'
                    )
                }

                if (
                    !access_token
                ) {
                    throw new Error(
                        'Access token is required.'
                    )
                }

                try {
                    set({
                        transferring:
                            true,

                        error:
                            null,
                    })

                    const response =
                        await KeywordGroupService
                            .transferKeywords({
                                access_token,

                                payload: {
                                    keywordIds,

                                    fromGroupId,

                                    targetGroupId:
                                        targetGroupId ||
                                        null,
                                },
                            })

                    const {
                        groupKeywordParams,
                        params,
                    } = get()

                    /*
                        Refresh the source-group table
                        and the group list after transfer.
                    */
                    await Promise
                        .allSettled([
                            get()
                                .fetchKeywordGroupKeywords({
                                    id:
                                        fromGroupId,

                                    access_token,

                                    ...groupKeywordParams,
                                }),

                            get()
                                .fetchKeywordGroups({
                                    access_token,

                                    ...params,
                                }),
                        ])

                    set({
                        transferring:
                            false,

                        transferOptionsHasLoaded:
                            false,

                        error:
                            null,
                    })

                    return response
                } catch (
                error
                ) {
                    set({
                        transferring:
                            false,

                        error,
                    })

                    throw error
                }
            },

        // ====== CREATE GROUP ======
        createKeywordGroup:
            async ({
                access_token = '',
                nameEn = '',
                nameKh = '',
            } = {}) => {
                if (
                    !access_token
                ) {
                    throw new Error(
                        'Access token is required.'
                    )
                }

                try {
                    set({
                        creating:
                            true,

                        error:
                            null,
                    })

                    const response =
                        await KeywordGroupService
                            .createKeywordGroup({
                                access_token,

                                payload: {
                                    nameEn:
                                        nameEn
                                            ?.trim(),

                                    nameKh:
                                        nameKh
                                            ?.trim(),
                                },
                            })

                    const params =
                        get().params ||
                        defaultParams

                    await get()
                        .fetchKeywordGroups({
                            access_token,

                            ...params,
                        })

                    set({
                        creating:
                            false,

                        error:
                            null,
                    })

                    return response
                } catch (
                error
                ) {
                    set({
                        creating:
                            false,

                        error,
                    })

                    throw error
                }
            },

        // ====== UPDATE GROUP ======
        updateKeywordGroup:
            async ({
                access_token = '',
                _id,
                nameEn = '',
                nameKh = '',
            } = {}) => {
                if (!_id) {
                    throw new Error(
                        'Keyword group ID is required.'
                    )
                }

                try {
                    set({
                        updating:
                            true,

                        error:
                            null,
                    })

                    const response =
                        await KeywordGroupService
                            .updateKeywordGroup({
                                access_token,

                                payload: {
                                    _id,

                                    nameEn:
                                        nameEn
                                            ?.trim(),

                                    nameKh:
                                        nameKh
                                            ?.trim(),
                                },
                            })

                    const params =
                        get().params ||
                        defaultParams

                    await get()
                        .fetchKeywordGroups({
                            access_token,

                            ...params,
                        })

                    set({
                        updating:
                            false,

                        error:
                            null,
                    })

                    return response
                } catch (
                error
                ) {
                    set({
                        updating:
                            false,

                        error,
                    })

                    throw error
                }
            },

        // ====== DELETE GROUP ======
        deleteKeywordGroup:
            async ({
                id,
                access_token = '',
                moveKeywordsToUngrouped =
                true,
            } = {}) => {
                if (!id) {
                    throw new Error(
                        'Keyword group ID is required.'
                    )
                }

                try {
                    set({
                        deleting:
                            true,

                        error:
                            null,
                    })

                    const response =
                        await KeywordGroupService
                            .deleteKeywordGroup({
                                id,

                                access_token,

                                moveKeywordsToUngrouped,
                            })

                    set({
                        deleting:
                            false,

                        error:
                            null,
                    })

                    return response
                } catch (
                error
                ) {
                    set({
                        deleting:
                            false,

                        error,
                    })

                    throw error
                }
            },
    }))

export default useKeywordGroupStore