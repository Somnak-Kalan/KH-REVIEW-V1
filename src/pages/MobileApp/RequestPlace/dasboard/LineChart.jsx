import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

const LineChart = () => {
  const chartRef = useRef(null)

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current)

    const option = {
      title: {
        text: 'Line Chart',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Sales',
          type: 'line',
          data: [120, 200, 150, 80, 70, 110, 130],
          smooth: true,
        },
      ],
    }

    chartInstance.setOption(option)

    const handleResize = () => {
      chartInstance.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.dispose()
    }
  }, [])

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
}

export default LineChart
