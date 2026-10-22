import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Modal, Button, Upload, message } from 'antd'
import { ReloadOutlined, CheckCircleFilled } from '@ant-design/icons'

// file -> base64
const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
    })

// base64 -> File
const dataURLtoFile = async (input, filename, fallbackType = 'image/png') => {
    //  already File
    if (input instanceof File) return input

    //  dataURL -> File
    if (typeof input === 'string' && input.startsWith('data:')) {
        const [meta, base64] = input.split(',')
        if (!base64) throw new Error('Invalid data URL (missing base64 part)')

        const mimeMatch = meta.match(/data:(.*?);base64/)
        const mimeType = mimeMatch?.[1] || fallbackType

        const bstr = atob(base64)
        const u8arr = new Uint8Array(bstr.length)
        for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i)

        return new File([u8arr], filename, { type: mimeType, lastModified: Date.now() })
    }

    //  DO NOT fetch remote URLs (CORS). Let backend handle it.
    if (typeof input === 'string' && input.startsWith('http')) {
        return null // means: "remote url"
    }

    // blob: can be fetched (same-origin usually)
    if (typeof input === 'string' && input.startsWith('blob:')) {
        const res = await fetch(input)
        const blob = await res.blob()
        return new File([blob], filename, { type: blob.type || fallbackType, lastModified: Date.now() })
    }

    throw new Error('Unsupported cover format')
}

