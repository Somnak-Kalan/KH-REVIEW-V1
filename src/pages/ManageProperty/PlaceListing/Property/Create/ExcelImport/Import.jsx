// import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react'
// import * as XLSX from 'xlsx'
// import { Table, Empty, Button } from 'antd'

// function truncateText(value, length = 40) {
//   const str = String(value ?? '')
//   return str.length > length ? str.slice(0, length) + '...' : str
// }

// function excelSerialToDateString(serial) {
//   const days = Math.floor(serial)
//   const excelEpoch = new Date(1899, 11, 30) // 1899-12-30
//   const jsDate = new Date(excelEpoch.getTime() + days * 86400000)
//   const day = String(jsDate.getDate()).padStart(2, '0')
//   const month = String(jsDate.getMonth() + 1).padStart(2, '0')
//   const year = String(jsDate.getFullYear()).slice(-2)
//   return `${day}/${month}/${year}`
// }

// function fractionToTime(fraction) {
//   const totalMinutes = fraction * 24 * 60
//   const hours = Math.floor(totalMinutes / 60)
//   const minutes = Math.round(totalMinutes % 60)
//   const period = hours >= 12 ? 'PM' : 'AM'
//   const adjustedHours = hours % 12 || 12
//   return `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
// }

// function formatStringTime(timeStr) {
//   const date = new Date(`1970-01-01T${timeStr}`)
//   if (isNaN(date)) return timeStr
//   const hours = date.getHours()
//   const minutes = date.getMinutes()
//   const period = hours >= 12 ? 'PM' : 'AM'
//   const adjustedHours = hours % 12 || 12
//   return `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
// }

// const ExcelImport = forwardRef((props, ref) => {
//   const fileInputRef = useRef(null)
//   const [columns, setColumns] = useState([])
//   const [dataSource, setDataSource] = useState([])
//   const [loading, setLoading] = useState(false)

//   useImperativeHandle(ref, () => ({
//     triggerFileUpload() {
//       if (fileInputRef.current) {
//         fileInputRef.current.value = ''
//         fileInputRef.current.click()
//       }
//     },
//   }))

//   const handleRemoveRow = (key) => {
//     setDataSource((prevData) => prevData.filter((row) => row.key !== key))
//   }

//   const convertToTableData = (excelArray) => {
//     if (!excelArray || excelArray.length === 0) return
//     const headerRow = excelArray[0]
//     let dataRows = excelArray.slice(1)

//     // Filter out rows that are completely empty overall
//     dataRows = dataRows.filter((row) =>
//       row.some(
//         (cell) =>
//           cell !== undefined && cell !== null && String(cell).trim() !== ''
//       )
//     )

//     // Build columns from Excel header row
//     const newColumns = headerRow.map((headerText, colIndex) => {
//       const title = truncateText(headerText, 40) || `Column ${colIndex}`
//       return {
//         title,
//         dataIndex: `col_${colIndex}`,
//         key: `col_${colIndex}`,
//         render: (value) => {
//           if (typeof value === 'number') {
//             if (value >= 0 && value < 1) {
//               return fractionToTime(value)
//             }
//             if (value >= 60) {
//               return excelSerialToDateString(value)
//             }
//             return truncateText(value, 40)
//           }
//           if (typeof value === 'string') {
//             if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(value)) {
//               return value
//             }
//             if (value.includes(':')) {
//               return formatStringTime(value)
//             }
//           }
//           return truncateText(value, 40)
//         },
//       }
//     })

//     // Create the "Action" column for removing a row
//     const actionColumn = {
//       title: 'Action',
//       key: 'action',
//       render: (_, record) => (
//         <Button type='link' onClick={() => handleRemoveRow(record.key)}>
//           <svg
//             width={15}
//             height={15}
//             viewBox='0 0 24 24'
//             fill='none'
//             stroke='red'
//             strokeWidth='2'
//             strokeLinecap='round'
//             strokeLinejoin='round'
//             xmlns='http://www.w3.org/2000/svg'
//             {...props}
//           >
//             <polyline points='3 6 5 6 21 6' />
//             <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
//             <line x1='10' y1='11' x2='10' y2='17' />
//             <line x1='14' y1='11' x2='14' y2='17' />
//             <path d='M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' />
//           </svg>
//         </Button>
//       ),
//     }

//     // Insert the action column at the beginning
//     newColumns.unshift(actionColumn)

//     const newDataSource = dataRows.map((row, rowIndex) => {
//       const rowObj = { key: rowIndex }
//       row.forEach((cellVal, cIndex) => {
//         rowObj[`col_${cIndex}`] = cellVal
//       })
//       return rowObj
//     })

//     setColumns(newColumns)
//     setDataSource(newDataSource)
//   }

//   const handleFileChange = (e) => {
//     const file = e.target.files[0]
//     if (!file) return
//     setLoading(true)
//     const reader = new FileReader()
//     reader.onload = (evt) => {
//       const bstr = evt.target.result
//       const workbook = XLSX.read(bstr, { type: 'binary' })
//       const worksheetName = workbook.SheetNames[0]
//       const worksheet = workbook.Sheets[worksheetName]
//       const excelArray = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
//       convertToTableData(excelArray)
//       setLoading(false)
//     }
//     reader.readAsBinaryString(file)
//   }
//   const [isEmpty, setIsEmpty] = useState(false)
//   return (
//     <>
//       <input
//         type='file'
//         accept='.xlsx, .xls'
//         ref={fileInputRef}
//         style={{ display: 'none' }}
//         onChange={handleFileChange}
//       />
//       {dataSource.length > 0 ? (
//         <span className='divider-row'>
//           <Table
//             columns={columns}
//             dataSource={dataSource}
//             loading={loading}
//             scroll={{ x: 'max-content' }}
//             bordered
//             pagination={false}
//             rowClassName={(record) => {
//               const isEmpty = [2, 3, 4, 5].every((colIndex) => {
//                 const cell = record[`col_${colIndex}`]
//                 return (
//                   cell === undefined ||
//                   cell === null ||
//                   String(cell).trim() === ''
//                 )
//               })
//               return isEmpty ? 'divider-row' : ''
//             }}
//           />
//         </span>
//       ) : (
//         !loading && (
//           <Empty
//             description='No data exists'
//             image={Empty.PRESENTED_IMAGE_SIMPLE}
//           />
//         )
//       )}
//     </>
//   )
// })

