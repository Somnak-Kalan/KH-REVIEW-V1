import { Button, Card, Col, Row } from 'antd'
import React, { useEffect, useState } from 'react'
import AddComment from './AddComment'
import AddRemark from './AddRemark'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
// Example data

const InlineRemarkList = (props) => {
  const { businessProperty, handleSuccess } = props
  const [openComment, setOpenComment] = useState(false)
  const [openRemark, setOpenRemark] = useState(false)
  const [status, setStatus] = useState('active')
  const [data, setData] = useState([])

  const handleDelete = (index) => {
    console.log(`Delete item at index ${index}`)
  }
  useEffect(() => {
    const status = businessProperty?.status?.trim()?.toLowerCase()
    setStatus(status)
    if (status === 'active') {
      setData(businessProperty?.remarks)
    } else if (status === 'in review') {
      setData(businessProperty?.comments)
    }
  }, [businessProperty])

  const isVisible = status === 'active' || status === 'in review'

  if (!isVisible) return null
  // Decide card title and background color based on status

  const cardTitle = status === 'in review' ? 'Comments' : 'Remark'
  const bgClass = status === 'in review' ? '#FDFAF5' : '#FDFAF5F7'
  const badgeClass = status === 'in review' ? 'bg-orange-500' : 'bg-green-600'
  const remarks = data
  return (
    <>
      <AddComment
        open={openComment}
        setOpen={setOpenComment}
        id={businessProperty?._id}
        handleSuccess={handleSuccess}
      />
      <AddRemark
        open={openRemark}
        setOpen={setOpenRemark}
        id={businessProperty?._id}
        handleSuccess={handleSuccess}
      />
      <Card
        title={cardTitle}
        extra={
          <>
            {/* #DD991B */}
            <Button
              type='default'
              style={{
                background: status === 'in review' ? '#DD991B' : '#6AC917',
                color: 'white',
                borderRadius: '10px',
              }}
              icon={<PlusOutlined />}
              onClick={() =>
                status === 'in review'
                  ? setOpenComment(true)
                  : setOpenRemark(true)
              }
            >
              {status === 'in review' ? 'Add Comment' : 'Add Remark'}
            </Button>
          </>
        }
      >
        <Row gutter={[16, 16]}>
          {remarks?.map((item, index) => (
            <Col key={index} xs={24} sm={12} md={12} lg={8} xl={6}>
              <div
                className={`relative flex items-start p-4 rounded-md h-full `}
                style={{ background: bgClass }}
              >
                {/* Colored index badge */}
                {/* <div
                  className={`text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3 ${badgeClass}`}
                >
                  {index + 1}
                </div> */}

                {/* Text content */}
                <div className='flex-1'>
                  <div className='text-sm text-gray-600'>
                    {dayjs(item.createdAt).format('YYYY-MM-DD')}{' '}
                    {dayjs(item.createdAt).format('hh:mm A')}
                    <a href='#' className='text-blue-500 hover:underline'></a>
                  </div>
                  <div className='text-sm text-gray-800 mt-1'>
                    {' '}
                    <div className='flex'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='25'
                        height='25'
                        fill='#69C229'
                        viewBox='0 0 24 24'
                      >
                        <path d='M3 6h12a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2zm0 5h12a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2zm0 5h7a1 1 0 0 0 0-2H3a1 1 0 0 0 0 2z' />
                        <path d='M21.7 7.29l-1-1a1 1 0 0 0-1.42 0l-6.3 6.3a1 1 0 0 0-.25.45l-1 3a1 1 0 0 0 1.27 1.27l3-1a1 1 0 0 0 .45-.25l6.3-6.3a1 1 0 0 0 0-1.42zM14.41 15l-1.41.47.47-1.41 5.59-5.59 1 1z' />
                      </svg>
                      <div></div>
                      <span style={{ color: '#6AC917', fontSize: '15px' }}>
                        {status === 'active' ? 'Remark : ' : 'Comment : '}{' '}
                      </span>{' '}
                      {item?.text}
                    </div>
                  </div>
                </div>

                {/* Delete icon */}
                <button
                  onClick={() => handleDelete(index)}
                  className='absolute top-2 right-2 text-red-500 hover:text-red-700'
                  title='Delete'
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <polyline points='3 6 5 6 21 6' />
                    <path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' />
                    <line x1='10' y1='11' x2='10' y2='17' />
                    <line x1='14' y1='11' x2='14' y2='17' />
                  </svg>
                </button>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </>
  )
}

export default InlineRemarkList
