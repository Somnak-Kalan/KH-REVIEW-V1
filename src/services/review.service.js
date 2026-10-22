// src/services/review.service.js

import dayjs from 'dayjs'
import { mockReviews } from '../pages/ReviewManagement/allReview/review.mock'

const API_URL = import.meta.env.VITE_API_URL || ''

const USE_MOCK =
    String(import.meta.env.VITE_USE_REVIEW_MOCK || 'true') === 'true'

const wait = (time = 350) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time)
    })
}

const createHeaders = (accessToken) => {
    const headers = {
        'Content-Type': 'application/json',
    }

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
    }

    return headers
}

const getReviewStats = (reviews = []) => {
    return {
        total: reviews.length,

        pending: reviews.filter((item) => item.status === 'pending').length,

        active: reviews.filter((item) => item.status === 'active').length,

        hidden: reviews.filter((item) => item.status === 'hidden').length,

        rejected: reviews.filter((item) => item.status === 'rejected').length,
    }
}

const filterMockReviews = (reviews, filters) => {
    const search = String(filters?.search || '')
        .trim()
        .toLowerCase()

    const startDate = filters?.startDate
        ? dayjs(filters.startDate).startOf('day')
        : null

    const endDate = filters?.endDate
        ? dayjs(filters.endDate).endOf('day')
        : null

    return reviews.filter((review) => {
        const searchableValue = [
            review.placeName,
            review.placeCategory,
            review.reviewerName,
            review.reviewerUsername,
            review.review,
        ]
            .join(' ')
            .toLowerCase()

        const matchSearch = !search || searchableValue.includes(search)

        const matchCategory =
            !filters?.category ||
            filters.category === 'all' ||
            review.placeCategory === filters.category

        const matchStatus =
            !filters?.status ||
            filters.status === 'all' ||
            review.status === filters.status

        const matchReviewType =
            !filters?.reviewType ||
            filters.reviewType === 'all' ||
            (filters.reviewType === 'with_photo' && review.hasPhoto) ||
            (filters.reviewType === 'without_photo' && !review.hasPhoto)

        const matchRating =
            !filters?.rating ||
            filters.rating === 'all' ||
            Math.round(Number(review.rating)) === Number(filters.rating)

        const reviewDate = dayjs(review.createdAt)

        const matchStartDate =
            !startDate || reviewDate.isAfter(startDate) || reviewDate.isSame(startDate)

        const matchEndDate =
            !endDate || reviewDate.isBefore(endDate) || reviewDate.isSame(endDate)

        return (
            matchSearch &&
            matchCategory &&
            matchStatus &&
            matchReviewType &&
            matchRating &&
            matchStartDate &&
            matchEndDate
        )
    })
}

const createQueryString = (doc = {}) => {
    const query = new URLSearchParams()

    Object.entries(doc).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            value !== '' &&
            value !== 'all'
        ) {
            query.set(key, String(value))
        }
    })

    return query.toString()
}

const normalizeReviewResponse = (result) => {
    const payload = result?.data ?? result ?? {}

    const items =
        payload?.items ||
        payload?.reviews ||
        payload?.results ||
        payload?.list ||
        []

    const total =
        payload?.total ||
        payload?.totalCount ||
        payload?.pagination?.total ||
        items.length

    const stats = payload?.stats || getReviewStats(items)

    return {
        items,
        total: Number(total),
        stats,
    }
}

