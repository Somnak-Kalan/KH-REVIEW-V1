// src/components/ReviewManagement/allReview/detail/modals/index.js

export {
    default as ReviewActionModals,
} from './ReviewActionModals'

export {
    default as ReviewReportModal,
} from './ReviewReportModal'

export const REVIEW_ACTION_SUCCESS_MESSAGES = {
    edit:
        'Review updated successfully',

    approve:
        'Review approved successfully',

    reject:
        'Review rejected successfully',

    hide:
        'Review hidden successfully',

    show:
        'Review shown successfully',
}