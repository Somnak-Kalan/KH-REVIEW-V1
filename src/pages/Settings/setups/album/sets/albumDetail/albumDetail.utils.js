// =============================================
// Generic ID
// =============================================

export const getId =
    value => {
        if (!value) {
            return null
        }

        if (
            typeof value ===
            'string'
        ) {
            return value
        }

        return (
            value?._id ||
            value?.id ||
            value?.albumId ||
            value?.setId ||
            null
        )
    }

// =============================================
// Album Sub Categories
// =============================================

export const getSubCategoryIds =
    album => {
        const raw =
            album?.subCategory ||
            []

        if (
            !Array.isArray(raw)
        ) {
            return []
        }

        return raw
            .map(item => {
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
            })
            .filter(Boolean)
    }

// =============================================
// Generic Display Name
// =============================================

export const getDisplayName =
    value => {
        if (!value) {
            return '-'
        }

        if (
            typeof value ===
            'string'
        ) {
            return value
        }

        return (
            value?.nameEn ||
            value?.nameKh ||
            value?.name ||
            value?.title ||
            '-'
        )
    }

// =============================================
// Khmer Name
// =============================================

export const getDisplayKhmer =
    value => {
        if (!value) {
            return ''
        }

        if (
            typeof value ===
            'string'
        ) {
            return value
        }

        return (
            value?.nameKh ||
            value?.nameKhmer ||
            value?.nameEn ||
            value?.name ||
            ''
        )
    }

// =============================================
// User Name
// =============================================

export const getUserName =
    value => {
        if (!value) {
            return '-'
        }

        if (
            typeof value ===
            'string'
        ) {
            return value
        }

        const fullName = [
            value?.firstName,
            value?.lastName,
        ]
            .filter(Boolean)
            .join(' ')
            .trim()

        return (
            value?.username ||
            fullName ||
            value?.name ||
            '-'
        )
    }

// =============================================
// Array Text
// =============================================

export const getArrayText = (
    value,
    language = 'kh'
) => {
    if (!value) {
        return '-'
    }

    const list =
        Array.isArray(value)
            ? value
            : [value]

    const result = list
        .map(item => {
            if (
                typeof item ===
                'string'
            ) {
                return item
            }

            if (
                language === 'kh'
            ) {
                return (
                    item?.nameKh ||
                    item?.nameEn ||
                    item?.name ||
                    ''
                )
            }

            return (
                item?.nameEn ||
                item?.nameKh ||
                item?.name ||
                ''
            )
        })
        .filter(Boolean)
        .join(', ')

    return result || '-'
}

// =============================================
// Property Image
// =============================================

export const getImageUrl =
    record => {
        if (!record) {
            return ''
        }

        const candidates = [
            record?.profileImage,
            record?.profile,
            record?.logo,
            record?.thumbnail,
            record?.image,
            record?.cover,
            record?.media?.cover,
        ]

        for (
            const value of
            candidates
        ) {
            if (!value) {
                continue
            }

            if (
                typeof value ===
                'string'
            ) {
                return value
            }

            const url =
                value?.url ||
                value?.path ||
                value?.file ||
                value?.original

            if (url) {
                return url
            }
        }

        const galleryCandidates = [
            record?.gallery,
            record?.galleries,
            record?.images,
            record?.media
                ?.gallery,
        ]

        for (
            const list of
            galleryCandidates
        ) {
            if (
                !Array.isArray(list)
            ) {
                continue
            }

            for (
                const item of list
            ) {
                if (
                    typeof item ===
                    'string'
                ) {
                    return item
                }

                const url =
                    item?.url ||
                    item?.path ||
                    item?.file

                if (url) {
                    return url
                }

                if (
                    Array.isArray(
                        item?.files
                    ) &&
                    item.files.length >
                    0
                ) {
                    const firstFile =
                        item.files[0]

                    if (
                        typeof firstFile ===
                        'string'
                    ) {
                        return firstFile
                    }

                    return (
                        firstFile?.url ||
                        firstFile?.path ||
                        firstFile?.file ||
                        ''
                    )
                }
            }
        }

        return ''
    }

// =============================================
// Extract Array
// =============================================

const extractArray =
    value => {
        if (
            Array.isArray(value)
        ) {
            return value
        }

        if (
            Array.isArray(
                value?.data
            )
        ) {
            return value.data
        }

        if (
            Array.isArray(
                value?.docs
            )
        ) {
            return value.docs
        }

        if (
            Array.isArray(
                value?.results
            )
        ) {
            return value.results
        }

        if (
            Array.isArray(
                value?.items
            )
        ) {
            return value.items
        }

        return null
    }

