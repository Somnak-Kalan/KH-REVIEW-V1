import {
    Empty,
    Pagination,
    Spin,
} from 'antd'

import ReviewCard
    from './ReviewCard'

const ReviewList = ({
    reviews = [],
    loading = false,
    updatingId,
    pagination = {},
    onAction,
    onOpenReports,
    onView
}) => {
    const safeReviews =
        Array.isArray(
            reviews
        )
            ? reviews
            : []

    if (
        loading &&
        safeReviews.length ===
        0
    ) {
        return (
            <div className='property-review-loading'>
                <Spin size='large' />
            </div>
        )
    }

    if (
        !loading &&
        safeReviews.length ===
        0
    ) {
        return (
            <div className='property-review-empty'>
                <Empty description='No reviews found' />
            </div>
        )
    }

    const current =
        Number(
            pagination
                ?.current
        ) ||
        1

    const pageSize =
        Number(
            pagination
                ?.pageSize
        ) ||
        20

    const total =
        Number(
            pagination
                ?.total
        ) ||
        safeReviews.length

    return (
        <Spin
            spinning={
                loading
            }
        >
            <div className='property-review-list'>
                {safeReviews.map(
                    (
                        review,
                        index
                    ) => (
                        <ReviewCard
                            key={
                                review
                                    ?._id ||
                                review
                                    ?.id ||
                                `review-${index}`
                            }
                            review={
                                review
                            }
                            updatingId={
                                updatingId
                            }
                            onAction={
                                onAction
                            }
                            onOpenReports={
                                onOpenReports
                            }
                            onView={
                                onView
                            }
                        />
                    )
                )}
            </div>

            {total >
                pageSize ? (
                <div className='property-review-pagination'>
                    <Pagination
                        current={
                            current
                        }
                        pageSize={
                            pageSize
                        }
                        total={
                            total
                        }
                        showSizeChanger
                        showQuickJumper={
                            total >
                            pageSize *
                            3
                        }
                        showTotal={(
                            value
                        ) => {
                            return `${value} reviews`
                        }}
                        pageSizeOptions={[
                            '10',
                            '20',
                            '50',
                            '100',
                        ]}
                        onChange={
                            pagination
                                ?.onChange
                        }
                    />
                </div>
            ) : null}
        </Spin>
    )
}

export default ReviewList