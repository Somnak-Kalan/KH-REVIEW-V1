// src/components/ReviewManagement/allReview/detail/ReviewModerationInfo.jsx

import dayjs from 'dayjs'

const formatDateTime = (date) => {
    if (!date) {
        return '-'
    }

    const parsedDate = dayjs(date)

    if (!parsedDate.isValid()) {
        return '-'
    }

    return parsedDate.format(
        'MMM D, YYYY • hh:mm A'
    )
}

const ReviewModerationInfo = ({
    status,
    moderation = {},
}) => {
    if (
        !status ||
        status === 'pending'
    ) {
        return null
    }

    const dataByStatus = {
        active: {
            className:
                'border-green-400 bg-green-50 dark:bg-green-950/20',
            rows: [
                {
                    label: 'Approved By',
                    value:
                        moderation?.approvedBy ||
                        'Admin (name)',
                },
                {
                    label: 'Approved At',
                    value: formatDateTime(
                        moderation?.approvedAt
                    ),
                },
            ],
        },

        hidden: {
            className:
                'border-red-300 bg-red-50 dark:bg-red-950/20',
            rows: [
                {
                    label: 'Reason',
                    value:
                        moderation?.reason ||
                        '-',
                },
                {
                    label: 'Hide By',
                    value:
                        moderation?.hiddenBy ||
                        'Admin (name)',
                },
                {
                    label: 'Hide At',
                    value: formatDateTime(
                        moderation?.hiddenAt
                    ),
                },
            ],
        },

        rejected: {
            className:
                'border-red-300 bg-red-50 dark:bg-red-950/20',
            rows: [
                {
                    label: 'Reason',
                    value:
                        moderation?.reason ||
                        '-',
                },
                {
                    label: 'Reject By',
                    value:
                        moderation?.rejectedBy ||
                        'Admin (name)',
                },
                {
                    label: 'Reject At',
                    value: formatDateTime(
                        moderation?.rejectedAt
                    ),
                },
            ],
        },

        inactive: {
            className:
                'border-gray-300 bg-gray-50 dark:border-slate-700 dark:bg-slate-800',
            rows: [
                {
                    label: 'Status',
                    value:
                        'This review is currently inactive.',
                },
            ],
        },
    }

    const configuration =
        dataByStatus?.[status]

    if (!configuration) {
        return null
    }

    return (
        <div
            className={[
                'mt-7 rounded-md border p-3 text-[10px] leading-5 text-gray-600 dark:text-slate-300',
                configuration.className,
            ].join(' ')}
        >
            {configuration.rows.map(
                (row) => (
                    <div key={row.label}>
                        {row.label}:{' '}

                        <strong>
                            {row.value}
                        </strong>
                    </div>
                )
            )}
        </div>
    )
}

export default ReviewModerationInfo