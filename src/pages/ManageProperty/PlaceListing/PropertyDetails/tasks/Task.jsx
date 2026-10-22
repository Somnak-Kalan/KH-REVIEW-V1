import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Button,
  Empty,
  Form,
} from 'antd'
import {
  ArrowDownOutlined,
} from '@ant-design/icons'
import CommentEmpty from '../../../../../assets/icon/CommentEmpty.png'
import MaskGroup from '../../../../../assets/icon/MaskGroup.png'
import DeletedIcon from '../../../../../assets/icon/delete.png'
import Swal from 'sweetalert2'
import { PERMS } from '../../../../../constants/permission/perms'
import { AuthContext } from '../../../../../contexts/AuthContext'
import AllPropertyServices from '../../../../../services/ManageProperty/PlaceListing/AllProperty'
import { useAllPropertyStore } from '../../../../../Stores/ManageProperty/AllProperty/AllProperty.store'

import TaskPropertyServices from '../../../../../services/ManageProperty/PlaceListing/Task'
import DataInput from './DataInput'
import PinComments from './PinComments'
import CommentList from './CommentList'
import {
  getMarkedComments,
  setMarkedComments
} from '@/utils/markUtils'
export default function TaskCommentsPlain(props) {
  const { placeId } = props
  // 1) State for all comments; each comment = { id, author, text, createdAt, replies, markAs, markAs }
  const [comments, setComments] = useState([])
  const { access_token, user, checkPermission } = useContext(AuthContext)
  const location = useLocation()
  // 2) Which comment ID we’re replying to (null = posting a top‐level comment)
  const [replyTo, setReplyTo] = useState(null)
  const [mainComment, setMainComment] = useState(null)
  const { fetchNonBusinessPropertyById, fetchPlaceReviewList, propertyDetail } = useAllPropertyStore()
  useEffect(() => {
    localStorage.setItem('userId', user?._id)
    localStorage.setItem('userRole', user.username)
  }, [user, access_token, location])

  // 3) Bottom‐bar draft (used for both new comments, replies, and edits)
  const [draft, setDraft] = useState('')
  const [author, setAuthor] = useState('')
  const navigate = useNavigate()
  // 4) Is the bottom bar expanded (showing TextArea + buttons)?
  const [isEditing, setIsEditing] = useState(false)
  const [loadingCommentId, setLoadingCommentId] = useState(null)

  // 5) Track which comment is being edited (null = not editing)
  const [editCommentId, setEditCommentId] = useState(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  //
  const [value, setValues] = useState()
  // 6) New states for the two checkboxes in the bottom bar:

  const statusOptions = [
    { label: 'Mark as Special remark', value: 'Special remark' },
    { label: 'Mark as Follow up', value: 'Follow up' },
  ]
  const [statusComment, setStatusComment] = useState(null)

  const toggleStatus = (value) => {
    setStatusComment((prev) => (prev === value ? null : value))
  }
  const [form] = Form.useForm()
  //
  const getCommentList = async (id, force = false) => {
    try {
      const res = await fetchNonBusinessPropertyById({
        access_token,
        id,
        force,
      })

      const detail = res?.data || propertyDetail || null
      const rawComments = Array.isArray(detail?.comments) ? detail.comments : []

      const commentMap = {}
      rawComments.forEach((c) => {
        commentMap[c._id] = {
          ...c,
          id: c._id,
          replies: [],
        }
      })

      const nestedComments = []
      rawComments.forEach((c) => {
        if (c.reply) {
          const parent = commentMap[c.reply]
          if (parent) {
            parent.replies.push(commentMap[c._id])
          }
        } else {
          nestedComments.push(commentMap[c._id])
        }
      })

      setComments(nestedComments)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (!placeId || !access_token) return
    getCommentList(placeId)
  }, [placeId, access_token])


  //
  // Helper: recursively insert a reply under the matching parentId
  const addReplyToList = (list, parentId, replyObj) => {
    return list.map((item) => {
      if (item?._id === parentId) {
        return { ...item, replies: [...item.replies, replyObj] }
      } else if (item.replies.length > 0) {
        return {
          ...item,
          replies: addReplyToList(item.replies, parentId, replyObj),
        }
      }
      return item
    })
  }

  // Helper: recursively update a comment’s text by ID (for editing)
  const updateCommentContent = (list, id, newContent) => {
    return list.map((item) => {
      if (item?._id === id) {
        return { ...item, text: newContent, edited: true }
      } else if (item.replies.length > 0) {
        return {
          ...item,
          replies: updateCommentContent(item.replies, id, newContent),
        }
      }
      return item
    })
  }

  // Helper: recursively remove a comment (or reply) by ID
  const removeCommentById = (list, id) => {
    return list
      .map((item) => {
        if (item.replies.length > 0) {
          return {
            ...item,
            replies: removeCommentById(item.replies, id),
          }
        }
        return item
      })
      .filter((item) => item?._id !== id)
  }

  const toggleRemarkFlag = (list, id, flag) => {
    return list.map((item) => {
      if (item?._id === id) {
        return {
          ...item,
          markAs: item.markAs === flag ? null : flag,
        }
      } else if (Array.isArray(item.replies) && item.replies.length > 0) {
        return {
          ...item,
          replies: toggleRemarkFlag(item.replies, id, flag),
        }
      }

      return item
    })
  }

  // 7) Create a new top‐level comment, reply under replyTo, or save edit
  const postDraft = async (values) => {
    const text = values?.comment.trim()
    setValues(text)
    if (!text) {
      // If empty, just collapse/reset
      setDraft('')
      setAuthor('')
      setIsEditing(false)
      setReplyTo(null)
      setMainComment(null)
      setEditCommentId(null)
      return
    }
    if (editCommentId) {
      // We’re saving an edit to an existing comment
      setLoadingSave(true)
      const doc = {
        commentId: editCommentId,
        text: text,
        author: user?.username,
        reply: mainComment, // _id comment
        markAs: statusComment, // Special remark  or "Follow up"
      }

      const res = await TaskPropertyServices?.UpdateCommentProperty({
        locationId: placeId,
        access_token,
        doc,
      })
      if (res) {
        setLoadingSave(false)
        const lastComment =
          res?.data?.comments?.[res?.data?.comments?.length - 1]
        setComments((prev) =>
          updateCommentContent(prev, lastComment?._id, lastComment?.text)
        )
        setDraft('')
        setAuthor('')
        setIsEditing(false)
        setReplyTo(null)

        setEditCommentId(null)
        form.setFieldsValue({ comment: '' })
        getCommentList(placeId)
      }
    } else if (replyTo) {
      setLoadingSave(true)
      const doc = {
        text: text,
        author: user?.username,
        reply: replyTo, // _id comment
        markAs: statusComment, // Special remark  or "Follow up"
      }
      const res = await TaskPropertyServices?.AddCommentProperty({
        locationId: placeId,
        access_token,
        doc,
      })
      if (res) {
        setLoadingSave(false)
        const lastComment =
          res?.data?.comments?.[res?.data?.comments?.length - 1]
        const newReply = {
          _id: lastComment?._id,
          author: lastComment?.author,
          text: lastComment?.text,
          createdAt: lastComment?.createdAt,
          replies: [],
          markAs: statusComment,
        }

        setComments((prev) => addReplyToList(prev, replyTo, newReply))

        setDraft('')
        setIsEditing(false)
        form.setFieldsValue({ comment: '' })
        getCommentList(placeId)
        handleCancel()
      }
    } else {
      setLoadingSave(true)
      // We’re posting a new top‐level comment
      const doc = {
        text: text,
        author: user?.username,
        reply: null, // _id comment
        markAs: statusComment, // Special remark  or "Follow up"
      }
      const res = await TaskPropertyServices?.AddCommentProperty({
        locationId: placeId,
        access_token,
        doc,
      })
      if (res) {
        setLoadingSave(false)
        const lastComment =
          res?.data?.comments?.[res?.data?.comments?.length - 1]
        // getCommentList(placeId)
        const newComment = {
          _id: lastComment?._id,
          author: lastComment?.author,
          text: lastComment?.text,
          createdAt: lastComment?.createdAt,
          replies: [],
          markAs: lastComment?.markAs,
        }

        setComments((prev) => [...prev, newComment])
        setShouldScroll(true)

        setDraft('')
        setIsEditing(false)
        form.setFieldsValue({ comment: '' })
      }
      // setStatusComments()
      // setFollowUp()
    }
  }
  // 8) Cancel bottom‐bar editor (for new comment, reply, or edit)
  const handleCancel = () => {
    setDraft('')
    setAuthor('')
    setIsEditing(false)
    setReplyTo(null)
    setMainComment(null)
    setEditCommentId(null)
  }
  // When “More” → Delete or Edit is clicked
  const handleMoreClick = (action, comment) => {
    if (action === 'edit') {
      // Open editor in edit mode
      setEditCommentId(comment._id)
      setReplyTo(null)
      setMainComment(comment?.reply)
      setDraft(comment.text)
      setValues(comment?.text)
      setAuthor(comment.author)

      form.setFieldsValue({ comment: comment.text })
      setIsEditing(true)
    } else if (action === 'delete') {
      // delete the comment (or reply)
      Swal.fire({
        title: 'Delete Comment',
        text: 'Are you sure you want to delete this comment?',
        imageUrl: DeletedIcon, // <-- path to your custom PNG
        imageWidth: 45, // adjust as needed
        imageHeight: 45, // adjust as needed
        imageAlt: 'Custom delete icon',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Delete',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        showCloseButton: true,
        reverseButtons: true,
        didOpen: () => {
          const confirmBtn = Swal.getConfirmButton()
          const cancelBtn = Swal.getCancelButton()
          const showCloseBtn = Swal.getCloseButton()
          if (showCloseBtn) {
            showCloseBtn.style.color = 'red'
            showCloseBtn.style.fontSize = '30px'
          }
          if (confirmBtn) {
            confirmBtn.style.backgroundColor = '#d33'
            confirmBtn.style.color = '#ffffff'
            confirmBtn.style.border = 'none'
            confirmBtn.style.padding = '8px 50px'
            confirmBtn.style.marginLeft = '2px'
            confirmBtn.style.borderRadius = '20px'
            confirmBtn.style.fontSize = '14px'
            confirmBtn.style.cursor = 'pointer'
          }
          if (cancelBtn) {
            cancelBtn.style.backgroundColor = '#3085d6'
            cancelBtn.style.color = '#ffffff'
            cancelBtn.style.border = 'none'
            cancelBtn.style.padding = '8px 50px'
            cancelBtn.style.marginRight = '2px'

            cancelBtn.style.borderRadius = '20px'
            cancelBtn.style.fontSize = '14px'
            cancelBtn.style.cursor = 'pointer'
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          setComments((prev) => removeCommentById(prev, comment?._id))
          const commentId = comment?._id
          if (commentId !== null) {
            const doc = { commentId: comment?._id }
            const res = TaskPropertyServices?.DeleteCommentProperty({
              locationId: placeId,
              access_token,
              doc,
            })
            if (res) {
              // getCommentList(placeId)
              Swal.fire({
                title: 'Deleted!',
                text: 'Your comment has been deleted.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
              })
            } else {
              Swal.fire({
                title: 'Deleted!',
                text: 'Your comment cannot deleted',
                icon: 'warn',
                timer: 1500,
                showConfirmButton: false,
              })
            }
          }
        }
      })
    }
  }
  const flattenComments = (comments = []) => {
    const result = []

    const recurse = (items) => {
      for (const item of items) {
        result.push(item)
        if (Array.isArray(item.replies) && item.replies.length > 0) {
          recurse(item.replies)
        }
      }
    }

    recurse(comments)
    return result
  }
  useEffect(() => {
    const allComments = flattenComments(comments) || []

    const markedComments = allComments
      .filter((c) => c?.markAs) // if markAs is not null
      .map((c) => ({
        commentId: c._id,
        author: c.author,
      }))
    if (user?._id && markedComments.length > 0) {
      setMarkedComments(user._id, markedComments)
    }
  }, [comments])

  const handleRemarkClick = (markAs, comment) => {
    const userId = localStorage.getItem('userId')
    const userRole = localStorage.getItem('userRole')

    if (!userId) return
    const allComments = flattenComments(comments) || []
    const markedComments = allComments
      .filter((c) => c?.markAs) // if markAs is not null
      .map((c) => ({
        commentId: c._id,
        author: c.author,
      }))
    if (user?._id && markedComments.length > 0) {
      setMarkedComments(user._id, markedComments)
    }
    // Get current marked comments — now array of objects [{ commentId, author }]
    const currentMarked = getMarkedComments(userId) || []
    const currentAuthor = user?.username

    // Check if current author already marked a comment
    const isAuthorAlreadyMarked = currentMarked.some(
      (item) => item.author === currentAuthor
    )
    if (userRole !== 'admin' && markAs && isAuthorAlreadyMarked) {
      Swal.fire({
        icon: 'info',
        title: 'Already Marked',
        text: `You’ve already marked a comment by "${currentAuthor}". Only one mark per author is allowed.`,
      })
      return
    }

    if (userRole === 'admin') {
      let updated
      if (markAs) {
        // Add new marked comment if not already added (check by commentId)
        if (!currentMarked.find((item) => item.commentId === comment._id)) {
          updated = [
            ...currentMarked,
            { commentId: comment._id, author: comment.author },
          ]
        } else {
          updated = currentMarked
        }
      } else {
        // Remove marked comment by commentId
        updated = currentMarked.filter((item) => item.commentId !== comment._id)
      }

      setMarkedComments(userId, updated)
      updateCommentMark(markAs, comment)
      return
    }

    // Non-admin limit: only one remark total
    if (markAs && currentMarked.length >= 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Limit Reached',
        text: 'Only one remark allowed for non-admin users.',
      })
      return
    }

    // For non-admin: mark or unmark (only one allowed)
    const updated = markAs
      ? [{ commentId: comment._id, author: comment.author }]
      : currentMarked.filter((item) => item.commentId !== comment._id)

    setMarkedComments(userId, updated)
    updateCommentMark(markAs, comment)
  }

  // When “Remark” → Special remark or Follow up is clicked  
  const updateCommentMark = async (flag, comment) => {
    try {
      if (!comment?._id || !placeId || !access_token) return

      setLoadingCommentId(comment._id)

      const payload = {
        commentId: comment._id,
        text: comment.text || '',
        author: comment.author || '',
        reply: comment.reply || null,
        markAs: flag, // "Special remark" or null
      }

      const res = await TaskPropertyServices?.UpdateCommentProperty({
        locationId: placeId,
        access_token,
        doc: payload,
      })

      if (res?.data?.comments?.length > 0) {
        const lastComment = res.data.comments.at(-1)
        getCommentList(placeId)
        setComments((prev) => toggleRemarkFlag(prev, lastComment._id, flag))
      } else {
        console.warn('No comments returned in response')
      }
    } catch (err) {
      console.error('Failed to update comment mark:', err)
    } finally {
      setLoadingCommentId(null)
    }
  }

  // Helper: collect all comments (including nested) that match a given flag
  const collectRemarks = (list, flag) => {
    let results = []
    list.forEach((item) => {
      if (flag === 'special' && item.markAs === 'Special remark')
        results.push(item)
      if (flag === 'follow' && item.markAs === 'Follow up') results.push(item)
      if (item?.replies?.length > 0) {
        results = results.concat(collectRemarks(item.replies, flag))
      }
    })
    return results
  }
  // Collect all special remarks (including replies)
  const specialComments = collectRemarks(comments, 'special')
  // Collect all follow-up remarks (including replies)
  const followUpComments = collectRemarks(comments, 'follow')
  const commentsWrapperRef = useRef(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const onScroll = () => {
    const el = commentsWrapperRef.current
    if (!el) return
    // if scrollTop  height < total scrollable height → not at bottom
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    setShowScrollBtn(!atBottom)
  }
  useEffect(() => {
    if (!shouldScroll) return

    const el = commentsWrapperRef.current
    if (!el) return

    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })

    setShouldScroll(false) // reset the flag
  }, [shouldScroll])

  return (
    <div className='bg-white rounded-lg'>


      {/* ==== Pinned Tasks Section ==== */}
      <PinComments
        specialComments={specialComments}
        followUpComments={followUpComments}
        checkPermission={checkPermission}
        PERMS={PERMS}
        handleRemarkClick={handleRemarkClick}
        DeletedIcon={DeletedIcon}
        MaskGroup={MaskGroup}
      />
      {/* ─── Add horizontal divider line here ─── */}
      {
        (specialComments?.length > 0 || followUpComments?.length > 0) && (
          <div style={{ borderBottom: 'solid 1px #C8E1F8' }} className=' mb-4' />
        )
      }
      {
        comments?.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              color: '#888',
            }}
          >
            <Empty
              image={
                <img
                  src={CommentEmpty}
                  alt='No comments'
                  style={{
                    display: 'block',
                    margin: '0 auto',
                    paddingTop: '20px',
                    width: '80px',
                  }}
                />
              }
              description={<span>Don’t have any comment yet.</span>}
            />
          </div>
        ) : (
          <div
            ref={commentsWrapperRef}
            onScroll={() => onScroll()}
            className='px-5 relative'
            style={{
              marginBottom: 24,
              height: 500,
              overflowY: 'auto',
            }}
          >
            <CommentList form={form} comments={comments} checkPermission={checkPermission}
              PERMS={PERMS} MaskGroup={MaskGroup} loadingCommentId={loadingCommentId}
              handleMoreClick={handleMoreClick}
              handleRemarkClick={handleRemarkClick}
              setReplyTo={setReplyTo}
              setMainComment={setMainComment}
              setAuthor={setAuthor}
              setIsEditing={setIsEditing}
              setEditCommentId={setEditCommentId}
            />
            {/* //main list */}
            {/* floating “scroll to bottom” button */}
            {comments?.length > 5 && showScrollBtn && (
              <Button
                shape='circle'
                // size='small'
                icon={<ArrowDownOutlined style={{ fontSize: '16px' }} />}
                onClick={() => {
                  const el = commentsWrapperRef.current
                  if (el) {
                    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
                  }
                }}
                style={{ background: '#3161A9', color: 'white' }}
                className='fixed bottom-80 right-14  z-50'
              />
            )}
          </div>
        )
      }
      {/* //data input */}
      <div className='pb-1'>
        <DataInput
          form={form}
          setIsEditing={setIsEditing} isEditing={isEditing}
          draft={draft} setDraft={setDraft} postDraft={postDraft} statusComment={statusComment} handleCancel={handleCancel}
          editCommentId={editCommentId} replyTo={replyTo} author={author} value={value} loadingSave={loadingSave} statusOptions={statusOptions}
          toggleStatus={toggleStatus}
        />

      </div>


      {/* //end data input */}
    </div >
  )
}
