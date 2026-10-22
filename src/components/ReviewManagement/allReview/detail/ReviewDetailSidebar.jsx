// src/components/ReviewManagement/allReview/detail/ReviewDetailSidebar.jsx

import {
    Alert,
} from 'antd'

import {
    CheckCircleFilled,
    EnvironmentFilled,
    FlagOutlined,
} from '@ant-design/icons'

const ReviewDetailSidebar = ({
    review,
    photos = [],
    reports = [],
    onOpenReports,
}) => {
    const location =
        review?.location || {}

    const locationImage =
        location?.image ||
        photos?.[0] ||
        ''

    const tags =
        Array.isArray(location?.tags)
            ? location.tags
            : []

    return (
        <aside className='mt-6 min-w-0 border-t border-gray-200 pt-5 dark:border-slate-700 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0'>
            {reports.length > 0 ? (
                <button
                    type='button'
                    className='flex min-h-[30px] w-full items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-left text-[11px] text-red-500 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30'
                    onClick={onOpenReports}
                >
                    <FlagOutlined />

                    <span>
                        Reported by{' '}
                        {reports.length}{' '}
                        {reports.length === 1
                            ? 'user'
                            : 'users'}
                    </span>
                </button>
            ) : (
                <Alert
                    type='success'
                    showIcon
                    message='No report'
                    className='!py-1.5 !text-[11px]'
                />
            )}

            <div className='mt-3 rounded-[10px] bg-[#F3F7FE] p-3 dark:bg-slate-800'>
                <div className='mb-3 flex items-center gap-2 text-[15px] font-semibold text-gray-900 dark:text-white'>
                    <EnvironmentFilled />

                    <span>Location</span>
                </div>

                <div className='flex min-w-0 gap-3 rounded-[9px] bg-white p-2.5 shadow-[0_2px_9px_rgba(15,23,42,0.08)] dark:bg-slate-900'>
                    {locationImage ? (
                        <img
                            src={locationImage}
                            alt={
                                location?.name ||
                                review?.placeName ||
                                'Location'
                            }
                            className='h-[76px] w-[72px] min-w-[72px] rounded-md object-cover'
                            onError={(event) => {
                                event.currentTarget.style.display =
                                    'none'
                            }}
                        />
                    ) : (
                        <div className='flex h-[76px] w-[72px] min-w-[72px] items-center justify-center rounded-md bg-gray-100 text-[9px] text-gray-400'>
                            No image
                        </div>
                    )}

                    <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-1'>
                            <span className='truncate text-[12px] font-semibold text-gray-900 dark:text-white'>
                                {location?.name ||
                                    review?.placeName ||
                                    '-'}
                            </span>

                            {location?.verified ? (
                                <CheckCircleFilled className='shrink-0 text-[11px] text-blue-500' />
                            ) : null}
                        </div>

                        <p className='mb-0 mt-0.5 line-clamp-2 text-[9px] leading-[14px] text-gray-500'>
                            {location?.description ||
                                review?.placeCategory ||
                                '-'}
                        </p>

                        {tags.length > 0 ? (
                            <div className='mt-1 flex flex-wrap items-center gap-1'>
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className='max-w-full truncate rounded-sm bg-blue-50 px-1 py-0.5 text-[8px] text-blue-500 dark:bg-blue-950/40'
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        ) : null}

                        <div className='mt-1.5 flex min-w-0 items-center gap-1 text-[8px] text-gray-500'>
                            <EnvironmentFilled className='shrink-0' />

                            <span className='truncate'>
                                {location?.address ||
                                    '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default ReviewDetailSidebar