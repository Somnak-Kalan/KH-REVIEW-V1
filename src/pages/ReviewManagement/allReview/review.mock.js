// src/pages/ReviewManagement/allReview/review.mock.js

import dayjs from 'dayjs'

const createDateAgo = ({
    seconds = 0,
    minutes = 0,
    hours = 0,
    days = 0,
    weeks = 0,
    months = 0,
    years = 0,
} = {}) => {
    let date = dayjs()

    if (seconds) {
        date = date.subtract(seconds, 'second')
    }

    if (minutes) {
        date = date.subtract(minutes, 'minute')
    }

    if (hours) {
        date = date.subtract(hours, 'hour')
    }

    if (days) {
        date = date.subtract(days, 'day')
    }

    if (weeks) {
        date = date.subtract(weeks, 'week')
    }

    if (months) {
        date = date.subtract(months, 'month')
    }

    if (years) {
        date = date.subtract(years, 'year')
    }

    return date.toISOString()
}

// An older date inside the current year.
// It should display like: Jan 2
const createSameYearDate = () => {
    return dayjs()
        .startOf('year')
        .add(1, 'day')
        .hour(10)
        .minute(30)
        .second(0)
        .toISOString()
}

// A date from the previous year.
// It should display like: 15 Jun 2025
const createPreviousYearDate = () => {
    return dayjs()
        .startOf('year')
        .subtract(1, 'year')
        .month(5)
        .date(15)
        .hour(10)
        .minute(30)
        .second(0)
        .toISOString()
}

