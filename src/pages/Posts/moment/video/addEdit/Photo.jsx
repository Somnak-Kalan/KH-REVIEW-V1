import React, { useState, useRef, useEffect } from 'react'
import VideoUploader from './VideoUploader'
import CoverImageUploader from './CoverImageUploader'
import { Modal, Form, Steps, Button, message } from 'antd'

function Photo({ form, videoUrl, setVideoUrl, coverVideo = null }) {
    const [selectedVideoFile, setSelectedVideoFile] = useState(null)
    const [selectedVideoUrl, setSelectedVideoUrl] = useState(null)
    const [selectedCoverImageUrl, setSelectedCoverImageUrl] = useState(null)
    const videoRef = useRef(null)
    //
    const [coverImageUrl, setCoverImageUrl] = useState(() => form?.getFieldValue('coverUrl') || null)
    const [generatedCovers, setGeneratedCovers] = useState(() => form?.getFieldValue('generatedCovers') || [])
    //
    useEffect(() => {
        setCoverImageUrl(coverVideo)

        //  keep form field in sync for edit mode
        if (coverVideo) {
            form?.setFieldsValue({ coverUrl: coverVideo })
        }
    }, [coverVideo])

    //  keep generatedCovers in sync when edit mode sets it via form.setFieldsValue
    useEffect(() => {
        const fromForm = form?.getFieldValue('generatedCovers') || []
        if (Array.isArray(fromForm) && fromForm.length) {
            setGeneratedCovers(fromForm)
        }
    }, [form])

    //  allow generating frames in edit mode using existing videoUrl
    useEffect(() => {
        if (videoUrl && !selectedVideoUrl) {
            setSelectedVideoUrl(videoUrl)
        }
    }, [videoUrl])

    const handleVideoSelect = (file, url) => {
        setSelectedVideoFile(file)
        setSelectedVideoUrl(url)
        setSelectedCoverImageUrl(null)
    }
    const handleCoverSelect = (file) => {
        if (!file) return
        const url = URL.createObjectURL(file)
        setSelectedCoverImageUrl(url)
    }
    return (
        // <Form form={form} layout="vertical">
        <div className="">
            <div className="sm:flex gap-4 mb-8 ">
                <VideoUploader
                    onVideoSelect={handleVideoSelect}
                    videoRef={videoRef}
                    form={form}
                    videoUrl={videoUrl}
                    setVideoUrl={setVideoUrl}
                    setGeneratedCovers={setGeneratedCovers}
                    setCoverImageUrl={setCoverImageUrl}
                />
                <div className="w-full">
                    <CoverImageUploader
                        coverImageUrl={coverImageUrl}
                        setCoverImageUrl={setCoverImageUrl}
                        generatedCovers={generatedCovers}
                        setGeneratedCovers={setGeneratedCovers}
                        videoUrl={selectedVideoUrl}
                        setVideoUrl={setSelectedVideoUrl}
                        videoRef={videoRef}
                        onCoverSelect={handleCoverSelect}
                        form={form}
                    />
                </div>
            </div>
        </div>
        // </Form>
    )
}

export default Photo