// export default ExcelImport
import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import * as XLSX from 'xlsx'

function truncateText(value, length = 40) {
  const str = String(value ?? '')
  return str.length > length ? str.slice(0, length) + '...' : str
}

function excelSerialToDateString(serial) {
  const days = Math.floor(serial)
  const excelEpoch = new Date(1899, 11, 30) // 1899-12-30
  const jsDate = new Date(excelEpoch.getTime() + days * 86400000)
  const day = String(jsDate.getDate()).padStart(2, '0')
  const month = String(jsDate.getMonth() + 1).padStart(2, '0')
  const year = String(jsDate.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

function fractionToTime(fraction) {
  const totalMinutes = fraction * 24 * 60
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  const period = hours >= 12 ? 'PM' : 'AM'
  const adjustedHours = hours % 12 || 12
  return `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
}

function formatStringTime(timeStr) {
  const date = new Date(`1970-01-01T${timeStr}`)
  if (isNaN(date)) return timeStr
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  const adjustedHours = hours % 12 || 12
  return `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
}

const ExcelImport = forwardRef((props, ref) => {
  const fileInputRef = useRef(null)
  const [columns, setColumns] = useState([])
  const [dataSource, setDataSource] = useState([])
  const [loading, setLoading] = useState(false)

  useImperativeHandle(ref, () => ({
    triggerFileUpload() {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
        fileInputRef.current.click()
      }
    },
  }))

  const handleRemoveRow = (key) => {
    setDataSource((prevData) => prevData.filter((row) => row.key !== key))
  }

  const convertToTableData = (excelArray) => {
    if (!excelArray || excelArray.length === 0) return
    const headerRow = excelArray[0]
    let dataRows = excelArray.slice(1)

    // Filter out rows that are completely empty overall
    dataRows = dataRows.filter((row) =>
      row.some(
        (cell) =>
          cell !== undefined && cell !== null && String(cell).trim() !== ''
      )
    )

    // Build columns from Excel header row
    const newColumns = headerRow.map((headerText, colIndex) => {
      const title = truncateText(headerText, 40) || `Column ${colIndex}`
      return {
        title,
        dataIndex: `col_${colIndex}`,
        key: `col_${colIndex}`,
        render: (value) => {
          if (typeof value === 'number') {
            if (value >= 0 && value < 1) {
              return fractionToTime(value)
            }
            if (value >= 60) {
              return excelSerialToDateString(value)
            }
            return truncateText(value, 40)
          }
          if (typeof value === 'string') {
            if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(value)) {
              return value
            }
            if (value.includes(':')) {
              return formatStringTime(value)
            }
          }
          return truncateText(value, 40)
        },
      }
    })

    // Create the "Action" column for removing a row
    const actionColumn = {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <button
          onClick={() => handleRemoveRow(record.key)}
          className='text-red-500 hover:underline'
        >
          <svg
            width={15}
            height={15}
            viewBox='0 0 24 24'
            fill='none'
            stroke='red'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            xmlns='http://www.w3.org/2000/svg'
          >
            <polyline points='3 6 5 6 21 6' />
            <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
            <line x1='10' y1='11' x2='10' y2='17' />
            <line x1='14' y1='11' x2='14' y2='17' />
            <path d='M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2' />
          </svg>
        </button>
      ),
    }

    // Insert the action column at the beginning
    newColumns.unshift(actionColumn)

    const newDataSource = dataRows.map((row, rowIndex) => {
      const rowObj = { key: rowIndex }
      row.forEach((cellVal, cIndex) => {
        rowObj[`col_${cIndex}`] = cellVal
      })
      return rowObj
    })

    setColumns(newColumns)
    setDataSource(newDataSource)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target.result
      const workbook = XLSX.read(bstr, { type: 'binary' })
      const worksheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[worksheetName]
      const excelArray = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      convertToTableData(excelArray)
      setLoading(false)
    }
    reader.readAsBinaryString(file)
  }

  return (
    <>
      <input
        type='file'
        accept='.xlsx, .xls'
        ref={fileInputRef}
        className='hidden'
        onChange={handleFileChange}
      />
      {dataSource.length > 0 ? (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead style={{ background: '#001529', color: 'white' }}>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className='px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider whitespace-nowrap'
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {dataSource.map((record) => {
                // Check if the row does NOT have keys for columns 2, 3, 4, and 5
                const emptyRow = [2, 3, 4, 5].every((colIndex) =>
                  record.hasOwnProperty(`col_${colIndex}`)
                )
                const rowClasses = emptyRow ? '' : 'bg-red-200'
                return (
                  <tr key={record.key} className={rowClasses}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                      >
                        {col.render(record[col.dataIndex], record)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <div className='text-center py-4'>No data exists</div>
      )}
    </>
  )
})

export default ExcelImport
