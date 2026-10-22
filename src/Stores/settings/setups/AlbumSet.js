import { create } from 'zustand'

import AlbumSetServices from '../../../services/settings/setups/AlbumSet'

// =========================================
// General Response
// =========================================

const getResponseData =
    response => {
        return (
            response?.data?.data ??
            response?.data ??
            response
        )
    }

// =========================================
// Error Message
// =========================================

const getErrorMessage = (
    error,
    fallbackMessage
) => {
    return (
        error?.response?.data
            ?.msg ||
        error?.response?.data
            ?.message ||
        error?.response?.data
            ?.error ||
        error?.message ||
        fallbackMessage
    )
}

// =========================================
// Item ID
// =========================================

const getItemId =
    item => {
        if (!item) {
            return null
        }

        if (
            typeof item ===
            'string'
        ) {
            return item
        }

        return (
            item?._id ||
            item?.id ||
            null
        )
    }

// =========================================
// Normalize Array
// =========================================

const normalizeArray =
    value => {
        return Array.isArray(
            value
        )
            ? value
            : []
    }

// =========================================
// Number Helper
// =========================================

const toNumber = (
    value,
    fallback = 0
) => {
    const number =
        Number(
            value
        )

    return Number.isFinite(
        number
    )
        ? number
        : fallback
}

const normalizeAlbumPlacesResponse = (
    response,
    fallback = {}
) => {
    // =====================================
    // Axios Response
    // =====================================

    const body =
        response?.data ??
        response ??
        {}

    // =====================================
    // API Data
    // =====================================

    const data =
        body?.data ??
        {}

    // =====================================
    // Locations
    // =====================================

    const places =
        Array.isArray(
            data?.locations
        )
            ? data.locations
            : []

    // =====================================
    // API Pagination
    // =====================================

    const apiPagination =
        data?.pagination ??
        {}

    // =====================================
    // Current Page
    // =====================================

    const page =
        Math.max(
            1,

            toNumber(
                apiPagination
                    ?.currentPage,

                fallback?.page ||
                1
            )
        )

    // =====================================
    // Page Size
    // =====================================

    const limit =
        Math.max(
            1,

            toNumber(
                apiPagination
                    ?.pageSize,

                fallback?.limit ||
                10
            )
        )

    // =====================================
    // Total Records
    // =====================================
    //
    // IMPORTANT:
    //
    // Your API uses:
    //
    // totalRecords
    //
    // NOT:
    // total
    //
    // =====================================

    const total =
        Math.max(
            0,

            toNumber(
                apiPagination
                    ?.totalRecords,

                0
            )
        )

    // =====================================
    // Total Pages
    // =====================================

    const calculatedTotalPages =
        limit > 0
            ? Math.ceil(
                total /
                limit
            )
            : 0

    const totalPages =
        Math.max(
            0,

            toNumber(
                apiPagination
                    ?.totalPages,

                calculatedTotalPages
            )
        )

    // =====================================
    // Status Summary
    // =====================================

    const statusSummary =
        data?.statusSummary &&
            typeof data
                .statusSummary ===
            'object'
            ? data.statusSummary
            : {}

    // =====================================
    // Return Normalized Data
    // =====================================

    return {
        places,

        pagination: {
            page,

            limit,

            total,

            totalPages,
        },

        statusSummary,

        raw:
            body,
    }
}

// =========================================
// Initial Pagination
// =========================================

const initialAlbumPlacesPagination = {
    page: 1,

    limit: 10,

    total: 0,

    totalPages: 0,
}

// =========================================
// Initial Query
// =========================================

const initialAlbumPlacesQuery = {
    albumSetId: '',

    albumId: '',

    keyword: '',
}

// =========================================
// Store
// =========================================

