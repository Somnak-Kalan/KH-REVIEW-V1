import httpCommon
    from '../../../../utils/http-common'

const getAuthorizationHeader = (
    accessToken
) => {
    if (!accessToken) {
        return {}
    }

    return {
        Authorization:
            `Bearer ${accessToken}`,
    }
}

const hasValue = (
    value
) => {
    return (
        value !== undefined &&
        value !== null &&
        value !== ''
    )
}

const isAllValue = (
    value
) => {
    return (
        String(
            value ||
            ''
        )
            .trim()
            .toLowerCase() ===
        'all'
    )
}

const removeEmptyParams = (
    params = {}
) => {
    return Object.fromEntries(
        Object.entries(
            params
        ).filter(
            (
                [
                    ,
                    value,
                ]
            ) => {
                return (
                    hasValue(
                        value
                    ) &&
                    !isAllValue(
                        value
                    )
                )
            }
        )
    )
}

const getPlaceReviewList =
    async ({
        access_token,
        placeId,
        doc = {},
    } = {}) => {
        if (!access_token) {
            throw new Error(
                'Access token is required'
            )
        }

        if (!placeId) {
            throw new Error(
                'Place ID is required'
            )
        }

        const params =
            removeEmptyParams({
                placeId,

                page:
                    Number(
                        doc?.page
                    ) ||
                    1,

                limit:
                    Number(
                        doc?.limit
                    ) ||
                    20,

                status:
                    doc?.status,

                userRating:
                    doc?.userRating,

                reviewType:
                    doc?.reviewType,

                sort:
                    doc?.sort ||
                    'latest',
            })

        try {
            const response =
                await httpCommon.get(
                    '/place-reviews',
                    {
                        params,

                        headers:
                            getAuthorizationHeader(
                                access_token
                            ),
                    }
                )

            return (
                response?.data ||
                response ||
                {}
            )
        } catch (
        error
        ) {
            console.error(
                'Unable to get place review list:',
                error?.response
                    ?.data ||
                error?.message
            )

            throw error
        }
    }

const PlaceReviewService = {
    getPlaceReviewList,
}

export default PlaceReviewService