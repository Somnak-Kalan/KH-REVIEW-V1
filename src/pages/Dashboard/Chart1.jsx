import React from 'react'
import ReactECharts from 'echarts-for-react'

const DonutChart = () => {
  const options = {
    title: {
      text: 'Sales by Category',
      left: 'center',
      top: '5%',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['Electronics', 'Furniture', 'Grocery', 'Clothing', 'Books'],
    },
    series: [
      {
        name: 'Sales Breakdown',
        type: 'pie',
        radius: ['40%', '70%'], // Inner and outer radius for donut shape
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {d}%', // Show category and percentage
        },
        labelLine: {
          show: true,
        },
        data: [
          { value: 335, name: 'Electronics' },
          { value: 310, name: 'Furniture' },
          { value: 234, name: 'Grocery' },
          { value: 135, name: 'Clothing' },
          { value: 1548, name: 'Books' },
        ],
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
  }

  return (
    <div>
      <h3>Donut Chart</h3>
      <ReactECharts
        option={options}
        style={{ height: '400px', width: '100%' }}
      />
    </div>
  )
}

export default DonutChart
