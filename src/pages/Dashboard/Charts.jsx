import React from 'react'
import ReactECharts from 'echarts-for-react'

const HorizontalBarChart = () => {
  const options = {
    title: {
      text: 'Sales by Day',
      left: 'center',
      top: '5%',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: '{a} <br/>{b}: {c}',
    },
    xAxis: {
      type: 'value', // Horizontal axis shows the values
      boundaryGap: [0, 0.01],
    },
    yAxis: {
      type: 'category', // Vertical axis shows categories
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], // Example categories
    },
    series: [
      {
        name: 'Sales',
        type: 'bar',
        data: [150, 230, 224, 218, 135], // Example data points
        itemStyle: {
          color: '#FF5722', // Consistent color with LineGraph example
        },
        label: {
          show: true,
          position: 'right', // Display values at the end of each bar
          formatter: '{c}', // Show value only
        },
      },
    ],
  }

  return (
    <div>
      <h3>Horizontal Bar Chart</h3>
      <ReactECharts
        option={options}
        style={{ height: '400px', width: '100%' }}
      />
    </div>
  )
}

export default HorizontalBarChart
