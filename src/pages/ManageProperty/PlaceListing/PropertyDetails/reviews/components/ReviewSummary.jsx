import {
    StarFilled,
    StarOutlined,
} from '@ant-design/icons'

const normalizeBreakdown = (
    ratingBreakdown
) => {
    if (
        Array.isArray(
            ratingBreakdown
        )
    ) {
        return ratingBreakdown
    }

    if (
        !ratingBreakdown ||
        typeof ratingBreakdown !==
        'object'
    ) {
        return []
    }

    return Object.entries(
        ratingBreakdown
    )
        .filter(
            (
                [
                    key,
                    value,
                ]
            ) => {
                return (
                    key !==
                    'averageStar' &&
                    key !==
                    'total' &&
                    typeof value !==
                    'object'
                )
            }
        )
        .map(
            (
                [
                    key,
                    value,
                ],
                index
            ) => ({
                key,

                label:
                    key
                        .replace(
                            /_/g,
                            ' '
                        )
                        .replace(
                            /\b\w/g,
                            (
                                character
                            ) => {
                                return character
                                    .toUpperCase()
                            }
                        ),

                score:
                    Number(
                        value
                    ) ||
                    0,

                orderNumber:
                    index,
            })
        )
}

const ReviewSummary = ({
    averageStar = 0,
    ratingBreakdown = [],
}) => {
    const resolvedAverage =
        Number(
            averageStar
        ) ||
        0

    const categories =
        normalizeBreakdown(
            ratingBreakdown
        )

    const filledStarCount =
        Math.max(
            0,
            Math.min(
                5,
                Math.round(
                    resolvedAverage
                )
            )
        )

    return (
        <div className='property-review-summary'>
            <div className='property-review-overall'>
                <div className='property-review-stars'>
                    {Array.from({
                        length:
                            5,
                    }).map(
                        (
                            _,
                            index
                        ) => {
                            const isFilled =
                                index <
                                filledStarCount

                            return isFilled ? (
                                <StarFilled
                                    key={
                                        index
                                    }
                                    className='property-review-star-filled'
                                />
                            ) : (
                                <StarOutlined
                                    key={
                                        index
                                    }
                                    className='property-review-star-empty'
                                />
                            )
                        }
                    )}
                </div>

                <strong className='property-review-average'>
                    {resolvedAverage.toFixed(
                        1
                    )}
                </strong>
            </div>

            {categories.length >
                0 ? (
                <div className='property-review-category-list'>
                    {categories.map(
                        (
                            category
                        ) => (
                            <div
                                key={
                                    category
                                        .key
                                }
                                className='property-review-category'
                            >
                                <strong className='property-review-category-rating'>
                                    {Number(
                                        category
                                            ?.score ||
                                        0
                                    ).toFixed(
                                        1
                                    )}
                                </strong>

                                <span className='property-review-category-label'>
                                    {
                                        category
                                            .label
                                    }
                                </span>
                            </div>
                        )
                    )}
                </div>
            ) : null}
        </div>
    )
}

export default ReviewSummary