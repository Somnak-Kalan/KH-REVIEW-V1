//-------------***-----------------
//import style from ant-design
import { Table } from 'antd'
import { useState } from 'react'
//end import style from ant-design
//------------***------------------
// rowSelection object indicates the need for row selection

//------------main part------------
const Tables = ({ columns, data, loading, onRowSelection }) => {
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      onRowSelection(selectedRows[0])
    },
  }
  const handleRowClick = () => {}
  const [selectionType, setSelectionType] = useState('radio')
  return (
    <>
      <div>
        {/* ant-design table */}

        <Table
          rowKey={(row) => row.id}
          rowSelection={{
            type: selectionType,
            ...rowSelection,
          }}
          columns={columns}
          dataSource={data}
          bordered
          loading={loading}
          size='small'
          scroll={{ x: '50vw' }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
        {/* end ant-design table */}
      </div>
    </>
  )
}
//-----------end main part----------
// export to display
export default Tables
