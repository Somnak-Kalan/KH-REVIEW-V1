import React from 'react'
import ReactEcharts from 'echarts-for-react'

export default function PlaceTypeCompare() {
  // Sample data
  const businessActive = 120
  const businessInactive = 80
  const nonBusinessActive = 300
  const nonBusinessInactive = 150

  const option = {
    title: {
      text: 'Place Type Comparison',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow', // adds a shadow effect on hover for clarity
      },
    },
    legend: {
      data: ['Active', 'Inactive'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['Business', 'Non-Business'],
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Active',
        type: 'bar',
        barWidth: '40%',
        data: [businessActive, nonBusinessActive],
        itemStyle: { color: '#5470C6' },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}', // shows the numeric value
        },
      },
      {
        name: 'Inactive',
        type: 'bar',
        barWidth: '40%',
        data: [businessInactive, nonBusinessInactive],
        itemStyle: { color: '#EE6666' },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
      },
    ],
  }

  return (
    <div>
      <ReactEcharts
        option={option}
        style={{ height: '400px', width: '100%' }}
      />
    </div>
  )
}
