import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
} from 'react'

import {
    Breadcrumb,
    Button,
    Card,
    Empty,
    message,
} from 'antd'

import {
    ArrowLeftOutlined,
    HomeOutlined,
} from '@ant-design/icons'

import {
    useNavigate,
    useOutletContext,
    useParams,
    useSearchParams,
} from 'react-router-dom'

import { AuthContext } from '../../../../../../contexts/AuthContext'

import useAlbumStore from '../../../../../../Stores/setups/album.store'

import useAlbumSetStore from '../../../../../../Stores/settings/setups/AlbumSet'

import AlbumUsageTable from './AlbumUsageTable'

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
// Get Album ID
// =========================================

const getAlbumId =
    album => {
        if (!album) {
            return null
        }

        if (
            typeof album ===
            'string'
        ) {
            return album
        }

        return (
            album?._id ||
            album?.id ||
            album?.albumId ||
            null
        )
    }

// =========================================
// Component
// =========================================

const AlbumDetail = () => {
    const {
        setDisplayEmitContent,
    } = useOutletContext()

    const {
        access_token,
    } = useContext(
        AuthContext
    )

    const params =
        useParams()

    const [
        searchParams,
    ] = useSearchParams()

    const navigate =
        useNavigate()

    // =========================================
    // IDs
    // =========================================

    const albumId =
        params?.albumId ||
        params?.id ||
        params?._id ||
        ''

    const albumSetId =
        searchParams.get(
            'albumSetId'
        ) || ''

    // =========================================
    // Album Store
    // =========================================

    const {
        fetchAlbumById,

        album,

        loading,
    } = useAlbumStore()

    // =========================================
    // Album Set Store
    // =========================================

    const albumPlaces =
        useAlbumSetStore(
            state =>
                state
                    .albumPlaces
        )

    const albumPlacesPagination =
        useAlbumSetStore(
            state =>
                state
                    .albumPlacesPagination
        )

    const albumPlacesQuery =
        useAlbumSetStore(
            state =>
                state
                    .albumPlacesQuery
        )

    const loadingAlbumPlaces =
        useAlbumSetStore(
            state =>
                state
                    .loadingAlbumPlaces
        )

    const fetchAlbumPlaces =
        useAlbumSetStore(
            state =>
                state
                    .fetchAlbumPlaces
        )

    const clearAlbumPlaces =
        useAlbumSetStore(
            state =>
                state
                    .clearAlbumPlaces
        )

    // =========================================
    // Current Album
    // =========================================

    const currentAlbum =
        useMemo(() => {
            if (!album) {
                return null
            }

            const currentId =
                getAlbumId(
                    album
                )

            if (
                currentId &&
                albumId &&
                String(
                    currentId
                ) !==
                String(
                    albumId
                )
            ) {
                return null
            }

            return album
        }, [
            album,
            albumId,
        ])

    // =========================================
    // Safe Places
    // =========================================
    //
    // Supports:
    //
    // albumPlaces = [...]
    //
    // OR:
    //
    // albumPlaces = {
    //     locations: [...]
    // }
    //
    // =========================================

    const places =
        useMemo(() => {
            if (
                Array.isArray(
                    albumPlaces
                )
            ) {
                return albumPlaces
            }

            if (
                Array.isArray(
                    albumPlaces
                        ?.locations
                )
            ) {
                return albumPlaces
                    .locations
            }

            return []
        }, [
            albumPlaces,
        ])

    // =========================================
    // API Pagination
    // =========================================
    //
    // API response:
    //
    // pagination: {
    //     currentPage: 1,
    //     totalPages: 130,
    //     pageSize: 10,
    //     totalRecords: 1293
    // }
    //
    // We also support the old format:
    //
    // {
    //     page: 1,
    //     limit: 10,
    //     total: 1293
    // }
    //
    // =========================================

    const pagination =
        useMemo(() => {
            // ---------------------------------
            // Possible nested pagination
            // ---------------------------------

            const source =
                albumPlacesPagination
                    ?.pagination ||
                albumPlacesPagination ||
                albumPlaces
                    ?.pagination ||
                {}

            // ---------------------------------
            // Current Page
            // ---------------------------------

            const currentPage =
                Number(
                    source
                        ?.currentPage ??
                    source
                        ?.page ??
                    1
                )

            // ---------------------------------
            // Page Size
            // ---------------------------------

            const pageSize =
                Number(
                    source
                        ?.pageSize ??
                    source
                        ?.limit ??
                    10
                )

            // ---------------------------------
            // Total Records
            // ---------------------------------

            const totalRecords =
                Number(
                    source
                        ?.totalRecords ??
                    source
                        ?.total ??
                    0
                )

            // ---------------------------------
            // Total Pages
            // ---------------------------------

            const apiTotalPages =
                Number(
                    source
                        ?.totalPages ??
                    0
                )

            const calculatedTotalPages =
                pageSize > 0
                    ? Math.ceil(
                        totalRecords /
                        pageSize
                    )
                    : 0

            // ---------------------------------
            // Return Normalized Pagination
            // ---------------------------------

            return {
                currentPage:
                    Number.isFinite(
                        currentPage
                    ) &&
                        currentPage > 0
                        ? currentPage
                        : 1,

                pageSize:
                    Number.isFinite(
                        pageSize
                    ) &&
                        pageSize > 0
                        ? pageSize
                        : 10,

                totalRecords:
                    Number.isFinite(
                        totalRecords
                    ) &&
                        totalRecords >= 0
                        ? totalRecords
                        : 0,

                totalPages:
                    Number.isFinite(
                        apiTotalPages
                    ) &&
                        apiTotalPages > 0
                        ? apiTotalPages
                        : calculatedTotalPages,
            }
        }, [
            albumPlacesPagination,
            albumPlaces,
        ])

    // =========================================
    // Current Search Keyword
    // =========================================

    const currentKeyword =
        useMemo(() => {
            return (
                albumPlacesQuery
                    ?.keyword ||
                ''
            )
        }, [
            albumPlacesQuery,
        ])

    // =========================================
    // Header
    // =========================================

    useEffect(() => {
        setDisplayEmitContent(
            <div className='my-3 flex items-center justify-between'>
                <button
                    type='button'
                    className='flex items-center gap-3 font-semibold text-gray-700 dark:text-slate-300'
                    onClick={() =>
                        navigate(
                            '/album/set/' +
                            encodeURIComponent(
                                albumSetId
                            )
                        )
                    }
                >
                    <ArrowLeftOutlined />

                    <span>
                        Album Details
                    </span>
                </button>

                <Breadcrumb
                    items={[
                        {
                            title: (
                                <HomeOutlined
                                    className='cursor-pointer'
                                    onClick={() =>
                                        navigate(
                                            '/'
                                        )
                                    }
                                />
                            ),
                        },

                        {
                            title: (
                                <button
                                    type='button'
                                    className='text-slate-700 dark:text-slate-200'
                                    onClick={() =>
                                        navigate(
                                            '/album?tab=sets'
                                        )
                                    }
                                >
                                    Album
                                </button>
                            ),
                        },
                    ]}
                />
            </div>
        )
    }, [
        albumSetId,
        navigate,
        setDisplayEmitContent,
    ])

    // =========================================
    // Load Album Information
    // =========================================

    useEffect(() => {
        if (
            !access_token ||
            !albumId ||
            typeof fetchAlbumById !==
            'function'
        ) {
            return
        }

        fetchAlbumById({
            access_token,

            // Pass all common names
            id:
                albumId,

            _id:
                albumId,

            albumId,
        }).catch(
            error => {
                console.error(
                    'Could not load album:',
                    error
                )

                message.error(
                    getErrorMessage(
                        error,

                        'Could not load album information.'
                    )
                )
            }
        )
    }, [
        access_token,
        albumId,
        fetchAlbumById,
    ])

    // =========================================
    // Load Places
    // =========================================

    const loadPlaces =
        useCallback(
            async ({
                page = 1,

                limit = 10,

                keyword = '',
            } = {}) => {
                if (
                    !access_token ||
                    !albumSetId ||
                    !albumId
                ) {
                    return null
                }

                try {
                    return await fetchAlbumPlaces({
                        access_token,

                        albumSetId,

                        albumId,

                        // API request page
                        page,

                        // API request page size
                        limit,

                        // Search
                        keyword,
                    })
                } catch (
                error
                ) {
                    console.error(
                        'Could not load album places:',
                        error
                    )

                    message.error(
                        getErrorMessage(
                            error,

                            'Could not load places using this album.'
                        )
                    )

                    return null
                }
            },
            [
                access_token,
                albumSetId,
                albumId,
                fetchAlbumPlaces,
            ]
        )

    // =========================================
    // Initial Places
    // =========================================

    useEffect(() => {
        if (
            !access_token ||
            !albumSetId ||
            !albumId
        ) {
            return
        }

        loadPlaces({
            page:
                1,

            limit:
                10,

            keyword:
                '',
        })
    }, [
        access_token,
        albumSetId,
        albumId,
        loadPlaces,
    ])

    // =========================================
    // Clear Places When Leaving
    // =========================================

    useEffect(() => {
        return () => {
            clearAlbumPlaces()
        }
    }, [
        clearAlbumPlaces,
    ])

    // =========================================
    // Search
    // =========================================

    const handleSearch =
        useCallback(
            keyword => {
                // Search always starts from
                // page 1.

                loadPlaces({
                    page:
                        1,

                    // Keep current page size.
                    limit:
                        pagination
                            .pageSize,

                    keyword:
                        keyword ||
                        '',
                })
            },
            [
                loadPlaces,
                pagination
                    .pageSize,
            ]
        )

    // =========================================
    // Pagination Change
    // =========================================

    const handlePaginationChange =
        useCallback(
            (
                page,
                pageSize
            ) => {
                loadPlaces({
                    // Selected page
                    page,

                    // Selected page size
                    limit:
                        pageSize,

                    // Keep current search
                    keyword:
                        currentKeyword,
                })
            },
            [
                loadPlaces,
                currentKeyword,
            ]
        )

    // =========================================
    // Missing Album ID
    // =========================================

    if (!albumId) {
        return (
            <Card className='dark:border-slate-700 dark:bg-slate-900'>
                <Empty description='Album ID was not found.' />

                <div className='mt-4 flex justify-center'>
                    <Button
                        onClick={() =>
                            navigate(
                                '/album?tab=sets'
                            )
                        }
                    >
                        Back
                    </Button>
                </div>
            </Card>
        )
    }

    // =========================================
    // Missing Album Set ID
    // =========================================

    if (!albumSetId) {
        return (
            <Card className='dark:border-slate-700 dark:bg-slate-900'>
                <Empty
                    description={
                        <>
                            Album Set ID
                            was not found.

                            <div className='mt-2 text-xs text-gray-500'>
                                Open this
                                album from
                                an Album Set.
                            </div>
                        </>
                    }
                />

                <div className='mt-4 flex justify-center'>
                    <Button
                        onClick={() =>
                            navigate(
                                '/album?tab=sets'
                            )
                        }
                    >
                        Back to Album Sets
                    </Button>
                </div>
            </Card>
        )
    }

    // =========================================
    // Render
    // =========================================

    return (
        <>
            <AlbumUsageTable
                // =============================
                // Album
                // =============================

                album={
                    currentAlbum
                }

                // =============================
                // Current Page Locations
                // =============================

                places={
                    places
                }

                // =============================
                // API: totalRecords
                // Example: 1293
                // =============================

                total={
                    pagination
                        .totalRecords
                }

                // =============================
                // API: currentPage
                // Example: 1
                // =============================

                page={
                    pagination
                        .currentPage
                }

                // =============================
                // API: pageSize
                // Example: 10
                // =============================

                limit={
                    pagination
                        .pageSize
                }

                // =============================
                // Current Search
                // =============================

                keyword={
                    currentKeyword
                }

                // =============================
                // Loading
                // =============================

                loading={
                    Boolean(
                        loading ||
                        loadingAlbumPlaces
                    )
                }

                // =============================
                // Search
                // =============================

                onSearch={
                    handleSearch
                }

                // =============================
                // Pagination
                // =============================

                onPaginationChange={
                    handlePaginationChange
                }
            />
        </>
    )
}

export default AlbumDetail