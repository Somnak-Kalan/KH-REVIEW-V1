import React, { useState } from 'react'
import {
  Button,
  Table,
  Tabs,
  Badge,
  Modal,
  Input,
  Tooltip,
  Popconfirm,
} from 'antd'
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import RequestLocation from './RequestIntroduce'

const IntroduceNewLocation = (props) => {
  const { open, setOpen } = props
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [notificationCount, setNotificationCount] = useState({
    all: 0,
    pending: 2,
    underReview: 1,
    accepted: 1,
    rejected: 0,
  })

  const [data, setData] = useState([
    {
      key: '1',
      location: 'Main Store - Downtown',
      fullName: 'John Doe',
      phone: '123-456-7890',
      createdBy: 'Admin',
      createdAt: '2025-02-14',
      status: 'pending',
    },
    {
      key: '2',
      location: 'Electronics Department',
      fullName: 'Jane Smith',
      phone: '234-567-8901',
      createdBy: 'Manager',
      createdAt: '2025-02-13',
      status: 'accepted',
    },
    {
      key: '3',
      location: 'City Tour - Chicago',
      fullName: 'Mike Johnson',
      phone: '345-678-9012',
      createdBy: 'Supervisor',
      createdAt: '2025-02-12',
      status: 'rejected',
    },
    {
      key: '4',
      location: 'San Francisco Store',
      fullName: 'Emily Davis',
      phone: '456-789-0123',
      createdBy: 'Staff',
      createdAt: '2025-02-11',
      status: 'underReview',
    },
  ])

  // Modal state for rejection
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [currentRecord, setCurrentRecord] = useState(null)

  const showRejectModal = (record) => {
    setCurrentRecord(record)
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    if (!rejectionReason) {
      return Modal.warning({ title: 'Please enter a reason for rejection.' })
    }

    handleStatusChange(currentRecord, 'rejected', rejectionReason)
    setIsModalVisible(false)
    setRejectionReason('')
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setRejectionReason('')
  }

  const handleStatusChange = (record, newStatus, reason = '') => {
    const previousStatus = record.status
    const updatedData = data.map((item) =>
      item.key === record.key
        ? { ...item, status: newStatus, rejectionReason: reason }
        : item
    )

    setData(updatedData)

    setNotificationCount((prev) => {
      const updatedCount = { ...prev }
      if (previousStatus !== newStatus) {
        updatedCount[previousStatus] = Math.max(
          0,
          updatedCount[previousStatus] - 1
        )
        updatedCount[newStatus] += 1
      }
      return updatedCount
    })
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
    setNotificationCount((prev) => ({ ...prev, [key]: 0 }))
  }

  const filteredData =
    activeTab === 'all'
      ? data
      : data.filter((item) => item.status === activeTab)

  const columns = [
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      key: 'phone',
      align: 'center',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      align: 'center',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color =
          status === 'accepted'
            ? 'green'
            : status === 'rejected'
              ? 'red'
              : status === 'underReview'
                ? 'orange'
                : 'blue'
        return <span style={{ color }}>{status.toUpperCase()}</span>
      },
    },
    {
      title: 'Change Status',
      key: 'changeStatus',
      align: 'center',
      render: (_, record) => (
        <div className='flex space-x-2'>
          {activeTab === 'accepted' || activeTab === 'rejected' ? (
            <Button
              size='small'
              onClick={() => handleStatusChange(record, 'underReview')}
            >
              Under Review
            </Button>
          ) : activeTab === 'all' || activeTab === 'pending' ? (
            <Button
              size='small'
              onClick={() => handleStatusChange(record, 'underReview')}
            >
              Under Review
            </Button>
          ) : (
            ''
          )}
          {activeTab !== 'accepted' && (
            <Button
              size='small'
              type='primary'
              onClick={() => handleStatusChange(record, 'accepted')}
            >
              Accept
            </Button>
          )}
          {activeTab !== 'rejected' && (
            <Button size='small' danger onClick={() => showRejectModal(record)}>
              Reject
            </Button>
          )}
        </div>
      ),
    },

    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <div className='flex justify-center'>
          <Tooltip title='View'>
            <Button
              icon={<EyeOutlined style={{ color: 'green' }} />}
              shape='circle'
              size='small'
              onClick={() => handleView(record)}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
          <Tooltip title='Edit'>
            <Button
              icon={<EditOutlined />}
              shape='circle'
              size='small'
              onClick={() => handleEdit(record)}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
          <Tooltip title='Delete'>
            <Popconfirm
              title='Are you sure you want to delete this record?'
              onConfirm={() =>
                ConfirmDelete({
                  record,
                  access_token,
                  getType,
                  setLoading,
                  getFileImage,
                })
              }
              okText='Yes'
              cancelText='No'
              placement='top'
            >
              <Button
                icon={<DeleteOutlined />}
                shape='circle'
                size='small'
                danger
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ]

  const pagination = {
    current: currentPage,
    pageSize: pageSize,
    total: filteredData.length,
    onChange: (page, pageSize) => {
      setCurrentPage(page)
      setPageSize(pageSize)
    },
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  }

  return (
    <div>
      <RequestLocation open={open} setOpen={setOpen} />
      <Tabs
        onChange={handleTabChange}
        defaultActiveKey='all'
        tabBarStyle={{
          backgroundColor: 'white',
          paddingLeft: '20px',
          borderRadius: '5px',
        }}
      >
        <Tabs.TabPane tab={`All (${data.length})`} key='all' />
        <Tabs.TabPane
          tab={<Badge count={notificationCount.pending}>Pending</Badge>}
          key='pending'
        />
        <Tabs.TabPane
          tab={
            <Badge count={notificationCount.underReview}>Under Review</Badge>
          }
          key='underReview'
        />
        <Tabs.TabPane
          tab={<Badge count={notificationCount.accepted}>Accepted</Badge>}
          key='accepted'
        />
        <Tabs.TabPane
          tab={<Badge count={notificationCount.rejected}>Rejected</Badge>}
          key='rejected'
        />
      </Tabs>
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={pagination}
        size='small'
        loading={loading}
        scroll={{ x: 'max-content' }}
      />
      <Modal
        title='Rejection Reason'
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key='cancel' onClick={handleModalCancel}>
            Cancel
          </Button>,
          <Button key='reject' type='primary' danger onClick={handleModalOk}>
            Reject
          </Button>,
        ]}
      >
        <Input.TextArea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder='Enter the reason for rejection'
        />
      </Modal>
    </div>
  )
}

export default IntroduceNewLocation
