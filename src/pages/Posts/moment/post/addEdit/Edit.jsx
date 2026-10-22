import React, { useState, useContext, useEffect } from 'react'
import { Modal, Form, message } from 'antd'
import Photo from './Photo'
import TextForm from '../../../../../components/post/moment/form/TextForm'
import { AuthContext } from '../../../../../contexts/AuthContext'
import { useMomentStore } from '../../../../../Stores/Post/Moment.store'
import Swal from 'sweetalert2'

// Map Tailwind aspect class → API aspectRatio string
const mapAspectRatioToApi = (aspectRatio) => {
    switch (aspectRatio) {
        case 'aspect-[3/4]':
            return '3/4'
        case 'aspect-square':
            return '1/1'
        case 'aspect-[4/3]':
        default:
            return '4/3'
    }
}
// Map API aspectRatio string → Tailwind aspect class (for editing)
const mapApiToAspectRatio = (apiAspect) => {
    switch (apiAspect) {
        // NEW API format
        case '3/4':
            return 'aspect-[3/4]'
        case '1/1':
            return 'aspect-square'
        case '4/3':
            return 'aspect-[4/3]'

        // OLD API format (keep for backward compatibility)
        case 'portrait3:4':
            return 'aspect-[3/4]'
        case 'square1:1':
            return 'aspect-square'
        case 'classic4:3':
            return 'aspect-[4/3]'

        default:
            return 'aspect-[4/3]'
    }
}

