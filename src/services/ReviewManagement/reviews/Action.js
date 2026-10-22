import httpCommon
    from '../../../utils/http-common'

const hasOwnProperty = (
    object,
    property
) => {
    return Object.prototype
        .hasOwnProperty
        .call(
            object,
            property
        )
}

const getAuthorizationHeaders = (
    accessToken
) => {
    if (!accessToken) {
        return {}
    }

    return {
        Authorization:
            `Bearer ${accessToken}`,

        'Content-Type':
            'application/json',
    }
}

const getReviewId = (
    payload = {}
) => {
    return (
        payload?.id ||
        payload?._id ||
        payload?.reviewId ||
        ''
    )
}

const getRequestParams = (
    doc = {}
) => {
    return {
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
    }
}

const normalizeRemoveMedia = (
    values
) => {
    if (
        !Array.isArray(
            values
        )
    ) {
        return []
    }

    return [
        ...new Set(
            values
                .map(
                    (
                        value
                    ) => {
                        if (
                            typeof value ===
                            'string'
                        ) {
                            return value.trim()
                        }

                        if (
                            !value ||
                            typeof value !==
                            'object'
                        ) {
                            return ''
                        }

                        return String(
                            value?.key ||
                            value?.url ||
                            value?.path ||
                            value?.imageUrl ||
                            ''
                        ).trim()
                    }
                )
                .filter(
                    Boolean
                )
        ),
    ]
}

const validatePayload = (
    payload = {}
) => {
    if (
        !payload?.access_token
    ) {
        throw new Error(
            'Access token is required'
        )
    }

    const reviewId =
        getReviewId(
            payload
        )

    if (!reviewId) {
        throw new Error(
            'Review ID is required'
        )
    }

    return reviewId
}

const buildUpdateContentBody = (
    payload = {}
) => {
    const requestBody = {}

    /*
     * Include comment only when it exists
     * in the supplied payload.
     *
     * null means remove the comment.
     * string means replace the comment.
     */
    if (
        hasOwnProperty(
            payload,
            'comment'
        )
    ) {
        if (
            payload.comment ===
            null
        ) {
            requestBody.comment =
                null
        } else if (
            typeof payload.comment ===
            'string'
        ) {
            const normalizedComment =
                payload.comment.trim()

            requestBody.comment =
                normalizedComment ||
                null
        } else {
            throw new Error(
                'Comment must be a string or null'
            )
        }
    }

    /*
     * Include removeMedia only when
     * at least one image was removed.
     */
    const removeMedia =
        normalizeRemoveMedia(
            payload?.removeMedia
        )

    if (
        removeMedia.length >
        0
    ) {
        requestBody.removeMedia =
            removeMedia
    }

    if (
        Object.keys(
            requestBody
        ).length === 0
    ) {
        throw new Error(
            'No review content changes were provided'
        )
    }

    return requestBody
}

const UpdateReviewContent =
    async (
        payload = {}
    ) => {
        const reviewId =
            validatePayload(
                payload
            )

        const requestBody =
            buildUpdateContentBody(
                payload
            )

        try {
            const response =
                await httpCommon.patch(
                    `/place-reviews/${encodeURIComponent(
                        reviewId
                    )}/content`,

                    requestBody,

                    {
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
                'Error updating review content:',
                error?.response
                    ?.data ||
                error?.message
            )

            throw error
        }
    }

const ApproveReview =
    async (
        payload = {}
    ) => {
        const reviewId =
            validatePayload(
                payload
            )

        try {
            const response =
                await httpCommon.post(
                    `/place-reviews/${encodeURIComponent(
                        reviewId
                    )}/approve`,

                    {},

                    {
                        params:
                            getRequestParams(
                                payload?.doc
                            ),

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
                'Error approving review:',
                error?.response
                    ?.data ||
                error?.message
            )

            throw error
        }
    }

const HideReview =
    async (
        payload = {}
    ) => {
        const reviewId =
            validatePayload(
                payload
            )

        try {
            const response =
                await httpCommon.post(
                    `/place-reviews/${encodeURIComponent(
                        reviewId
                    )}/hide`,

                    {
                        reason:
                            payload?.reason ||
                            '',
                    },

                    {
                        params:
                            getRequestParams(
                                payload?.doc
                            ),

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
                'Error hiding review:',
                error?.response
                    ?.data ||
                error?.message
            )

            throw error
        }
    }

const RejectReview =
    async (
        payload = {}
    ) => {
        const reviewId =
            validatePayload(
                payload
            )

        try {
            const response =
                await httpCommon.post(
                    `/place-reviews/${encodeURIComponent(
                        reviewId
                    )}/reject`,

                    {
                        reason:
                            payload?.reason ||
                            '',
                    },

                    {
                        params:
                            getRequestParams(
                                payload?.doc
                            ),

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
                'Error rejecting review:',
                error?.response
                    ?.data ||
                error?.message
            )

            throw error
        }
    }

const ReviewActionServices = {
    UpdateReviewContent,
    ApproveReview,
    HideReview,
    RejectReview,
}

export default ReviewActionServices