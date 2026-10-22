import React from 'react'
import ReactECharts from 'echarts-for-react'

const BasicColumnChart = () => {
  const options = {
    title: {
      text: 'Basic Column Chart',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow', // Display a shadow pointer for better readability
      },
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Categories for each column
      axisLabel: {
        rotate: 45, // Optional: rotate labels if they are too long
      },
    },
    yAxis: {
      type: 'value',
      name: 'Value', // Label for the Y-axis
    },
    series: [
      {
        name: 'Values',
        type: 'bar', // Column chart type
        data: [120, 200, 150, 80, 70, 110, 130], // Data values for each category
        itemStyle: {
          color: '#4CAF50', // Custom color for the columns
        },
      },
    ],
  }

  return (
    <ReactECharts option={options} style={{ height: '400px', width: '100%' }} />
  )
}

export default BasicColumnChart
