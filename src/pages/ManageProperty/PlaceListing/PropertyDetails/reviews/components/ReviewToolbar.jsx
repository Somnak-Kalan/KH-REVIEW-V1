import {
    Checkbox,
    Select,
} from 'antd'

import {
    REVIEW_RATING_OPTIONS,
    REVIEW_SORT_OPTIONS,
    REVIEW_STATUS_OPTIONS,
} from '../review.constants'

const ReviewToolbar = ({
    filters = {},
    counts = {},
    onChange,
}) => {
    const statusOptions =
        REVIEW_STATUS_OPTIONS.map(
            (
                option
            ) => {
                return {
                    value:
                        option.value,

                    label:
                        `${option.label} (${Number(
                            counts?.[
                            option.value
                            ] ||
                            0
                        )})`,
                }
            }
        )

    const handleChange = (
        key,
        value
    ) => {
        onChange?.({
            ...filters,

            [key]:
                value,
        })
    }

    return (
        <div className='property-review-toolbar'>
            <div className='property-review-selects'>
                <Select
                    value={
                        filters?.status ||
                        'all'
                    }
                    options={
                        statusOptions
                    }
                    className='property-review-status-select'
                    popupMatchSelectWidth={
                        false
                    }
                    onChange={(
                        value
                    ) => {
                        handleChange(
                            'status',
                            value
                        )
                    }}
                />

                <Select
                    value={
                        filters?.rating ||
                        'all'
                    }
                    options={
                        REVIEW_RATING_OPTIONS
                    }
                    className='property-review-rating-select'
                    popupMatchSelectWidth={
                        false
                    }
                    onChange={(
                        value
                    ) => {
                        handleChange(
                            'rating',
                            value
                        )
                    }}
                />

                {/* <Select
                    value={
                        filters?.sort ||
                        'latest'
                    }
                    options={
                        REVIEW_SORT_OPTIONS
                    }
                    className='property-review-sort-select'
                    popupMatchSelectWidth={
                        false
                    }
                    onChange={(
                        value
                    ) => {
                        handleChange(
                            'sort',
                            value
                        )
                    }}
                /> */}
            </div>

            <div className='property-review-checkboxes'>
                <Checkbox
                    checked={
                        Boolean(
                            filters
                                ?.withReport
                        )
                    }
                    onChange={(
                        event
                    ) => {
                        handleChange(
                            'withReport',
                            event
                                .target
                                .checked
                        )
                    }}
                >
                    With Report
                </Checkbox>

                <Checkbox
                    checked={
                        Boolean(
                            filters
                                ?.withImage
                        )
                    }
                    onChange={(
                        event
                    ) => {
                        handleChange(
                            'withImage',
                            event
                                .target
                                .checked
                        )
                    }}
                >
                    With Image
                </Checkbox>
            </div>
        </div>
    )
}

export default ReviewToolbar