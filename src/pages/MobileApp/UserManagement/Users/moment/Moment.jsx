import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom'
import { AuthContext } from '../../../../../contexts/AuthContext'
import { Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import MomentAsPost from './post/Post'
import HideCreatorPostModal from '../../../../../components/post/moment/modal/HideCreatorPostModal'
import ApprovePostModal from '../../../../../components/post/moment/modal/ApprovePostModal'
import ActivePostModal from '../../../../../components/post/moment/modal/ActivePostModal'
import DeletePostModal from '../../../../../components/post/moment/modal/DeletePostModal'

const buildStatus = (status) => {
  const value = String(status || '').toLowerCase()
  if (value === 'active') return 'Active'
  if (value === 'under_review') return 'under_review'
  return 'hide'
}

const MomentTab = ({ userId, accessToken }) => {
  const [openPost, setPost] = useState(false)
  const [openVideo, setVideo] = useState(false)
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

  const { user, access_token } = useContext(AuthContext)
  const username = user?.username
  const finalAccessToken = accessToken || access_token

  const navigate = useNavigate()
  const location = useLocation()

  const activeTab = location.pathname.includes('/moment/video') ? 'video' : 'post'

  const handleAddMention = useCallback(
    (record) => {
      setMentionRecord(record)
      console.log(record)

      const type = String(record?.type || '').toLowerCase()
      if (type === 'videopost' || activeTab === 'video') {
        setMentionType('video')
      } else {
        setMentionType('post')
      }

      setOpenAddMention(true)
    },
    [activeTab]
  )

  const handleHide = useCallback((record) => {
    setHideRecord(record)
    setOpenHideModal(true)
  }, [])

  const handleApprove = useCallback((record) => {
    setApproveRecord(record)
    setOpenApproveModal(true)
  }, [])

  const handleActive = useCallback((record) => {
    setActiveRecord(record)
    setOpenActiveModal(true)
  }, [])

  const handleDelete = useCallback((record) => {
    setDeleteRecord(record)
    setOpenDeleteModal(true)
  }, [])


  return (
    <div className='mb-4'>
      <div className="mt-4">
        <MomentAsPost
          userId={userId}
          accessToken={finalAccessToken}
          open={openPost}
          buildStatus={buildStatus}
          setOpen={setPost}
          username={username}
          onAddMention={handleAddMention}
          onHide={handleHide}
          onApprove={handleApprove}
          onActive={handleActive}
          onDelete={handleDelete}
        />
      </div>

      <HideCreatorPostModal
        open={openHideModal}
        setOpen={setOpenHideModal}
        record={hideRecord}
        loading={hideLoading}
        title="Hide Creator Post"
      />

      <ApprovePostModal
        open={openApproveModal}
        setOpen={setOpenApproveModal}
        record={approveRecord}
        loading={approveLoading}
        title="Approve Post"
      />

      <ActivePostModal
        open={openActiveModal}
        setOpen={setOpenActiveModal}
        record={activeRecord}
        loading={activeLoading}
        title="Active Post"
      />

      <DeletePostModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        record={deleteRecord}
        loading={deleteLoading}
        title="Delete Post"
        access_token={finalAccessToken}
      />
    </div>
  )
}

export default MomentTab