import React, { useEffect, useState, useContext, useCallback } from 'react'
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom'
import { AuthContext } from '../../../contexts/AuthContext'
import { Breadcrumb, Button } from 'antd'
import { HomeOutlined, PlusOutlined } from '@ant-design/icons'
import MomentAsPost from './post/Post'
import MomentAsVideo from './video/Video'
import EditPost from './post/addEdit/Edit'
import EditVideo from './video/addEdit/Edit'
import HideCreatorPostModal from '../../../components/post/moment/modal/HideCreatorPostModal'
import ApprovePostModal from '../../../components/post/moment/modal/ApprovePostModal'
import ActivePostModal from '../../../components/post/moment/modal/ActivePostModal'
import DeletePostModal from '../../../components/post/moment/modal/DeletePostModal'

const buildStatus = (status) => {
  const value = String(status || '').toLowerCase()
  if (value === 'active') return 'Active'
  if (value === 'under_review') return 'under_review'
  return 'hide'
}

const MomentTab = () => {
  const { setDisplayEmitContent } = useOutletContext()
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

  const navigate = useNavigate()
  const location = useLocation()

  const activeTab = location.pathname.includes('/moment/video') ? 'video' : 'post'

  const handleAddMention = useCallback(
    (record) => {
      setMentionRecord(record)
      console.log(record);

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

  useEffect(() => {
    setDisplayEmitContent(
      <div className="flex justify-between my-3">
        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
            { href: '', title: <span>Post</span> },
            { href: '', title: <span>Moment</span> },
          ]}
        />
      </div>
    )
  }, [setDisplayEmitContent])

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 shadow-sm dark:border-slate-800 px-4 pb-5 pt-2 ant-card-moment-tabs">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex justify-between space-x-4" aria-label="Tabs">
          <div>
            <button
              type="button"
              onClick={() => navigate('/moment/post')}
              className={`whitespace-nowrap py-2 px-4 text-sm font-medium rounded-t-lg ${activeTab === 'post'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Post
            </button>

            <button
              type="button"
              onClick={() => navigate('/moment/video')}
              className={`whitespace-nowrap py-2 px-4 text-sm font-medium rounded-t-lg ${activeTab === 'video'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Video
            </button>
          </div>

          <Button
            type="primary"
            style={{ background: '#1677ff' }}
            className="cursor-pointer text-white"
            onClick={() => (activeTab === 'post' ? setPost(true) : setVideo(true))}
          >
            <PlusOutlined />
            Add
          </Button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'post' ? (
          <MomentAsPost
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
        ) : (
          <MomentAsVideo
            open={openVideo}
            buildStatus={buildStatus}
            setOpen={setVideo}
            username={username}
            onAddMention={handleAddMention}
            onHide={handleHide}
            onApprove={handleApprove}
            onActive={handleActive}
            onDelete={handleDelete}
          />
        )}
      </div>

      {mentionType === 'post' ? (
        <EditPost
          open={openAddMention}
          setOpen={setOpenAddMention}
          propsData={mentionRecord}
          username={username}
          isAddMention={true}
          disableMention={true}
          mentionTitle="Add More Mention"
        />
      ) : (
        <EditVideo
          open={openAddMention}
          setOpen={setOpenAddMention}
          propsData={mentionRecord}
          username={username}
          isAddMention={true}
          disableMention={true}
          mentionTitle="Add More Mention"
          lastTabMention="Information"
        />
      )}

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
        access_token={access_token}
      />
    </div>
  )
}

export default MomentTab