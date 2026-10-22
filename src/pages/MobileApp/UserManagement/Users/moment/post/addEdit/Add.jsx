import React, { useState, useContext } from 'react'
import { Modal, Form, message } from 'antd'
import Photo from './Photo'
import TextForm from '../../../../../components/post/moment/form/TextForm'
import { AuthContext } from '../../../../../contexts/AuthContext'
import { useMomentStore } from '../../../../../Stores/Post/Moment.store'
import Swal from 'sweetalert2'
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
const AddPost = ({ open, setOpen, fetchMomentPosts, username }) => {
    const [form] = Form.useForm()
    const [aspectRatio, setAspectRatio] = useState('aspect-[4/3]')
    const [fileList, setFileList] = useState([])
    const { access_token } = useContext(AuthContext)
    const [locations, setLocations] = useState([])
    const [btnLoading, setBtnLoading] = useState(false)

    const { CreateMoment, loading } = useMomentStore()
    const resetAll = () => {
        form.resetFields()
        setFileList([])
        setLocations([])
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

            // places from form OR locations state fallback
            const placeSource = values.location || values.location || locations || []
            console.log(values, '456789 placeID');

            const placeIds = (placeSource || []).map((p) => p?._id || p?.id || p)

            // hashtags from form
            const hashtags = Array.isArray(values.hashtags) ? values.hashtags : []

            const formData = new FormData()

            const mediaMeta = []
            const videoCoverFiles = []

            for (let i = 0; i < fileList.length; i++) {
                const f = fileList[i]
                const isCover = i === 0

                const isImage = f?.type?.startsWith('image/')
                const isVideo = f?.type?.startsWith('video/')

                if (!isImage && !isVideo) {
                    message.error('Unsupported file type found.')
                    setBtnLoading(false)
                    return
                }

                if (!f?.originFileObj) {
                    message.error('One of the selected files is missing (originFileObj). Please re-upload.')
                    setBtnLoading(false)
                    return
                }

                formData.append('media', f.originFileObj)

                if (isImage) {
                    mediaMeta.push({
                        type: 'photo',
                        ...(isCover ? { isCover: true } : {}),
                    })
                }

                if (isVideo) {
                    if (!f?.coverImage) {
                        message.error(
                            isCover
                                ? 'Please select a cover image for the first video (cover post).'
                                : 'Please select a cover image for each video.'
                        )
                        setBtnLoading(false)
                        return
                    }

                    videoCoverFiles.push(f.coverImage)
                    mediaMeta.push({
                        type: 'video',
                        mute: !!f?.isMuted,
                        ...(isCover ? { isCover: true } : {}),
                    })
                }
            }

            videoCoverFiles.forEach((coverFile) => {
                formData.append('videoCovers', coverFile)
            })
            const dataPayload = {
                type: 'PhotoPost',
                title: values.title || '',
                aspectRatio: mapAspectRatioToApi(aspectRatio),
                placeIds,
                hashtags,
                media: mediaMeta,
                createdBy: username,
                //  description includes hashtags exactly as typed
                description: values.description || '',
                status: values.status || '',
            }
            console.log(dataPayload, mapAspectRatioToApi(aspectRatio), 'dataPayload');

            formData.append('data', JSON.stringify(dataPayload))

            const res = await CreateMoment({
                access_token,
                data: formData,
            })

            if (res) {
                Swal.fire({
                    icon: 'success',
                    title: 'Post Created!',
                    text: 'Your post has been successfully added.',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    willClose: () => {
                        resetAll()
                        setOpen(false)
                        setBtnLoading(false)
                        fetchMomentPosts?.()
                    },
                })
            } else {
                setBtnLoading(false)
            }
        } catch (err) {
            console.error('Error preparing Moment form:', err)
            setBtnLoading(false)
            message.error(err?.message || 'Create post failed.')
        }
    }

    const handleCancel = () => {
        if (btnLoading) return
        resetAll()
        setOpen(false)
    }

    return (
        <Modal
            title="Add Post"
            width={1000}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Save Change"
            confirmLoading={btnLoading}
            cancelButtonProps={{ disabled: btnLoading }}
            maskClosable={false}
            closable={!btnLoading}
        >
            <Form form={form} component={false}>
                <div className="mb-5">
                    <Photo
                        aspectRatio={aspectRatio}
                        setAspectRatio={setAspectRatio}
                        form={form}
                        fileList={fileList}
                        setFileList={setFileList}

                    />
                </div>

                <TextForm
                    form={form}
                    locations={locations}
                    setLocations={setLocations}
                    isMoment="post"
                    placeholderText="Write your description... use #hashtags"
                />
            </Form>
        </Modal>
    )
}

export default AddPost