export const mockReviews = [
    {
        _id: 'review-001',

        status: 'pending',

        rating: 2.2,

        placeName: 'Sunset Grill',

        placeCategory: 'Attraction',

        placeRating: 3.7,

        reviewerName: 'Mira Tan',

        reviewerUsername: '@miraexplores',

        reviewerAvatar: '',

        creatorName: 'SG',

        updaterName: 'SG',

        review:
            'Fresh seafood with a stunning view of the sunset. Great cocktails too!',

        hasPhoto: true,

        photos: [
            'https://khreivew.sgp1.digitaloceanspaces.com/place/2026/07/original-657-1784337077511.jpg',
            'https://khreivew.sgp1.digitaloceanspaces.com/place/2026/07/original-657-1784337077511.jpg',
            'https://khreivew.sgp1.digitaloceanspaces.com/place/2026/07/original-657-1784337077511.jpg',
            'https://khreivew.sgp1.digitaloceanspaces.com/place/2026/07/original-657-1784337077511.jpg',
            'https://khreivew.sgp1.digitaloceanspaces.com/place/2026/07/original-657-1784337077511.jpg',
            'https://khreivew.sgp1.digitaloceanspaces.com/place/2026/07/original-657-1784337077511.jpg',
            'https://khreivew.sgp1.digitaloceanspaces.com/place/2026/07/original-657-1784337077511.jpg',
            'https://khreivew.sgp1.digitaloceanspaces.com/place/2026/07/original-657-1784337077511.jpg',
        ],

        ratingBreakdown: {
            food: 2,
            service: 1,
            atmosphere: 3,
            value: 4,
        },

        // Result: Just now
        createdAt: createDateAgo({
            seconds: 20,
        }),

        updatedAt: createDateAgo({
            seconds: 10,
        }),
    },

    {
        _id: 'review-002',

        status: 'active',

        rating: 4.3,

        placeName: 'Kampot Riverside Café',

        placeCategory: 'Cafe & Bakery',

        placeRating: 4.5,

        reviewerName: 'Lina Chea',

        reviewerUsername: '@linachea',

        reviewerAvatar: '',

        creatorName: 'SG',

        updaterName: 'SG',

        review:
            'Lovely riverside setting and a very attentive team. The coffee was excellent.',

        hasPhoto: true,

        photos: [
            'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
        ],

        ratingBreakdown: {
            food: 4,
            service: 5,
            atmosphere: 4,
            value: 4,
        },

        // Result: 2m
        createdAt: createDateAgo({
            minutes: 2,
        }),

        updatedAt: createDateAgo({
            minutes: 1,
        }),
    },

    {
        _id: 'review-003',

        status: 'hidden',

        rating: 2,

        placeName: 'Urban Bites',

        placeCategory: 'Eatery',

        placeRating: 3.2,

        reviewerName: 'Johan Lee',

        reviewerUsername: '@jlee_foodie',

        reviewerAvatar: '',

        creatorName: 'SG',

        updaterName: 'Admin',

        review:
            'The food was acceptable, but the service took too long.',

        hasPhoto: false,

        photos: [],

        ratingBreakdown: {
            food: 2,
            service: 1,
            atmosphere: 3,
            value: 2,
        },

        // Result: 2h
        createdAt: createDateAgo({
            hours: 2,
        }),

        updatedAt: createDateAgo({
            hours: 1,
        }),
    },

    {
        _id: 'review-004',

        status: 'rejected',

        rating: 2.2,

        placeName: 'La Petite Patisserie',

        placeCategory: 'Shopping',

        placeRating: 4.1,

        reviewerName: 'Sofia Ramirez',

        reviewerUsername: '@sofia_eats',

        reviewerAvatar: '',

        creatorName: 'SG',

        updaterName: 'Admin',

        review:
            'The location looked good, but the products were not available.',

        hasPhoto: false,

        photos: [],

        ratingBreakdown: {
            food: 2,
            service: 1,
            atmosphere: 3,
            value: 2,
        },

        // Result: 1 day
        createdAt: createDateAgo({
            days: 1,
        }),

        updatedAt: createDateAgo({
            hours: 10,
        }),
    },

    {
        _id: 'review-005',

        status: 'active',

        rating: 5,

        placeName: 'Mountain View Diner',

        placeCategory: 'Accommodation',

        placeRating: 4.8,

        reviewerName: 'Ethan Clarke',

        reviewerUsername: '@ethantravels',

        reviewerAvatar: '',

        creatorName: 'SG',

        updaterName: 'SG',

        review:
            'Cozy diner atmosphere with hearty breakfasts. Pancakes were fluffy and delicious.',

        hasPhoto: true,

        photos: [
            'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c',
        ],

        ratingBreakdown: {
            food: 5,
            service: 5,
            atmosphere: 5,
            value: 5,
        },

        // Result: 2 days
        createdAt: createDateAgo({
            days: 2,
        }),

        updatedAt: createDateAgo({
            days: 1,
        }),
    },

    {
        _id: 'review-006',

        status: 'active',

        rating: 5,

        placeName: 'Mountain View Diner',

        placeCategory: 'Attraction',

        placeRating: 4.7,

        reviewerName: 'Ethan Clarke',

        reviewerUsername: '@ethantravels',

        reviewerAvatar: '',

        creatorName: 'SG',

        updaterName: 'SG',

        review:
            'The mountain view is beautiful and the service is friendly.',

        hasPhoto: false,

        photos: [],

        ratingBreakdown: {
            food: 4,
            service: 5,
            atmosphere: 5,
            value: 4,
        },

        // Result: 1 week
        createdAt: createDateAgo({
            weeks: 1,
        }),

        updatedAt: createDateAgo({
            days: 5,
        }),
    },

    {
        _id: 'review-007',

        status: 'active',

        rating: 5,

        placeName: 'Mountain View Diner',

        placeCategory: 'Accommodation',

        placeRating: 4.9,

        reviewerName: 'Ethan Clarke',

        reviewerUsername: '@ethantravels',

        reviewerAvatar: '',

        creatorName: 'SG',

        updaterName: 'SG',

        review:
            'Nice location and comfortable environment. I would visit again.',

        hasPhoto: true,

        photos: [
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
        ],

        ratingBreakdown: {
            food: 5,
            service: 5,
            atmosphere: 5,
            value: 5,
        },

        // Result: 2 weeks
        createdAt: createDateAgo({
            weeks: 2,
        }),

        updatedAt: createDateAgo({
            weeks: 1,
        }),
    },

    {
        _id: 'review-008',

        status: 'active',

        rating: 5,

        placeName: 'Mountain View Diner',

        placeCategory: 'Eatery',

        placeRating: 4.6,

        reviewerName: 'Ethan Clarke',

        reviewerUsername: '@ethantravels',

        reviewerAvatar: '',

        creatorName: 'SG',

        updaterName: 'SG',

        review:
            'The meals arrived quickly and all staff members were helpful.',

        hasPhoto: false,

        photos: [],

        ratingBreakdown: {
            food: 5,
            service: 5,
            atmosphere: 4,
            value: 5,
        },

        // Result: 1 month
        createdAt: createDateAgo({
            months: 1,
        }),

        updatedAt: createDateAgo({
            weeks: 3,
        }),
    },

    {
        _id: 'review-009',

        status: 'pending',

        rating: 3.5,

        placeName: 'River Garden',

        placeCategory: 'Attraction',

        placeRating: 4.2,

        reviewerName: 'Nita Sok',

        reviewerUsername: '@nitasok',

        reviewerAvatar: '',

        creatorName: 'SG',

        updaterName: 'SG',

        review:
            'The garden was peaceful, but the waiting time was quite long.',

        hasPhoto: true,

        photos: [
            'https://images.unsplash.com/photo-1497250681960-ef046c08a56e',
            'https://images.unsplash.com/photo-1497250681960-ef046c08a56e',
            'https://images.unsplash.com/photo-1497250681960-ef046c08a56e',
        ],

        ratingBreakdown: {
            food: 3,
            service: 2,
            atmosphere: 5,
            value: 3,
        },

        // Result: 3 months
        createdAt: createDateAgo({
            months: 3,
        }),

        updatedAt: createDateAgo({
            months: 2,
        }),
    },

    {
        _id: 'review-010',

        status: 'inactive',

        rating: 4,

        placeName: 'Central Coffee House',

        placeCategory: 'Cafe & Bakery',

        placeRating: 4.4,

        reviewerName: 'Dara Kim',

        reviewerUsername: '@darakim',

        reviewerAvatar: '',

        creatorName: 'SG',

        updaterName: 'Admin',

        review:
            'Good coffee, clean environment and reasonable prices.',

        hasPhoto: false,

        photos: [],

        ratingBreakdown: {
            food: 4,
            service: 4,
            atmosphere: 4,
            value: 4,
        },

        // Result: Jan 2 or another current-year month and day
        createdAt: createSameYearDate(),

        updatedAt: createDateAgo({
            months: 4,
        }),
    },

    {
        _id: 'review-011',

        status: 'active',

        rating: 4.8,

        placeName: 'Old Town Restaurant',

        placeCategory: 'Eatery',

        placeRating: 4.6,

        reviewerName: 'Sokha Lim',

        reviewerUsername: '@sokhafood',

        reviewerAvatar: '',

        creatorName: 'SG',

        updaterName: 'Admin',

        review:
            'A very pleasant restaurant with friendly staff and traditional food.',

        hasPhoto: true,

        photos: [
            'https://images.unsplash.com/photo-1552566626-52f8b828add9',
            'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c',
            'https://khreivew.sgp1.digitaloceanspaces.com/place/2026/07/original-657-1784337077511.jpg'
        ],

        ratingBreakdown: {
            food: 5,
            service: 4,
            atmosphere: 5,
            value: 5,
        },

        // Result: 15 Jun 2025 or the previous year
        createdAt: createPreviousYearDate(),

        updatedAt: createDateAgo({
            months: 5,
        }),
    },
]