const EditPost = ({ open, setOpen, propsData, fetchMomentPosts, username, disableMention = false, mentionTitle = '' }) => {
    const [form] = Form.useForm()
    const { access_token } = useContext(AuthContext)

    const [aspectRatio, setAspectRatio] = useState('aspect-[4/3]')
    const [fileList, setFileList] = useState([])
    const [loadingDetail, setLoadingDetail] = useState(false)
    //  keep same concept: collect removed mediaIds
    const [removeMedia, setRemoveMedia] = useState([])

    const [videoUrl, setVideoUrl] = useState(null)
    const [coverVideo, setCoverVideo] = useState(null)
    const [locations, setLocations] = useState([])
    const [btnLoading, setBtnLoading] = useState(false)
    const [hastags, setHastags] = useState([])
    const [descriptionText, setDescriptionText] = useState()
    //  ADD ONLY: snapshot for "no changes => close directly"
    const initialSnapshotRef = React.useRef(null)
    const { UpdateMoment, fetchMomentById } = useMomentStore()
    //  helper: compare by filename
    const getName = (u) => {
        if (!u || typeof u !== 'string') return ''
        const clean = u.split('?')[0]
        return clean.substring(clean.lastIndexOf('/') + 1)
    }

    const isVideoFile = (f) => {
        const mime = String(f?.type || '').toLowerCase()
        if (mime.startsWith('video/')) return true
        const name = String(f?.name || '')
        const url = String(f?.url || '')
        return name.endsWith('.mp4') || url.endsWith('.mp4')
    }


    const normalizeHashtags = (input) => {
        if (Array.isArray(input)) {
            return input
                .map((t) => (typeof t === 'string' ? t : t?.value || t?.label || ''))
                .map((t) => String(t).trim())
                .filter(Boolean)
        }
        if (typeof input === 'string' && input.trim()) {
            return input
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
        }
        return []
    }

    const normalizePlaceIds = (input) => {
        if (!input || !Array.isArray(input)) return []
        return input
            .map((p) => p?._id || p?.id || p?.value || p)
            .map((id) => String(id).trim())
            .filter(Boolean)
    }

    //  ADD ONLY: detect any change
    const hasUnsavedChanges = () => {
        const snap = initialSnapshotRef.current

        // if snapshot not ready yet, fallback (DO NOT treat existing fileList length as change)
        if (!snap) {
            const touched = form?.isFieldsTouched?.(true)
            const hasRemove = Array.isArray(removeMedia) && removeMedia.length > 0

            //  only count file changes that represent REAL user changes
            const hasNewUpload =
                Array.isArray(fileList) &&
                fileList.some((f) => !f?.fromServer && !!f?.originFileObj && !f?.fromCover)

            const hasReplaceServerVideoCover =
                Array.isArray(fileList) &&
                fileList.some((f) => !!f?.fromServer && isVideoFile(f) && f?.coverImage instanceof File)

            return !!(touched || hasRemove || hasNewUpload || hasReplaceServerVideoCover)
        }

        const values = form.getFieldsValue(true) || {}

        const eqArr = (a, b) => {
            const aa = Array.isArray(a) ? [...a].map(String).sort() : []
            const bb = Array.isArray(b) ? [...b].map(String).sort() : []
            if (aa.length !== bb.length) return false
            for (let i = 0; i < aa.length; i++) if (aa[i] !== bb[i]) return false
            return true
        }

        // any removed media
        const removeMediaIds = Array.isArray(removeMedia)
            ? removeMedia
                .map((x) => (typeof x === 'string' ? x : x?.mediaId || x?._id || x?.id))
                .map((id) => String(id || '').trim())
                .filter(Boolean)
            : []
        if (removeMediaIds.length > 0) return true

        // aspect ratio changed
        if (aspectRatio !== snap.aspectRatio) return true

        // form values changed
        const title = values.title || ''
        const description = values.description || ''
        const status = values.status || ''

        if (String(title) !== String(snap.title || '')) return true
        if (String(description) !== String(snap.description || '')) return true
        if (String(status) !== String(snap.status || '')) return true

        const hashtags = normalizeHashtags(values.hashtags)
        if (!eqArr(hashtags, snap.hashtags || [])) return true

        const placeIds = normalizePlaceIds(values.places || values.location || [])
        if (!eqArr(placeIds, snap.placeIds || [])) return true

        // fileList changed (order / cover / caption / mute / new uploads / new coverImage)
        const currentSig = (fileList || []).map((f, idx) => ({
            key: f?.fromCover ? `C:${f?.coverKey || f?.uid || ''}` : `M:${f?.mediaId || f?.uid || ''}`,
            isCover: idx === 0,
            caption: (typeof f?.caption === 'string' ? f.caption : ''),
            isMuted: !!f?.isMuted,

            //  ignore originFileObj for server items (some Upload setups may inject it)
            hasOrigin: !f?.fromServer && !!f?.originFileObj && !f?.fromCover,

            // cover change check
            hasCoverImage: f?.coverImage instanceof File,
        }))

        const snapSig = Array.isArray(snap.fileSig) ? snap.fileSig : []
        if (currentSig.length !== snapSig.length) return true

        for (let i = 0; i < currentSig.length; i++) {
            const a = currentSig[i]
            const b = snapSig[i]
            if (
                a.key !== b.key ||
                a.isCover !== b.isCover ||
                a.caption !== b.caption ||
                a.isMuted !== b.isMuted ||
                a.hasOrigin !== b.hasOrigin ||
                a.hasCoverImage !== b.hasCoverImage
            ) {
                return true
            }
        }

        return false
    }

    //  confirm close when click cancel / X / mask
    const confirmBeforeClose = async () => {
        if (btnLoading) return

        //  ADD ONLY: if detail not loaded yet => close directly (NO Swal)
        if (!initialSnapshotRef.current) {
            setOpen(false)
            return
        }

        //  if nothing changed, close modal only (NO Swal)
        if (!hasUnsavedChanges()) {
            setOpen(false)
            return
        }

        const result = await Swal.fire({
            icon: 'warning',
            title: 'Discard changes?',
            text: 'If you close now, your unsaved changes will be lost.',
            showCancelButton: true,
            confirmButtonText: 'Yes, close',
            cancelButtonText: 'No, keep editing',
            reverseButtons: true,
        })

        if (result.isConfirmed) {
            try {
                form.resetFields()
            } catch { }
            setOpen(false)
        }
    }

    const getDetailById = async (id) => {

        if (!id) return
        setLoadingDetail(true)
        try {
            const res = await fetchMomentById({
                access_token,
                _id: id,
                force: true,
            })

            const detail = res?.data || res || {}

            // reset removeMedia each time open edit
            setRemoveMedia([])

            const computedAspect = detail.aspectRatio ? mapApiToAspectRatio(detail.aspectRatio) : 'aspect-[4/3]'
            console.log('computedAspect:', computedAspect, 'detail.aspectRatio:', detail.aspectRatio);

            if (detail.aspectRatio) {
                setAspectRatio(computedAspect)
            }

            const coverObj = detail.cover || null
            const mediaArray = Array.isArray(detail.media) ? detail.media : []

            const coverUrl = coverObj?.url || ''
            const coverKey = coverObj?.key || ''
            const coverName = getName(coverUrl)

            //  detect if cover is actually coming from a videoCoverUrl
            const matchedVideoIdx = mediaArray.findIndex((m) => {
                if (m?.type !== 'video') return false
                const videoCoverName = getName(m?.videoCoverUrl)
                return !!coverName && !!videoCoverName && coverName === videoCoverName
            })

            //  map server media (store mediaId + caption + mute)
            const mediaFiles = mediaArray.map((m, idx) => {
                const serverId = m._id || `${idx}`
                const isPhoto = m.type === 'photo'

                return {
                    uid: serverId,
                    name: m.key || `media-${idx}`,
                    status: 'done',
                    url: m.url,
                    originalUrl: m.url,
                    type: isPhoto ? 'image/*' : 'video/mp4',

                    // will set by order later
                    isCover: false,

                    // For videos
                    coverUrl: m.videoCoverUrl || null,
                    coverImage: null, // if user picks new one in UI
                    isMuted: !!m.mute,

                    // caption from API
                    caption: m.caption || '',

                    // ids/flags
                    fromServer: true,
                    mediaId: serverId,

                    // cover object tile flags
                    fromCover: false,
                    coverKey: null,
                }
            })

            //  create COVER tile ONLY when cover is NOT same as any videoCoverUrl
            const shouldCreateCoverTile = !!coverUrl && !!coverKey && matchedVideoIdx === -1

            const coverFile = shouldCreateCoverTile
                ? {
                    uid: `cover-${detail._id || id}`,
                    name: coverKey,
                    status: 'done',
                    url: coverUrl,
                    originalUrl: coverUrl,
                    type: 'image/*',

                    // cover tile (NOT a media item)
                    fromCover: true,
                    fromServer: false,
                    coverKey,

                    // keep shape used by UI
                    isCover: true,
                    coverUrl,
                    coverImage: null,
                    isMuted: false,
                    caption: '',
                    mediaId: null,
                }
                : null

            //  Final list:
            // A) If cover is from videoCoverUrl => move THAT VIDEO first, and DO NOT add cover tile
            // B) Else keep: cover tile first + media list
            let initialFiles = []

            if (!shouldCreateCoverTile && matchedVideoIdx > -1) {
                const targetVideo = mediaFiles[matchedVideoIdx]
                const rest = mediaFiles.filter((_, i) => i !== matchedVideoIdx)
                initialFiles = [targetVideo, ...rest]
            } else {
                if (coverFile) initialFiles.push(coverFile)
                initialFiles = [...initialFiles, ...mediaFiles]
            }

            //  ensure isCover by order (UI)
            if (initialFiles.length > 0) {
                initialFiles = initialFiles.map((f, i) => ({ ...f, isCover: i === 0 }))
            }

            setFileList(
                initialFiles.map((f, index) => ({
                    ...f,
                    key: `${f.uid}-${index}`,
                }))
            )

            const firstVideo = mediaArray.find((m) => m.type === 'video')
            if (firstVideo?.url) {
                setVideoUrl(firstVideo.url)
                setCoverVideo(firstVideo.videoCoverUrl || null)
            } else {
                setVideoUrl(null)
                setCoverVideo(null)
            }

            // --- Hashtags ---
            let hashtagsValue = []
            if (Array.isArray(detail.hashtags)) {
                hashtagsValue = detail.hashtags
            } else if (typeof detail.hashtags === 'string') {
                hashtagsValue = detail.hashtags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
            }


            // --- Places ---
            setHastags(hashtagsValue)

            const rawPlaces = Array.isArray(detail.places) ? detail.places : []
            const normalizedPlaces = rawPlaces.map((p) => ({
                _id: p.id || p._id || p.placeId,
                id: p.id || p._id || p.placeId,
                name: p.nameEn || p.nameKh || '',
                nameEn: p.nameEn,
                nameKh: p.nameKh,
                image: p.image,
            }))
            setLocations(normalizedPlaces)

            form.setFieldsValue({
                title: detail.title || '',
                description: detail.description,
                status: detail.status || 'Active',
                hashtags: hashtagsValue,
                places: normalizedPlaces,
            })

            //  ADD ONLY: set initial snapshot after loading
            initialSnapshotRef.current = {
                aspectRatio: computedAspect,
                title: detail.title || '',
                description: detail.description,
                status: detail.status || 'Active',
                hashtags: hashtagsValue || [],
                placeIds: (normalizedPlaces || [])
                    .map((p) => String(p?._id || p?.id || ''))
                    .filter(Boolean),
                fileSig: (initialFiles || []).map((f, idx) => ({
                    key: f?.fromCover ? `C:${f?.coverKey || f?.uid || ''}` : `M:${f?.mediaId || f?.uid || ''}`,
                    isCover: idx === 0,
                    caption: (typeof f?.caption === 'string' ? f.caption : ''),
                    isMuted: !!f?.isMuted,

                    //  ignore originFileObj for server items
                    hasOrigin: !f?.fromServer && !!f?.originFileObj && !f?.fromCover,

                    hasCoverImage: f?.coverImage instanceof File,
                })),
            }
        } catch (err) {
            console.log('Error fetching detail', err)
            message.error('Failed to load moment detail')
        }
        finally {

            setLoadingDetail(false)

        }
    }
    useEffect(() => {
        if (!open) return
        form.setFieldsValue({
            hashtags: hastags,
        })
    }, [hastags, open, form])

    useEffect(() => {
        //  ADD ONLY: reset snapshot when open/new item (avoid old snapshot causing Swal)
        if (open) {
            initialSnapshotRef.current = null
        }

        if (open && propsData?._id) {
            getDetailById(propsData._id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, propsData?._id])

    /**
     *  Build addMedia/addVideoCovers/addMediaMeta (Swagger screenshot)
     * - addMedia: repeat key for each new file
     * - addVideoCovers: repeat key for each NEW video (in the same order of NEW videos)
     * - data.addMediaMeta: meta array (same order as new uploads)
     */
    const buildAddMediaPayload = (orderedFiles = []) => {
        // NEW uploads only (ignore special cover tile)
        const newUploads = orderedFiles.filter((f) => !!f?.originFileObj && !f?.fromCover)

        const addMediaFiles = newUploads.map((f) => f.originFileObj)

        const addMediaMeta = newUploads.map((f) => {
            const type = isVideoFile(f) ? 'video' : 'photo'
            const caption = (typeof f?.caption === 'string' ? f.caption : '').trim()

            const meta = {
                type,
                ...(caption ? { caption } : {}),
                ...(type === 'video' ? { mute: !!f?.isMuted } : {}),
                // IMPORTANT: allow setting cover for NEW uploads too
                isCover: !!f?.isCover,
            }
            return meta
        })

        // Covers for NEW videos only (same order as NEW videos)
        const newVideos = newUploads.filter((f) => isVideoFile(f))
        const addVideoCoverFiles = newVideos.map((v) => (v?.coverImage instanceof File ? v.coverImage : null))

        return {
            hasNewUploads: newUploads.length > 0,
            addMediaFiles,
            addVideoCoverFiles,
            addMediaMeta,
        }
    }

    /**
     *  Build updateMedia (Swagger screenshot)
     * updateMedia: [{ mediaId, caption?, isCover?, mute? }]
     */
    const buildUpdateMediaPayload = (orderedFiles = [], coverIsSpecialTile = false) => {
        const updateMedia = []

        orderedFiles.forEach((f) => {
            if (!f?.fromServer || !f?.mediaId) return

            const item = {
                mediaId: String(f.mediaId),
            }

            const caption = (typeof f?.caption === 'string' ? f.caption : '').trim()
            if (caption) item.caption = caption

            if (isVideoFile(f)) {
                item.mute = !!f?.isMuted
            }

            // only set isCover when cover is NOT the special cover tile
            if (!coverIsSpecialTile) {
                item.isCover = !!f?.isCover
            }

            updateMedia.push(item)
        })

        return updateMedia
    }

    const appendServerReplaceVideoCovers = (formData, orderedFiles = []) => {
        const changed = []

        orderedFiles.forEach((f) => {
            if (!f?.fromServer || !f?.mediaId) return
            if (!isVideoFile(f)) return
            if (!(f?.coverImage instanceof File)) return

            const key = `replaceVideoCover_${String(f.mediaId)}`
            formData.append(key, f.coverImage)
            changed.push(String(f.mediaId))
        })

        return changed // list of mediaIds that had cover replaced
    }

    const handleOk = async () => {
        setBtnLoading(true)
        try {
            const values = await form.validateFields()

            if (!fileList || fileList.length === 0) {
                message.error('Please upload at least 1 image or video.')
                setBtnLoading(false)
                return
            }

            //  always enforce cover by ORDER (index 0)
            const orderedFiles = (fileList || []).map((f, i) => ({ ...f, isCover: i === 0 }))

            const first = orderedFiles[0]
            const coverIsSpecialTile = !!first?.fromCover // cover object tile from API (not a media)

            const hashtags = normalizeHashtags(values.hashtags)
            const placeIds = normalizePlaceIds(values.places || values.location || [])

            // removeMediaIds
            const removeMediaIds = Array.isArray(removeMedia)
                ? removeMedia
                    .map((x) => (typeof x === 'string' ? x : x?.mediaId || x?._id || x?.id))
                    .map((id) => String(id || '').trim())
                    .filter(Boolean)
                : []

            // updateMedia (server)
            const updateMedia = buildUpdateMediaPayload(orderedFiles, coverIsSpecialTile)

            // addMedia (new uploads)
            const { hasNewUploads, addMediaFiles, addVideoCoverFiles, addMediaMeta } = buildAddMediaPayload(orderedFiles)

            //  data payload exactly like swagger/curl examples
            const dataPayload = {
                title: values.title || '',
                description: values.description || '',
                status: values.status || 'Active',
                aspectRatio: mapAspectRatioToApi(aspectRatio),
                hashtags,
                placeIds,
                ...(updateMedia.length > 0 ? { updateMedia } : {}),
                ...(removeMediaIds.length > 0 ? { removeMediaIds } : {}),
                ...(hasNewUploads ? { addMediaMeta } : {}),
            }

            const formData = new FormData()
            formData.append('data', JSON.stringify(dataPayload))

            //  addMedia/addVideoCovers like swagger (repeat keys)
            if (hasNewUploads) {
                addMediaFiles.forEach((f) => formData.append('addMedia', f))
                const newVideoCount = addVideoCoverFiles.length
                if (newVideoCount > 0) {
                    addVideoCoverFiles.forEach((c) => {
                        if (c instanceof File) formData.append('addVideoCovers', c)
                        else formData.append('addVideoCovers', '')
                    })
                } else {

                }
            }


            const changedCoverMediaIds = appendServerReplaceVideoCovers(formData, orderedFiles)

            // If swagger requires data.updateMedia for that endpoint, we already send data with updateMedia.
            // Ensure those mediaIds exist inside updateMedia if user only changed cover image:
            if (changedCoverMediaIds.length > 0 && (!dataPayload.updateMedia || dataPayload.updateMedia.length === 0)) {
                formData.set(
                    'data',
                    JSON.stringify({
                        ...dataPayload,
                        updateMedia: changedCoverMediaIds.map((id) => ({ mediaId: id })),
                    })
                )
            }

            // debug
            // console.log('dataPayload:', dataPayload)
            // console.log('FormData debug:')
            for (const [k, v] of formData.entries()) {
                if (v instanceof File) console.log(k, { name: v.name, size: v.size, type: v.type })
                else console.log(k, v)
            }


            const res = await UpdateMoment({
                access_token,
                doc: formData,
                id: propsData?._id,
            })

            if (res) {
                Swal.fire({
                    icon: 'success',
                    title: 'Post Updated!',
                    text: 'Your post has been successfully updated.',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    willClose: () => {
                        try {
                            form.resetFields()
                        } catch { }
                        setFileList([])
                        setRemoveMedia([])
                        setOpen(false)
                        setBtnLoading(false)
                        fetchMomentPosts?.()
                    },
                })
            } else {
                setBtnLoading(false)
            }
        } catch (err) {
            console.error('Error preparing/editing Moment form:', err)
            message.error('Failed to update moment')
            setBtnLoading(false)
        }
    }

    const handleCancel = () => {
        confirmBeforeClose()
    }


    return (
        <Modal
            title={mentionTitle || 'Edit Post'}
            width={1000}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={mentionTitle || 'Save Changes'}
            confirmLoading={btnLoading}
            cancelButtonProps={{ disabled: btnLoading }}
            maskClosable={false}
            closable={!btnLoading}
        >
            {/* CONNECT FORM INSTANCE  */}
            <Form form={form} component={false}>
                <div className="mb-5">
                    {!loadingDetail && (
                        <Photo
                            aspectRatio={aspectRatio}
                            setAspectRatio={setAspectRatio}
                            form={form}
                            fileList={fileList}
                            setFileList={setFileList}
                            removeMedia={removeMedia}
                            setRemoveMedia={setRemoveMedia}
                            videoUrl={videoUrl}
                            coverVideo={coverVideo}
                            isMoment="post"
                            disableMention={disableMention}
                        />
                    )}

                </div>

                <TextForm
                    aspectRatio={aspectRatio}
                    disableMention={disableMention}
                    setAspectRatio={setAspectRatio}
                    form={form}
                    hastags={hastags}
                    setLocations={setLocations}
                    locations={locations}
                    isMoment="post"
                    placeholderText="Write your description... use #hashtags"
                />
            </Form>
        </Modal>
    )
}

export default EditPost
