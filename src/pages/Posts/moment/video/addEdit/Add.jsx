import React, { useState, useContext } from 'react'
import { Modal, Steps, Button, Form, message } from 'antd'
import Photo from './Photo'
import TextForm from '../../../../../components/post/moment/form/TextForm'
import { AuthContext } from '../../../../../contexts/AuthContext'
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
    if (!input) return []
    if (!Array.isArray(input)) return []

    return input
        .map((p) => p?._id || p?.id || p?.value || p)
        .map((id) => String(id).trim())
        .filter(Boolean)
}

const AddPost = ({ open, setOpen, fetchMomentVideos, username }) => {
    const { access_token } = useContext(AuthContext)

    const [form] = Form.useForm()
    const [currentStep, setCurrentStep] = useState(0)
    const [btnLoading, setBtnLoading] = useState(false)
    const [videoUrl, setVideoUrl] = useState(null)
    const [locations, setLocations] = useState([])
    const { CreateMoment, loading } = useMomentStore()
    const steps = [
        {
            title: 'Photo',
            content: (
                <Photo
                    form={form}
                    videoUrl={videoUrl}
                    setVideoUrl={setVideoUrl}
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
                    placeholderText="Write your caption... use #hashtags"
                />
            ),
            form,
        },
    ]

    const next = async () => {
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
        setLocations([])
    }

    const handleSubmit = async () => {
        setBtnLoading(true)
        try {
            await form.validateFields()
            const values = form.getFieldsValue(true)

            //  Extract files
            const mediaFile = pickFile(values.video)
            const coverFile = pickFile(values.cover)

            //  Mute (true = no sound, false = sound)
            const mute =
                typeof values.isMuted === 'boolean'
                    ? values.isMuted
                    : String(values.isMuted || 'false').toLowerCase() === 'true'

            //  Normalize hashtags + places
            const hashtags = normalizeHashtags(values.hashtags)
            const placeIds = normalizePlaceIds(values.location)
            const payload = {
                type: 'VideoPost',
                description: values.description || values.caption || '',
                createdBy: username, // keep your concept (safe if backend ignores)
                placeIds,
                hashtags,
                media: [
                    {
                        type: 'video',
                        mute,
                    },
                ],
            }

            const formData = new FormData()

            //  required by swagger sometimes
            if (mediaFile) formData.append('media', mediaFile)
            else formData.append('media', '') // keep required

            if (coverFile) formData.append('videoCovers', coverFile)
            else formData.append('videoCovers', '') // keep required (if swagger says required)

            formData.append('data', JSON.stringify(payload))

            // //  Debug
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

            //  Call API (must use CreateMomentVideo)
            const res = await CreateMoment({
                access_token,
                data: formData,
            })

            if (res) {
                Swal.fire({
                    icon: 'success',
                    title: 'Video Created!',
                    text: 'Your video has been successfully added.',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    willClose: () => {
                        handleCancel()
                        fetchMomentVideos?.()
                    },
                })
            } else {
                setBtnLoading(false)
            }
        } catch (err) {
            console.error('Submit failed:', err)
            if (!err?.errorFields) {
                message.error('Failed to save post')
            }
        } finally {
            setBtnLoading(false)
        }
    }

    const resetAll = () => {
        setCurrentStep(0)
        try { form.resetFields() } catch { }
        setVideoUrl(null)
        setLocations([])
    }
    //  ADD ONLY: if nothing changed, close modal directly (NO Swal)
    const hasUnsavedChanges = () => {
        const touched = form?.isFieldsTouched?.(true)

        const values = form.getFieldsValue(true) || {}
        const mediaFile = pickFile(values.video)
        const coverFile = pickFile(values.cover)

        const hasText =
            !!(values.description && String(values.description).trim()) ||
            !!(values.caption && String(values.caption).trim())

        const hasHashtags =
            (Array.isArray(values.hashtags) && values.hashtags.length > 0) ||
            (typeof values.hashtags === 'string' && values.hashtags.trim().length > 0)

        const hasPlaces =
            (Array.isArray(values.location) && values.location.length > 0) ||
            (Array.isArray(values.places) && values.places.length > 0)

        const hasUploads = !!mediaFile || !!coverFile || !!videoUrl

        const hasExtraState = Array.isArray(locations) && locations.length > 0

        return !!(touched || hasText || hasHashtags || hasPlaces || hasUploads || hasExtraState)
    }
    const confirmBeforeClose = async () => {
        if (btnLoading) return
        //  NEW: if no input yet, just close
        if (!hasUnsavedChanges()) {
            setOpen(false)
            resetAll()
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
            resetAll()
        }
    }

    return (
        <Modal
            title="Add Video"
            width={900}
            open={open}
            onCancel={confirmBeforeClose}
            footer={null}
            maskClosable={false}
            closable={!btnLoading}
            destroyOnHidden
            keyboard={false}
        >
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
                    {currentStep > 0 && (
                        <Button style={{ marginRight: 8 }} onClick={prev} disabled={btnLoading}>
                            Previous
                        </Button>
                    )}

                    {currentStep < steps.length - 1 && (
                        <Button type="primary" loading={btnLoading} onClick={next}>
                            Next
                        </Button>
                    )}

                    {currentStep === steps.length - 1 && (
                        <Button type="primary" loading={btnLoading} onClick={handleSubmit}>
                            Save Change
                        </Button>
                    )}
                </div>
            </Form>
        </Modal>
    )
}
export default AddPost
