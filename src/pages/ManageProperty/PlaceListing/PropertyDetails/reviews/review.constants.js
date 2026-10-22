// src/pages/ManageProperty/PlaceListing/PropertyDetails/
// reviews/review.constants.js

export const DEFAULT_PROPERTY_REVIEW_FILTERS = {
    status:
        'all',

    rating:
        'all',

    sort:
        'latest',

    withReport:
        false,

    withImage:
        false,
}

export const REVIEW_STATUS_OPTIONS = [
    {
        value:
            'all',

        label:
            'All Review',
    },
    {
        value:
            'pending',

        label:
            'Pending',
    },
    {
        value:
            'active',

        label:
            'Active',
    },
    {
        value:
            'hidden',

        label:
            'Hide',
    },
    {
        value:
            'rejected',

        label:
            'Reject',
    },
]

export const REVIEW_RATING_OPTIONS = [
    {
        value:
            'all',

        label:
            'All Rating',
    },
    {
        value:
            '5',

        label:
            '5 Stars',
    },
    {
        value:
            '4',

        label:
            '4 Stars',
    },
    {
        value:
            '3',

        label:
            '3 Stars',
    },
    {
        value:
            '2',

        label:
            '2 Stars',
    },
    {
        value:
            '1',

        label:
            '1 Star',
    },
]

export const REVIEW_SORT_OPTIONS = [
    {
        value:
            'latest',

        label:
            'Latest',
    },

    {
        value:
            'highest',

        label:
            'Highest Rating',
    },
    {
        value:
            'lowest',

        label:
            'Lowest Rating',
    },
]

export const REVIEW_STATUS_META = {
    pending: {
        label:
            'Pending',

        color:
            'gold',

        className:
            'pending',
    },

    active: {
        label:
            'Active',

        color:
            'green',

        className:
            'active',
    },

    hidden: {
        label:
            'Hide',

        color:
            'red',

        className:
            'hidden',
    },

    rejected: {
        label:
            'Reject',

        color:
            'default',

        className:
            'rejected',
    },

    inactive: {
        label:
            'Inactive',

        color:
            'default',

        className:
            'inactive',
    },
}

export const REVIEW_RATING_CATEGORIES = [
    {
        key:
            'taste',

        label:
            'Taste',
    },
    {
        key:
            'atmosphere',

        label:
            'Atmosphere',
    },
    {
        key:
            'service',

        label:
            'Service',
    },
    {
        key:
            'value',

        label:
            'Value',
    },
]

export const REVIEW_REASON_OPTIONS = [
    {
        value:
            'GUIDELINES',

        label:
            'Violates community guidelines',
    },
    {
        value:
            'SPAM',

        label:
            'Spam or excessive promotion',
    },
    {
        value:
            'MISLEADING',

        label:
            'Misleading or false information',
    },
    {
        value:
            'OFFENSIVE',

        label:
            'Inappropriate or offensive content',
    },
    {
        value:
            'IRRELEVANT',

        label:
            'Irrelevant to the mentioned place',
    },
    {
        value:
            'LOW_QUALITY',

        label:
            'Low-quality or unclear content',
    },
    {
        value:
            'DUPLICATE',

        label:
            'Duplicate or repetitive content',
    },
    {
        value:
            'ADVERTISING',

        label:
            'Unauthorized advertising',
    },
]

export const REVIEW_ACTION_SUCCESS_MESSAGES = {
    edit:
        'Review content updated successfully',

    approve:
        'Review approved successfully',

    hide:
        'Review hidden successfully',

    reject:
        'Review rejected successfully',
}