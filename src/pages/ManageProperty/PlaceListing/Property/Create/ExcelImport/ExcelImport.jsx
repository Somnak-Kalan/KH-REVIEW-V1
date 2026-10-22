import React, { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { Table, Modal, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

/** Utility function to truncate a string to a given length, then add "..." */
function truncateText(value, length = 40) {
  const str = String(value ?? '')
  return str.length > length ? str.slice(0, length) + '...' : str
}

/**
 * Convert an Excel serial date (e.g., 45623) to a JS Date, then format as DD/MM/YY.
 * Excel’s day "1" is 1899-12-31, but practically speaking, you can use 1899-12-30
 * and skip the leap-year bug for dates after 1900.
 */
function excelSerialToDateString(serial) {
  // Take only the integer part as "days since 1899-12-30"
  const days = Math.floor(serial)
  const excelEpoch = new Date(1899, 11, 30) // 1899-12-30
  const jsDate = new Date(excelEpoch.getTime() + days * 86400000)

  // Format as DD/MM/YY
  const day = String(jsDate.getDate()).padStart(2, '0')
  const month = String(jsDate.getMonth() + 1).padStart(2, '0')
  const year = String(jsDate.getFullYear()).slice(-2) // only last two digits
  return `${day}/${month}/${year}`
}

/**
 * Convert fractional day (e.g., 0.75) to time in HH:MM AM/PM format.
 * 0.75 * 24 = 18 → 6 PM
 */
function fractionToTime(fraction) {
  const totalMinutes = fraction * 24 * 60
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  const period = hours >= 12 ? 'PM' : 'AM'
  const adjustedHours = hours % 12 || 12
  const formattedHours = adjustedHours.toString().padStart(2, '0')
  const formattedMinutes = minutes.toString().padStart(2, '0')
  return `${formattedHours}:${formattedMinutes} ${period}`
}

/**
 * Convert a string time like "06:00" or "18:00" to HH:MM AM/PM format.
 */
function formatStringTime(timeStr) {
  const date = new Date(`1970-01-01T${timeStr}`)
  if (isNaN(date)) return timeStr // If parsing fails, return original

  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  const adjustedHours = hours % 12 || 12
  const formattedHours = adjustedHours.toString().padStart(2, '0')
  const formattedMinutes = minutes.toString().padStart(2, '0')
  return `${formattedHours}:${formattedMinutes} ${period}`
}

export default function ExcelImport() {
  const fileInputRef = useRef(null)
  const [columns, setColumns] = useState([])
  const [dataSource, setDataSource] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Convert 2D array => antd Table columns/data
  const convertToTableData = (excelArray) => {
    if (!excelArray || excelArray.length === 0) return

    // The first row is assumed to be headers
    const headerRow = excelArray[0]
    const dataRows = excelArray.slice(1)

    // Build columns from the first row
    const newColumns = headerRow.map((headerText, colIndex) => {
      const title = truncateText(headerText, 40) || `Column ${colIndex}`
      return {
        title,
        dataIndex: `col_${colIndex}`,
        key: `col_${colIndex}`,
        render: (value) => {
          // 1) If it's a number, check if it's a fractional time or a date serial
          if (typeof value === 'number') {
            // If value is between 0 (inclusive) and 1 (exclusive), treat as fractional time
            if (value >= 0 && value < 1) {
              return fractionToTime(value)
            }
            // If it's >= 60 (roughly 1900-03-01 onward), treat as a date
            // (Excel's day 60 is 1900-02-29 which is a leap-day bug, but this is good enough for modern dates)
            if (value >= 60) {
              return excelSerialToDateString(value)
            }
            // Otherwise, just truncate if it doesn't fit the above logic
            return truncateText(value, 40)
          }

          // 2) If it's a string, check if it's a known date or time pattern
          if (typeof value === 'string') {
            // If it matches dd/mm/yy pattern, return as-is
            if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(value)) {
              return value
            }
            // If it has a colon, assume it's a time
            if (value.includes(':')) {
              return formatStringTime(value)
            }
          }

          // 3) Otherwise, truncate
          return truncateText(value, 40)
        },
      }
    })

    // Create data objects for antd Table
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

  // Handle file upload and parse
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target.result
      // Parse the binary string
      const workbook = XLSX.read(bstr, { type: 'binary' })
      const worksheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[worksheetName]

      // Convert sheet => 2D array
      const excelArray = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      convertToTableData(excelArray)

      // Show modal automatically after parse
      setIsModalOpen(true)
    }
    reader.readAsBinaryString(file)
  }

  // Programmatically trigger file input click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Reset in case same file is chosen
      fileInputRef.current.click()
    }
  }

  // Handler for the Submit button in the modal
  const handleModalSubmit = () => {
    console.log('Submitting Excel data:', dataSource)
    setIsModalOpen(false)
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        type='file'
        accept='.xlsx, .xls'
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* The visible button to open file dialog */}
      <Button
        type='primary'
        icon={<PlusOutlined />}
        onClick={handleImportClick}
      >
        Import
      </Button>

      <Modal
        title='Parsed Excel Data'
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key='cancel' onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button key='submit' type='primary' onClick={handleModalSubmit}>
            Submit
          </Button>,
        ]}
        width={1000}
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: 'max-content' }}
          bordered
          pagination={false}
        />
      </Modal>
    </>
  )
}
