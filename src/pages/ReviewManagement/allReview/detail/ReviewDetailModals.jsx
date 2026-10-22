export const ReviewReportModal = ({
    open,
    reports = [],
    onCancel,
}) => {
    const columns = [
        {
            title: 'No',
            key: 'no',
            width: 50,
            render: (_, __, index) => {
                return index + 1
            },
        },
        {
            title: 'Reported By',
            dataIndex: 'reportedBy',
            key: 'reportedBy',
            width: 115,
            render: (value) => value || '-',
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
            width: 140,
            render: (value) => value || '-',
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 110,
            render: (value) => {
                return value
                    ? dayjs(value).format(
                        'YYYY-MM-DD'
                    )
                    : '-'
            },
        },
    ]

    return (
        <Modal
            open={open}
            title='Report this Review'
            width={380}
            centered
            footer={null}
            destroyOnClose
            onCancel={onCancel}
            className='review-report-modal'
            styles={{
                body: {
                    paddingTop: 4,
                },
            }}
        >
            <Table
                rowKey={(record, index) => {
                    return (
                        record?._id ||
                        `report-${index}`
                    )
                }}
                columns={columns}
                dataSource={reports}
                pagination={false}
                size='small'
                bordered={false}
                scroll={{
                    x: 360,
                }}
                className='review-report-table'
            />
        </Modal>
    )
}