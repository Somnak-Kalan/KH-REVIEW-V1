import { useContext, useEffect, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'

//
import { Card, Row, Col, Progress } from 'antd'
// import { HomeOutlined } from '@ant-design/icons'
import { AuthContext } from '../../contexts/AuthContext'

import { NotifyContext } from '../../contexts/NotifyContext'
import dayjs from 'dayjs'

const Dashboard = () => {
  document.title = 'Dashboard'
  //
  const { collapsed } = useOutletContext()
  const { setCount } = useContext(NotifyContext)
  const navigate = useNavigate()
  const { username, access_token } = useContext(AuthContext)

  //
  const [dashboard_leave_request, setDashboardLeaveRequest] = useState([])
  const [missed_scan_list, setMissedScanList] = useState([])
  const [total_approve, setApprove] = useState(0)
  const [total_pending, setPending] = useState(0)
  const [total_reject, setReject] = useState(0)
  const [total_missed_scan, setMissedScan] = useState(0)
  //

  //leave request
  useEffect(() => {
    let count_approve = 0
    let count_pending = 0
    let count_reject = 0
    dashboard_leave_request?.map((el) => {
      if (el?.from?.month === dayjs().format('MM')) {
        if (el?.status === 'Approved') {
          count_approve++
        } else if (el?.status === 'Pending') {
          count_pending++
        } else {
          count_reject++
        }
      }
    })
    setApprove(count_approve)
    setPending(count_pending)
    setReject(count_reject)
  }, [dashboard_leave_request])
  //end leave request
  //missed scan
  useEffect(() => {
    let count_missed_scan = 0
    missed_scan_list?.map((el) => {
      if (el?.from?.month === dayjs().format('MM')) {
        count_missed_scan++
      }
    })
    setMissedScan(count_missed_scan)
  }, [missed_scan_list])
  //end missed scan
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

  const percentage = (approve, total_request) => {
    return (approve / total_request) * 100 // Calculate percentage
  }

  return (
    <Card
      title={
        <>
          <Row style={{ display: 'flex', alignItems: 'center' }}>
            <Col sm={12}>
              <h4>Leave Report</h4>
            </Col>
            <Col sm={12} className='text-xs'>
              <p>
                {current.month}-{current.year}
              </p>
            </Col>
          </Row>
        </>
      }
    >
      <Row>
        <Col sm={12}>Pending</Col>
        <Col sm={12}>
          <b>{total_pending}</b>
        </Col>
        <Col span={24}>
          <Progress
            type='line'
            percent={total_pending}
            status={status}
            // width={100}
            style={{ marginRight: '10px' }}
            strokeColor={{
              '0%': '#add8e6',
              '100%': '#87d068',
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12}>Approve</Col>
        <Col sm={12}>
          <b>{total_approve}</b>
        </Col>
        <Col span={24}>
          <Progress
            type='line'
            percent={total_approve}
            status={status}
            // width={100}
            style={{ marginRight: '10px' }}
            strokeColor={{
              '0%': '#32CD32',
              '100%': '#87d068',
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12}>Reject</Col>
        <Col sm={12}>
          <b>{total_reject}</b>
        </Col>
        <Col span={24}>
          <Progress
            type='line'
            percent={total_reject}
            status={status}
            // width={100}
            style={{ marginRight: '10px' }}
            strokeColor={{
              '0%': '#CD5C5C',
              '100%': '#87d068',
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12}>Missed Scan</Col>
        <Col sm={12}>
          <b>{total_missed_scan}</b>
        </Col>
        <Col span={24}>
          <Progress
            type='line'
            percent={total_missed_scan}
            status={status}
            // width={100}
            style={{ marginRight: '10px' }}
            strokeColor={{
              '0%': '#ffbf00',
              '100%': '#87d068',
            }}
          />
        </Col>
      </Row>
    </Card>
  )
}

export default Dashboard
