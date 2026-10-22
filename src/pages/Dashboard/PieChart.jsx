import React from 'react'
import ReactECharts from 'echarts-for-react'
const PieChart = () => {
  const options = {
    title: { text: 'Pie Chart', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: [
          { value: 40, name: 'A' },
          { value: 20, name: 'B' },
          { value: 25, name: 'C' },
          { value: 15, name: 'D' },
        ],
      },
    ],
  }

  return (
    <ReactECharts option={options} style={{ height: '400px', width: '100%' }} />
  )
}

export default PieChart
