import {
    CloseOutlined,
} from '@ant-design/icons'

import {
    Modal,
} from 'antd'

import dayjs from 'dayjs'

const formatCreatedDate = (
    date
) => {
    if (!date) {
        return '-'
    }

    const parsedDate =
        dayjs(date)

    if (
        !parsedDate.isValid()
    ) {
        return '-'
    }

    return parsedDate.format(
        'YYYY-MM-DD'
    )
}

const getReportedByName = (
    report
) => {
    if (
        typeof report?.reportedBy ===
        'string'
    ) {
        return report.reportedBy
    }

    return (
        report?.reportedByName ||
        report?.reporterName ||
        report?.reportedBy?.name ||
        report?.reportedBy?.fullName ||
        report?.reporter?.name ||
        report?.reporter?.fullName ||
        '-'
    )
}

const ReviewReportModal = ({
    open = false,
    reports = [],
    onCancel,
}) => {
    const safeReports =
        Array.isArray(reports)
            ? reports
            : []

    return (
        <Modal
            open={open}
            title='Report this Review'
            width={500}
            centered
            footer={null}
            destroyOnClose
            closeIcon={
                <CloseOutlined />
            }
            onCancel={
                onCancel
            }
            styles={{
                content: {
                    padding:
                        '20px 22px 18px',

                    borderRadius:
                        16,
                },

                header: {
                    marginBottom:
                        16,
                },

                body: {
                    padding: 0,
                },
            }}
        >
            <div className='overflow-x-auto'>
                <table className='w-full border-collapse text-left text-[11px]'>
                    <thead>
                        <tr className='bg-gray-50 text-gray-800 dark:bg-slate-800 dark:text-slate-200'>
                            <th className='w-[45px] border-b border-gray-200 px-3 py-3 font-medium dark:border-slate-700'>
                                No
                            </th>

                            <th className='border-b border-l border-gray-200 px-3 py-3 font-medium dark:border-slate-700'>
                                Reported By
                            </th>

                            <th className='border-b border-l border-gray-200 px-3 py-3 font-medium dark:border-slate-700'>
                                Reason
                            </th>

                            <th className='border-b border-l border-gray-200 px-3 py-3 font-medium dark:border-slate-700'>
                                Created
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {safeReports.length >
                            0 ? (
                            safeReports.map(
                                (
                                    report,
                                    index
                                ) => (
                                    <tr
                                        key={
                                            report?._id ||
                                            report?.id ||
                                            `report-${index}`
                                        }
                                        className='text-gray-700 dark:text-slate-300'
                                    >
                                        <td className='border-b border-gray-200 px-3 py-3.5 dark:border-slate-700'>
                                            {index +
                                                1}
                                        </td>

                                        <td className='border-b border-gray-200 px-3 py-3.5 dark:border-slate-700'>
                                            {getReportedByName(
                                                report
                                            )}
                                        </td>

                                        <td className='border-b border-gray-200 px-3 py-3.5 dark:border-slate-700'>
                                            {report?.reason ||
                                                report?.reportReason ||
                                                '-'}
                                        </td>

                                        <td className='whitespace-nowrap border-b border-gray-200 px-3 py-3.5 dark:border-slate-700'>
                                            {formatCreatedDate(
                                                report?.createdAt ||
                                                report?.reportedAt
                                            )}
                                        </td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td
                                    colSpan={
                                        4
                                    }
                                    className='px-3 py-8 text-center text-gray-400'
                                >
                                    No
                                    reports
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Modal>
    )
}

export default ReviewReportModal