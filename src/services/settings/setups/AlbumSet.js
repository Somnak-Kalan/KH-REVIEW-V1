import httpCommon from '../../../utils/http-common'

const BASE_PATH =
    '/setup/album-set'

const ALBUM_PATH =
    '/setup/album'

// =========================================
// Auth Config
// =========================================

const getAuthConfig = (
    access_token,
    extraConfig = {}
) => {
    if (!access_token) {
        throw new Error(
            'Access token is required.'
        )
    }

    return {
        ...extraConfig,

        headers: {
            ...extraConfig.headers,

            Authorization:
                `Bearer ${access_token}`,

            'Content-Type':
                'application/json',
        },
    }
}

// =========================================
// Album Set Services
// =========================================

const AlbumSetServices = {
    /**
     * GET
     * /api/core/setup/album-set/list
     *
     * Optional:
     * ?search=restaurant
     */
    fetchAlbumSets: ({
        access_token,
        doc = {},
    }) => {
        const search =
            String(
                doc?.search || ''
            ).trim()

        return httpCommon.get(
            `${BASE_PATH}/list`,
            getAuthConfig(
                access_token,
                {
                    params: search
                        ? {
                            search,
                        }
                        : {},
                }
            )
        )
    },

    /**
     * GET
     * /api/core/setup/album-set/:_id
     */
    fetchAlbumSetById: ({
        access_token,
        _id,
    }) => {
        if (!_id) {
            throw new Error(
                'Album set ID is required.'
            )
        }

        return httpCommon.get(
            `${BASE_PATH}/${_id}`,
            getAuthConfig(
                access_token
            )
        )
    },

    /**
     * POST
     * /api/core/setup/album-set/create
     */
    createAlbumSet: ({
        access_token,
        doc,
    }) => {
        return httpCommon.post(
            `${BASE_PATH}/create`,
            doc,
            getAuthConfig(
                access_token
            )
        )
    },

    /**
     * PUT
     * /api/core/setup/album-set/update
     *
     * Body:
     * {
     *   _id,
     *   nameEn,
     *   nameKh,
     *   albums: []
     * }
     */
    updateAlbumSet: ({
        access_token,
        doc,
    }) => {
        return httpCommon.put(
            `${BASE_PATH}/update`,
            doc,
            getAuthConfig(
                access_token
            )
        )
    },

    /**
     * DELETE
     * /api/core/setup/album-set/:_id
     */
    removeAlbumSet: ({
        access_token,
        _id,
    }) => {
        if (!_id) {
            throw new Error(
                'Album set ID is required.'
            )
        }

        return httpCommon.delete(
            `${BASE_PATH}/${_id}`,
            getAuthConfig(
                access_token
            )
        )
    },

    // =========================================
    // Places Of Album
    // =========================================

    /**
     * POST
     * /api/core/setup/album/places
     *
     * Body:
     * {
     *   albumSetId,
     *   albumId,
     *   page,
     *   limit,
     *   keyword
     * }
     */
    fetchAlbumPlaces: ({
        access_token,
        doc = {},
    }) => {
        const albumSetId =
            String(
                doc?.albumSetId ||
                ''
            ).trim()

        const albumId =
            String(
                doc?.albumId ||
                ''
            ).trim()

        const page =
            Math.max(
                1,
                Number(
                    doc?.page
                ) || 1
            )

        const limit =
            Math.max(
                1,
                Number(
                    doc?.limit
                ) || 10
            )

        const keyword =
            String(
                doc?.keyword ||
                ''
            ).trim()

        if (!albumSetId) {
            throw new Error(
                'Album set ID is required.'
            )
        }

        if (!albumId) {
            throw new Error(
                'Album ID is required.'
            )
        }

        const requestBody = {
            albumSetId,
            albumId,
            page,
            limit,
            keyword,
        }

        return httpCommon.post(
            `${ALBUM_PATH}/places`,
            requestBody,
            getAuthConfig(
                access_token
            )
        )
    },
}

export default AlbumSetServices