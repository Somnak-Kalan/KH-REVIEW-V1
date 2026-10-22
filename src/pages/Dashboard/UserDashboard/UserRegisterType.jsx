import React, { useState } from 'react'
import ReactEcharts from 'echarts-for-react'

export default function ColumnChart() {
  // Get current year for default value
  const currentYear = new Date().getFullYear()

  // Create an array for the year filter: "all" plus a few past years and current year.
  const years = [
    'all',
    currentYear - 3,
    currentYear - 2,
    currentYear - 1,
    currentYear,
  ]

  // State for selected year. Initially set to currentYear.
  // When "all" is selected, the value will be the string "all".
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // Base data arrays for the registration types (simulated)
  const baseSeriesData = [
    { value: 500, itemStyle: { color: '#5470C6' } },
    { value: 200, itemStyle: { color: '#91CC75' } },
    { value: 150, itemStyle: { color: '#FAC858' } },
    { value: 300, itemStyle: { color: '#EE6666' } },
  ]

  // Function to simulate dynamic data based on the selected year.
  // When selectedYear equals currentYear, factor = 1.0.
  // For other years, the factor changes by 5% per year.
  const generateData = (year) => {
    if (year === 'all') {
      return baseSeriesData
    }
    const factor = 1 + (year - currentYear) * 0.05
    return baseSeriesData.map((data) => ({
      value: Math.round(data.value * factor),
      itemStyle: data.itemStyle,
    }))
  }

  const seriesData = generateData(selectedYear)

  const option = {
    title: {
      // text: `User Registration Types - ${
      //   selectedYear === 'all' ? 'All Years' : selectedYear
      // }`,
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
      data: ['Users'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: [
        'Active Users',
        'Inactive Users',
        'Business Users',
        'Normal Users',
      ],
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Users',
        type: 'bar',
        data: seriesData,
        barWidth: '40%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
      },
    ],
  }

  // Handler for the "Previous Year" button
  const handlePreviousYear = () => {
    if (selectedYear === 'all') {
      // If "all" is selected, set to the highest numeric year (currentYear)
      setSelectedYear(currentYear)
    } else {
      setSelectedYear((prevYear) => prevYear - 1)
    }
  }

  // Handler for the "Next Year" button
  const handleNextYear = () => {
    if (selectedYear === 'all') {
      // Do nothing if "all" is selected.
      return
    }
    if (selectedYear < currentYear) {
      setSelectedYear((prevYear) => prevYear + 1)
    }
  }

  // Handler for the "All Years" button
  const handleAllYears = () => {
    setSelectedYear('all')
  }

  return (
    <div style={{ padding: '20px' }}>
      <div className='text-gray-500 font-bold text-lg text-center mb-4'>
        User Registration Types -{' '}
        {selectedYear === 'all' ? 'All Years' : selectedYear}
      </div>
      {/* Year Navigation Controls */}
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        <button
          onClick={handlePreviousYear}
          style={{
            padding: '8px 12px',
            marginRight: '10px',
            backgroundColor: '#f0f0f0',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px',
          }}
        >
          Previous Year
        </button>
        <input
          type='number'
          value={selectedYear === 'all' ? '' : selectedYear}
          onChange={(e) => {
            const newYear = parseInt(e.target.value, 10)
            if (!isNaN(newYear)) {
              setSelectedYear(newYear)
            }
          }}
          placeholder={selectedYear === 'all' ? 'All Years' : ''}
          style={{
            width: '100px',
            padding: '6px',
            fontSize: '16px',
            textAlign: 'center',
          }}
        />
        <button
          onClick={handleNextYear}
          style={{
            padding: '8px 12px',
            marginRight: '10px',
            backgroundColor:
              selectedYear === currentYear || selectedYear === 'all'
                ? '#d9d9d9'
                : '#f0f0f0',
            color:
              selectedYear === currentYear || selectedYear === 'all'
                ? '#888'
                : '#000',
            border: 'none',
            cursor:
              selectedYear === currentYear || selectedYear === 'all'
                ? 'not-allowed'
                : 'pointer',
            borderRadius: '5px',
          }}
          disabled={selectedYear === currentYear || selectedYear === 'all'}
        >
          Next Year
        </button>
        <button
          onClick={handleAllYears}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f0f0f0',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px',
          }}
        >
          All Years
        </button>
      </div>
      {/* Year Input Field */}

      <ReactEcharts
        option={option}
        style={{ height: '400px', width: '100%' }}
      />
    </div>
  )
}