const ReviewService = {
    async getReviewById({
        access_token,
        id,
    }) {
        if (!id) {
            throw new Error('Review ID is required')
        }

        if (USE_MOCK) {
            await wait(300)

            const review = mockReviews.find(
                (item) => item?._id === id
            )

            if (!review) {
                throw new Error('Review not found')
            }

            return createMockReviewDetail(review)
        }

        const response = await fetch(
            `${API_URL}/reviews/${id}`,
            {
                method: 'GET',
                headers: createHeaders(access_token),
            }
        )

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => null)

            throw new Error(
                errorData?.message ||
                'Unable to get review detail'
            )
        }

        const result = await response.json()

        return result?.data ?? result
    },

    async updateReviewContent({
        access_token,
        id,
        review,
    }) {
        if (!id) {
            throw new Error('Review ID is required')
        }

        if (!review?.trim()) {
            throw new Error(
                'Review content is required'
            )
        }

        if (USE_MOCK) {
            await wait(250)

            const reviewIndex =
                mockReviews.findIndex(
                    (item) => item?._id === id
                )

            if (reviewIndex < 0) {
                throw new Error('Review not found')
            }

            mockReviews[reviewIndex] = {
                ...mockReviews[reviewIndex],
                review: review.trim(),
                updatedBy: 'Admin (name)',
                updatedAt: new Date().toISOString(),
            }

            return createMockReviewDetail(
                mockReviews[reviewIndex]
            )
        }

        const response = await fetch(
            `${API_URL}/reviews/${id}`,
            {
                method: 'PATCH',
                headers: createHeaders(access_token),
                body: JSON.stringify({
                    review: review.trim(),
                }),
            }
        )

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => null)

            throw new Error(
                errorData?.message ||
                'Unable to update review'
            )
        }

        const result = await response.json()

        return result?.data ?? result
    },
    async updateReviewStatus({
        access_token,
        id,
        status,
        reason = '',
    }) {
        if (!id) {
            throw new Error('Review ID is required')
        }

        if (!status) {
            throw new Error(
                'Review status is required'
            )
        }

        if (USE_MOCK) {
            await wait(250)

            const reviewIndex =
                mockReviews.findIndex(
                    (review) => review?._id === id
                )

            if (reviewIndex < 0) {
                throw new Error('Review not found')
            }

            const updatedAt =
                new Date().toISOString()

            const moderation = {
                ...mockReviews[reviewIndex]
                    ?.moderation,
            }

            if (status === 'active') {
                moderation.approvedBy =
                    'Admin (name)'

                moderation.approvedAt =
                    updatedAt
            }

            if (status === 'hidden') {
                moderation.reason = reason
                moderation.hiddenBy =
                    'Admin (name)'
                moderation.hiddenAt = updatedAt
            }

            if (status === 'rejected') {
                moderation.reason = reason
                moderation.rejectedBy =
                    'Admin (name)'
                moderation.rejectedAt =
                    updatedAt
            }

            mockReviews[reviewIndex] = {
                ...mockReviews[reviewIndex],
                status,
                moderation,
                updatedBy: 'Admin (name)',
                updatedAt,
            }

            return createMockReviewDetail(
                mockReviews[reviewIndex]
            )
        }

        const response = await fetch(
            `${API_URL}/reviews/${id}/status`,
            {
                method: 'PATCH',
                headers: createHeaders(access_token),

                body: JSON.stringify({
                    status,
                    reason,
                }),
            }
        )

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => null)

            throw new Error(
                errorData?.message ||
                'Unable to update review status'
            )
        }

        const result = await response.json()

        return result?.data ?? result
    },
    async getReviews({ access_token, doc = {} }) {
        if (USE_MOCK) {
            await wait()

            const filteredReviews = filterMockReviews(mockReviews, doc)

            const page = Number(doc.page || 1)
            const limit = Number(doc.limit || 10)
            const startIndex = (page - 1) * limit
            const endIndex = startIndex + limit

            return {
                items: filteredReviews.slice(startIndex, endIndex),
                total: filteredReviews.length,
                stats: getReviewStats(mockReviews),
            }
        }

        const queryString = createQueryString(doc)

        const response = await fetch(
            `${API_URL}/reviews${queryString ? `?${queryString}` : ''}`,
            {
                method: 'GET',
                headers: createHeaders(access_token),
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => null)

            throw new Error(
                errorData?.message || 'Unable to get review information'
            )
        }

        const result = await response.json()

        return normalizeReviewResponse(result)
    },

    async updateReviewStatus({ access_token, id, status }) {
        if (!id) {
            throw new Error('Review ID is required')
        }

        if (!status) {
            throw new Error('Review status is required')
        }

        if (USE_MOCK) {
            await wait(250)

            const reviewIndex = mockReviews.findIndex(
                (review) => review._id === id
            )

            if (reviewIndex < 0) {
                throw new Error('Review not found')
            }

            mockReviews[reviewIndex] = {
                ...mockReviews[reviewIndex],
                status,
            }

            return mockReviews[reviewIndex]
        }

        const response = await fetch(
            `${API_URL}/reviews/${id}/status`,
            {
                method: 'PATCH',
                headers: createHeaders(access_token),
                body: JSON.stringify({
                    status,
                }),
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => null)

            throw new Error(
                errorData?.message || 'Unable to update review status'
            )
        }

        const result = await response.json()

        return result?.data ?? result
    },
}
const createMockReviewDetail = (review) => {
    const currentDate = new Date().toISOString()

    const moderation = {
        reason: '',
        approvedBy: '',
        approvedAt: null,
        hiddenBy: '',
        hiddenAt: null,
        rejectedBy: '',
        rejectedAt: null,
    }

    if (review?.status === 'active') {
        moderation.approvedBy = 'Admin (name)'
        moderation.approvedAt =
            review?.updatedAt ||
            review?.createdAt ||
            currentDate
    }

    if (review?.status === 'hidden') {
        moderation.reason =
            'Spam or excessive promotion'

        moderation.hiddenBy = 'Admin (name)'

        moderation.hiddenAt =
            review?.updatedAt ||
            currentDate
    }

    if (review?.status === 'rejected') {
        moderation.reason =
            'Review does not follow the community policy'

        moderation.rejectedBy = 'Admin (name)'

        moderation.rejectedAt =
            review?.updatedAt ||
            currentDate
    }

    return {
        ...review,

        placeRating:
            review?.placeRating ?? 3.7,

        likeCount:
            review?.likeCount ?? 3,

        reports:
            review?.reports || [
                {
                    _id: 'report-001',
                    reportedBy: 'Chan narak',
                    reason: 'Spam',
                    createdAt: '2025-01-23',
                },
                {
                    _id: 'report-002',
                    reportedBy: 'Dara ratt',
                    reason: 'False information',
                    createdAt: '2025-01-23',
                },
                {
                    _id: 'report-003',
                    reportedBy: 'Sok Dara',
                    reason: 'Advertising',
                    createdAt: '2025-01-24',
                },
            ],

        location:
            review?.location || {
                name:
                    review?.placeName ||
                    'Mountain View Diner',

                description:
                    'Popular location with beautiful scenery and excellent service.',

                image:
                    review?.photos?.[0] || '',

                verified: true,

                tags: [
                    'Restaurant',
                    'Attraction',
                    'Popular place',
                ],

                address: 'Phnom Penh',
            },

        moderation:
            review?.moderation || moderation,
    }

}


export default ReviewService