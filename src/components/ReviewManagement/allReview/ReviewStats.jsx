// src/pages/ReviewManagement/allReview/components/ReviewStats.jsx

import {
    AppstoreOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons'

const ReviewStats = ({
    stats,
    activeStatus = 'all',
    onSelectStatus,
}) => {

    const statisticItems = [
        {
            key: 'all',
            label: 'Total Review',
            value: stats?.total || 0,
            className: 'total',
            icon: <AppstoreOutlined />,
        },
        {
            key: 'pending',
            label: 'Pending',
            value: stats?.pending || 0,
            className: 'pending',
            icon: <ClockCircleOutlined />,
        },
        {
            key: 'active',
            label: 'Active',
            value: stats?.active || 0,
            className: 'active',
            icon: <CheckCircleOutlined />,
        },
        {
            key: 'hidden',
            label: 'Hide',
            value: stats?.hidden || 0,
            className: 'hide-status',
            icon: <CloseCircleOutlined />,
        },
        {
            key: 'rejected',
            label: 'Reject',
            value: stats?.rejected || 0,
            className: 'rejected',
            icon: <MinusCircleOutlined />,
        },
    ]

    return (
        <div className='review-stats-grid'>
            {statisticItems.map((item) => {
                const selected = activeStatus === item.key

                return (
                    <>
                        <button
                            key={item.key}
                            type='button'
                            className={[
                                'review-stat-card',
                                // selected ? 'selected' : '',
                            ].join(' ')}
                        // onClick={() => onSelectStatus?.(item.key)}
                        >
                            <div
                                className={[
                                    'review-stat-icon',
                                    item.className,
                                ].join(' ')}
                            >
                                {item.icon}
                            </div>

                            <div className='review-stat-content'>
                                <div className='review-stat-label'>
                                    {item.label}
                                </div>

                                <div className='review-stat-value'>
                                    {item.value}
                                </div>
                            </div>
                        </button>
                    </>
                )
            })}
        </div>
    )
}

export default ReviewStats