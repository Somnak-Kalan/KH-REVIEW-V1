import React, { useState, useContext, useEffect } from 'react'
import { Modal, Steps, Button, Form, message } from 'antd'
import Photo from './Photo'
import TextForm from '../../../../../components/post/moment/form/TextForm'
import { AuthContext } from '../../../../../contexts/AuthContext'
import MomentVideoService from '../../../../../services/post/moments/Moments'
import { useMomentStore } from '../../../../../Stores/Post/Moment.store'
import Swal from 'sweetalert2'
const { Step } = Steps

//  safely extract File from many antd/Upload shapes
const pickFile = (v) => {
    if (!v) return null
    if (v instanceof File) return v

    // antd Upload file object
    if (v?.originFileObj instanceof File) return v.originFileObj

    // antd Upload "fileList" or array value
    if (Array.isArray(v)) {
        const first = v[0]
        if (first instanceof File) return first
        if (first?.originFileObj instanceof File) return first.originFileObj
    }

    // antd Form may store { file, fileList }
    if (v?.file?.originFileObj instanceof File) return v.file.originFileObj
    if (Array.isArray(v?.fileList) && v.fileList[0]?.originFileObj instanceof File) {
        return v.fileList[0].originFileObj
    }

    return null
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

const EditVideo = ({ open, setOpen, propsData, fetchMomentVideos, username, disableMention = false, lastTabMention = "Photo", mentionTitle = '' }) => {
    const { access_token } = useContext(AuthContext)
    const [form] = Form.useForm()

    //  ADD ONLY: keep initial snapshot for "no changes => close directly"
    const initialSnapshotRef = React.useRef(null)

    const [currentStep, setCurrentStep] = useState(0)
    const [btnLoading, setBtnLoading] = useState(false)

    const [videoUrl, setVideoUrl] = useState(null)
    const [coverVideo, setCoverVideo] = useState(null)
    const [locations, setLocations] = useState([])
    const { UpdateMoment, fetchMomentById } = useMomentStore()
    //  store mediaId for updateMedia[] (mute)
    const [mediaId, setMediaId] = useState(null)
    useEffect(() => {
        if (lastTabMention === 'Information' && open) {
            setCurrentStep(1)
            console.log(lastTabMention)
        }
    }, [lastTabMention, open])
    const getDetailById = async (id) => {
        if (!id) return
        try {
            const res = await fetchMomentById({
                access_token,
                _id: id,
                force: true,
            })
            const detail = res?.data || res || {}

            const videoItem = Array.isArray(detail.media)
                ? detail.media.find((m) => m.type === 'video')
                : null

            setMediaId(videoItem?._id || videoItem?.id || null)

            const coverUrlFromApi = detail?.cover?.url || ''
            const videoCoverFromApi = videoItem?.videoCoverUrl || ''

            // options (urls) just for UI display
            const coverOptions = [coverUrlFromApi, videoCoverFromApi]
                .filter(Boolean)
                .filter((v, idx, arr) => arr.indexOf(v) === idx)

            if (videoItem?.url) {
                setVideoUrl(videoItem.url)
                setCoverVideo(coverUrlFromApi || videoCoverFromApi || null)
            } else {
                setVideoUrl(null)
                setCoverVideo(null)
            }

            // hashtags -> array
            let hashtagsValue = []
            if (Array.isArray(detail.hashtags)) {
                hashtagsValue = detail.hashtags
            } else if (typeof detail.hashtags === 'string') {
                hashtagsValue = detail.hashtags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
            }

            // places -> normalized objects for selector UI
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
                //  video post description (your API returns root "description")
                description: detail.description || videoItem?.caption || '',
                status: detail.status || 'Active',
                hashtags: hashtagsValue,

                // your TextForm uses location (keep same)
                location: normalizedPlaces,

                // just for Photo UI
                coverUrl: coverUrlFromApi || videoCoverFromApi || '',
                generatedCovers: coverOptions,

                //  mute from API (mute:true => NO SOUND)
                isMuted: typeof videoItem?.mute === 'boolean' ? videoItem.mute : false,
            })

            //  ADD ONLY: set initial snapshot after data loaded
            initialSnapshotRef.current = {
                description: detail.description || videoItem?.caption || '',
                status: detail.status || 'Active',
                hashtags: hashtagsValue || [],
                locationIds: (normalizedPlaces || []).map((p) => String(p?._id || p?.id || '')).filter(Boolean),
                coverUrl: coverUrlFromApi || videoCoverFromApi || '',
                isMuted: typeof videoItem?.mute === 'boolean' ? videoItem.mute : false,
                videoUrl: videoItem?.url || null,
                coverVideo: (coverUrlFromApi || videoCoverFromApi || null),
                mediaId: (videoItem?._id || videoItem?.id || null),
            }
        } catch (err) {
            console.log('Error fetching detail', err)
            message.error('Failed to load moment detail')
        }
    }

    useEffect(() => {
        if (open && propsData?._id) {
            getDetailById(propsData._id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, propsData?._id])

    const steps = [
        {
            title: 'Photo',
            content: (
                <Photo
                    form={form}
                    videoUrl={videoUrl}
                    setVideoUrl={setVideoUrl}
                    coverVideo={coverVideo}
                />
            ),
            form,
        },
        {
            title: 'Information',
            content: (
                <TextForm
                    form={form}
                    setLocations={setLocations}
                    locations={locations}
                    isMoment="video"
                    disableMention={disableMention}
                    placeholderText="Write your caption... use #hashtags"
                />
            ),
            form,
        },
    ]

    const next = async () => {
        //  editing: if already have videoUrl, skip validation of step 0 file
        if (currentStep === 0 && videoUrl) {
            setCurrentStep((s) => s + 1)
            return
        }

        setBtnLoading(true)
        try {
            await steps[currentStep].form.validateFields()
            setCurrentStep((s) => s + 1)
        } catch (err) {
            message.error('Please complete required fields in this step')
        } finally {
            setBtnLoading(false)
        }
    }

    const prev = () => setCurrentStep((s) => s - 1)

    const handleCancel = () => {
        setOpen(false)
        setCurrentStep(0)
        try {
            form.resetFields()
        } catch { }
        setVideoUrl(null)
        setCoverVideo(null)
        setLocations([])
        setMediaId(null)
    }

    const handleSubmit = async () => {
        setBtnLoading(true)
        try {
            await form.validateFields()
            const values = form.getFieldsValue(true)

            //  files for swagger update endpoint
            const replaceVideoFile = pickFile(values.video) // only if user uploaded new video
            const replaceCoverFile = pickFile(values.cover) // only if user uploaded new cover

            //  normalize fields for data payload
            const hashtags = normalizeHashtags(values.hashtags)
            const placeIds = normalizePlaceIds(values.location || values.places)

            const mute =
                typeof values.isMuted === 'boolean'
                    ? values.isMuted
                    : String(values.isMuted || 'false').toLowerCase() === 'true'

            const desc = values.description || values.caption || ''

            //  Build "data" exactly like your curl examples (ONLY include what exists)
            // Example 1:
            // { description, updateMedia:[{mediaId,mute}] }
            // Example 2:
            // { description, status, hashtags, placeIds, updateMedia:[{mediaId,mute}] }
            const dataPayload = {}

            if (desc) dataPayload.description = desc
            if (values.status) dataPayload.status = values.status
            if (hashtags.length > 0) dataPayload.hashtags = hashtags
            if (placeIds.length > 0) dataPayload.placeIds = placeIds

            if (mediaId) {
                dataPayload.updateMedia = [
                    {
                        mediaId: String(mediaId),
                        mute, // boolean like curl
                    },
                ]
            }

            const formData = new FormData()

            //  optional file fields like curl (only append when user changed)
            if (replaceVideoFile) formData.append('replaceVideo', replaceVideoFile)
            if (replaceCoverFile) formData.append('replaceCover', replaceCoverFile)

            //  required: data="<json string>"
            formData.append('data', JSON.stringify(dataPayload))

            // console.log('FormData debug (edit video):')
            // for (const [key, val] of formData.entries()) {
            //     if (val instanceof File) {
            //         console.log(key, {
            //             name: val.name,
            //             size: val.size,
            //             type: val.type,
            //             lastModified: val.lastModified,
            //         })
            //     } else {
            //         console.log(key, val)
            //     }
            // }

            const res = await UpdateMoment({
                access_token,
                doc: formData,
                id: propsData?._id, //  PUT /core/moment/update/:id
            })

            if (res) {
                Swal.fire({
                    icon: 'success',
                    title: 'Video Updated!',
                    text: 'Your video has been successfully updated.',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    willClose: () => {
                        handleCancel()
                        fetchMomentVideos?.()
                    },
                })
            }
        } catch (err) {
            console.error('Submit failed:', err)
            if (!err?.errorFields) {
                message.error('Failed to update post')
            }
        } finally {
            setBtnLoading(false)
        }
    }

    //  ADD ONLY: check "no change" => close without Swal
    const hasUnsavedChanges = () => {
        const initial = initialSnapshotRef.current

        const eqArr = (a, b) => {
            const aa = Array.isArray(a) ? [...a].map(String).sort() : []
            const bb = Array.isArray(b) ? [...b].map(String).sort() : []
            if (aa.length !== bb.length) return false
            for (let i = 0; i < aa.length; i++) if (aa[i] !== bb[i]) return false
            return true
        }

        const values = form.getFieldsValue(true) || {}

        // new uploads => changed
        const replaceVideoFile = pickFile(values.video)
        const replaceCoverFile = pickFile(values.cover)
        if (replaceVideoFile || replaceCoverFile) return true

        // if no initial yet, fallback to touched
        if (!initial) {
            return !!form?.isFieldsTouched?.(true)
        }

        // touched fields
        if (form?.isFieldsTouched?.(true)) return true

        const desc = values.description || values.caption || ''
        if ((desc || '') !== (initial.description || '')) return true

        const status = values.status || ''
        if ((status || '') !== (initial.status || '')) return true

        const hashtags = normalizeHashtags(values.hashtags)
        if (!eqArr(hashtags, initial.hashtags || [])) return true

        const placeIds = normalizePlaceIds(values.location || values.places)
        if (!eqArr(placeIds, initial.locationIds || [])) return true

        const mute =
            typeof values.isMuted === 'boolean'
                ? values.isMuted
                : String(values.isMuted || 'false').toLowerCase() === 'true'
        if (mute !== !!initial.isMuted) return true

        const coverUrl = values.coverUrl || ''
        if ((coverUrl || '') !== (initial.coverUrl || '')) return true

        // state comparisons (if user changed preview/selection)
        if ((videoUrl || null) !== (initial.videoUrl || null)) return true
        if ((coverVideo || null) !== (initial.coverVideo || null)) return true
        if ((mediaId || null) !== (initial.mediaId || null)) return true

        return false
    }

    const confirmBeforeClose = async () => {
        if (btnLoading) return

        //  NEW: if nothing changed, close modal only (no Swal)
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
            setOpen(false)

        }
    }

    return (
        <Modal
            title={mentionTitle || "Edit Video"}
            width={900}
            open={open}
            onCancel={confirmBeforeClose}
            footer={null}
            maskClosable={false}
            closable={!btnLoading}
        >
            {/*  CONNECT FORM INSTANCE  */}
            <Form form={form} component={false}>
                <Steps current={currentStep} className="mb-6">
                    {steps.map((step) => (
                        <Step key={step.title} title={step.title} />
                    ))}
                </Steps>

                <div style={{ marginTop: 24, minHeight: 200 }}>
                    {steps[currentStep].content}
                </div>

                <div style={{ marginTop: 24 }} className="flex justify-end">

                    {currentStep > 0 && lastTabMention !== 'Information' && (
                        <Button style={{ marginRight: 8 }} onClick={prev} disabled={btnLoading}>
                            Previous
                        </Button>
                    )}
                    {lastTabMention === 'Information' && (
                        <Button style={{ marginRight: 8 }} onClick={() => handleCancel()}>
                            Cancel
                        </Button>
                    )}

                    {currentStep < steps.length - 1 && (
                        <Button type="primary" loading={btnLoading} onClick={next}>
                            Next
                        </Button>
                    )}

                    {currentStep === steps.length - 1 && (
                        <Button type="primary" loading={btnLoading} onClick={handleSubmit}>
                            {mentionTitle || 'Save Change'}
                        </Button>
                    )}
                </div>
            </Form>
        </Modal>
    )
}

export default EditVideo
