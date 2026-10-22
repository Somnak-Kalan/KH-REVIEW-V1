// src/components/Column.tsx
import React, { useContext, useEffect, useState } from 'react'
import { Avatar, Button, Card, Popover, Modal, Tag, Divider } from 'antd'
import { useNavigate } from 'react-router-dom'

import { DownOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
dayjs.extend(advancedFormat)
import MaskGroup from '../../../../assets/icon/MaskGroup.png'
import { AuthContext } from '../../../../contexts/AuthContext'
import { PERMS } from '../../../../constants/permission/perms'
import ImageTickIcon from '../../../../assets/icon/MaskGroup.png'
import helpFunctions from '../../../../utils/helpFunctions'
export default function getTableColumns(activeTab) {
  // track which popover is open
  const [activePopoverKey, setActivePopoverKey] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const navigate = useNavigate()

  const { username, access_token, checkPermission } = useContext(AuthContext)
  const hasFullAccess = checkPermission(PERMS.ASSIGNED_USER)
  const handleView = (record) => {
    navigate(`/property/${record?._id}/info`)
  }
  const flattenComments = (comments = []) => {
    const result = []

    const recurse = (items) => {
      for (const item of items) {
        result.push(item)
        if (Array.isArray(item.replyComment) && item.replyComment.length > 0) {
          recurse(item.replyComment)
        }
      }
    }

    recurse(comments)
    return result
  }
  const CommentBox = ({ commentData }) => {
    const flatComments = flattenComments(commentData || [])
    const latestComment = flatComments?.sort((a, b) =>
      dayjs(b.createdAt).diff(dayjs(a.createdAt))
    )[0]

    return latestComment ? (
      <>
        <div
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: 6,
            background: 'white',
            flex: 1,
          }}
        >
          <p
            className='px-5 py-2 flex flex-start'
            style={{
              fontSize: 12,
              color: '#000000',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {dayjs(latestComment.createdAt).format('MM-DD-YYYY h:mm A')}
          </p>
          <Divider style={{ margin: 0, borderColor: '#f0f0f0' }} />
          <p
            className='px-5 py-3 flex flex-start'
            style={{
              margin: 0,
              fontSize: 14,
              color: '#333',
              lineHeight: 1.3,
            }}
          >
            {latestComment.text}
          </p>
        </div>
      </>
    ) : null
  }

  const renderAllCommentsWithLatestFirst = (comments = []) => {
    const sorted = [...comments].sort((a, b) =>
      dayjs(b.createdAt).diff(dayjs(a.createdAt))
    )

    return (
      <div style={{ maxWidth: 300 }}>
        {sorted.map((comment) => (
          <div
            key={comment._id}
            style={{
              border: '1px solid #f0f0f0',
              padding: '12px',
              margin: '8px',
              borderRadius: '5px',
            }}
          >
            <div
              style={{
                fontSize: 14,
                position: 'relative', // relative positioning for child positioning
                padding: 12,
                border: '1px solid #f0f0f0',
                borderRadius: 6,
                maxWidth: 400,
                background: '#fff',
              }}
            >
              {/* ✅ Image at top-right inside the border box */}
              <img
                src={ImageTickIcon}
                alt='tick'
                style={{
                  position: 'absolute',
                  top: 15,
                  right: 6,
                  width: 15,
                  height: 15,
                }}
              />

              {/* Comment text */}
              <p
                style={{
                  margin: 0,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  paddingRight: '15px',
                }}
              >
                {comment.text}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  color: '#666',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                {dayjs(comment.createdAt).format('MM-DD-YYYY')}{' '}
                <span className='text-blue-500 ml-2'>
                  {' '}
                  {dayjs(comment.createdAt).format('hh:mm A')}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }
  const renderRemarkContentSp = (key, record) => {
    // Flatten all comments and replies
    const flatComments = flattenComments(record.comments || [])
    // Filter only "Special remark" comments
    const allRemarkComments = flatComments.filter(
      (c) => c.markAs?.toLowerCase().trim() === 'special remark'
    )
    if (!allRemarkComments.length) {
      return <div style={{ fontSize: 12, color: '#999' }}>No remark yet</div>
    }
    const withOverflow = allRemarkComments.length > 3
    return (
      <div
        style={{
          maxWidth: 300,
          maxHeight: withOverflow ? 250 : 'auto',
          overflowY: withOverflow ? 'auto' : 'visible',
          paddingRight: withOverflow ? 8 : 0,
        }}
      >
        {renderAllCommentsWithLatestFirst(allRemarkComments)}
      </div>
    )
  }
  const renderFollowUpContent2 = (key, record) => {
    // Flatten all comments and replies
    const flatComments = flattenComments(record.comments || [])

    // Filter only "Special remark" comments
    const allFollowUpComments = flatComments.filter(
      (c) => c.markAs?.toLowerCase().trim() === 'follow up'
    )

    if (!allFollowUpComments.length) {
      return <div style={{ fontSize: 12, color: '#999' }}>No follow-up yet</div>
    }
    const withOverflow = allFollowUpComments.length > 3
    return (
      <div
        style={{
          maxWidth: 300,
          maxHeight: withOverflow ? 250 : 'auto',
          overflowY: withOverflow ? 'auto' : 'visible',
          paddingRight: withOverflow ? 8 : 0,
        }}
      >
        {renderAllCommentsWithLatestFirst(allFollowUpComments)}
      </div>
    )
  }

  return [
    {
      title: 'Task',
      key: 'task',
      align: 'center',
      render: (record) => {
        const remarkKey = `${record._id}-remark`
        const followKey = `${record._id}-follow`
        const flatComments = flattenComments(record.comments || [])

        // Filter only "Special remark" comments
        const allRemarkComments = flatComments.filter(
          (c) => c.markAs?.toLowerCase().trim() === 'special remark'
        )
        const allFollowUpComments = flatComments.filter(
          (c) => c.markAs?.toLowerCase().trim() === 'follow up'
        )
        const remarkCount = allRemarkComments?.length
        const followUpCount = allFollowUpComments?.length
        return (
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'space-start',
            }}
          >
            <div className='p-0 m-0 ' style={{ width: '180px' }}>
              {remarkCount > 0 && (
                <div className='flex flex-start my-1 mx-0 p-0'>
                  <Popover
                    content={renderRemarkContentSp(remarkKey, record)}
                    trigger='click'
                    placement='bottomLeft'
                    open={activePopoverKey === remarkKey}
                    onOpenChange={(visible) =>
                      setActivePopoverKey(visible ? remarkKey : null)
                    }
                  >
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedRecord(record)
                      }}
                      style={{
                        color: '#DFAF09',
                        borderRadius: 5,
                        cursor: 'pointer',
                        padding: '0 8px',
                        fontSize: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: 'solid 1px #F0F0F0',
                        userSelect: 'none',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <img
                          src={MaskGroup}
                          alt='Icon'
                          style={{ width: '15px' }}
                        />
                        Special remark: {remarkCount}
                        <DownOutlined style={{ fontSize: 12 }} />
                      </span>
                    </span>
                  </Popover>
                </div>
              )}

              <div className='flex flex-start mx-0 p-0'>
                {followUpCount > 0 && (
                  <Popover
                    content={renderFollowUpContent2(followKey, record)}
                    trigger='click'
                    placement='bottomLeft'
                    open={activePopoverKey === followKey}
                    onOpenChange={(visible) =>
                      setActivePopoverKey(visible ? followKey : null)
                    }
                  >
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedRecord(record)
                      }}
                      style={{
                        color: '#0050B3',
                        borderRadius: 5,
                        cursor: 'pointer',
                        padding: '0 8px',
                        fontSize: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: 'solid 1px #F0F0F0',
                        userSelect: 'none',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <img
                          src={MaskGroup}
                          alt='Icon'
                          style={{ width: '15px' }}
                        />
                        Follow up: {followUpCount}
                        <DownOutlined style={{ fontSize: 12 }} />
                      </span>
                    </span>
                  </Popover>
                )}
              </div>
              {/* )} */}
            </div>
            <CommentBox commentData={record?.comments} />
          </div>
        )
      },
    },
    {
      title: 'Place ID',
      dataIndex: 'placeId',
      key: 'placeId',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (val) => {
        const lower = val?.toLowerCase()
        if (lower === 'active')
          return (
            <Tag
              color='green'
              style={{
                background: '#6AC917',
                color: 'white',
                borderRadius: '20px',
              }}
            >
              Active
            </Tag>
          )
        if (lower === 'pending') return <Tag color='orange'>Pending</Tag>
        if (lower === 'draft') return <Tag color='blue'>Draft</Tag>
        if (lower === 'inactive') return <Tag color='red'>Inactive</Tag>
        if (lower === 'in review')
          return (
            <Tag
              color='gold'
              style={{
                background: '#E8C504',
                color: 'white',
                borderRadius: '20px',
              }}
            >
              In Review
            </Tag>
          )
        return <Tag color='gray'>{val}</Tag>
      },
    },
    {
      title: 'Property Profile',
      key: 'property_profile',
      align: 'center',
      render: (_, record) => {
        const imageSrc =
          record?.media?.image?.find((img) => img?.includes('original'))

        const detailUrl = `/property/${record?._id}`

        const openDetail = () =>
          window.open(detailUrl, '_blank', 'noopener,noreferrer')

        return (
          <div className='flex items-center gap-2 '>
            <Avatar
              shape='square'
              style={{ width: '60px', height: '40px' }}
              src={imageSrc}
            />
            <div className='flex flex-col items-start leading-[1.05] '>
              <p
                className='m-0 p-0 cursor-pointer font-bold text-blue-800 hover:underline'
                onClick={openDetail}
              >
                {record?.nameEn}
              </p>
              <p
                className='m-0 p-0 my-1 cursor-pointer font-semibold text-gray-500 hover:underline'
                onClick={openDetail}
              >
                {record?.nameKh}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      title: 'Updated',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      align: 'center',
      sorter: (a, b) =>
        String(a['Update By']).localeCompare(String(b['Update By'])),
      sortDirections: ['ascend', 'descend'],
      className: 'column-sort',
      render: (val, record) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {val || 'Admin'}
          </span>
          <span style={{ fontSize: 12, color: '#000000' }}>
            {record.updatedAt
              ? dayjs(record.updatedAt).format('YYYY-MM-DD')
              : ''}
          </span>
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdBy',
      key: 'createdBy',
      align: 'center',
      sorter: (a, b) =>
        String(a['Created By']).localeCompare(String(b['Created By'])),
      sortDirections: ['ascend', 'descend'],
      className: 'column-sort',
      render: (val, record) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {val || 'Admin'}
          </span>
          <span style={{ fontSize: 12, color: '#000000' }}>
            {record.createdAt
              ? dayjs(record.createdAt).format('YYYY-MM-DD')
              : ''}
          </span>
        </div>
      ),
    },
  ]
}
