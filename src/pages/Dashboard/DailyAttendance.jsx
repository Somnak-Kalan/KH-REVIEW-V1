import Chart from 'react-apexcharts'
import { Card } from 'antd'

const DailyAttendance = () => {
  const chartOptions = {
    series: [44, 55, 13],
    options: {
      chart: {
        type: 'pie',
        width: 300,
      },
      labels: ['Pending', 'Approve', 'Reject'],
      colors: ['#008FFB', '#00E396', '#FEB019'],
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '14px',
        markers: {
          width: 12,
          height: 12,
          radius: 6,
        },
        itemMargin: {
          horizontal: 15,
          vertical: 5,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 2000,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    },
  }

  return (
    <Card title='Daily Attendance'>
      <div style={{ width: 286 }}>
        <Chart
          options={chartOptions.options}
          series={chartOptions.series}
          type='pie'
          width='100%'
        />
      </div>
    </Card>
  )
}

export default DailyAttendance
