import {
    DatePicker,
    Input,
    Select,
} from 'antd'

import {
    SearchOutlined,
} from '@ant-design/icons'

import {
    useContext,
    useEffect,
    useMemo,
} from 'react'

import dayjs from 'dayjs'

import {
    AuthContext,
} from '../../../contexts/AuthContext'

import useCategoryStore
    from '../../../Stores/setups/category.store'

import {
    RATING_OPTIONS,
    REVIEW_TYPE_OPTIONS,
    STATUS_OPTIONS,
} from '../../../pages/ReviewManagement/allReview/review.constants'

const {
    RangePicker,
} = DatePicker

const getCategoryLabel = (
    category
) => {
    if (!category) {
        return ''
    }

    if (
        typeof category ===
        'string'
    ) {
        return category
    }

    return (
        category?.nameEn + ' - ' + category?.nameKh ||
        'Unnamed category'
    )
}

const getCategoryValue = (
    category
) => {
    if (!category) {
        return ''
    }

    if (
        typeof category ===
        'string'
    ) {
        return category
    }

    return (
        category?._id ||
        category?.id ||
        category?.value ||
        ''
    )
}

const ReviewFilters = ({
    filters,
    onChange,
}) => {
    const {
        access_token,
    } = useContext(
        AuthContext
    )

    const categories =
        useCategoryStore(
            (state) =>
                state.categories
        )

    const categoryLoading =
        useCategoryStore(
            (state) =>
                state.loading
        )

    const fetchCategory =
        useCategoryStore(
            (state) =>
                state.fetchCategory
        )

    useEffect(() => {
        if (!access_token) {
            return
        }

        fetchCategory({
            access_token,
            doc: {
                search: '',
            },
        }).catch(
            (error) => {
                console.error(
                    'Unable to load review categories:',
                    error
                )
            }
        )
    }, [
        access_token,
        fetchCategory,
    ])

    const categoryOptions =
        useMemo(() => {
            const dynamicOptions =
                Array.isArray(
                    categories
                )
                    ? categories
                        .map(
                            (
                                category
                            ) => {
                                const value =
                                    getCategoryValue(
                                        category
                                    )

                                const label =
                                    getCategoryLabel(
                                        category
                                    )

                                if (
                                    !value
                                ) {
                                    return null
                                }

                                return {
                                    value,
                                    label,
                                }
                            }
                        )
                        .filter(
                            Boolean
                        )
                    : []

            return [
                {
                    value:
                        'all',
                    label:
                        'All Categories',
                },
                ...dynamicOptions,
            ]
        }, [
            categories,
        ])

    const selectedCategory =
        useMemo(() => {
            const category =
                filters
                    ?.categoryId ||
                filters
                    ?.category ||
                'all'

            if (
                typeof category ===
                'object'
            ) {
                return (
                    category?._id ||
                    category?.id ||
                    category?.value ||
                    'all'
                )
            }

            return (
                category ||
                'all'
            )
        }, [
            filters?.category,
            filters?.categoryId,
        ])

    const dateRangeValue =
        useMemo(() => {
            const dateRange =
                filters
                    ?.dateRange

            if (
                !Array.isArray(
                    dateRange
                ) ||
                dateRange.length !==
                2 ||
                !dateRange[0] ||
                !dateRange[1]
            ) {
                return null
            }

            const startDate =
                dayjs(
                    dateRange[0]
                )

            const endDate =
                dayjs(
                    dateRange[1]
                )

            if (
                !startDate.isValid() ||
                !endDate.isValid()
            ) {
                return null
            }

            return [
                startDate,
                endDate,
            ]
        }, [
            filters?.dateRange,
        ])

    const handleFilterChange = (
        name,
        value
    ) => {
        onChange?.({
            ...filters,
            [name]:
                value,
        })
    }

    const handleCategoryChange = (
        value
    ) => {
        onChange?.({
            ...filters,
            category:
                value,

            categoryId:
                value ===
                    'all'
                    ? ''
                    : value,
        })
    }

    const handleDateChange = (
        dates
    ) => {
        if (
            !dates ||
            dates.length !==
            2 ||
            !dates[0] ||
            !dates[1]
        ) {
            handleFilterChange(
                'dateRange',
                []
            )

            return
        }

        handleFilterChange(
            'dateRange',
            [
                dates[0]
                    .startOf(
                        'day'
                    )
                    .toISOString(),

                dates[1]
                    .endOf(
                        'day'
                    )
                    .toISOString(),
            ]
        )
    }

    return (
        <div className='review-filter-panel'>
            <div className='review-filter-first-row'>
                <Input
                    value={
                        filters
                            ?.search ||
                        ''
                    }
                    prefix={
                        <SearchOutlined />
                    }
                    placeholder='Search reviews...'
                    allowClear
                    onChange={(
                        event
                    ) => {
                        handleFilterChange(
                            'search',
                            event
                                .target
                                .value
                        )
                    }}
                />

                <RangePicker
                    value={
                        dateRangeValue
                    }
                    placeholder={[
                        'Start date',
                        'End date',
                    ]}
                    format='DD MMM, YYYY'
                    allowClear
                    onChange={
                        handleDateChange
                    }
                />
            </div>

            <div className='review-filter-second-row'>
                <Select
                    value={
                        selectedCategory
                    }
                    options={
                        categoryOptions
                    }
                    loading={
                        categoryLoading
                    }
                    placeholder='Select category'
                    showSearch
                    allowClear={
                        false
                    }
                    optionFilterProp='label'
                    filterOption={(
                        input,
                        option
                    ) => {
                        return String(
                            option
                                ?.label ||
                            ''
                        )
                            .toLowerCase()
                            .includes(
                                input
                                    .trim()
                                    .toLowerCase()
                            )
                    }}
                    onChange={
                        handleCategoryChange
                    }
                    notFoundContent={
                        categoryLoading
                            ? 'Loading categories...'
                            : 'No categories found'
                    }
                />

                <Select
                    value={
                        filters
                            ?.status ||
                        'all'
                    }
                    options={
                        STATUS_OPTIONS
                    }
                    onChange={(
                        value
                    ) => {
                        handleFilterChange(
                            'status',
                            value
                        )
                    }}
                />

                <Select
                    value={
                        filters
                            ?.reviewType ||
                        'all'
                    }
                    options={
                        REVIEW_TYPE_OPTIONS
                    }
                    onChange={(
                        value
                    ) => {
                        handleFilterChange(
                            'reviewType',
                            value
                        )
                    }}
                />

                <Select
                    value={
                        filters
                            ?.rating ||
                        'all'
                    }
                    options={
                        RATING_OPTIONS
                    }
                    onChange={(
                        value
                    ) => {
                        handleFilterChange(
                            'rating',
                            value
                        )
                    }}
                />
            </div>
        </div>
    )
}

export default ReviewFilters