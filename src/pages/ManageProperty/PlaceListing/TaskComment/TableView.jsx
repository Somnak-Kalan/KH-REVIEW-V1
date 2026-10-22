import React from 'react'
import { Table } from 'antd'

const TableView = ({ data, loading, columns, currentPage, pageSize }) => {
  // Backend already sends the correct page, so just use data directly
  const paginatedData = Array.isArray(data) ? data : []

  return (
    <Table
      rowKey={(record) => record.id || record._id}
      columns={columns}
      dataSource={paginatedData}
      pagination={false}
      size='small'
      scroll={{ x: 'max-content' }}
    />
  )
}

export default TableView