const VideoCoverUploader = ({
    videoCoverModal,
    setVideoCoverModal,
    onUploadVideoCover,
    aspectRatio,
    aspectStyle,
    file,
    onToggleMute, //  IMPORTANT: receive from Photo -> toggles the SAME state
}) => {
    const open = !!videoCoverModal?.open
    const videoFile = videoCoverModal?.videoFile
    const uid = videoFile?.uid

    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const fileInputRef = useRef(null)

    const [videoUrl, setVideoUrl] = useState(null)
    const [generatedCovers, setGeneratedCovers] = useState([]) // base64[]
    const [coverImageUrl, setCoverImageUrl] = useState(null) // selected base64
    const [generating, setGenerating] = useState(false)

    //  DEFAULT ALL VIDEOS MUTED (if isMuted missing => true)
    const [localMuted, setLocalMuted] = useState(videoFile?.isMuted ?? true)


    const boxStyle = useMemo(() => {
        return aspectStyle?.[aspectRatio] || { width: '100%', height: 360 }
    }, [aspectStyle, aspectRatio])

    const close = useCallback(() => {
        setVideoCoverModal?.({ open: false, videoFile: null })
    }, [setVideoCoverModal])

    // setup when modal opens
    useEffect(() => {
        if (!open || !videoFile) {
            setVideoUrl(null)
            setGeneratedCovers([])
            setCoverImageUrl(null)
            setGenerating(false)
            return
        }

        //  sync (default muted)
        setLocalMuted(videoFile?.isMuted ?? true)

        // keep existing cover if any
        const existing = videoFile?.coverUrl || null
        setCoverImageUrl(existing)

        const origin = videoFile?.originFileObj
        if (origin) {
            const obj = URL.createObjectURL(origin)
            setVideoUrl(obj)
            return () => URL.revokeObjectURL(obj)
        }

        setVideoUrl(videoFile?.url || null)
    }, [open, videoFile])

    //  if parent toggles while modal open, sync it (default muted)
    useEffect(() => {
        if (!open) return
        setLocalMuted(videoFile?.isMuted ?? true)
    }, [open, videoFile?.isMuted])

    // generate frames
    const generateFrames = useCallback(async () => {
        if (!videoUrl) return
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        setGenerating(true)

        try {
            video.src = videoUrl
            video.muted = true //  internal capture only (doesn't change state)
            video.playsInline = true
            video.preload = 'auto'
            video.load()

            await new Promise((resolve, reject) => {
                const onLoaded = () => resolve()
                const onErr = () => reject(new Error('Video load error'))
                video.addEventListener('loadedmetadata', onLoaded, { once: true })
                video.addEventListener('error', onErr, { once: true })
            })

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const duration = video.duration || 0
            const times = [0.1, 0.3, 0.5, 0.7, 0.9].map((t) =>
                Math.max(0, Math.min(duration * t, Math.max(0, duration - 0.05)))
            )

            const frames = []

            const captureAt = (time) =>
                new Promise((resolve) => {
                    const onSeeked = () => {
                        try {
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                            const b64 = canvas.toDataURL('image/jpeg')
                            frames.push(b64)
                        } catch { }
                        resolve()
                    }
                    video.addEventListener('seeked', onSeeked, { once: true })
                    video.currentTime = time
                })

            for (const t of times) {
                // eslint-disable-next-line no-await-in-loop
                await captureAt(t)
            }

            const merged = frames.filter(Boolean)
            setGeneratedCovers(merged)

            if (!coverImageUrl && merged.length > 0) setCoverImageUrl(merged[0])

            try {
                video.currentTime = 0
            } catch { }
        } catch (e) {
            console.error(e)
            message.error('Failed to generate thumbnails')
        } finally {
            setGenerating(false)
        }
    }, [videoUrl, coverImageUrl])

    useEffect(() => {
        if (!open || !videoUrl || !uid) return
        if (!videoFile?.coverUrl) generateFrames()
        else if (generatedCovers.length === 0) generateFrames()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, videoUrl, uid])

    const selectGeneratedCover = useCallback((imageUrl) => {
        setCoverImageUrl(imageUrl)
    }, [])

    const handleCustomUpload = useCallback(async (uploadFile) => {
        try {
            const b64 = await getBase64(uploadFile)
            setCoverImageUrl(b64)
        } catch (e) {
            console.error(e)
            message.error('Upload failed')
        }
        return false
    }, [])

    const handleDirectImageChange = useCallback(async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return

        if (!file.type.startsWith('image/')) {
            message.error('Please upload a valid image file')
            return
        }

        const b64 = await getBase64(file)
        setCoverImageUrl(b64)
    }, [])

    const handleDone = useCallback(async () => {
        if (!coverImageUrl || !uid) {
            message.error('Please select a cover first')
            return
        }

        try {
            //  if cover is from server (https...), don't fetch it. pass remote url.
            if (typeof coverImageUrl === 'string' && coverImageUrl.startsWith('http')) {
                onUploadVideoCover?.(uid, {
                    file: null,
                    fileUrl: coverImageUrl,
                    remoteUrl: coverImageUrl,
                })
                close()
                return
            }

            //  dataURL/blob/File -> make File
            const fileObj = await dataURLtoFile(
                coverImageUrl,
                `video_cover_${uid}_${Date.now()}.png`,
                'image/png'
            )

            onUploadVideoCover?.(uid, { file: fileObj, fileUrl: coverImageUrl })
            close()
        } catch (e) {
            console.error(e)
            message.error('Failed to create cover file')
        }
    }, [coverImageUrl, uid, onUploadVideoCover, close])

    //  toggle (mute=no sound, unmute=sound)
    const toggleMute = useCallback(() => {
        if (!uid) return
        setLocalMuted((prev) => !prev)
        onToggleMute?.(uid)
    }, [uid, onToggleMute])

    return (
        <Modal open={open} onCancel={close} footer={null} centered width={900} destroyOnHidden title={null}>
            <div className="flex flex-col gap-4">
                {/* HIDDEN INPUT */}
                <input
                    hidden
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleDirectImageChange}
                    className="hidden"
                />

                {/* antd Upload hidden */}
                <Upload showUploadList={false} beforeUpload={handleCustomUpload} accept="image/*">
                    <span style={{ display: 'none' }} />
                </Upload>
                <div className='rounded-xl border border-gray-200 bg-white p-3 flex flex-row gap-4 items-start '>

                    <div className='w-[60%] p-3 flex flex-row gap-4 items-start'>

                        <div className="relative w-full  rounded-xl overflow-hidden bg-black" style={boxStyle}>
                            <video
                                src={videoUrl}
                                ref={videoRef}
                                controls
                                crossOrigin="anonymous"
                                muted={!!localMuted}
                                className="absolute inset-0 w-full h-full object-contain"
                                playsInline
                                preload="metadata"
                                poster={coverImageUrl || videoFile?.coverUrl}
                            />
                            <button
                                type="button"
                                onClick={toggleMute}
                                className="absolute top-3 left-3 px-4 py-2 rounded-full bg-black/75 text-white text-sm shadow"
                            >
                                {localMuted ? 'Unmute' : 'Mute'}
                            </button>
                        </div>



                        <div
                            className="relative w-[220px] aspect-[3/4] rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center cursor-pointer shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                            title="Click to upload cover"
                        >
                            {coverImageUrl ? (
                                <img src={coverImageUrl} alt="selected-cover" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-gray-400 text-center px-4">Click to upload cover image</div>
                            )}

                            <div className="absolute inset-0 pointer-events-none flex items-end justify-center p-2">
                                <div className="px-3 py-1 rounded-full bg-black/40 text-white text-xs">Click cover to upload</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  THUMBNAILS BELOW EVERYTHING */}
                <div className="rounded-2xl border border-gray-200 bg-white p-3">
                    <div className="text-sm text-gray-600 mb-2">Generated thumbnails </div>

                    {generating && <div className="text-center text-gray-500 py-6">Generating thumbnails...</div>}

                    {!generating && generatedCovers.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto py-2">
                            {generatedCovers.slice(0, 10).map((thumb, idx) => {
                                const active = coverImageUrl === thumb
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => selectGeneratedCover(thumb)}
                                        className={`relative shrink-0 w-28 h-16 rounded-xl overflow-hidden cursor-pointer border ${active ? 'border-blue-500' : 'border-gray-200'
                                            }`}
                                    >
                                        <img src={thumb} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                        {active && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-blue-500/25">
                                                <CheckCircleFilled className="text-white text-2xl" />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {!generating && generatedCovers.length === 0 && (
                        <div className="text-center text-gray-500 py-6">No thumbnails generated.</div>
                    )}
                </div>

                {/*  ACTIONS AT BOTTOM */}
                <div className="flex items-center justify-between">
                    <Button onClick={close}>Cancel</Button>

                    <div className="flex items-center gap-3">
                        <Button type="primary" onClick={handleDone} disabled={!coverImageUrl}>
                            Done
                        </Button>
                    </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />
            </div>
        </Modal >
    )
}

export default VideoCoverUploader
