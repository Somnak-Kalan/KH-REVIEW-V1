import React, { useContext, useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import { Card, Row, Col } from 'antd'
import dayjs from 'dayjs'
import { AuthContext } from '../../contexts/AuthContext'
import { useNavigate, useOutletContext } from 'react-router-dom'

const AttendanceReport = () => {
  const { collapsed } = useOutletContext()
  // const { setCount } = useContext(NotifyContext)
  const navigate = useNavigate()
  const { username, access_token } = useContext(AuthContext)
  //variable
  const yesterday = dayjs().subtract(1, 'day')

  const [dashboard_attendance_report, setDashboardAttendanceReport] = useState(
    []
  )
  const [count_a, setCountA] = useState(0)
  const [count_l, setCountL] = useState(0)
  const [count_al, setCountAL] = useState(0)
  const [count_ul, setCountUL] = useState(0)
  const [count_s, setCountS] = useState(0)
  const [count_e, setCountE] = useState(0)
  const [count_h, setCountH] = useState(0)
  const [count_ms, setCountMS] = useState(0)
  // const [count_n, setCountN] = useState(0)
  //end variable

  function getCurrentDate() {
    const currentDate = dayjs()
    const day = currentDate.format('D')
    const dayWithSuffix = currentDate.format('Do')
    const dayOfWeek = currentDate.format('ddd')
    const month = currentDate.format('MMMM')
    const year = currentDate.format('YYYY')

    return {
      date: day,
      label: dayWithSuffix,
      day: dayOfWeek,
      month: month,
      year: year,
    }
  }
  const current = getCurrentDate()
  const series = [
    count_a,
    count_l,
    count_al,
    count_ul,
    count_s,
    count_e,
    count_h,
    count_ms,
    // count_n,
    // 12, 15, 20, 21, 10, 8, 20, 16,
  ]
  const getChartOptions = () => {
    return {
      chart: {
        width: 380,
        type: 'pie',
      },
      labels: ['A', 'L', 'AL', 'UL', 'S', 'E', 'H', 'MS' /*'N'*/],
      colors: [
        '#FF0000',
        '#FF0000',
        '#0000FF',
        '#0000FF',
        '#0000FF',
        '#ffbf00',
        '#ffbf00',
        '#ffbf00',
      ],

      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
      title: {
        text: '',
        align: 'center',

        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#263238',
        },
      },
      legend: {
        show: true,
        position: 'right',
        horizontalAlign: 'center',
        floating: false,
        fontSize: '14px',
        fontFamily: 'Helvetica, Arial',
        fontWeight: 400,
        offsetX: 0,
        offsetY: 0,
      },
    }
  }

  useEffect(() => {
    let countA = 0
    let countL = 0
    let countAL = 0
    let countUL = 0
    let countS = 0
    let countE = 0
    let countH = 0
    let countMS = 0

    dashboard_attendance_report?.forEach((el) => {
      if (Array.isArray(el?.days)) {
        el.days.forEach((day) => {
          if (
            dayjs(day?.date).format('DD') === yesterday?.format('DD') &&
            dayjs(day?.date).format('MM') === yesterday?.format('MM') &&
            dayjs(day?.date).format('YYYY') === yesterday?.format('YYYY')
          ) {
            switch (day?.value) {
              case 'A':
                countA++
                break
              case 'L':
                countL++
                break
              case 'AL':
                countAL++
                break
              case 'UL':
                countUL++
                break
              case 'S':
                countS++
                break
              case 'E':
                countE++
                break
              case 'H':
                countH++
                break
              case 'MS':
                countMS++
                break
              default:
                break
            }
          }
        })
      }
    })

    setCountA(countA)
    setCountL(countL)
    setCountAL(countAL)
    setCountUL(countUL)
    setCountS(countS)
    setCountE(countE)
    setCountH(countH)
    setCountMS(countMS)
  }, [dashboard_attendance_report])

  return (
    <div>
      <Card
        title={
          <>
            <Row style={{ display: 'flex', alignItems: 'center' }}>
              <Col sm={12}>
                <h4>Attendance Report</h4>
              </Col>
              <Col sm={12}>
                <p className='text-xs'>
                  {yesterday?.format('Do')}-{yesterday?.format('MMMM')}-
                  {yesterday?.format('YYYY')}
                </p>
              </Col>
            </Row>
          </>
        }
      >
        <div style={{ display: 'flex', justifyContent: 'center' }} id='chart'>
          <ReactApexChart
            options={getChartOptions()}
            series={series}
            type='pie'
            width={380}
          />
        </div>
        <div id='html-dist'></div>
      </Card>
    </div>
  )
}

export default AttendanceReport
