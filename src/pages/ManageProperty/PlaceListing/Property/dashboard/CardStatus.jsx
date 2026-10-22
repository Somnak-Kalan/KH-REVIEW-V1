import React from 'react'

import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'

import {
  Card,
  Tooltip,
} from 'antd'


/* =========================================================
   STATUS CARD
========================================================= */

const StatusCard = ({
  activeTab,
  label,
  count,
  icon: IconComponent,
  colorClass,
  colorStyle,
  isActive,
  onClick,
  tooltipText,
}) => {

  /* =========================================================
     ACTIVE BORDER COLOR
  ========================================================= */

  const getBorderColor = () => {
    if (label === 'All') {
      return 'gray'
    }

    if (label === 'Active') {
      return 'green'
    }

    if (label === 'Inactive') {
      return 'red'
    }

    if (label === 'In Review') {
      return '#FFBF00'
    }

    if (label === 'Pending') {
      return 'orange'
    }

    if (label === 'Draft') {
      return 'purple'
    }

    if (label === 'Dashboard') {
      return 'blue'
    }


    return 'gray'
  }


  /* =========================================================
     COUNT COLOR
  ========================================================= */

  const getCountColor = () => {
    if (label === 'Active') {
      return '#6AC917'
    }

    if (label === 'Inactive') {
      return '#AD3838'
    }

    if (label === 'Pending') {
      return '#DD991B'
    }

    if (label === 'Draft') {
      return '#5C6BB2'
    }

    if (label === 'In Review') {
      return '#E8C504'
    }


    if (label === 'Dashboard') {
      return '#1645DD'
    }

    return ''
  }


  /* =========================================================
     TOOLTIP ICON COLOR
  ========================================================= */

  const getTooltipIconColor = () => {
    if (label === 'In Review') {
      return '#E8C504'
    }



    return '#666'
  }


  return (
    <div
      onClick={onClick}
      className='
        relative
        transition-transform
        duration-300
        hover:scale-90
        cursor-pointer
      '
    >
      <Card
        size='small'
        style={{
          ...colorStyle,

          ...(isActive && {
            border: `1px solid ${getBorderColor()}`,
          }),
        }}
        className={`
          ${colorClass || ''}
          text-center
          shadow-sm
          rounded-md
        `}
      >

        {/* =====================================================
            TOOLTIP ICON - TOP RIGHT
        ===================================================== */}

        {tooltipText && IconComponent && (
          <div
            className='
              absolute
              top-2
              right-2
              z-10
            '
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <Tooltip
              title={tooltipText}
              placement='top'
              arrow
            >
              <span
                className='
                  flex
                  items-center
                  justify-center
                  cursor-help
                '
              >
                <IconComponent
                  style={{
                    fontSize: '14px',
                    color: getTooltipIconColor(),
                  }}
                />
              </span>
            </Tooltip>
          </div>
        )}


        {/* =====================================================
            LABEL
        ===================================================== */}

        <div className='text-xs'>
          {label}
        </div>


        {/* =====================================================
            NUMBER
        ===================================================== */}

        <div
          className='
            flex
            items-center
            justify-center
            text-xl
            font-bold
            mb-1
          '
        >

          {/* Dashboard icon only */}

          {label === 'Dashboard' && IconComponent && (
            <IconComponent
              style={{
                color: '#1645DD',
              }}
              className='mr-2 py-1'
            />
          )}


          {/* Number stays centered */}

          {label !== 'Dashboard' && (
            <span
              style={{
                color: getCountColor(),
              }}
            >
              {count ?? 0}
            </span>
          )}

        </div>

      </Card>
    </div>
  )
}


/* =========================================================
   CARD STATUS
========================================================= */

export default function CardStatus(props) {

  const {
    activeTab,
    status,
    activeStatus,
    setActiveStatus,
  } = props


  /* =========================================================
     STATUS COUNTS
  ========================================================= */

  const {
    All: all = 0,
    Active: active = 0,
    Inactive: inactive = 0,
    Pending: pending = 0,
    Draft: draft = 0,
    ['In Review']: inReview = 0,
    Trash: trash = 0,
  } = status || {}


  return (
    <div
      className={`
        grid
        grid-cols-1
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6
        2xl:grid-cols-9
        gap-1
      `}
    >

      {/* =====================================================
          ALL
      ===================================================== */}

      <StatusCard
        activeTab={activeTab}
        label='All'
        count={all}
        icon={AppstoreOutlined}
        colorStyle={{
          background: '#F9F9F9',
        }}
        isActive={
          activeStatus === 'All'
        }
        onClick={() =>
          setActiveStatus('All')
        }
      />


      {/* =====================================================
          ACTIVE
      ===================================================== */}

      <StatusCard
        activeTab={activeTab}
        label='Active'
        count={active}
        icon={CheckCircleOutlined}
        colorStyle={{
          background: '#6AC9170A',
        }}
        isActive={
          activeStatus === 'Active'
        }
        onClick={() =>
          setActiveStatus('Active')
        }
      />


      {/* =====================================================
          INACTIVE
      ===================================================== */}

      <StatusCard
        activeTab={activeTab}
        label='Inactive'
        // icon={ExclamationCircleOutlined}
        // tooltipText={
        //   <div className='flex flex-col gap-1 text-xs'>
        //     <div>
        //       • Places currently under review
        //     </div>

        //     <div>
        //       • Waiting for approval
        //     </div>

        //     <div>
        //       • May require additional checking
        //     </div>
        //   </div>
        // }
        count={inactive}
        icon={CloseCircleOutlined}
        colorStyle={{
          background: '#AD38380D',
        }}
        isActive={
          activeStatus === 'Inactive'
        }
        onClick={() =>
          setActiveStatus('Inactive')
        }
      />


      {/* =====================================================
          IN REVIEW
      ===================================================== */}

      <StatusCard
        activeTab={activeTab}
        label='In Review'
        count={inReview}

        colorStyle={{
          background: '#E8C5040D',
        }}
        isActive={
          activeStatus === 'In Review'
        }
        onClick={() =>
          setActiveStatus('In Review')
        }

      />


      {/* =====================================================
          PENDING
      ===================================================== */}

      <StatusCard
        activeTab={activeTab}
        label='Pending'
        count={pending}
        icon={ExclamationCircleOutlined}
        colorStyle={{
          background: '#DD991B0D',
        }}
        isActive={
          activeStatus === 'Pending'
        }
        onClick={() =>
          setActiveStatus('Pending')
        }
      />


      {/* =====================================================
          DRAFT
      ===================================================== */}

      <StatusCard
        activeTab={activeTab}
        label='Draft'
        count={draft}
        icon={ExclamationCircleOutlined}
        colorStyle={{
          background: '#DD991B0D',
        }}
        isActive={
          activeStatus === 'Draft'
        }
        onClick={() =>
          setActiveStatus('Draft')
        }
      />

      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      {activeTab === 'all' && (
        <StatusCard
          activeTab={activeTab}
          label='Dashboard'
          icon={AppstoreOutlined}
          colorStyle={{
            background: '#F7F7FB',
          }}
          isActive={
            activeStatus === 'Dashboard'
          }
          onClick={() =>
            setActiveStatus('Dashboard')
          }
        />
      )}

    </div>
  )
}