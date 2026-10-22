import * as ExcelJS from 'exceljs'

const ExportExcelFile = (cols = [], data = [], fileName = 'file') => {
  //
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet1')
  //
  worksheet.columns = cols
  worksheet.addRows(data)
  //
  // Create a buffer
  workbook.xlsx.writeBuffer().then((buffer) => {
    // Create a Blob from the buffer
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Create a download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.xlsx`
    a.click()

    // Release the object URL
    URL.revokeObjectURL(url)
  })
  //
}
//
export default ExportExcelFile
