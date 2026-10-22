// src/Stores/review/review.store.js

import { create } from 'zustand'
import ReviewService from '../../services/review.service'
import { EMPTY_REVIEW_STATS } from '../../pages/ReviewManagement/allReview/review.constants'

const useReviewStore = create((set) => ({
    reviews: [],

    total: 0,

    stats: {
        ...EMPTY_REVIEW_STATS,
    },

    loading: false,

    updatingId: null,

    error: null,

    selectedReview: null,

    setSelectedReview: (review) => {
        set({
            selectedReview: review,
        })
    },

    clearSelectedReview: () => {
        set({
            selectedReview: null,
        })
    },

    fetchReviews: async ({ access_token, doc = {} }) => {
        set({
            loading: true,
            error: null,
        })

        try {
            const result = await ReviewService.getReviews({
                access_token,
                doc,
            })

            set({
                reviews: result?.items || [],
                total: Number(result?.total || 0),
                stats: {
                    ...EMPTY_REVIEW_STATS,
                    ...(result?.stats || {}),
                },
            })

            return result
        } catch (error) {
            set({
                reviews: [],
                total: 0,
                error: error?.message || 'Unable to load reviews',
            })

            throw error
        } finally {
            set({
                loading: false,
            })
        }
    },

    updateReviewStatus: async ({
        access_token,
        id,
        status,
    }) => {
        set({
            updatingId: id,
            error: null,
        })

        try {
            const updatedReview =
                await ReviewService.updateReviewStatus({
                    access_token,
                    id,
                    status,
                })

            set((state) => ({
                reviews: state.reviews.map((review) => {
                    if (review._id !== id) {
                        return review
                    }

                    return {
                        ...review,
                        ...updatedReview,
                        status,
                    }
                }),

                selectedReview:
                    state.selectedReview?._id === id
                        ? {
                            ...state.selectedReview,
                            ...updatedReview,
                            status,
                        }
                        : state.selectedReview,
            }))

            return updatedReview
        } catch (error) {
            set({
                error:
                    error?.message || 'Unable to update review status',
            })

            throw error
        } finally {
            set({
                updatingId: null,
            })
        }
    },
}))

export default useReviewStore