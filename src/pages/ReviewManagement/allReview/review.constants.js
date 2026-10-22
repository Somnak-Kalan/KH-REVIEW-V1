// src/pages/ReviewManagement/allReview/review.constants.js

export const REVIEW_STATUS = {
    ALL: 'all',
    PENDING: 'pending',
    ACTIVE: 'active',
    HIDDEN: 'hidden',
    REJECTED: 'rejected',
}

export const STATUS_META = {
    pending: {
        label: 'Pending',
        color: '#f5a623',
        background: '#fff7e6',
    },

    active: {
        label: 'Active',
        color: '#52c41a',
        background: '#f6ffed',
    },



    hidden: {
        label: 'Hide',
        color: '#b83b3b',
        background: '#fff1f0',
    },

    rejected: {
        label: 'Reject',
        color: '#a6a6a6',
        background: '#f5f5f5',
    },
}

export const CATEGORY_OPTIONS = [
    {
        label: 'All Category',
        value: 'all',
    },
    {
        label: 'Accommodation',
        value: 'Accommodation',
    },
    {
        label: 'Attraction',
        value: 'Attraction',
    },
    {
        label: 'Cafe & Bakery',
        value: 'Cafe & Bakery',
    },
    {
        label: 'Eatery',
        value: 'Eatery',
    },
    {
        label: 'Shopping',
        value: 'Shopping',
    },
]

export const STATUS_OPTIONS = [
    {
        label: 'All Status',
        value: 'all',
    },
    {
        label: 'Pending',
        value: 'pending',
    },
    {
        label: 'Active',
        value: 'active',
    },

    {
        label: 'Hide',
        value: 'hidden',
    },
    {
        label: 'Reject',
        value: 'rejected',
    },
]

export const REVIEW_TYPE_OPTIONS = [
    {
        label: 'All Review',
        value: 'all',
    },
    {
        label: 'With photo',
        value: 'with_photo',
    },
]

export const RATING_OPTIONS = [
    {
        label: 'All Rating',
        value: 'all',
    },
    {
        label: '5 star',
        value: '5',
    },
    {
        label: '4 star',
        value: '4',
    },
    {
        label: '3 star',
        value: '3',
    },
    {
        label: '2 star',
        value: '2',
    },
    {
        label: '1 star',
        value: '1',
    },
]

export const DEFAULT_REVIEW_FILTERS = {
    search: '',
    dateRange: [],
    category: 'all',
    status: 'pending',
    reviewType: 'all',
    rating: 'all',
}

export const EMPTY_REVIEW_STATS = {
    total: 0,
    pending: 0,
    active: 0,
    hidden: 0,
    rejected: 0,
}