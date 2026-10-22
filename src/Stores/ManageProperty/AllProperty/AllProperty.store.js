import { create } from 'zustand'
import Swal from 'sweetalert2'

import AllPropertyServices from '../../../services/ManageProperty/PlaceListing/AllProperty'

const DEFAULT_PAGINATION = {
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
}

const getErrorMessage = (
    error,
    fallback
) =>
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback

const showSuccess = ({
    title = 'Success!',
    text = '',
    onClose,
}) => {
    Swal.fire({
        icon: 'success',
        title,
        text,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        willClose: onClose,
    })
}

const showErrorAlert = (
    error,
    title,
    fallback
) => {
    Swal.fire({
        icon: 'error',
        title,

        text:
            getErrorMessage(
                error,
                fallback
            ),
    })
}

const removeMapKey = (
    map,
    key
) => {
    const next = {
        ...(map || {}),
    }

    delete next[key]

    return next
}

const extractPropertyDetail =
    response =>
        response?.data
            ?.locations?.[0] ||
        response?.data?.data
            ?.locations?.[0] ||
        response?.data?.data?.[0] ||
        response?.data?.[0] ||
        response?.data ||
        null

const extractAlbumSetList =
    response => {
        const values =
            response?.data?.albumSets ||
            response?.data?.items ||
            response?.data?.data ||
            response?.albumSets ||
            response?.items ||
            response?.data ||
            response

        return Array.isArray(values)
            ? values
            : []
    }

