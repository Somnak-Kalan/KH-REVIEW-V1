import React, { useState, useEffect } from 'react'
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { Card } from 'antd'

const StatusCard = ({
  activeTab,
  label,
  count,
  icon: IconComponent,
  colorClass,
  colorStyle,
  isActive,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className='transition-transform duration-300 hover:scale-90 cursor-pointer'
    >
      <Card
        size='small'
        style={{
          // always apply the base colorStyle
          ...colorStyle,
          ...(isActive && {
            border: `1px solid ${label === 'All' ? 'gray' : label === 'Active' ? 'green' : label === 'Inactive' ? 'red' : label === 'In Review' ? '#FFBF00' : label === 'Pending' ? 'orange' : label === 'Draft' ? 'purple' : label === 'Dashboard' ? 'blue' : 'gray'}`,
          }),
        }}
        className={`
        ${colorClass}
        text-center shadow-sm rounded-md
        
      
      `}
      >
        <div className='text-xs'>{label}</div>
        <div className='flex items-center justify-center text-xl font-bold mb-1'>
          {label === 'Dashboard' && (
            <IconComponent
              style={{ color: '#1645DD' }}
              className={`mr-2 ${label === 'Dashboard' ? 'py-1' : ''}`}
            />
          )}
          <span
            style={{
              color:
                label === 'Active'
                  ? '#6AC917'
                  : label === 'Inactive'
                    ? '#AD3838'
                    : label === 'Pending'
                      ? '#DD991B'
                      : label === 'Draft'
                        ? '#5C6BB2'
                        : label === 'Dashboard'
                          ? '#1645DD'
                          : '',
            }}
          >
            {count}
          </span>
        </div>
      </Card>
    </div>
  )
}

export default function CardStatus(props) {
  // Internal activeStatus state
  const { activeTab, stats, activeStatus, setActiveStatus } = props

  // Destructure stats
  const {
    all = 0,
    active = 0,
    inactive = 0,
    inReview = 0,
    pending = 0,
    draft = 0,
  } = stats

  return (
    <div
      className={`grid grid-cols-1 ${activeTab === 'all' ? 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-9' : 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-9'} gap-1`}
    >
      <StatusCard
        activeTab={activeTab}
        label='All'
        count={all}
        icon={AppstoreOutlined}
        colorStyle={{ background: '#F9F9F9' }}
        isActive={activeStatus === 'all'}
        onClick={() => setActiveStatus('all')}
      />
      <StatusCard
        activeTab={activeTab}
        label='Active'
        count={active}
        icon={CheckCircleOutlined}
        colorStyle={{ background: '#6AC9170A' }}
        isActive={activeStatus === 'active'}
        onClick={() => setActiveStatus('active')}
      />
      <StatusCard
        activeTab={activeTab}
        label='Inactive'
        count={inactive}
        icon={CloseCircleOutlined}
        colorStyle={{ background: '#AD38380D' }}
        isActive={activeStatus === 'inactive'}
        onClick={() => setActiveStatus('inactive')}
      />
      <StatusCard
        activeTab={activeTab}
        label='In Review'
        count={inReview}
        icon={ExclamationCircleOutlined}
        colorStyle={{ background: '#E8C5040D' }}
        isActive={activeStatus === 'inReview'}
        onClick={() => setActiveStatus('inReview')}
      />
      <StatusCard
        activeTab={activeTab}
        label='Pending'
        count={pending}
        icon={ExclamationCircleOutlined}
        colorStyle={{ background: '#DD991B0D' }}
        isActive={activeStatus === 'pending'}
        onClick={() => setActiveStatus('pending')}
      />
      <StatusCard
        activeTab={activeTab}
        label='Draft'
        count={draft}
        icon={ExclamationCircleOutlined}
        colorStyle={{ background: '#5C6BB20D' }}
        isActive={activeStatus === 'draft'}
        onClick={() => setActiveStatus('draft')}
      />
      <StatusCard
        activeTab={activeTab}
        label='Set Up'
        count={draft}
        icon={ExclamationCircleOutlined}
        colorClass='bg-gray-50'
        isActive={activeStatus === 'setup'}
        onClick={() => setActiveStatus('setup')}
      />
      {activeTab === 'all' ? (
        <StatusCard
          activeTab={activeTab}
          label='Dashboard'
          icon={AppstoreOutlined}
          colorStyle={{ background: '#F7F7FB' }}
          isActive={activeStatus === 'Dashboard'}
          onClick={() => setActiveStatus('Dashboard')}
        />
      ) : (
        ''
      )}
    </div>
  )
}
