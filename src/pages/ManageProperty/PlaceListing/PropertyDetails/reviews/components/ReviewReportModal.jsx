import {
    Modal,
    Table,
} from 'antd'

import {
    formatReportDate,
    getReviewReports,
} from '../review.utils'

const ReviewReportModal = ({
    open = false,
    review,
    onClose,
}) => {
    const reports =
        getReviewReports(
            review
        )

    const columns = [
        {
            title:
                'No',

            dataIndex:
                'no',

            key:
                'no',

            width:
                54,
        },
        {
            title:
                'Reported By',

            dataIndex:
                'reportedBy',

            key:
                'reportedBy',

            width:
                145,
        },
        {
            title:
                'Reason',

            dataIndex:
                'reason',

            key:
                'reason',

            width:
                210,

            render: (
                value,
                record
            ) => {
                return (
                    <span
                        title={
                            record
                                ?.reasonCode ||
                            ''
                        }
                    >
                        {
                            value ||
                            '-'
                        }
                    </span>
                )
            },
        },
        {
            title:
                'Created',

            dataIndex:
                'createdAt',

            key:
                'createdAt',

            width:
                115,

            render: (
                value
            ) => {
                return formatReportDate(
                    value
                )
            },
        },
    ]

    return (
        <Modal
            open={open}
            title='Report this Review'
            footer={null}
            width={560}
            centered
            destroyOnClose
            className='property-review-report-modal'
            onCancel={
                onClose
            }
        >
            <Table
                rowKey='key'
                columns={
                    columns
                }
                dataSource={
                    reports
                }
                pagination={
                    false
                }
                size='middle'
                scroll={{
                    x:
                        500,
                }}
                locale={{
                    emptyText:
                        'No report information',
                }}
            />
        </Modal>
    )
}

export default ReviewReportModal