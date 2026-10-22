import {
    create,
} from 'zustand'

import ReviewActionServices
    from '../../../services/ReviewManagement/reviews/Action'

const getErrorMessage = (
    error
) => {
    return (
        error?.response
            ?.data?.message ||
        error?.response
            ?.data?.error ||
        error?.response
            ?.data?.msg ||
        error?.message ||
        'Something went wrong'
    )
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

const normalizeAction = (
    value
) => {
    const action =
        String(
            value ||
            ''
        )
            .trim()
            .toLowerCase()

    const aliases = {
        active:
            'approve',

        approved:
            'approve',

        hidden:
            'hide',

        rejected:
            'reject',
    }

    return (
        aliases[action] ||
        action
    )
}

const useReviewActionStore =
    create(
        (
            set,
            get
        ) => ({
            updatingId:
                null,

            updatingAction:
                '',

            error:
                null,

            lastResponse:
                null,

            executeAction:
                async ({
                    id,
                    action,
                    request,
                }) => {
                    if (!id) {
                        throw new Error(
                            'Review ID is required'
                        )
                    }

                    if (
                        typeof request !==
                        'function'
                    ) {
                        throw new Error(
                            'Review action request is required'
                        )
                    }

                    set({
                        updatingId:
                            id,

                        updatingAction:
                            action,

                        error:
                            null,
                    })

                    try {
                        const response =
                            await request()

                        set({
                            lastResponse:
                                response,

                            error:
                                null,
                        })

                        return response
                    } catch (
                    error
                    ) {
                        set({
                            error:
                                getErrorMessage(
                                    error
                                ),
                        })

                        throw error
                    } finally {
                        const state =
                            get()

                        if (
                            state
                                .updatingId ===
                            id
                        ) {
                            set({
                                updatingId:
                                    null,

                                updatingAction:
                                    '',
                            })
                        }
                    }
                },

            updateReviewContent:
                async (
                    payload = {}
                ) => {
                    const reviewId =
                        getReviewId(
                            payload
                        )

                    return get()
                        .executeAction({
                            id:
                                reviewId,

                            action:
                                'edit',

                            request:
                                () => {
                                    return ReviewActionServices
                                        .UpdateReviewContent(
                                            {
                                                ...payload,

                                                id:
                                                    reviewId,
                                            }
                                        )
                                },
                        })
                },

            approveReview:
                async (
                    payload = {}
                ) => {
                    const reviewId =
                        getReviewId(
                            payload
                        )

                    return get()
                        .executeAction({
                            id:
                                reviewId,

                            action:
                                'approve',

                            request:
                                () => {
                                    return ReviewActionServices
                                        .ApproveReview(
                                            {
                                                ...payload,

                                                id:
                                                    reviewId,
                                            }
                                        )
                                },
                        })
                },

            hideReview:
                async (
                    payload = {}
                ) => {
                    const reviewId =
                        getReviewId(
                            payload
                        )

                    return get()
                        .executeAction({
                            id:
                                reviewId,

                            action:
                                'hide',

                            request:
                                () => {
                                    return ReviewActionServices
                                        .HideReview(
                                            {
                                                ...payload,

                                                id:
                                                    reviewId,
                                            }
                                        )
                                },
                        })
                },

            rejectReview:
                async (
                    payload = {}
                ) => {
                    const reviewId =
                        getReviewId(
                            payload
                        )

                    return get()
                        .executeAction({
                            id:
                                reviewId,

                            action:
                                'reject',

                            request:
                                () => {
                                    return ReviewActionServices
                                        .RejectReview(
                                            {
                                                ...payload,

                                                id:
                                                    reviewId,
                                            }
                                        )
                                },
                        })
                },

            updateReviewStatus:
                async (
                    payload = {}
                ) => {
                    const action =
                        normalizeAction(
                            payload
                                ?.action ||
                            payload
                                ?.targetStatus ||
                            payload
                                ?.status
                        )

                    if (
                        action ===
                        'approve'
                    ) {
                        return get()
                            .approveReview(
                                payload
                            )
                    }

                    if (
                        action ===
                        'hide'
                    ) {
                        return get()
                            .hideReview(
                                payload
                            )
                    }

                    if (
                        action ===
                        'reject'
                    ) {
                        return get()
                            .rejectReview(
                                payload
                            )
                    }

                    throw new Error(
                        `Unsupported review action: ${action || 'unknown'}`
                    )
                },

            clearActionError:
                () => {
                    set({
                        error:
                            null,
                    })
                },

            resetActionState:
                () => {
                    set({
                        updatingId:
                            null,

                        updatingAction:
                            '',

                        error:
                            null,

                        lastResponse:
                            null,
                    })
                },
        })
    )

export default useReviewActionStore