const useAlbumSetStore = create(
    (
        set,
        get
    ) => ({
        // =====================================
        // Album Sets
        // =====================================

        albumSets: [],

        albumSet: null,

        search: '',

        loadingList: false,

        loadingDetail: false,

        creating: false,

        updating: false,

        removing: false,

        error: null,

        // =====================================
        // Album Places
        // =====================================

        albumPlaces: [],

        albumPlacesPagination: {
            ...initialAlbumPlacesPagination,
        },

        albumPlacesStatusSummary:
            {},

        albumPlacesQuery: {
            ...initialAlbumPlacesQuery,
        },

        loadingAlbumPlaces:
            false,

        // =====================================
        // Set Search
        // =====================================

        setSearch:
            search => {
                set({
                    search:
                        String(
                            search ||
                            ''
                        ),
                })
            },

        // =====================================
        // Clear Error
        // =====================================

        clearError: () => {
            set({
                error:
                    null,
            })
        },

        // =====================================
        // Clear Album Set
        // =====================================

        clearAlbumSet: () => {
            set({
                albumSet:
                    null,
            })
        },

        // =====================================
        // Clear Album Places
        // =====================================

        clearAlbumPlaces:
            () => {
                set({
                    albumPlaces:
                        [],

                    albumPlacesPagination:
                    {
                        ...initialAlbumPlacesPagination,
                    },

                    albumPlacesStatusSummary:
                        {},

                    albumPlacesQuery:
                    {
                        ...initialAlbumPlacesQuery,
                    },

                    loadingAlbumPlaces:
                        false,
                })
            },

        // =====================================
        // Fetch Album Sets
        // =====================================

        fetchSets:
            async ({
                access_token,
                doc = {},
            }) => {
                const search =
                    String(
                        doc?.search ||
                        ''
                    ).trim()

                set({
                    loadingList:
                        true,

                    search,

                    error:
                        null,
                })

                try {
                    const response =
                        await AlbumSetServices
                            .fetchAlbumSets({
                                access_token,

                                doc: {
                                    search,
                                },
                            })

                    const data =
                        getResponseData(
                            response
                        )

                    const albumSets =
                        normalizeArray(
                            data
                        )

                    set({
                        albumSets,
                    })

                    return albumSets
                } catch (
                error
                ) {
                    set({
                        error:
                            getErrorMessage(
                                error,

                                'Could not load album sets.'
                            ),
                    })

                    throw error
                } finally {
                    set({
                        loadingList:
                            false,
                    })
                }
            },

        // =====================================
        // Fetch Album Set By ID
        // =====================================

        fetchSetById:
            async ({
                access_token,

                setId,

                _id,
            }) => {
                const albumSetId =
                    setId ||
                    _id

                if (
                    !albumSetId
                ) {
                    throw new Error(
                        'Album set ID is required.'
                    )
                }

                set({
                    loadingDetail:
                        true,

                    error:
                        null,
                })

                try {
                    const response =
                        await AlbumSetServices
                            .fetchAlbumSetById({
                                access_token,

                                _id:
                                    albumSetId,
                            })

                    const albumSet =
                        getResponseData(
                            response
                        )

                    set({
                        albumSet,
                    })

                    return albumSet
                } catch (
                error
                ) {
                    set({
                        albumSet:
                            null,

                        error:
                            getErrorMessage(
                                error,

                                'Could not load the album set.'
                            ),
                    })

                    throw error
                } finally {
                    set({
                        loadingDetail:
                            false,
                    })
                }
            },

        // =====================================
        // Create Album Set
        // =====================================

        createSet:
            async ({
                access_token,

                doc,
            }) => {
                set({
                    creating:
                        true,

                    error:
                        null,
                })

                try {
                    const response =
                        await AlbumSetServices
                            .createAlbumSet({
                                access_token,

                                doc,
                            })

                    const createdSet =
                        getResponseData(
                            response
                        )

                    set(
                        state => {
                            const createdId =
                                getItemId(
                                    createdSet
                                )

                            const oldSets =
                                state
                                    .albumSets
                                    .filter(
                                        item =>
                                            getItemId(
                                                item
                                            ) !==
                                            createdId
                                    )

                            return {
                                albumSets:
                                    [
                                        createdSet,

                                        ...oldSets,
                                    ],
                            }
                        }
                    )

                    return createdSet
                } catch (
                error
                ) {
                    set({
                        error:
                            getErrorMessage(
                                error,

                                'Could not create the album set.'
                            ),
                    })

                    throw error
                } finally {
                    set({
                        creating:
                            false,
                    })
                }
            },

        // =====================================
        // Update Album Set
        // =====================================

        updateSet:
            async ({
                access_token,

                doc,
            }) => {
                if (
                    !doc?._id
                ) {
                    throw new Error(
                        'Album set ID is required.'
                    )
                }

                set({
                    updating:
                        true,

                    error:
                        null,
                })

                try {
                    const response =
                        await AlbumSetServices
                            .updateAlbumSet({
                                access_token,

                                doc,
                            })

                    const updatedSet =
                        getResponseData(
                            response
                        )

                    const updatedId =
                        getItemId(
                            updatedSet
                        ) ||
                        doc._id

                    set(
                        state => ({
                            albumSets:
                                state
                                    .albumSets
                                    .map(
                                        item =>
                                            getItemId(
                                                item
                                            ) ===
                                                updatedId
                                                ? {
                                                    ...item,

                                                    ...updatedSet,
                                                }
                                                : item
                                    ),

                            albumSet:
                                getItemId(
                                    state
                                        .albumSet
                                ) ===
                                    updatedId
                                    ? {
                                        ...state
                                            .albumSet,

                                        ...updatedSet,
                                    }
                                    : state
                                        .albumSet,
                        })
                    )

                    return updatedSet
                } catch (
                error
                ) {
                    set({
                        error:
                            getErrorMessage(
                                error,

                                'Could not update the album set.'
                            ),
                    })

                    throw error
                } finally {
                    set({
                        updating:
                            false,
                    })
                }
            },

        // =====================================
        // Remove Album Set
        // =====================================

        removeSet:
            async ({
                access_token,

                setId,

                _id,
            }) => {
                const albumSetId =
                    setId ||
                    _id

                if (
                    !albumSetId
                ) {
                    throw new Error(
                        'Album set ID is required.'
                    )
                }

                set({
                    removing:
                        true,

                    error:
                        null,
                })

                try {
                    const response =
                        await AlbumSetServices
                            .removeAlbumSet({
                                access_token,

                                _id:
                                    albumSetId,
                            })

                    set(
                        state => ({
                            albumSets:
                                state
                                    .albumSets
                                    .filter(
                                        item =>
                                            getItemId(
                                                item
                                            ) !==
                                            albumSetId
                                    ),

                            albumSet:
                                getItemId(
                                    state
                                        .albumSet
                                ) ===
                                    albumSetId
                                    ? null
                                    : state
                                        .albumSet,
                        })
                    )

                    return getResponseData(
                        response
                    )
                } catch (
                error
                ) {
                    set({
                        error:
                            getErrorMessage(
                                error,

                                'Could not delete the album set.'
                            ),
                    })

                    throw error
                } finally {
                    set({
                        removing:
                            false,
                    })
                }
            },

        // =====================================
        // Fetch Places Of Album
        // =====================================

        fetchAlbumPlaces:
            async ({
                access_token,

                albumSetId,

                albumId,

                page = 1,

                limit = 10,

                keyword = '',
            }) => {
                // =================================
                // Validation
                // =================================

                if (
                    !albumSetId
                ) {
                    throw new Error(
                        'Album set ID is required.'
                    )
                }

                if (
                    !albumId
                ) {
                    throw new Error(
                        'Album ID is required.'
                    )
                }

                // =================================
                // Normalize Page
                // =================================

                const normalizedPage =
                    Math.max(
                        1,

                        Number(
                            page
                        ) || 1
                    )

                // =================================
                // Normalize Limit
                // =================================

                const normalizedLimit =
                    Math.max(
                        1,

                        Number(
                            limit
                        ) || 10
                    )

                // =================================
                // Normalize Search
                // =================================

                const normalizedKeyword =
                    String(
                        keyword ||
                        ''
                    ).trim()

                // =================================
                // Start Loading
                // =================================

                set({
                    loadingAlbumPlaces:
                        true,

                    albumPlacesQuery:
                    {
                        albumSetId:
                            String(
                                albumSetId
                            ),

                        albumId:
                            String(
                                albumId
                            ),

                        keyword:
                            normalizedKeyword,
                    },

                    error:
                        null,
                })

                try {
                    // =================================
                    // API Request
                    // =================================

                    const response =
                        await AlbumSetServices
                            .fetchAlbumPlaces({
                                access_token,

                                doc: {
                                    albumSetId,

                                    albumId,

                                    page:
                                        normalizedPage,

                                    limit:
                                        normalizedLimit,

                                    keyword:
                                        normalizedKeyword,
                                },
                            })

                    // =================================
                    // Normalize API Response
                    // =================================

                    const result =
                        normalizeAlbumPlacesResponse(
                            response,

                            {
                                page:
                                    normalizedPage,

                                limit:
                                    normalizedLimit,
                            }
                        )

                    // =================================
                    // Debug
                    // =================================

                    console.log(
                        'Album places:',
                        result.places
                    )

                    console.log(
                        'Album pagination:',
                        result.pagination
                    )

                    console.log(
                        'Album status summary:',
                        result.statusSummary
                    )

                    // =================================
                    // Save Into Zustand
                    // =================================

                    set({
                        albumPlaces:
                            result
                                .places,

                        albumPlacesPagination:
                            result
                                .pagination,

                        albumPlacesStatusSummary:
                            result
                                .statusSummary,
                    })

                    return result
                } catch (
                error
                ) {
                    set({
                        albumPlaces:
                            [],

                        error:
                            getErrorMessage(
                                error,

                                'Could not load places using this album.'
                            ),
                    })

                    throw error
                } finally {
                    set({
                        loadingAlbumPlaces:
                            false,
                    })
                }
            },

        // =====================================
        // Refresh Sets
        // =====================================

        refreshSets:
            async access_token => {
                const {
                    search,
                } = get()

                return get()
                    .fetchSets({
                        access_token,

                        doc: {
                            search,
                        },
                    })
            },

        // =====================================
        // Alternative Names
        // =====================================

        fetchAlbumSets:
            payload =>
                get()
                    .fetchSets(
                        payload
                    ),

        fetchAlbumSetById:
            payload =>
                get()
                    .fetchSetById(
                        payload
                    ),

        createAlbumSet:
            payload =>
                get()
                    .createSet(
                        payload
                    ),

        updateAlbumSet:
            payload =>
                get()
                    .updateSet(
                        payload
                    ),

        removeAlbumSet:
            payload =>
                get()
                    .removeSet(
                        payload
                    ),
    })
)

export default useAlbumSetStore