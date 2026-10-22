import React, { useEffect, useMemo, useState } from 'react'
import { Select, Pagination, Image, Spin, Empty } from 'antd'
import {
  ShareAltOutlined,
  HeartOutlined,
  DislikeOutlined,
} from '@ant-design/icons'
import { useOutletContext, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

import SaveImgIcon from '../../../../../assets/icon/user/saveOrange.svg'
import ReviewImgIcon from '../../../../../assets/icon/user/review.svg'
import CommentImgIcon from '../../../../../assets/icon/user/comment.svg'
import RepostImgIcon from '../../../../../assets/icon/user/repost.svg'

import { useMomentStore } from '../../../../../Stores/Post/Moment.store'

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100']

const FILTER_OPTIONS = [
  {
    label: 'All Interaction',
    value: '',
  },
  {
    label: 'Comment',
    value: 'comment',
  },
  {
    label: 'Repost',
    value: 'repost',
  },
  {
    label: 'Share',
    value: 'share',
  },
  {
    label: 'Like',
    value: 'like',
  },
  {
    label: 'Save',
    value: 'save',
  },
]

const getLocalAccessToken = () => {
  if (typeof window === 'undefined') return null

  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token')
  )
}

const normalizeActionType = (item) => {
  const value = String(
    item?.actionType || item?.type || item?.interactionType || ''
  )
    .toLowerCase()
    .trim()

  if (value.includes('comment')) return 'comment'

  if (value.includes('repost')) return 'repost'

  if (value.includes('share')) return 'share'

  if (value.includes('like')) return 'like'

  if (value.includes('save')) return 'save'

  return 'view'
}

const ACTION_CONFIG = {
  comment: {
    label: 'Commented on',
    icon: <Image src={CommentImgIcon} preview={false} />,
  },

  repost: {
    label: 'Reposted',
    icon: <Image src={RepostImgIcon} preview={false} />,
  },

  save: {
    label: 'Saved',
    icon: <Image src={SaveImgIcon} preview={false} />,
  },

  like: {
    label: 'Liked',
    icon: <HeartOutlined />,
  },

  share: {
    label: 'Shared',
    icon: <ShareAltOutlined />,
  },

  view: {
    label: 'Viewed',
    icon: <Image src={ReviewImgIcon} preview={false} />,
  },
}

