
import React, { useRef, useEffect } from 'react'
import { Form, Input } from 'antd'

const CoverImageUploader = ({
    videoUrl,
    onCoverSelect,
    form,
    coverImageUrl,
    setCoverImageUrl,
    generatedCovers,
    setGeneratedCovers,
}) => {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const fileInputRef = useRef(null)

    //  generate frames again when videoUrl changes (upload new video in edit)
    const generatedOnceRef = useRef(false)
    const lastVideoUrlRef = useRef(null)

    //  If edit mode has coverUrl but coverImageUrl state is empty, show it
    useEffect(() => {
        const coverUrlValue = form?.getFieldValue('coverUrl')
        if (!coverImageUrl && coverUrlValue) {
            setCoverImageUrl(coverUrlValue)
        }
    }, [form, coverImageUrl, setCoverImageUrl])

    useEffect(() => {
        if (!videoUrl) return

        //  detect videoUrl change
        const isChanged = lastVideoUrlRef.current !== videoUrl
        if (isChanged) {
            lastVideoUrlRef.current = videoUrl
            generatedOnceRef.current = false
        }

        //  If new video uploaded (usually blob url), reset old covers so new video generates new covers
        const isBlob = typeof videoUrl === 'string' && videoUrl.startsWith('blob:')
        if (isBlob) {
            setGeneratedCovers([])
            form?.setFieldsValue({
                generatedCovers: [],
                cover: undefined,
                coverUrl: '',
            })
            setCoverImageUrl(null)
        }

        if (!generatedOnceRef.current) {
            generateFrames()
            generatedOnceRef.current = true
        }
    }, [videoUrl])

    const dataURLtoFile = (dataurl, filename, mimeType) => {
        const arr = dataurl.split(',')
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], filename, {
            type: mimeType,
            lastModified: Date.now(),
        })
    }

    const handleDirectImageChange = (event) => {
        const file = event.target.files[0]
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file)
            setCoverImageUrl(url)
            onCoverSelect(file)
            form?.setFieldsValue({ cover: file, coverUrl: url })
        } else {
            alert('Please upload a valid image file.')
        }
    }

    const generateFrames = () => {
        if (!videoUrl) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas?.getContext?.('2d')
        if (!video || !canvas || !context) return

        //  CORS only matters for remote video url, blob url will work fine
        video.crossOrigin = 'anonymous'

        video.src = videoUrl
        video.load()

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const duration = video.duration
            const numFrames = 5
            const interval = duration / (numFrames + 1)
            const frames = []

            const captureFrame = (time) => {
                video.currentTime = time
                return new Promise((resolve) => {
                    video.onseeked = () => {
                        try {
                            context.drawImage(video, 0, 0, canvas.width, canvas.height)
                            const imageUrl = canvas.toDataURL('image/jpeg')
                            frames.push(imageUrl)
                        } catch (err) {
                            console.error('Canvas export blocked (CORS):', err)
                            resolve('CORS_BLOCKED')
                            return
                        }
                        resolve()
                    }
                })
            }

            const generateAllFrames = async () => {
                for (let i = 1; i <= numFrames; i++) {
                    const result = await captureFrame(i * interval)
                    if (result === 'CORS_BLOCKED') break
                }

                if (frames.length > 0) {
                    const allFrames = [...generatedCovers, ...frames]
                        .filter(Boolean)
                        .filter((v, idx, arr) => arr.indexOf(v) === idx)

                    setGeneratedCovers(allFrames)
                    form?.setFieldsValue({ generatedCovers: allFrames })

                    //  If coverUrl is empty (new upload), auto-select first generated frame
                    const existingCoverUrl = form?.getFieldValue('coverUrl')
                    if (!existingCoverUrl && allFrames.length > 0) {
                        const firstFile = dataURLtoFile(
                            allFrames[0],
                            `cover_${Date.now()}.png`,
                            'image/png'
                        )
                        setCoverImageUrl(allFrames[0])
                        onCoverSelect(firstFile)
                        form?.setFieldsValue({
                            cover: firstFile,
                            coverUrl: allFrames[0],
                        })
                    }
                }

                video.currentTime = 0
            }
            generateAllFrames()
        }
        video.onerror = (e) => {
            console.error('Error loading video for frame generation:', e)
        }
    }

    const selectGeneratedCover = (imageUrl) => {
        // API URL option => keep coverUrl only (no File required)
        if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
            setCoverImageUrl(imageUrl)
            form?.setFieldsValue({ coverUrl: imageUrl })
            return
        }

        const file = dataURLtoFile(imageUrl, `cover_${Date.now()}.png`, 'image/png')
        setCoverImageUrl(imageUrl)
        onCoverSelect(file)
        form?.setFieldsValue({ cover: file, coverUrl: imageUrl })
    }

    return (
        <div className="w-full">
            <Form.Item
                name="cover"
                rules={[
                    {
                        validator: async () => {
                            const coverFile = form?.getFieldValue('cover')
                            const coverUrlValue = form?.getFieldValue('coverUrl')
                            if (coverFile || coverUrlValue) return
                            throw new Error('Please select or generate a cover image!')
                        },
                    },
                ]}
                style={{ display: 'none' }}
            >
                <Input />
            </Form.Item>

            <Form.Item name="coverUrl" style={{ display: 'none' }}>
                <Input />
            </Form.Item>

            <Form.Item name="generatedCovers" style={{ display: 'none' }}>
                <Input />
            </Form.Item>

            <div
                onClick={() => fileInputRef.current.click()}
                className="relative sm:w-[40%] h-56 border cursor-pointer rounded-md flex items-center justify-center overflow-hidden mb-4"
            >
                {coverImageUrl ? (
                    <img
                        src={coverImageUrl}
                        alt="Cover"
                        className="w-full h-full object-cover rounded-md"
                    />
                ) : (
                    <div className="text-gray-400 text-center p-4">
                        Click to upload or generate cover image.
                    </div>
                )}

                <input
                    hidden
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleDirectImageChange}
                    className="hidden"
                />
            </div>

            <div className="mt-4 rounded-md">
                <div className="flex overflow-y-auto gap-2">
                    {generatedCovers.map((imgSrc, index) => (
                        <div
                            key={index}
                            className="relative cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-md overflow-hidden"
                            onClick={() => selectGeneratedCover(imgSrc)}
                        >
                            <img
                                src={imgSrc}
                                alt={`Generated Cover ${index + 1}`}
                                className="w-32 object-contain rounded-md"
                            />
                            {coverImageUrl === imgSrc && (
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-75 rounded-md">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-white"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <video
                    ref={videoRef}
                    className="hidden"
                    muted
                    playsInline
                    preload="auto"
                    crossOrigin="anonymous"
                ></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
        </div>
    )
}

export default CoverImageUploader





