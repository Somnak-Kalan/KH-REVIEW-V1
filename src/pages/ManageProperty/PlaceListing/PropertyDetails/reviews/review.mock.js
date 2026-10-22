// src/pages/ManageProperty/PlaceListing/PropertyDetails/
// reviews/review.mock.js

export const MOCK_REVIEW_IMAGES = [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600',
    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600',
    'https://images.unsplash.com/photo-1609902726285-00668009f004?w=600',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600',
]

export const MOCK_REVIEWS = [
    {
        _id: 'review-active-001',

        status: 'active',

        rating: 3.7,

        ratingBreakdown: {
            food: 2,
            service: 1,
            atmosphere: 3,
            value: 4,
        },

        reviewerName: 'Dara',

        reviewerUsername: '@dara',

        reviewerAvatar:
            'https://randomuser.me/api/portraits/men/32.jpg',

        review:
            'The location is beautiful and the environment is comfortable. The service was good and the staff were friendly.',

        photos: [],

        reportCount: 0,

        reports: [],

        likeCount: 0,

        createdAt:
            '2026-07-15T08:00:00.000Z',

        updatedAt:
            '2026-07-15T08:00:00.000Z',
    },

    {
        _id: 'review-hidden-001',

        status: 'hidden',

        rating: 3.7,

        ratingBreakdown: {
            food: 2,
            service: 1,
            atmosphere: 3,
            value: 4,
        },

        reviewerName: 'Dara',

        reviewerUsername: '@dara',

        reviewerAvatar:
            'https://randomuser.me/api/portraits/men/32.jpg',

        review:
            'The place has many interesting views. I enjoyed taking photos and walking around the area.',

        photos: MOCK_REVIEW_IMAGES,

        reportCount: 3,

        reports: [
            {
                _id: 'report-001',

                reporterName:
                    'Chan Narak',

                reason: 'Spam',

                createdAt:
                    '2026-07-20T10:00:00.000Z',
            },

            {
                _id: 'report-002',

                reporterName:
                    'Dara Ratt',

                reason:
                    'False information',

                createdAt:
                    '2026-07-20T11:20:00.000Z',
            },

            {
                _id: 'report-003',

                reporterName:
                    'Sok Piseth',

                reason:
                    'Inappropriate content',

                createdAt:
                    '2026-07-21T09:30:00.000Z',
            },
        ],

        likeCount: 3,

        createdAt:
            '2026-07-15T08:00:00.000Z',

        updatedAt:
            '2026-07-21T09:30:00.000Z',
    },

    {
        _id: 'review-pending-001',

        status: 'pending',

        rating: 3.7,

        ratingBreakdown: {
            food: 2,
            service: 1,
            atmosphere: 3,
            value: 4,
        },

        reviewerName: 'Dara',

        reviewerUsername: '@dara',

        reviewerAvatar:
            'https://randomuser.me/api/portraits/men/32.jpg',

        review:
            'Good place for visiting with friends and family. The atmosphere was calm and relaxing.',

        photos: MOCK_REVIEW_IMAGES,

        reportCount: 0,

        reports: [],

        likeCount: 0,

        createdAt:
            '2026-07-16T08:00:00.000Z',

        updatedAt:
            '2026-07-16T08:00:00.000Z',
    },

    {
        _id: 'review-pending-002',

        status: 'pending',

        rating: 4.2,

        ratingBreakdown: {
            food: 4,
            service: 4,
            atmosphere: 5,
            value: 4,
        },

        reviewerName: 'Sokha',

        reviewerUsername: '@sokha',

        reviewerAvatar:
            'https://randomuser.me/api/portraits/women/44.jpg',

        review:
            'Very beautiful place. The staff provided excellent service and the area was clean.',

        photos: [
            MOCK_REVIEW_IMAGES[0],
            MOCK_REVIEW_IMAGES[1],
            MOCK_REVIEW_IMAGES[3],
        ],

        reportCount: 2,

        reports: [
            {
                _id: 'report-004',

                reporterName:
                    'Vannak',

                reason:
                    'Duplicate review',

                createdAt:
                    '2026-07-22T08:00:00.000Z',
            },

            {
                _id: 'report-005',

                reporterName:
                    'Srey Mom',

                reason: 'Spam',

                createdAt:
                    '2026-07-22T09:00:00.000Z',
            },
        ],

        likeCount: 5,

        createdAt:
            '2026-07-17T08:00:00.000Z',

        updatedAt:
            '2026-07-22T09:00:00.000Z',
    },

    {
        _id: 'review-active-002',

        status: 'active',

        rating: 4.8,

        ratingBreakdown: {
            food: 5,
            service: 5,
            atmosphere: 5,
            value: 4,
        },

        reviewerName: 'Nita',

        reviewerUsername: '@nita',

        reviewerAvatar:
            'https://randomuser.me/api/portraits/women/68.jpg',

        review:
            'Amazing experience. I highly recommend this place because the service and atmosphere were excellent.',

        photos: [
            MOCK_REVIEW_IMAGES[2],
            MOCK_REVIEW_IMAGES[4],
        ],

        reportCount: 0,

        reports: [],

        likeCount: 12,

        createdAt:
            '2026-07-18T08:00:00.000Z',

        updatedAt:
            '2026-07-18T08:00:00.000Z',
    },

    {
        _id: 'review-rejected-001',

        status: 'rejected',

        rating: 2.5,

        ratingBreakdown: {
            food: 2,
            service: 2,
            atmosphere: 3,
            value: 3,
        },

        reviewerName: 'Bora',

        reviewerUsername: '@bora',

        reviewerAvatar:
            'https://randomuser.me/api/portraits/men/75.jpg',

        review:
            'The review was rejected because the submitted information could not be verified.',

        photos: MOCK_REVIEW_IMAGES,

        reportCount: 3,

        reports: [
            {
                _id: 'report-006',

                reporterName:
                    'Chantha',

                reason:
                    'False information',

                createdAt:
                    '2026-07-23T08:00:00.000Z',
            },

            {
                _id: 'report-007',

                reporterName:
                    'Mony',

                reason:
                    'Offensive content',

                createdAt:
                    '2026-07-23T09:00:00.000Z',
            },

            {
                _id: 'report-008',

                reporterName:
                    'Sophal',

                reason: 'Spam',

                createdAt:
                    '2026-07-23T10:00:00.000Z',
            },
        ],

        likeCount: 3,

        createdAt:
            '2026-07-19T08:00:00.000Z',

        updatedAt:
            '2026-07-23T10:00:00.000Z',
    },
]

export const MOCK_REVIEW_PAGINATION = {
    page: 1,

    limit: 10,

    total: MOCK_REVIEWS.length,

    totalPages: 1,

    statusCounts: {
        all: MOCK_REVIEWS.length,
        pending: 2,
        active: 2,
        hidden: 1,
        rejected: 1,
    },

    averageStar: 4.7,

    ratingSummary: {
        food: 4.8,
        service: 3.6,
        atmosphere: 4.1,
        value: 4.1,
    },
}