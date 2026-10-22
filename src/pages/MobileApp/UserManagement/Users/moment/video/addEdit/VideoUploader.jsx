import React, { useState, useEffect, useRef } from 'react'
import { Form } from 'antd'

const VideoUploader = ({
    onVideoSelect,
    videoRef,
    form,
    videoUrl,
    setVideoUrl,
    setGeneratedCovers,
    setCoverImageUrl,
}) => {
    const [videoFile, setVideoFile] = useState(null)
    const [isMuted, setIsMuted] = useState(false)
    const [status, setStatus] = useState('')
    const fileInputRef = useRef(null)

    // Restore video + mute state from form when coming back to this step
    useEffect(() => {
        if (!form) return
        const values = form.getFieldsValue(true)
        console.log(values, 'restored from form in VideoUploader')

        // restore video file from form (must be File, not fakepath string)
        if (!videoFile && values.video instanceof File) {
            setVideoFile(values.video)

            // also restore preview URL if needed
            if (!videoUrl && setVideoUrl) {
                const url = URL.createObjectURL(values.video)
                setVideoUrl(url)
            }
        }

        // restore isMuted: treat true/"true" as true, anything else as false
        if (values.isMuted !== undefined) {
            const muted =
                values.isMuted === true || values.isMuted === 'true' ? true : false
            setIsMuted(muted)
        } else {
            // ✅ default should be SOUND (mute:false) unless API sets it otherwise
            form.setFieldsValue({ isMuted: 'false' })
            setIsMuted(false)
        }
    }, [form, videoFile, videoUrl, setVideoUrl])

    // keep HTML video element in sync
    useEffect(() => {
        if (videoRef.current) videoRef.current.muted = isMuted
    }, [isMuted, videoUrl, videoRef])

    const handleFileChange = (event) => {
        const file = event.target.files[0]

        if (!file) return
        if (!file.type.startsWith('video/')) {
            alert('Please upload a valid video file.')
            return
        }

        // ✅ NEW: user uploaded a NEW video (even in edit mode)
        // reset old cover + covers list so new video can generate new covers
        setGeneratedCovers && setGeneratedCovers([])
        setCoverImageUrl && setCoverImageUrl(null)

        form?.setFieldsValue({
            // clear old cover selection when new video chosen
            cover: undefined,
            coverUrl: '',
            generatedCovers: [],
        })

        // Status shows only filename
        setStatus(`Selected: ${file.name}`)

        // Use original File directly (no compression)
        const url = URL.createObjectURL(file)
        setVideoFile(file)
        setVideoUrl(url)
        onVideoSelect(file, url, isMuted)

        // store the actual File object in form (no C:\fakepath)
        form?.setFieldsValue({
            video: file,
            isMuted: isMuted ? 'true' : 'false',
        })

        // clear the input value so selecting the same file again works
        event.target.value = ''
    }

    const handleMuteToggle = () => {
        setIsMuted((prev) => {
            const newState = !prev

            if (videoFile) {
                onVideoSelect(videoFile, videoUrl, newState)
            }

            form?.setFieldsValue({ isMuted: newState ? 'true' : 'false' })
            return newState
        })
    }

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    return (
        <>
            <Form.Item
                name="video"
                className="w-full"
            >
                <div className="relative w-full border rounded-md p-4">
                    {!videoUrl ? (
                        <div className="flex flex-col items-center justify-center h-full w-full p-4">
                            <button
                                onClick={handleUploadClick}
                                className="flex flex-col items-center justify-center p-4 text-gray-500 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105"
                                title="Upload Video"
                                type="button"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                    />
                                </svg>
                                <span className="text-lg font-medium">Upload Video</span>
                                <span className="text-sm text-gray-500 mt-1">
                                    or drag and drop here
                                </span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                controls
                                src={videoUrl}
                                className="w-full h-full object-contain rounded-md"
                                onLoadedMetadata={() => {
                                    if (videoRef.current) {
                                        videoRef.current.muted = isMuted
                                    }
                                }}
                            />

                            <button
                                onClick={handleMuteToggle}
                                className="absolute top-12 left-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg z-10"
                                // ✅ mute=true => NO SOUND, mute=false => SOUND
                                title={isMuted ? 'Muted (no sound)' : 'Sound On'}
                                type="button"
                            >
                                {isMuted ? 'Muted' : 'Unmuted'}
                            </button>

                            <button
                                onClick={handleUploadClick}
                                className="absolute top-12 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg z-10"
                                title="Upload New Video"
                                type="button"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                    />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </Form.Item>

            <input
                type="file"
                accept="video/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <Form.Item name="isMuted" hidden initialValue="false">
                <input type="hidden" />
            </Form.Item>
        </>
    )
}

export default VideoUploader
