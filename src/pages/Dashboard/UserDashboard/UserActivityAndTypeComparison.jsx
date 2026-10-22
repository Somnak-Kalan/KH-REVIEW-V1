import React, { useState } from 'react'
import ReactEcharts from 'echarts-for-react'
import { Divider } from 'antd'

export default function UserDashboard() {
  // Set initial year to last full year
  const currentYear = new Date().getFullYear()
  const availableYears = [currentYear - 1, currentYear - 2, currentYear - 3]
  const [year, setYear] = useState(availableYears[0])

  // State for month selection (index)
  // The months array now has 12 elements; default selects the last one.
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(11)

  // Base data arrays (will be scaled dynamically)
  const baseActiveData = [
    400, 300, 200, 278, 189, 239, 349, 360, 340, 320, 310, 300,
  ]
  const baseInactiveData = [
    240, 139, 980, 390, 480, 380, 430, 410, 400, 390, 380, 370,
  ]
  const baseBusinessData = [
    240, 221, 229, 200, 218, 250, 210, 205, 200, 195, 190, 185,
  ]
  const baseNormalData = [
    240, 229, 200, 218, 250, 210, 220, 215, 210, 205, 200, 195,
  ]
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // Function to simulate dynamic data based on the selected year.
  // Factor is 1.0 when year equals currentYear-1.
  const generateData = (selectedYear) => {
    const factor = 1 + (selectedYear - (currentYear - 1)) * 0.1
    return {
      activeData: baseActiveData.map((num) => Math.round(num * factor)),
      inactiveData: baseInactiveData.map((num) => Math.round(num * factor)),
      businessData: baseBusinessData.map((num) => Math.round(num * factor)),
      normalData: baseNormalData.map((num) => Math.round(num * factor)),
    }
  }

  // Generate dynamic data based on the current selected year
  const { activeData, inactiveData, businessData, normalData } =
    generateData(year)

  // Slice data arrays based on the selected month index.
  // (Cumulative data from January through the selected month.)
  const slicedActiveData = activeData.slice(0, selectedMonthIndex + 1)
  const slicedInactiveData = inactiveData.slice(0, selectedMonthIndex + 1)
  const slicedBusinessData = businessData.slice(0, selectedMonthIndex + 1)
  const slicedNormalData = normalData.slice(0, selectedMonthIndex + 1)
  const slicedMonths = months.slice(0, selectedMonthIndex + 1)

  // Option configuration for the Active vs. Inactive Users chart
  const optionActiveInactive = {
    // title: {
    //   text: `User Activity Overview - ${year}`,
    //   left: 'center',
    // },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['Active Users', 'Inactive Users'],
      top: '0%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: slicedMonths,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Active Users',
        type: 'line',
        data: slicedActiveData,
        smooth: true,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
      },
      {
        name: 'Inactive Users',
        type: 'line',
        data: slicedInactiveData,
        smooth: true,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
      },
    ],
  }

  // Option configuration for the Business vs. Normal Users chart
  const optionUserTypes = {
    title: {
      // text: `User Types Comparison - ${year}`,
      left: 'center',
      top: '-6',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['Business Users', 'Normal Users'],
      top: '0%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: slicedMonths,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Business Users',
        type: 'line',
        data: slicedBusinessData,
        smooth: true,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
      },
      {
        name: 'Normal Users',
        type: 'line',
        data: slicedNormalData,
        smooth: true,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
      },
    ],
  }

  // Handlers for changing the year via buttons
  const handlePreviousYear = () => setYear((prevYear) => prevYear - 1)
  const handleNextYear = () => setYear((prevYear) => prevYear + 1)

  // Handler for changing the year via dropdown selection
  const handleSelectChange = (e) => setYear(Number(e.target.value))

  // Calculate current month index for current year
  const currentMonthIndex = new Date().getMonth()
  // Determine available months if the current year is selected;
  // Otherwise, use all months.
  const availableMonthsComputed =
    year === currentYear ? months.slice(0, currentMonthIndex + 1) : months
  // effectiveMonthIndex is the minimum between the selected month index and currentMonthIndex if current year
  const effectiveMonthIndexComputed =
    year === currentYear
      ? Math.min(selectedMonthIndex, currentMonthIndex)
      : selectedMonthIndex

  return (
    <div style={{ padding: '20px' }}>
      <div className='flex justify-center'>
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={handlePreviousYear}
            style={{
              padding: '8px 12px',
              marginRight: '5px',
              backgroundColor: '#f0f0f0',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px',
            }}
          >
            Previous Year
          </button>
          <span
            style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 10px' }}
          >
            <input
              type='number'
              value={year}
              onChange={(e) => {
                const newYear = parseInt(e.target.value, 10)
                if (!isNaN(newYear)) {
                  setYear(newYear)
                  if (
                    newYear === currentYear &&
                    selectedMonthIndex > currentMonthIndex
                  ) {
                    setSelectedMonthIndex(currentMonthIndex)
                  }
                }
              }}
              style={{
                width: '80px',
                padding: '4px',
                fontSize: '16px',
                textAlign: 'center',
              }}
            />
          </span>
          <button
            onClick={handleNextYear}
            disabled={year === currentYear}
            style={{
              padding: '8px 12px',
              marginLeft: '5px',
              backgroundColor: year === currentYear ? '#d9d9d9' : '#f0f0f0',
              color: year === currentYear ? '#888' : '#000',
              border: 'none',
              cursor: year === currentYear ? 'not-allowed' : 'pointer',
              borderRadius: '5px',
            }}
          >
            Next Year
          </button>
        </div>
      </div>
      {/* Month Selection Buttons */}
      <div style={{ marginBottom: '10px' }} className='flex justify-center'>
        {(year === currentYear ? availableMonthsComputed : months).map(
          (month, index) => (
            <button
              key={index}
              onClick={() => setSelectedMonthIndex(index)}
              disabled={year === currentYear && index > currentMonthIndex}
              style={{
                padding: '6px 10px',
                margin: '2px',
                backgroundColor:
                  effectiveMonthIndexComputed === index ? '#52c41a' : '#f0f0f0',
                color: effectiveMonthIndexComputed === index ? '#fff' : '#000',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
            >
              {month}
            </button>
          )
        )}
      </div>
      <Divider />
      <div className='font-bold text-lg text-center'>
        User Activity Overview - {year}
      </div>
      {/* Chart for Active vs. Inactive Users */}
      <div style={{ marginBottom: '40px' }}>
        <ReactEcharts
          option={optionActiveInactive}
          style={{ height: '300px', width: '100%' }}
        />
      </div>
      {/* Chart for Business vs. Normal Users */}
      <div className='font-bold text-lg text-center'>
        User Types Comparison - {year}
      </div>
      <div>
        <ReactEcharts
          option={optionUserTypes}
          style={{ height: '300px', width: '100%' }}
        />
      </div>
    </div>
  )
}
