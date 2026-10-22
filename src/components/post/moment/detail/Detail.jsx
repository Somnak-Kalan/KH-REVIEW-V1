import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
} from 'react'
import {
  Breadcrumb,
  Card,
  Col,
  Row,
  Typography,
  Spin,
  Select,
  List,
  Pagination,
} from 'antd'
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  useNavigate,
  useOutletContext,
  useParams,
  useLocation,
} from 'react-router-dom'
import { AuthContext } from '../../../../contexts/AuthContext'
import { useMomentStore } from '../../../../Stores/Post/Moment.store'
import { MomentDetailEngagement } from '../function/_moment.detailEngagement'
import MomentInteractionTimeline from './function/MomentInteractionTimeline'
import Cover from './Cover'
import Location from './Location'
import { stripHashtagsFromDescription } from '../../moment/function/_moment.helpers'

import HideCreatorPostModal from '../modal/HideCreatorPostModal'
import ApprovePostModal from '../modal/ApprovePostModal'
import ActivePostModal from '../modal/ActivePostModal'
import DeletePostModal from '../modal/DeletePostModal'

import EditPost from '../../../../pages/Posts/moment/post/addEdit/Edit'
import EditVideo from '../../../../pages/Posts/moment/video/addEdit/Edit'

const MOMENT_HIDE_REASONS = [
  {
    value: 'GUIDELINES',
    label: 'Violates community guidelines',
  },
  {
    value: 'SPAM',
    label: 'Spam or excessive promotion',
  },
  {
    value: 'MISLEADING',
    label: 'Misleading or false information',
  },
  {
    value: 'OFFENSIVE',
    label: 'Inappropriate or offensive content',
  },
  {
    value: 'IRRELEVANT',
    label: 'Irrelevant to the mentioned place',
  },
  {
    value: 'LOW_QUALITY',
    label: 'Low-quality or unclear content',
  },
  {
    value: 'DUPLICATE',
    label: 'Duplicate or repetitive content',
  },
  {
    value: 'ADVERTISING',
    label: 'Unauthorized advertising',
  },
]
const { Text, Paragraph } = Typography

const cardStyle = {
  borderRadius: 8,
  border: '1px solid #E2EFFF',
  background: '#fff',
}

const labelStyle = { fontSize: 12 }

// same status view for both
const getStatusText = (status) => {
  const s = (status || '').toLowerCase()

  switch (s) {
    case 'active':
      return <span style={{ color: 'green' }}> Active</span>
    case 'inactive':
      return <span style={{ color: 'gray' }}>⚪ Inactive</span>
    case 'expired':
      return <span style={{ color: 'red' }}>❌ Expired</span>
    case 'hide':
    case 'hidden':
      return <span style={{ color: 'red' }}> Hidden</span>
    case 'under_review':
    case 'under review':
    case 'review':
    case 'pending':
      return <span style={{ color: '#1677ff' }}> Under Review</span>
    default:
      return <span style={{ color: 'blue' }}>🆕 {status || 'Unknown'}</span>
  }
}
const getDisplayText = (value, fallback = '-') => {
  if (value === undefined || value === null || value === '') return fallback

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim() || fallback
  }

  if (Array.isArray(value)) {
    const text = value
      .map((item) => getDisplayText(item, ''))
      .filter(Boolean)
      .join(', ')

    return text || fallback
  }

  if (typeof value === 'object') {
    return (
      value.displayName ||
      value.fullName ||
      value.name ||
      value.username ||
      value.nickname ||
      value.email ||
      value.title ||
      fallback
    )
  }

  return fallback
}

const getDisplayName = getDisplayText

const getApprovedByText = (detail = {}) => {
  const approvedBy =
    getDisplayName(detail?.approvedBy) ||
    getDisplayName(detail?.approval?.approvedBy) ||
    getDisplayName(detail?.review?.approvedBy) ||
    getDisplayName(detail?.moderation?.approvedBy) ||
    getDisplayName(detail?.approvedByName) ||
    getDisplayName(detail?.autoApprovedBy) ||
    getDisplayName(detail?.reviewedBy)

  const approveMode =
    getDisplayName(detail?.approveMode) ||
    getDisplayName(detail?.approvalMode) ||
    getDisplayName(detail?.approvedType) ||
    getDisplayName(detail?.approvalType) ||
    getDisplayName(detail?.review?.approvalType)

  if (approvedBy && approveMode) {
    const approvedByLower = approvedBy.toLowerCase()
    const approveModeLower = approveMode.toLowerCase()

    if (!approvedByLower.includes(approveModeLower)) {
      return `${approvedBy} ${approveMode}`
    }
  }
  if (
    approvedBy === '-' ||
    (approvedBy === '' && detail?.status === 'active')
  ) {
    return 'System allow'
  } else {
    return approvedBy || approveMode
  }
}

