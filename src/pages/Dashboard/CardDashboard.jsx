import React, { useEffect, useState } from 'react'
import { Card, Col, Row } from 'antd'
import {
  ClusterOutlined,
  HomeOutlined,
  TeamOutlined,
  SettingOutlined,
  SolutionOutlined,
  CameraOutlined,
} from '@ant-design/icons'
import MobileAppUserServices from '../../services/mobiles/apps/user'

const AnimatedCard = ({ children, borderColor, title, count, icon, className }) => {
  const [hover, setHover] = useState(false)

  return (
    <Card
      size="small"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderLeft: `4px solid ${borderColor}`,
        transform: hover ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 200ms ease',
      }}

      className={[
        'cursor-pointer rounded-lg !border-0',
        'bg-white text-slate-900 shadow-sm',          // light
        'dark:bg-slate-900 bg-white dark:text-slate-100',      // dark
        hover
          ? 'shadow-md dark:ring-1 dark:ring-slate-700 bg-white'
          : 'dark:ring-1 dark:ring-slate-800 bg-white',
        className || '',
      ].join(' ')}

    >
      <div className="flex h-full flex-col justify-between ">
        <span className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          {title}
        </span>

        <div className="flex items-center justify-between">
          <div
            className="text-xl font-bold"
            style={{ color: borderColor }}
          >
            {count}
          </div>

          <span className="text-slate-400 dark:text-slate-300">
            {icon}
          </span>
        </div>
      </div>

      {children}
    </Card>
  )
}

export default function CardDashboard(props) {
  const { access_token } = props
  const [users, setUsers] = useState([])
  const [company_list, setCompanyList] = useState([])
  const [department_list, setDepartmentList] = useState([])
  const [position_list, setPositionList] = useState([])

  const GetUser = async () => {
    try {
      const res = await MobileAppUserServices?.fetchUserApp({ access_token })
      setUsers(res)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    GetUser()
  }, [])

  return (
    <Row gutter={[16, 16]} className="my-4">

      <Col xs={24} sm={12} md={12} xl={6}>
        <AnimatedCard
          title="Users"
          count={users?.length > 0 ? users?.length : 0}
          icon={<TeamOutlined style={{ fontSize: 40 }} />}
          borderColor="#3b82f6"
        />
      </Col>

      <Col xs={24} sm={12} md={12} xl={6}>
        <AnimatedCard
          title="Place"
          count={company_list.length > 0 ? company_list.length : 0}
          icon={<HomeOutlined style={{ fontSize: 40 }} />}
          borderColor="#10b981"
        />
      </Col>

      <Col xs={24} sm={12} md={12} xl={6}>
        <AnimatedCard
          title="Service"
          count={department_list.length > 0 ? department_list.length : 0}
          icon={<SettingOutlined style={{ fontSize: 40 }} />}
          borderColor="#8b5cf6"
        />
      </Col>

      <Col xs={24} sm={12} md={12} xl={6}>
        <AnimatedCard
          title="Additional Service"
          count={department_list.length > 0 ? department_list.length : 0}
          icon={<SolutionOutlined style={{ fontSize: 40 }} />}
          borderColor="#8b5cf6"
        />
      </Col>

      <Col xs={24} sm={12} md={12} xl={6}>
        <AnimatedCard
          title="Moments"
          count={department_list.length > 0 ? department_list.length : 0}
          icon={<CameraOutlined style={{ fontSize: 40 }} />}
          borderColor="#8b5cf6"
        />
      </Col>

      <Col xs={24} sm={12} md={12} xl={6}>
        <AnimatedCard
          title="Tours"
          count={position_list.length > 0 ? position_list.length : 0}
          icon={<ClusterOutlined style={{ fontSize: 40 }} />}
          borderColor="#ef4444"
        />
      </Col>

      <Col xs={24} sm={12} md={12} xl={6}>
        <AnimatedCard
          title="Promotion&Events"
          count={position_list.length > 0 ? position_list.length : 0}
          icon={<ClusterOutlined style={{ fontSize: 40 }} />}
          borderColor="#2563eb"
        />
      </Col>
    </Row>
  )
}
