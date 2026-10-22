import React, { useState } from 'react'
import ReactEcharts from 'echarts-for-react'

export default function StatusChart() {
  // Get current year
  const currentYear = new Date().getFullYear()

  // All months array
  const allMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Sample data arrays for the current year (12 months)
  const currentYearData = {
    pending: [120, 132, 101, 134, 90, 230, 210, 180, 150, 200, 170, 220],
    active: [220, 182, 191, 234, 290, 330, 310, 300, 280, 250, 270, 320],
    inactive: [150, 232, 201, 154, 190, 330, 410, 350, 300, 280, 320, 300],
    nonPending: [320, 332, 301, 334, 390, 330, 320, 310, 300, 290, 280, 270],
    draft: [820, 932, 901, 934, 1290, 1330, 1320, 1280, 1250, 1200, 1100, 1150],
  }

  // Sample data arrays for previous years (using same sample data for demonstration)
  const previousYearData = {
    pending: [100, 140, 110, 130, 95, 220, 200, 170, 160, 210, 160, 210],
    active: [210, 190, 180, 240, 300, 320, 300, 290, 270, 260, 280, 310],
    inactive: [140, 220, 190, 160, 180, 320, 400, 340, 310, 270, 310, 290],
    nonPending: [310, 320, 290, 320, 380, 310, 310, 300, 290, 280, 270, 260],
    draft: [800, 920, 890, 920, 1270, 1310, 1300, 1260, 1230, 1190, 1080, 1140],
  }

  // Get current month index (0 for January, 1 for February, etc.)
  const currentMonthIndex = new Date().getMonth()

  // State to track selected year and selected month index.
  // For current year, only months up to currentMonthIndex are clickable.
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonthIndex, setSelectedMonthIndex] =
    useState(currentMonthIndex)

  // Determine available months based on selected year:
  // When the current year is selected, only allow months up to the current month.
  const availableMonths =
    selectedYear === currentYear
      ? allMonths.slice(0, currentMonthIndex + 1)
      : allMonths

  // Ensure selectedMonthIndex is within bounds for the current year.
  const effectiveMonthIndex =
    selectedYear === currentYear
      ? Math.min(selectedMonthIndex, currentMonthIndex)
      : selectedMonthIndex

  // Choose dataset based on selected year.
  // Use currentYearData for the current year; otherwise, use previousYearData.
  const dataset =
    selectedYear === currentYear ? currentYearData : previousYearData

  // Slice arrays based on the effective month index.
  const months = availableMonths.slice(0, effectiveMonthIndex + 1)
  const pendingData = dataset.pending.slice(0, effectiveMonthIndex + 1)
  const activeData = dataset.active.slice(0, effectiveMonthIndex + 1)
  const inactiveData = dataset.inactive.slice(0, effectiveMonthIndex + 1)
  const nonPendingData = dataset.nonPending.slice(0, effectiveMonthIndex + 1)
  const draftData = dataset.draft.slice(0, effectiveMonthIndex + 1)

  const option = {
    title: {
      bottom: '200px',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
    },
    legend: {
      data: ['Pending', 'Active', 'Inactive', 'Non-pending', 'Draft'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
      axisTick: { alignWithLabel: true },
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Pending',
        type: 'line',
        data: pendingData,
        smooth: true,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
      },
      {
        name: 'Active',
        type: 'line',
        data: activeData,
        smooth: true,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
      },
      {
        name: 'Inactive',
        type: 'line',
        data: inactiveData,
        smooth: true,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
      },
      {
        name: 'Non-pending',
        type: 'line',
        data: nonPendingData,
        smooth: true,
        label: {
          show: true,
          position: 'top',

          formatter: '{c}',
        },
      },
      {
        name: 'Draft',
        type: 'line',
        data: draftData,
        smooth: true,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
      },
    ],
  }

  // Handlers for changing the year via buttons.
  const handlePreviousYear = () => {
    setSelectedYear(selectedYear - 1)
  }

  const handleNextYear = () => {
    if (selectedYear < currentYear) {
      setSelectedYear(selectedYear + 1)
      if (
        selectedYear + 1 === currentYear &&
        selectedMonthIndex > currentMonthIndex
      ) {
        setSelectedMonthIndex(currentMonthIndex)
      }
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Year Navigation Buttons */}
      <div className='font-bold text-lg mb-2'>
        Monthly Status Statistic ({selectedYear})
      </div>
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
            value={selectedYear}
            onChange={(e) => {
              const newYear = parseInt(e.target.value, 10)
              if (!isNaN(newYear)) {
                setSelectedYear(newYear)
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
          disabled={selectedYear === currentYear}
          style={{
            padding: '8px 12px',
            marginLeft: '5px',
            backgroundColor:
              selectedYear === currentYear ? '#d9d9d9' : '#f0f0f0',
            color: selectedYear === currentYear ? '#888' : '#000',
            border: 'none',
            cursor: selectedYear === currentYear ? 'not-allowed' : 'pointer',
            borderRadius: '5px',
          }}
        >
          Next Year
        </button>
      </div>

      {/* Month Selection Buttons */}
      <div style={{ marginBottom: '10px' }}>
        {(selectedYear === currentYear ? availableMonths : allMonths).map(
          (month, index) => (
            <button
              key={index}
              onClick={() => setSelectedMonthIndex(index)}
              disabled={
                selectedYear === currentYear && index > currentMonthIndex
              }
              style={{
                padding: '6px 10px',
                margin: '2px',
                backgroundColor:
                  effectiveMonthIndex === index ? '#52c41a' : '#f0f0f0',
                color: effectiveMonthIndex === index ? '#fff' : '#000',
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

      {/* Chart */}
      <ReactEcharts
        option={option}
        style={{ height: '400px', width: '100%' }}
      />
    </div>
  )
}