const ApprovedByLine = ({ detail }) => {
  return (
    <div
      style={{
        fontSize: 13,
        lineHeight: '20px',
        marginBottom: 8,
        color: '#111827',
      }}
    >
      <span style={{ fontWeight: 500 }}>Approved by :</span>{' '}
      <span style={{ color: '#6b7280' }}>{getApprovedByText(detail)}</span>
    </div>
  )
}

const getHideReasonLabel = (value) => {
  if (!value) return '-'

  const reason = MOMENT_HIDE_REASONS.find((item) => item.value === value)

  return reason?.label || value
}
const HiddenReasonBox = ({ detail }) => {
  const reason = getHideReasonLabel(detail?.hiddenReason)
  ;('-')

  const hiddenBy = detail?.updatedBy || 'Admin'

  const hiddenAt = detail?.updatedAt

  return (
    <div
      style={{
        border: '1px solid #ffb3b3',
        borderRadius: 8,
        background: '#f6eeee',
        padding: '12px 16px',
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 14 }}>
        <strong>Reason :</strong>{' '}
        {Array.isArray(reason) ? reason.join(', ') : reason}
      </div>

      <div style={{ fontSize: 14 }}>
        <strong>Hide By :</strong> {hiddenBy}
      </div>

      <div style={{ fontSize: 14 }}>
        <strong>Hide At :</strong>{' '}
        {hiddenAt ? dayjs(hiddenAt).format('MMM D, YYYY • h:mm A') : '-'}
      </div>
    </div>
  )
}

