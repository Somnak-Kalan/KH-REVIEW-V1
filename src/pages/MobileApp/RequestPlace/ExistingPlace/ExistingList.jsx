import React, { useState } from 'react'
import { Button, Table, Tabs, Badge, Tag, Modal, Input } from 'antd'
import RequestLocation from './RequestExisting'

const ExistingPlace = (props) => {
  const { open, setOpen } = props
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [notificationCount, setNotificationCount] = useState({
    all: 0,
    pending: 4,
    underReview: 1,
    accepted: 1,
    rejected: 1,
  })
  const [data, setData] = useState([
    {
      key: '1',
      requester: 'John Doe (Staff)',
      phone: '123-456-7890',
      fullName: 'John Doe',
      businessName: 'Tech Solutions',
      category: 'IT Services',
      businessPhone: '987-654-3210',
      status: 'pending',
    },
    {
      key: '2',
      requester: 'Jane Smith (Supervisor)',
      phone: '234-567-8901',
      fullName: 'Jane Smith',
      businessName: 'Health & Wellness',
      category: 'Healthcare',
      businessPhone: '876-543-2109',
      status: 'accepted',
    },
    {
      key: '3',
      requester: 'Mike Johnson (Staff)',
      phone: '345-678-9012',
      fullName: 'Mike Johnson',
      businessName: 'Fitness World',
      category: 'Fitness',
      businessPhone: '765-432-1098',
      status: 'rejected',
    },
    {
      key: '4',
      requester: 'Emily Davis (Manager)',
      phone: '456-789-0123',
      fullName: 'Emily Davis',
      businessName: 'Organic Foods',
      category: 'Food & Beverage',
      businessPhone: '654-321-0987',
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

    // Update notification count
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
    setNotificationCount((prev) => ({ ...prev, [key]: 0 })) // Reset notification count for the active tab
  }

  const filteredData =
    activeTab === 'all'
      ? data
      : data.filter((item) => item.status === activeTab)

  const columns = [
    { title: 'Requester (Role)', dataIndex: 'requester', key: 'requester' },
    { title: 'Phone Number', dataIndex: 'phone', key: 'phone' },
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Business Name', dataIndex: 'businessName', key: 'businessName' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    {
      title: 'Business Phone Number',
      dataIndex: 'businessPhone',
      key: 'businessPhone',
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
        return <Tag color={color}>{status.toUpperCase()}</Tag>
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
        <Tabs.TabPane tab={`All `} key='all' />
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

export default ExistingPlace
