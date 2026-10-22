import React, { useMemo } from 'react'
import { Table } from 'antd'

const TableView = ({
  data = [],
  loading = false,
  columns = [],
  currentPage = 1,
  pageSize = 10,
}) => {
  const paginatedData = useMemo(() => {
    if (!Array.isArray(data)) return []
    return data
  }, [data])

  return (
    <Table
      columns={columns}
      dataSource={paginatedData}
      rowKey={(record) => record._id || record.id}

      pagination={false}
      scroll={{ x: 'max-content' }}
    />
  )
}

export default TableView
