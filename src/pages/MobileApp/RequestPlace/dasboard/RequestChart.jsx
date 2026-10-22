import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

const OrderStatistics = () => {
  const chartRef = useRef(null)

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current)
    const option = {
      title: {
        left: 'center',
        textStyle: {
          fontSize: 14,
          color: '#1f2937',
        },
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['All Request', 'Accepted', 'Review', 'Pending', 'Rejected'],
        top: '0%',
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value',
        min: 0,
        boundaryGap: [0, '10%'],
      },
      series: [
        {
          name: 'All Request',
          type: 'line',
          data: [12, 19, 3, 5, 2, 3, 7],
          smooth: true,
          lineStyle: { color: 'rgb(59, 130, 246)' },
          areaStyle: { color: 'rgba(59, 130, 246, 0.1)' },
        },
        {
          name: 'Accepted',
          type: 'line',
          data: [2, 3, 20, 5, 1, 4, 10],
          smooth: true,
          lineStyle: { color: 'rgb(16, 185, 129)' },
          areaStyle: { color: 'rgba(16, 185, 129, 0.1)' },
        },
        {
          name: 'Review',
          type: 'line',
          data: [5, 15, 10, 3, 8, 5, 2],
          smooth: true,
          lineStyle: { color: 'rgb(169, 150, 11)' },
          areaStyle: { color: 'rgba(244, 211, 94, 0.1)' },
        },
        {
          name: 'Pending',
          type: 'line',
          data: [7, 10, 8, 12, 5, 3, 4],
          smooth: true,
          lineStyle: { color: 'rgb(214, 80, 31)' },
          areaStyle: { color: 'rgba(214, 80, 31, 0.1)' },
        },
        {
          name: 'Rejected',
          type: 'line',
          data: [3, 5, 8, 6, 10, 12, 14],
          smooth: true,
          lineStyle: { color: 'rgb(244, 63, 94)' },
          areaStyle: { color: 'rgba(244, 63, 94, 0.1)' },
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

  return (
    <div className='bg-white border border-gray-100 shadow-md rounded-md overflow-hidden'>
      <div>
        <div
          style={{ color: '#1f2937' }}
          className='font-bold my-5 text-center'
        >
          Request Location Statistics
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 xxl:grid-cols-5 gap-4 mb-4 mx-1 sm:mx-8 xl:mx-24 2xl:mx-28'>
          <div className='rounded-md border border-dashed border-gray-200 p-4'>
            <div className='flex items-center mb-0.5'>
              <div className='text-xl font-semibold'>10</div>
              <span className='p-1 rounded text-[12px] font-semibold bg-blue-500/10 text-blue-500 leading-none ml-1'>
                80%
              </span>
            </div>
            <span className='text-gray-400 text-sm'>All Requests</span>
          </div>
          <div className='rounded-md border border-dashed border-gray-200 p-4'>
            <div className='flex items-center mb-0.5'>
              <div className='text-xl font-semibold'>50</div>
              <span className='p-1 rounded text-[12px] font-semibold bg-emerald-500/10 text-emerald-500 leading-none ml-1'>
                +46.9%
              </span>
            </div>
            <span className='text-gray-400 text-sm'>Accepted</span>
          </div>
          <div className='rounded-md border border-dashed border-gray-200 p-4'>
            <div className='flex items-center mb-0.5'>
              <div className='text-xl font-semibold'>4</div>
              <span className='p-1 rounded text-[12px] font-semibold bg-yellow-500/10 text-yellow-500 leading-none ml-1'>
                13%
              </span>
            </div>
            <span className='text-gray-400 text-sm'>Review</span>
          </div>
          <div className='rounded-md border border-dashed border-gray-200 p-4'>
            <div className='flex items-center mb-0.5'>
              <div className='text-xl font-semibold'>4</div>
              <span className='p-1 rounded text-[12px] font-semibold bg-orange-500/10 text-orange-500 leading-none ml-1'>
                13%
              </span>
            </div>
            <span className='text-gray-400 text-sm'>Pending</span>
          </div>
          <div className='rounded-md border border-dashed border-gray-200 p-4'>
            <div className='flex items-center mb-0.5'>
              <div className='text-xl font-semibold'>4</div>
              <span className='p-1 rounded text-[12px] font-semibold bg-red-500/10 text-red-500 leading-none ml-1'>
                -13%
              </span>
            </div>
            <span className='text-gray-400 text-sm'>Rejected</span>
          </div>
        </div>

        {/* Chart Container */}
      </div>
      <div
        className='overflow-hidden'
        style={{ width: '100%', height: '400px' }}
        ref={chartRef}
      ></div>
    </div>
  )
}

export default OrderStatistics