// =============================================
// Places Using Album
// =============================================

export const getPlacesUsingAlbum =
    album => {
        if (!album) {
            return []
        }

        const candidates = [
            album?.placesUsingAlbum,
            album?.places,
            album?.usedByPlaces,
            album?.usedPlaces,
            album?.properties,
            album?.placeUses,
            album?.placeUsage,
            album?.usage,
            album?.usedBy,
        ]

        for (
            const candidate of
            candidates
        ) {
            const result =
                extractArray(
                    candidate
                )

            if (result) {
                return result
            }
        }

        return []
    }

// =============================================
// Usage Count
// =============================================

export const getPlaceUsageCount = (
    album,
    places = []
) => {
    const candidates = [
        album?.placeUsageCount,
        album?.usedPlaceCount,
        album?.placeCount,
        album?.usageCount,
        album?.totalPlaces,
        album?.placesCount,
        album?.placeUsage?.total,
        album?.usage?.total,
        album?.usedBy?.total,
    ]

    const found =
        candidates.find(
            value =>
                value !==
                undefined &&
                value !== null &&
                !Number.isNaN(
                    Number(value)
                )
        )

    if (
        found !== undefined
    ) {
        return Number(found)
    }

    return Array.isArray(
        places
    )
        ? places.length
        : 0
}

// =============================================
// IMPORTANT REMOVE RULE
// =============================================

export const canRemoveAlbumFromSet = (
    album,
    places = []
) => {
    const count =
        getPlaceUsageCount(
            album,
            places
        )

    /*
     * Business rule:
     *
     * No place uses album
     * => can remove
     *
     * One or more places use album
     * => cannot remove
     */
    return count === 0
}

// =============================================
// Album Set Name
// =============================================

export const getAlbumSetName =
    album => {
        if (!album) {
            return ''
        }

        if (
            album?.albumSetName
        ) {
            return album.albumSetName
        }

        const albumSet =
            album?.albumSet ||
            album?.albumSetId ||
            album?.set

        if (!albumSet) {
            return ''
        }

        if (
            typeof albumSet ===
            'string'
        ) {
            return ''
        }

        return (
            albumSet?.nameEn ||
            albumSet?.nameKh ||
            albumSet?.name ||
            albumSet?.title ||
            ''
        )
    }

// =============================================
// Status Color
// =============================================

export const getStatusColor =
    status => {
        const normalized =
            String(
                status || ''
            ).toLowerCase()

        if (
            normalized ===
            'pending'
        ) {
            return 'orange'
        }

        if (
            normalized ===
            'active' ||
            normalized ===
            'approved'
        ) {
            return 'green'
        }

        if (
            normalized ===
            'inactive' ||
            normalized ===
            'rejected'
        ) {
            return 'red'
        }

        return 'default'
    }

// =============================================
// Date
// =============================================

export const formatDate =
    value => {
        if (!value) {
            return '-'
        }

        const date =
            new Date(value)

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return '-'
        }

        const year =
            date.getFullYear()

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, '0')

        const day =
            String(
                date.getDate()
            ).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

// =============================================
// Search Place
// =============================================

export const filterPlaces = (
    places,
    search
) => {

    const list =
        Array.isArray(places)
            ? places
            : []

    const keyword =
        String(search || '')
            .trim()
            .toLowerCase()

    if (!keyword) {
        return list
    }

    return list.filter(
        place => {
            const searchableText = [
                place?.placeId,

                place?.nameEn,

                place?.nameKh,

                place?.nickname,

                place?.ownership,

                place?.status,

                getDisplayName(
                    place
                        ?.mainCategory ||
                    place
                        ?.category
                ),

                getArrayText(
                    place
                        ?.subCategory
                ),

                getArrayText(
                    place
                        ?.typeOfPlace
                ),

                getDisplayName(
                    place?.provinceEn || '-'

                ),

                getDisplayName(
                    place?.district ||
                    place
                        ?.address
                        ?.district
                ),

                getDisplayName(
                    place?.commune ||
                    place
                        ?.address
                        ?.commune
                ),

                getUserName(
                    place?.updatedBy
                ),

                getUserName(
                    place?.createdBy
                ),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            return searchableText.includes(
                keyword
            )
        }
    )
}