const MomentInteractionTimeline = ({
  momentId,
  access_token,
  handleOpenUser,
  handleOpenUserOwner,
}) => {
  const params = useParams()

  const outletContext = useOutletContext() || {}

  const [filter, setFilter] = useState('')

  const [currentPage, setCurrentPage] = useState(1)

  const [pageSize, setPageSize] = useState(10)

  // ============================
  // DATA
  // ============================

  const listMomentInteractions = useMomentStore(
    (state) => state.listMomentInteractions
  )

  const totalMomentInteractions = useMomentStore(
    (state) => state.totalMomentInteractions
  )

  const paginationMomentInteractions = useMomentStore(
    (state) => state.paginationMomentInteractions
  )

  const loadingMomentInteractions = useMomentStore(
    (state) => state.loadingMomentInteractions
  )

  const error = useMomentStore((state) => state.error)
  const momentOwner = useMomentStore((state) => state.momentOwner)

  // ============================
  // ACTION FUNCTION
  // ============================

  const fetchListMomentInteractions = useMomentStore(
    (state) => state.ListMomentInteractions
  )

  const resolvedMomentId = momentId || params?.id || params?.momentId

  const resolvedAccessToken =
    access_token || outletContext?.access_token || getLocalAccessToken()

  useEffect(() => {
    if (
      !resolvedMomentId ||
      !resolvedAccessToken ||
      typeof fetchListMomentInteractions !== 'function'
    )
      return

    fetchListMomentInteractions({
      access_token: resolvedAccessToken,

      id: resolvedMomentId,

      doc: {
        actionType: filter,
        page: currentPage,
        size: pageSize,
      },
    })
  }, [resolvedMomentId, resolvedAccessToken, filter, currentPage, pageSize])
  const timelineData = useMemo(() => {
    const list = Array.isArray(listMomentInteractions)
      ? listMomentInteractions
      : []
    console.log(list, 'list')

    return list.map((item, index) => ({
      id: item?._id || index,

      raw: item,

      type: normalizeActionType(item),

      user: item?.user?.username || item?.username || 'Unknown User',

      owner: item?.moment?.postedBy?.username || 'Moment Owner',

      ownerId: item?.moment?.postedBy?._id,

      description: item?.text || '',

      createdAt: item?.createdAt || new Date().toISOString(),
    }))
  }, [listMomentInteractions])

  const totalItems = Number(
    totalMomentInteractions ||
      paginationMomentInteractions?.total ||
      timelineData.length ||
      0
  )

  const handleChangeFilter = (value) => {
    setFilter(value)

    setCurrentPage(1)
  }

  const handlePagination = (page, size) => {
    if (size !== pageSize) {
      setPageSize(size)

      setCurrentPage(1)

      return
    }

    setCurrentPage(page)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.filterRow}>
        <Select
          value={filter}

          options={FILTER_OPTIONS}

          onChange={handleChangeFilter}

          style={{
            width: 180,
          }}

          size='small'
        />
      </div>

      {error && (
        <div style={styles.error}>
          {error?.message || 'Something went wrong'}
        </div>
      )}

      {loadingMomentInteractions ? (
        <div style={styles.loading}>
          <Spin />
        </div>
      ) : timelineData.length > 0 ? (
        <div style={styles.list}>
          {timelineData.map((item) => (
            <TimelineCard
              key={item.id}
              item={item}
              momentOwner={momentOwner}
              handleOpenUser={handleOpenUser}
              handleOpenUserOwner={handleOpenUserOwner}
            />
          ))}
        </div>
      ) : (
        <Empty description='No interactions' />
      )}

      <div style={styles.pagination}>
        <Pagination
          current={currentPage}

          pageSize={pageSize}

          total={totalItems}

          showSizeChanger

          pageSizeOptions={PAGE_SIZE_OPTIONS}

          onChange={handlePagination}
        />
      </div>
    </div>
  )
}

const TimelineCard = ({
  item,
  handleOpenUser,
  handleOpenUserOwner,
  momentOwner,
}) => {
  const config = ACTION_CONFIG[item.type] || ACTION_CONFIG.view
  console.log(item, 'item')

  return (
    <div style={styles.card}>
      <div style={styles.icon}>{config.icon}</div>

      <div style={styles.content}>
        <div style={styles.text}>
          <span
            className='cursor-pointer'
            style={styles.username}
            onClick={() => handleOpenUser?.(item)}
          >
            {item.user}
          </span>{' '}
          <span>{config.label}</span>{' '}
          <span
            className='cursor-pointer'
            style={styles.username}
            onClick={() => handleOpenUserOwner?.(momentOwner?._id)}
          >
            {item.owner}
          </span>
        </div>

        {item.description && (
          <div style={styles.description}>{item.description}</div>
        )}

        <div style={styles.date}>
          {dayjs(item.createdAt).format('DD MMM YYYY hh:mm A')}
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 16,
  },

  filterRow: {
    marginBottom: 15,
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  card: {
    display: 'flex',
    padding: 12,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    background: '#fff',
  },

  icon: {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  text: {
    fontSize: 13,
  },

  username: {
    color: '#1677ff',
    fontWeight: 600,
  },

  description: {
    marginTop: 5,
    color: '#64748b',
    fontSize: 12,
  },

  date: {
    marginTop: 6,
    color: '#94a3b8',
    fontSize: 11,
  },

  pagination: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'flex-end',
  },

  loading: {
    minHeight: 200,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  error: {
    color: 'red',
    marginBottom: 10,
  },
}

export default MomentInteractionTimeline
