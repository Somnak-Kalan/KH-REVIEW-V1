import { Table } from 'antd'

export default function UserTable({ columns, data, loading, pagination }) {
    return (
        <div className=" pb-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    pagination={pagination}
                    size="small"
                    scroll={{ x: 'max-content' }}
                />
            </div>
        </div>
    )
}