const MomentDetailShared = ({
  backPath = '/moment/post',
  breadcrumbRootTitle = 'Post',

  // optional callbacks from parent page
  onView,
  onApprove,
  onAddMention,
  onHide,
  onEdit,
  onActive,
  onDelete,
}) => {
  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { user, access_token } = useContext(AuthContext)
  const username = user?.username

  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [openAddMention, setOpenAddMention] = useState(false)
  const [mentionRecord, setMentionRecord] = useState(null)
  const [mentionType, setMentionType] = useState('post')

  const [openHideModal, setOpenHideModal] = useState(false)
  const [hideRecord, setHideRecord] = useState(null)
  const [hideLoading, setHideLoading] = useState(false)

  const [openApproveModal, setOpenApproveModal] = useState(false)
  const [approveRecord, setApproveRecord] = useState(null)
  const [approveLoading, setApproveLoading] = useState(false)

  const [openActiveModal, setOpenActiveModal] = useState(false)
  const [activeRecord, setActiveRecord] = useState(null)
  const [activeLoading, setActiveLoading] = useState(false)

  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [deleteRecord, setDeleteRecord] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // FIX: hooks must be called inside component body
  const fetchMomentById = useMomentStore((s) => s.fetchMomentById)
  // const storeLoading = useMomentStore((s) => s.loading?.detail)
  const storeLoading = useMomentStore((s) => s.loadingDetail)

  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleBack = () => navigate(backPath)

  const activeTab = useMemo(() => {
    const path = String(location?.pathname || '').toLowerCase()
    const title = String(breadcrumbRootTitle || '').toLowerCase()
    const back = String(backPath || '').toLowerCase()

    if (
      path.includes('/moment/video') ||
      title.includes('video') ||
      back.includes('/moment/video')
    ) {
      return 'video'
    }

    return 'post'
  }, [location?.pathname, breadcrumbRootTitle, backPath])
  const fetchDetail = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetchMomentById({
        access_token,
        _id: id,
        force: true,
      })

      const rawData = res?.data || res || null

      const data = rawData
        ? {
            ...rawData,

            // keep original object if you need it later
            postedByRaw: rawData?.postedBy,

            // convert object fields to text for React render
            postedBy: getDisplayText(rawData?.postedBy),
            createdBy: getDisplayText(rawData?.createdBy),
            author: getDisplayText(rawData?.author),
            owner: getDisplayText(rawData?.owner),
            approvedBy: getDisplayText(rawData?.approvedBy),
            reviewedBy: getDisplayText(rawData?.reviewedBy),
          }
        : null

      setDetail(data)
    } catch (err) {
      console.error('Error fetching moment detail', err)
      setError('Failed to load moment detail')
    } finally {
      setLoading(false)
    }
  }, [id, access_token, fetchMomentById])

  const handleOpenPlace = (item) => {
    const placeId =
      item?.placeId ||
      item?.place_id ||
      item?.place?._id ||
      item?.place?.id ||
      item?.placeInfo?._id ||
      item?.placeInfo?.id ||
      item?.targetId ||
      item?.target?._id ||
      item?.target?.id

    if (!placeId) return

    window.open(
      `${window.location.origin}/place/${placeId}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleOpenUser = (item) => {
    const userId = item?.raw?.user?._id

    if (!userId) return

    window.open(
      `${window.location.origin}/app/user/profile/${userId}`,
      '_blank',
      'noopener,noreferrer'
    )
  }
  const handleOpenUserOwner = (id) => {
    const userId = id
    if (!userId) return

    window.open(
      `${window.location.origin}/app/user/profile/${userId}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleDetailView = useCallback(
    (record) => {
      if (typeof onView === 'function') {
        return onView(record)
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    },
    [onView]
  )

  const handleAddMention = useCallback(
    (record) => {
      console.log('ADD MENTION RECORD:', record)

      const type = String(
        record?.type ||
          record?.postType ||
          record?.momentType ||
          detail?.type ||
          ''
      ).toLowerCase()

      setMentionRecord(record)

      if (
        type === 'videopost' ||
        type === 'video' ||
        type.includes('video') ||
        activeTab === 'video'
      ) {
        setMentionType('video')
      } else {
        setMentionType('post')
      }

      setOpenAddMention(true)

      if (typeof onAddMention === 'function') {
        onAddMention(record)
      }
    },
    [detail?.type, activeTab, onAddMention]
  )

  const handleHide = useCallback(
    (record) => {
      if (typeof onHide === 'function') {
        return onHide(record)
      }

      setHideRecord(record)
      setOpenHideModal(true)
    },
    [onHide]
  )

  const handleApprove = useCallback(
    (record) => {
      if (typeof onApprove === 'function') {
        return onApprove(record)
      }

      setApproveRecord(record)
      setOpenApproveModal(true)
    },
    [onApprove]
  )

  const handleActive = useCallback(
    (record) => {
      if (typeof onActive === 'function') {
        return onActive(record)
      }

      setActiveRecord(record)
      setOpenActiveModal(true)
    },
    [onActive]
  )

  const handleEdit = useCallback(
    (record) => {
      if (typeof onEdit === 'function') {
        return onEdit(record)
      }
    },
    [onEdit]
  )

  const handleDelete = useCallback(
    (record) => {
      if (typeof onDelete === 'function') {
        return onDelete(record)
      }

      setDeleteRecord(record)
      setOpenDeleteModal(true)
    },
    [onDelete]
  )

  const handleSetOpenAddMention = useCallback(
    (value) => {
      setOpenAddMention(value)

      if (value === false) {
        fetchDetail()
      }
    },
    [fetchDetail]
  )

  const handleSetOpenHideModal = useCallback(
    (value) => {
      setOpenHideModal(value)

      if (value === false) {
        fetchDetail()
      }
    },
    [fetchDetail]
  )

  const handleSetOpenApproveModal = useCallback(
    (value) => {
      setOpenApproveModal(value)

      if (value === false) {
        fetchDetail()
      }
    },
    [fetchDetail]
  )

  const handleSetOpenActiveModal = useCallback(
    (value) => {
      setOpenActiveModal(value)

      if (value === false) {
        fetchDetail()
      }
    },
    [fetchDetail]
  )

  const handleSetOpenDeleteModal = useCallback(
    (value) => {
      setOpenDeleteModal(value)

      if (value === false) {
        fetchDetail()
      }
    },
    [fetchDetail]
  )

  // header / breadcrumb
  useEffect(() => {
    setDisplayEmitContent(
      <div className='my-2'>
        <Row
          align='middle'
          justify='space-between'
          className='bg-white rounded-md px-4 py-2'
        >
          <Col>
            <div
              className='inline-flex items-center space-x-2 cursor-pointer'
              onClick={handleBack}
            >
              <ArrowLeftOutlined />
              <span style={{ fontWeight: 600, color: '#111827' }}>
                Back to Moments
              </span>
            </div>
          </Col>

          <Col>
            <Breadcrumb
              items={[
                {
                  title: (
                    <HomeOutlined
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/')}
                    />
                  ),
                },
                { title: breadcrumbRootTitle },
                { title: 'Moment' },
                { title: 'Moment Detail' },
              ]}
            />
          </Col>
        </Row>
      </div>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breadcrumbRootTitle, backPath])

  // fetch detail
  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const mediaArray = useMemo(() => {
    if (!Array.isArray(detail?.media)) return []

    const list = [...detail.media]

    // keep cover first but preserve other order
    const coverIndex = list.findIndex((m) => m?.isCover)

    if (coverIndex > 0) {
      const coverItem = list.splice(coverIndex, 1)[0]
      list.unshift(coverItem)
    }

    return list
  }, [detail?.media])

  const hashtags = useMemo(
    () => (Array.isArray(detail?.hashtags) ? detail.hashtags : []),
    [detail]
  )
  const places = useMemo(
    () => (Array.isArray(detail?.places) ? detail.places : []),
    [detail]
  )

  const actionRecord = useMemo(() => {
    if (!detail) return null

    return {
      ...detail,
      _id: detail?._id || detail?.id || id,
      id: detail?.id || detail?._id || id,
      status: detail?.status,
      createdBy:
        getDisplayName(detail?.createdBy) ||
        getDisplayName(detail?.createdByName) ||
        getDisplayName(detail?.author) ||
        getDisplayName(detail?.postedBy) ||
        '',
    }
  }, [detail, id])

  const isHiddenStatus = (status) => {
    const value = String(status || '')
      .toLowerCase()
      .trim()

    return value === 'inactive' || value === 'hidden'
  }
  if (error) {
    return (
      <Card style={cardStyle}>
        <Text type='danger'>{error}</Text>
      </Card>
    )
  }

  if (!detail) {
    return (
      <Card style={cardStyle}>
        <Text type='secondary'>No detail found.</Text>
      </Card>
    )
  }

  return (
    <>
      {isHiddenStatus(detail?.status) && (
        <Card style={cardStyle} className='mt-2'>
          <HiddenReasonBox detail={detail} />
        </Card>
      )}

      <div className='mx-3 my-2'>
        <Row gutter={[20, 20]}>
          {/* media */}
          <Col xs={24} md={24} xl={8} xxl={6} style={cardStyle}>
            <Card style={{ border: 'none' }} styles={{ body: { padding: 12 } }}>
              <Cover
                media={mediaArray}
                coverUrl={detail?.cover?.url}
                aspectRatio={detail?.aspectRatio}
              />
            </Card>
          </Col>

          {/* info */}
          <Col xs={24} md={24} xl={16} xxl={18} style={cardStyle}>
            <Card style={{ marginBottom: 20, border: 'none' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 2,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ApprovedByLine detail={detail} />
                </div>
              </div>

              <div className='mb-2'>
                <MomentDetailEngagement
                  record={detail}
                  actionRecord={actionRecord}
                  onView={handleDetailView}
                  onApprove={handleApprove}
                  onAddMention={handleAddMention}
                  onHide={handleHide}
                  onEdit={handleEdit}
                  onActive={handleActive}
                  onDelete={handleDelete}
                  detailPage={true}
                />
              </div>

              <Row gutter={[8, 8]}>
                {/* Title */}
                <Col xs={24}>
                  <Card size='small' style={cardStyle}>
                    <Text type='secondary' style={labelStyle}>
                      Title
                    </Text>
                    <Paragraph style={{ margin: 0 }}>
                      {detail.title || '-'}
                    </Paragraph>
                  </Card>
                </Col>

                {/* Type */}
                <Col xs={24} sm={12} md={8}>
                  <Card size='small' style={cardStyle}>
                    <Text type='secondary' style={labelStyle}>
                      Type
                    </Text>
                    <Paragraph style={{ margin: 0 }}>
                      {detail.type || '-'}
                    </Paragraph>
                  </Card>
                </Col>

                {/* Status */}
                <Col xs={24} sm={12} md={8}>
                  <Card size='small' style={cardStyle}>
                    <Text type='secondary' style={labelStyle}>
                      Status
                    </Text>
                    <Paragraph style={{ margin: 0 }}>
                      {getStatusText(detail.status)}
                    </Paragraph>
                  </Card>
                </Col>

                {/* Posted By */}
                <Col xs={24} sm={12} md={8}>
                  <Card size='small' style={cardStyle}>
                    <Text type='secondary' style={labelStyle}>
                      Posted By
                    </Text>
                    <Paragraph style={{ margin: 0 }}>
                      {getDisplayText(detail?.postedBy)}
                    </Paragraph>

                    {/* <Paragraph style={{ margin: 0 }}>{detail.postedBy || '-'}</Paragraph> */}
                  </Card>
                </Col>
                {/* Posted By */}
                <Col xs={24} sm={12} md={8}>
                  <Card size='small' style={cardStyle}>
                    <Text type='secondary' style={labelStyle}>
                      Updated By
                    </Text>
                    <Paragraph style={{ margin: 0 }}>
                      {getDisplayText(detail?.updatedBy)}
                    </Paragraph>

                    {/* <Paragraph style={{ margin: 0 }}>{detail.postedBy || '-'}</Paragraph> */}
                  </Card>
                </Col>

                {/* Posted From */}
                <Col xs={24} sm={12} md={8}>
                  <Card size='small' style={cardStyle}>
                    <Text type='secondary' style={labelStyle}>
                      Posted From
                    </Text>
                    <Paragraph style={{ margin: 0 }}>
                      {detail.postedFrom === 'app'
                        ? getDisplayText(detail?.postedBy)
                        : detail.postedFrom +
                          ' (' +
                          (getDisplayText(detail?.createdBy) + ')')}
                    </Paragraph>
                  </Card>
                </Col>

                {/* Created At */}
                <Col xs={24} sm={12} md={8}>
                  <Card size='small' style={cardStyle}>
                    <Text type='secondary' style={labelStyle}>
                      Created At
                    </Text>
                    <Paragraph style={{ margin: 0 }}>
                      {detail.createdAt
                        ? dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm:ss')
                        : '-'}
                    </Paragraph>
                  </Card>
                </Col>

                {/* Updated At */}
                <Col xs={24} sm={12} md={8}>
                  <Card size='small' style={cardStyle}>
                    <Text type='secondary' style={labelStyle}>
                      Updated At
                    </Text>
                    <Paragraph style={{ margin: 0 }}>
                      {detail.updatedAt
                        ? dayjs(detail.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                        : '-'}
                    </Paragraph>
                  </Card>
                </Col>

                {/* Hashtags */}
                <Col xs={24}>
                  <Card size='small' style={cardStyle}>
                    <Text type='secondary' style={labelStyle}>
                      Hashtags
                    </Text>

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginTop: 4,
                      }}
                    >
                      {hashtags.length === 0 && (
                        <span className='text-gray-400 text-sm'>
                          No hashtags
                        </span>
                      )}

                      {hashtags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: '#e6f7ff',
                            color: '#1890ff',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 14,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary' style={labelStyle}>
              Description
            </Text>

            <Paragraph style={{ margin: 0, whiteSpace: 'pre-line' }}>
              {stripHashtagsFromDescription(
                detail.description || 'No description'
              )}
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* places */}
      <Location places={places} />

      <MomentInteractionTimeline
        handleOpenUser={handleOpenUser}
        handleOpenUserOwner={handleOpenUserOwner}
      />

      {mentionType === 'post' ? (
        <EditPost
          open={openAddMention}
          setOpen={handleSetOpenAddMention}
          propsData={mentionRecord}
          username={username}
          isAddMention={true}
          disableMention={true}
          mentionTitle='Add More Mention'
        />
      ) : (
        <EditVideo
          open={openAddMention}
          setOpen={handleSetOpenAddMention}
          propsData={mentionRecord}
          username={username}
          isAddMention={true}
          disableMention={true}
          mentionTitle='Add More Mention'
          lastTabMention='Information'
        />
      )}

      <HideCreatorPostModal
        open={openHideModal}
        setOpen={handleSetOpenHideModal}
        record={hideRecord}
        loading={hideLoading}
        title='Hide Creator Post'
      />

      <ApprovePostModal
        open={openApproveModal}
        setOpen={handleSetOpenApproveModal}
        record={approveRecord}
        loading={approveLoading}
        title='Approve Post'
      />

      <ActivePostModal
        open={openActiveModal}
        setOpen={handleSetOpenActiveModal}
        record={activeRecord}
        loading={activeLoading}
        title='Active Post'
      />

      <DeletePostModal
        open={openDeleteModal}
        setOpen={handleSetOpenDeleteModal}
        record={deleteRecord}
        loading={deleteLoading}
        title='Delete Post'
        access_token={access_token}
      />
    </>
  )
}

export default MomentDetailShared
