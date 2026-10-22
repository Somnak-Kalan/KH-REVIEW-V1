import React from 'react'
import { Table } from 'antd'

const TableView = ({ data, loading, columns, currentPage, pageSize }) => {
  // Backend handles pagination (page & limit), so we use data as-is.
  // const paginatedData = data.slice(
  //   (currentPage - 1) * pageSize,
  //   currentPage * pageSize
  // )

  return (
    <Table
      columns={columns}
      dataSource={data}
      // loading={loading}
      pagination={false} // Pagination handled by <Pagination /> outside
      scroll={{ x: 'max-content' }}
      rowKey={(record) => record._id}
    />
  )
}

export default TableView