export const useAllPropertyStore =
    create((set, get) => ({
        properties: [],
        propertyDetail: null,

        albumSetList: [],

        reviewList: [],
        reviewPagination: null,

        statusSummary: {},

        pagination:
            DEFAULT_PAGINATION,

        loading: false,
        saving: false,
        deleting: false,
        reviewsLoading: false,
        albumSetsLoading: false,

        galleryDeleting: false,
        galleryMoving: false,
        galleryOrderSaving: false,

        error: null,

        _lastFilters: {},

        _listByKey: {},
        _listInFlight: {},

        _propertyDetailById: {},
        _propertyDetailInFlight: {},

        _reviewByKey: {},
        _reviewInFlight: {},

        _albumSetsLoaded: false,

        fetchAllProperty: async (
            access_token,
            filters = {},
            options = {}
        ) => {
            if (!access_token) {
                return null
            }

            const key =
                JSON.stringify(filters)

            const cached =
                get()._listByKey[key]

            if (
                !options.force &&
                cached
            ) {
                set({
                    properties:
                        cached.locations,

                    statusSummary:
                        cached.statusSummary,

                    pagination:
                        cached.pagination,

                    _lastFilters:
                        filters,
                })

                return {
                    data: cached,
                    cached: true,
                }
            }

            const runningRequest =
                get()._listInFlight[
                key
                ]

            if (runningRequest) {
                return runningRequest
            }

            const request =
                (async () => {
                    set({
                        loading: true,
                        error: null,
                        _lastFilters:
                            filters,
                    })

                    try {
                        const response =
                            await AllPropertyServices
                                .fetchAllProperty({
                                    access_token,
                                    filters,
                                })

                        const locations =
                            response?.data
                                ?.locations ||
                            []

                        const statusSummary =
                            response?.data
                                ?.statusSummary ||
                            {}

                        const responsePagination =
                            response?.data
                                ?.pagination ||
                            {}

                        const pagination = {
                            currentPage:
                                responsePagination
                                    .currentPage ||
                                filters.page ||
                                1,

                            pageSize:
                                responsePagination
                                    .pageSize ||
                                filters.limit ||
                                10,

                            totalRecords:
                                responsePagination
                                    .totalRecords ??
                                locations.length,

                            totalPages:
                                responsePagination
                                    .totalPages ||
                                1,
                        }

                        const cacheValue = {
                            locations,
                            statusSummary,
                            pagination,
                        }

                        set(state => ({
                            properties:
                                locations,

                            statusSummary,

                            pagination,

                            loading: false,

                            _listByKey: {
                                ...state
                                    ._listByKey,

                                [key]:
                                    cacheValue,
                            },
                        }))

                        return {
                            data: cacheValue,
                            cached: false,
                        }
                    } catch (error) {
                        set({
                            loading: false,
                            error,
                        })

                        showErrorAlert(
                            error,
                            'Load Failed',
                            'Failed to load properties.'
                        )

                        return null
                    } finally {
                        set(state => ({
                            _listInFlight:
                                removeMapKey(
                                    state
                                        ._listInFlight,

                                    key
                                ),
                        }))
                    }
                })()

            set(state => ({
                _listInFlight: {
                    ...state
                        ._listInFlight,

                    [key]: request,
                },
            }))

            return request
        },

        fetchAllPropertyOnce:
            async (
                access_token,
                filters = {}
            ) => {
                const result =
                    await get()
                        .fetchAllProperty(
                            access_token,
                            filters
                        )

                return (
                    result?.data
                        ?.locations ||
                    []
                )
            },

        forceRefreshAllProperty:
            async (
                access_token,
                filters = {}
            ) => {
                const key =
                    JSON.stringify(
                        filters
                    )

                set(state => ({
                    _listByKey:
                        removeMapKey(
                            state._listByKey,
                            key
                        ),
                }))

                return get()
                    .fetchAllProperty(
                        access_token,
                        filters,
                        {
                            force: true,
                        }
                    )
            },

        createNonBusinessProperty:
            async (
                access_token,
                doc,
                options = {}
            ) => {
                if (
                    !access_token ||
                    !doc
                ) {
                    return null
                }

                set({
                    saving: true,
                    error: null,
                })

                try {
                    const response =
                        await AllPropertyServices
                            .createNonBusinessProperty(
                                {
                                    access_token,
                                    doc,
                                }
                            )

                    await get()
                        .forceRefreshAllProperty(
                            access_token,
                            get()
                                ._lastFilters
                        )

                    showSuccess({
                        title:
                            options.title ||
                            'Created!',

                        text:
                            options.text ||
                            'Property has been successfully created.',

                        onClose:
                            options.onClose,
                    })

                    return response
                } catch (error) {
                    set({ error })

                    showErrorAlert(
                        error,
                        'Create Failed',
                        'Failed to create property.'
                    )

                    return null
                } finally {
                    set({
                        saving: false,
                    })
                }
            },

        updateNonBusinessProperty:
            async (
                access_token,
                doc,
                options = {}
            ) => {
                if (
                    !access_token ||
                    !doc
                ) {
                    return null
                }

                set({
                    saving: true,
                    error: null,
                })

                try {
                    const response =
                        await AllPropertyServices
                            .updateNonBusinessProperty(
                                {
                                    access_token,
                                    doc,
                                }
                            )

                    const propertyId =
                        doc._id || doc.id

                    if (propertyId) {
                        await get()
                            .fetchNonBusinessPropertyById(
                                {
                                    access_token,
                                    id: propertyId,
                                    force: true,
                                }
                            )
                    }

                    await get()
                        .forceRefreshAllProperty(
                            access_token,
                            get()
                                ._lastFilters
                        )

                    showSuccess({
                        title:
                            options.title ||
                            'Updated!',

                        text:
                            options.text ||
                            'Property has been successfully updated.',

                        onClose:
                            options.onClose,
                    })

                    return response
                } catch (error) {
                    set({ error })

                    showErrorAlert(
                        error,
                        'Update Failed',
                        'Failed to update property.'
                    )

                    return null
                } finally {
                    set({
                        saving: false,
                    })
                }
            },

        updatePropertyInformation:
            async (
                access_token,
                doc,
                options = {}
            ) => {
                if (
                    !access_token ||
                    !doc?._id
                ) {
                    return null
                }

                set({
                    saving: true,
                    error: null,
                })

                try {
                    const response =
                        await AllPropertyServices
                            .updatePropertyInformation(
                                {
                                    access_token,
                                    doc,
                                }
                            )

                    await get()
                        .fetchNonBusinessPropertyById(
                            {
                                access_token,
                                id: doc._id,
                                force: true,
                            }
                        )

                    showSuccess({
                        title:
                            options.title ||
                            'Updated!',

                        text:
                            options.text ||
                            'Property information updated successfully.',

                        onClose:
                            options.onClose,
                    })

                    return response
                } catch (error) {
                    set({ error })

                    showErrorAlert(
                        error,
                        'Update Failed',
                        'Failed to update property information.'
                    )

                    return null
                } finally {
                    set({
                        saving: false,
                    })
                }
            },

        updatePropertyAddress:
            async (
                access_token,
                doc,
                options = {}
            ) => {
                if (
                    !access_token ||
                    !doc?._id
                ) {
                    return null
                }

                set({
                    saving: true,
                    error: null,
                })

                try {
                    const response =
                        await AllPropertyServices
                            .updatePropertyAddress(
                                {
                                    access_token,
                                    doc,
                                }
                            )

                    await get()
                        .fetchNonBusinessPropertyById(
                            {
                                access_token,
                                id: doc._id,
                                force: true,
                            }
                        )

                    showSuccess({
                        title:
                            options.title ||
                            'Updated!',

                        text:
                            options.text ||
                            'Property address updated successfully.',

                        onClose:
                            options.onClose,
                    })

                    return response
                } catch (error) {
                    set({ error })

                    showErrorAlert(
                        error,
                        'Update Failed',
                        'Failed to update property address.'
                    )

                    return null
                } finally {
                    set({
                        saving: false,
                    })
                }
            },

        updatePropertyThumbnail:
            async (
                access_token,
                _id,
                doc,
                options = {}
            ) => {
                if (
                    !access_token ||
                    !_id ||
                    !doc
                ) {
                    return null
                }

                set({
                    saving: true,
                    error: null,
                })

                try {
                    const response =
                        await AllPropertyServices
                            .updatePropertyThumbnail(
                                {
                                    access_token,
                                    _id,
                                    doc,
                                }
                            )

                    await get()
                        .fetchNonBusinessPropertyById(
                            {
                                access_token,
                                id: _id,
                                force: true,
                            }
                        )

                    showSuccess({
                        title:
                            options.title ||
                            'Updated!',

                        text:
                            options.text ||
                            'Property thumbnail updated successfully.',

                        onClose:
                            options.onClose,
                    })

                    return response
                } catch (error) {
                    set({ error })

                    showErrorAlert(
                        error,
                        'Update Failed',
                        'Failed to update property thumbnail.'
                    )

                    return null
                } finally {
                    set({
                        saving: false,
                    })
                }
            },

        updatePropertyVideo:
            async (
                access_token,
                _id,
                doc,
                options = {}
            ) => {
                if (
                    !access_token ||
                    !_id ||
                    !doc
                ) {
                    return null
                }

                set({
                    saving: true,
                    error: null,
                })

                try {
                    const response =
                        await AllPropertyServices
                            .updatePropertyVideo(
                                {
                                    access_token,
                                    _id,
                                    doc,
                                }
                            )

                    await get()
                        .fetchNonBusinessPropertyById(
                            {
                                access_token,
                                id: _id,
                                force: true,
                            }
                        )

                    showSuccess({
                        title:
                            options.title ||
                            'Updated!',

                        text:
                            options.text ||
                            'Property video updated successfully.',

                        onClose:
                            options.onClose,
                    })

                    return response
                } catch (error) {
                    set({ error })

                    showErrorAlert(
                        error,
                        'Update Failed',
                        'Failed to update property video.'
                    )

                    return null
                } finally {
                    set({
                        saving: false,
                    })
                }
            },

        removeActivity:
            async (
                access_token,
                doc,
                options = {}
            ) => {
                if (
                    !access_token ||
                    !doc?._id
                ) {
                    return null
                }

                set({
                    deleting: true,
                    error: null,
                })

                try {
                    const response =
                        await AllPropertyServices
                            .removeActivity({
                                access_token,
                                doc,
                            })

                    await get()
                        .forceRefreshAllProperty(
                            access_token,
                            get()
                                ._lastFilters
                        )

                    showSuccess({
                        title:
                            options.title ||
                            'Removed!',

                        text:
                            options.text ||
                            'Property has been removed successfully.',

                        onClose:
                            options.onClose,
                    })

                    return response
                } catch (error) {
                    set({ error })

                    showErrorAlert(
                        error,
                        'Delete Failed',
                        'Failed to remove property.'
                    )

                    return null
                } finally {
                    set({
                        deleting: false,
                    })
                }
            },

        fetchAlbumSetList:
            async ({
                access_token,

                params = {
                    page: 1,
                    limit: 1000,
                },

                force = false,
            }) => {
                if (!access_token) {
                    return []
                }

                if (
                    get()
                        ._albumSetsLoaded &&
                    !force
                ) {
                    return get()
                        .albumSetList
                }

                set({
                    albumSetsLoading:
                        true,

                    error: null,
                })

                try {
                    const response =
                        await AllPropertyServices
                            .fetchAlbumSetList({
                                access_token,
                                params,
                            })

                    const albumSetList =
                        extractAlbumSetList(
                            response
                        )

                    set({
                        albumSetList,
                        _albumSetsLoaded:
                            true,
                    })

                    return albumSetList
                } catch (error) {
                    set({ error })

                    return []
                } finally {
                    set({
                        albumSetsLoading:
                            false,
                    })
                }
            },

        deletePropertyGalleryImages:
            async ({
                access_token,
                propertyId,
                images,
            }) => {
                const validImages =
                    (images || []).filter(
                        image =>
                            image?.galleryId &&
                            image?.url
                    )

                if (
                    !access_token ||
                    !propertyId ||
                    !validImages.length
                ) {
                    throw new Error(
                        'Property and selected images are required.'
                    )
                }

                set({
                    galleryDeleting:
                        true,

                    error: null,
                })

                try {
                    const results =
                        await Promise.allSettled(
                            validImages.map(
                                image =>
                                    AllPropertyServices
                                        .removeImageGallery(
                                            {
                                                access_token,
                                                propertyId,

                                                galleryId:
                                                    image
                                                        .galleryId,

                                                fileUrl:
                                                    image.url,
                                            }
                                        )
                            )
                        )

                    const deletedImages =
                        []

                    const failedImages =
                        []

                    results.forEach(
                        (
                            result,
                            index
                        ) => {
                            if (
                                result.status ===
                                'fulfilled'
                            ) {
                                deletedImages.push(
                                    validImages[index]
                                )
                            } else {
                                failedImages.push(
                                    validImages[index]
                                )
                            }
                        }
                    )

                    await get()
                        .fetchNonBusinessPropertyById(
                            {
                                access_token,
                                id: propertyId,
                                force: true,
                            }
                        )

                    return {
                        deletedImages,
                        failedImages,
                    }
                } catch (error) {
                    set({ error })

                    throw error
                } finally {
                    set({
                        galleryDeleting:
                            false,
                    })
                }
            },

        movePropertyGalleryImages:
            async ({
                access_token,
                propertyId,
                sourceAlbumSetId,
                sourceAlbumId,
                targetAlbumSetId,
                targetAlbumId,
                fileUrls,
                moveAll = false,
            }) => {
                if (
                    !access_token ||
                    !propertyId ||
                    !targetAlbumSetId ||
                    !targetAlbumId
                ) {
                    throw new Error(
                        'Destination album is required.'
                    )
                }

                if (
                    !moveAll &&
                    !(fileUrls || []).length
                ) {
                    throw new Error(
                        'Please select at least one image.'
                    )
                }

                set({
                    galleryMoving: true,
                    error: null,
                })

                try {
                    const response =
                        await AllPropertyServices
                            .moveImagesGallery({
                                access_token,
                                propertyId,

                                sourceAlbumSetId,
                                sourceAlbumId,

                                targetAlbumSetId,
                                targetAlbumId,

                                fileUrls,
                                moveAll,
                            })

                    await get()
                        .fetchNonBusinessPropertyById(
                            {
                                access_token,
                                id: propertyId,
                                force: true,
                            }
                        )

                    return response
                } catch (error) {
                    set({ error })

                    throw error
                } finally {
                    set({
                        galleryMoving:
                            false,
                    })
                }
            },

        reorderPropertyGalleryImages:
            async ({
                access_token,
                propertyId,
                galleryId,
                albumId,
                fileUrls,
            }) => {
                if (
                    !access_token ||
                    !propertyId ||
                    !galleryId ||
                    !(fileUrls || []).length
                ) {
                    throw new Error(
                        'Ordered gallery images are required.'
                    )
                }

                set({
                    galleryOrderSaving:
                        true,

                    error: null,
                })

                try {
                    const response =
                        await AllPropertyServices
                            .reorderImagesGallery({
                                access_token,
                                propertyId,
                                galleryId,
                                albumId,
                                fileUrls,
                            })

                    await get()
                        .fetchNonBusinessPropertyById(
                            {
                                access_token,
                                id: propertyId,
                                force: true,
                            }
                        )

                    return response
                } catch (error) {
                    set({ error })

                    throw error
                } finally {
                    set({
                        galleryOrderSaving:
                            false,
                    })
                }
            },

        fetchNonBusinessPropertyById:
            async ({
                access_token,
                _id,
                id,
                force = false,
            }) => {
                const propertyId =
                    _id || id

                if (
                    !access_token ||
                    !propertyId
                ) {
                    return null
                }

                const cached =
                    get()
                        ._propertyDetailById[
                    propertyId
                    ]

                if (
                    !force &&
                    cached
                ) {
                    set({
                        propertyDetail:
                            cached,
                    })

                    return {
                        data: cached,
                        fromCache: true,
                    }
                }

                const runningRequest =
                    get()
                        ._propertyDetailInFlight[
                    propertyId
                    ]

                if (runningRequest) {
                    return runningRequest
                }

                const request =
                    (async () => {
                        set({
                            loading: true,
                            error: null,
                        })

                        try {
                            const response =
                                await AllPropertyServices
                                    .fetchNonBusinessPropertyById(
                                        {
                                            access_token,
                                            id: propertyId,
                                        }
                                    )

                            const detail =
                                extractPropertyDetail(
                                    response
                                )

                            set(state => ({
                                propertyDetail:
                                    detail,

                                loading: false,

                                _propertyDetailById:
                                {
                                    ...state
                                        ._propertyDetailById,

                                    [propertyId]:
                                        detail,
                                },
                            }))

                            return {
                                data: detail,
                                fromCache: false,
                                raw: response,
                            }
                        } catch (error) {
                            set({
                                loading: false,
                                error,
                            })

                            showErrorAlert(
                                error,
                                'Load Failed',
                                'Failed to load property detail.'
                            )

                            return null
                        } finally {
                            set(state => ({
                                _propertyDetailInFlight:
                                    removeMapKey(
                                        state
                                            ._propertyDetailInFlight,

                                        propertyId
                                    ),
                            }))
                        }
                    })()

                set(state => ({
                    _propertyDetailInFlight:
                    {
                        ...state
                            ._propertyDetailInFlight,

                        [propertyId]:
                            request,
                    },
                }))

                return request
            },

        fetchPlaceReviewList:
            async ({
                access_token,
                code,
                params = {},
                force = false,
            }) => {
                if (
                    !access_token ||
                    !code
                ) {
                    return null
                }

                const reviewKey =
                    JSON.stringify({
                        code,
                        ...params,
                    })

                const cached =
                    get()
                        ._reviewByKey[
                    reviewKey
                    ]

                if (
                    !force &&
                    cached
                ) {
                    set({
                        reviewList:
                            cached.list,

                        reviewPagination:
                            cached.pagination,
                    })

                    return {
                        data:
                            cached.list,

                        pagination:
                            cached.pagination,

                        fromCache: true,
                    }
                }

                const runningRequest =
                    get()
                        ._reviewInFlight[
                    reviewKey
                    ]

                if (runningRequest) {
                    return runningRequest
                }

                const request =
                    (async () => {
                        set({
                            reviewsLoading:
                                true,

                            error: null,
                        })

                        try {
                            const response =
                                await AllPropertyServices
                                    .fetchPlaceReviewList(
                                        {
                                            access_token,
                                            code,
                                            params,
                                        }
                                    )

                            const list =
                                Array.isArray(
                                    response?.data
                                )
                                    ? response.data
                                    : Array.isArray(
                                        response
                                            ?.data?.data
                                    )
                                        ? response
                                            .data.data
                                        : []

                            const pagination =
                                response?.pagination ||
                                response?.data
                                    ?.pagination ||
                                null

                            set(state => ({
                                reviewList:
                                    list,

                                reviewPagination:
                                    pagination,

                                reviewsLoading:
                                    false,

                                _reviewByKey: {
                                    ...state
                                        ._reviewByKey,

                                    [reviewKey]:
                                    {
                                        list,
                                        pagination,
                                    },
                                },
                            }))

                            return {
                                data: list,
                                pagination,
                                fromCache: false,
                                raw: response,
                            }
                        } catch (error) {
                            set({
                                reviewsLoading:
                                    false,

                                error,
                            })

                            showErrorAlert(
                                error,
                                'Load Failed',
                                'Failed to load reviews.'
                            )

                            return null
                        } finally {
                            set(state => ({
                                _reviewInFlight:
                                    removeMapKey(
                                        state
                                            ._reviewInFlight,

                                        reviewKey
                                    ),
                            }))
                        }
                    })()

                set(state => ({
                    _reviewInFlight: {
                        ...state
                            ._reviewInFlight,

                        [reviewKey]:
                            request,
                    },
                }))

                return request
            },

        clearPropertyDetail:
            () =>
                set({
                    propertyDetail: null,
                }),

        clearReviewList:
            () =>
                set({
                    reviewList: [],

                    reviewPagination:
                        null,
                }),

        clearError:
            () =>
                set({
                    error: null,
                }),

        clearPropertyDetailCacheById:
            id =>
                set(state => ({
                    _propertyDetailById:
                        removeMapKey(
                            state
                                ._propertyDetailById,

                            id
                        ),
                })),

        clearReviewCacheByCode:
            code => {
                const next = {
                    ...get()._reviewByKey,
                }

                Object.keys(next)
                    .forEach(key => {
                        if (
                            key.includes(
                                `"code":"${code}"`
                            )
                        ) {
                            delete next[key]
                        }
                    })

                set({
                    _reviewByKey: next,
                })
            },

        clearAllCache:
            () =>
                set({
                    _listByKey: {},
                    _listInFlight: {},

                    _propertyDetailById:
                        {},

                    _propertyDetailInFlight:
                        {},

                    _reviewByKey: {},
                    _reviewInFlight: {},

                    albumSetList: [],

                    _albumSetsLoaded:
                        false,
                }),
    }))

export default useAllPropertyStore