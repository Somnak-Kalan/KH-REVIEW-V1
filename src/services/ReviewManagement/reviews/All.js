import httpCommon
    from '../../../utils/http-common'

const getAuthorizationHeaders = (
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

const ListAllReview =
    async (
        payload = {}
    ) => {
        try {
            const response =
                await httpCommon.get(
                    '/place-reviews',
                    {
                        params: {
                            ...(
                                payload?.doc ||
                                {}
                            ),
                        },

                        headers:
                            getAuthorizationHeaders(
                                payload
                                    ?.access_token
                            ),
                    }
                )

            return response.data
        } catch (error) {
            console.error(
                'Error fetching place reviews:',
                error?.response
                    ?.data ||
                error?.message
            )

            throw error
        }
    }

const GetReviewDetail =
    async (
        payload = {}
    ) => {
        const reviewId =
            payload?.id ||
            payload?._id

        if (!reviewId) {
            throw new Error(
                'Review ID is required'
            )
        }

        try {
            const response =
                await httpCommon.get(
                    `/place-reviews/${encodeURIComponent(
                        reviewId
                    )}`,
                    {
                        params: {
                            page: 1,
                            limit: 20,
                            ...(
                                payload?.doc ||
                                {}
                            ),
                        },

                        headers:
                            getAuthorizationHeaders(
                                payload
                                    ?.access_token
                            ),
                    }
                )

            return response.data
        } catch (error) {
            console.error(
                'Error fetching review detail:',
                error?.response
                    ?.data ||
                error?.message
            )

            throw error
        }
    }

const AllReviewServices = {
    ListAllReview,
    GetReviewDetail,
}

export default AllReviewServices