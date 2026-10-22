// post/addEdit/Photo.jsx

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Upload, Select, Modal, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import Swal from 'sweetalert2'

import MediaItem from './MediaItem'
import CropInsetModal from './CropInsetModal'
import { extractVideoFrame } from './videoProcessingHelper'
import {
    getBase64,
    dataURLtoFile,
    urlToObjectUrl,
    normalizeCover,
    cropToDataUrlNatural,
    getRatioFromAspect,
    clamp,
} from './photoHelpers'

// -----------------------------
// Photo (custom crop overlay)
// -----------------------------
const Photo = (props) => {
    const { aspectRatio, setAspectRatio, fileList, setFileList, removeMedia, setRemoveMedia, disableMention = false } = props
    const coverInitialized = useRef(false)
    const [draggedUid, setDraggedUid] = useState(null)
    const [__cropped, setCropped] = useState(true)
    // crop modal
    const [cropModal, setCropModal] = useState({ open: false, file: null })
    const coverSyncDone = useRef(false)

    // refs for measuring image rect
    const stageRef = useRef(null) // container
    const imgRef = useRef(null) // img
    const [cropSrc, setCropSrc] = useState(null)
    const cropSrcRef = useRef(null)

    // crop box in DISPLAY pixels (relative to displayed image rect)
    // { x, y, width, height }
    const [cropBox, setCropBox] = useState(null)

    // image rect inside stage (because objectFit contain adds padding)
    const [imgRect, setImgRect] = useState(null) // { left, top, width, height } in stage coords

    // dragging state for handles
    const dragStateRef = useRef(null)

    const aspectStyle = {
        'aspect-[3/4]': { width: '230px', height: `${(230 * 4) / 3}px` },
        'aspect-square': { width: '230px', height: '230px' },
        'aspect-[4/3]': { width: '230px', height: `${(230 * 3) / 4}px` },
    }

    const showMessage = (title, content) => {
        Modal.info({
            title,
            content,
            okText: 'OK',
            centered: true,
        })
    }

    // helper: load image element safely
    const loadImageEl = (src) =>
        new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = src
        })

    // helper: crop by natural pixels
    const cropNaturalToDataUrl = async (imgEl, pixelCrop) => {
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(pixelCrop.width))
        canvas.height = Math.max(1, Math.round(pixelCrop.height))
        const ctx = canvas.getContext('2d')

        ctx.drawImage(
            imgEl,
            Math.round(pixelCrop.x),
            Math.round(pixelCrop.y),
            Math.round(pixelCrop.width),
            Math.round(pixelCrop.height),
            0,
            0,
            Math.round(pixelCrop.width),
            Math.round(pixelCrop.height)
        )
        return canvas.toDataURL('image/jpeg', 0.92)
    }
    useEffect(() => {

        if (coverInitialized.current) return

        if (!Array.isArray(fileList) || fileList.length < 2) return

        const first = fileList[0]

        if (!first?.fromCover || !first?.url) return


        // your existing cover reorder code here


        coverInitialized.current = true

    }, [fileList])
    useEffect(() => {

        if (coverSyncDone.current) return

        if (!Array.isArray(fileList) || fileList.length < 2) return

        const first = fileList[0]

        if (!first?.fromCover || !first?.url) return


        // your existing reorder code...


        coverSyncDone.current = true

    }, [fileList])
    // AUTO CROP (center) to current aspect ratio
    const autoCropCenterToAspect = async (src, ratio) => {
        const imgEl = await loadImageEl(src)
        const w = imgEl.naturalWidth
        const h = imgEl.naturalHeight

        // center crop to match ratio
        let cropW = w
        let cropH = h
        let x = 0
        let y = 0

        const current = w / h
        if (current > ratio) {
            // too wide -> reduce width
            cropW = h * ratio
            x = (w - cropW) / 2
        } else {
            // too tall -> reduce height
            cropH = w / ratio
            y = (h - cropH) / 2
        }

        const dataUrl = await cropNaturalToDataUrl(imgEl, { x, y, width: cropW, height: cropH })
        return dataUrl
    }

    const handleAutoCropToggle = useCallback(
        async (uid) => {
            const target = fileList.find((f) => f.uid === uid)
            if (!target) return

            if (!target.type?.startsWith('image/')) return

            try {
                // choose source to crop
                // - server image -> fetch blob -> objectURL (requires CORS)
                // - local image -> base64 already
                let src = target.originalUrl || target.url
                let tmpObjectUrl = null

                if (target.fromServer && target.url) {
                    const objUrl = await urlToObjectUrl(target.url) // uses fetch cors
                    tmpObjectUrl = objUrl
                    src = objUrl
                }

                const ratio = getRatioFromAspect(aspectRatio) // uses current selected aspect
                const croppedDataUrl = await autoCropCenterToAspect(src, ratio)
                const croppedFile = await dataURLtoFile(croppedDataUrl, `autocrop_${uid}_${Date.now()}.jpg`)

                // cleanup temp url
                if (tmpObjectUrl) URL.revokeObjectURL(tmpObjectUrl)

                // if server image: mark old mediaId removed
                if (target.fromServer && target.mediaId) {
                    setRemoveMedia((prev) => {
                        const next = Array.isArray(prev) ? [...prev] : []
                        const id = String(target.mediaId)
                        if (!next.includes(id)) next.push(id)
                        return next
                    })
                }

                setFileList((prev) =>
                    normalizeCover(
                        prev.map((f) => {
                            if (f.uid !== uid) return f

                            return {
                                ...f,

                                // backup so uncrop can restore
                                __backup: f.__backup || {
                                    url: f.url,
                                    originalUrl: f.originalUrl,
                                    fromServer: f.fromServer,
                                    mediaId: f.mediaId,
                                    key: f.key,
                                },

                                url: croppedDataUrl,
                                originalUrl: f.originalUrl || f.url,

                                // THIS makes it uploadable & savable
                                originFileObj: croppedFile,
                                name: croppedFile.name,
                                type: croppedFile.type,

                                // treat as new upload if came from server
                                ...(f.fromServer
                                    ? {
                                        fromServer: false,
                                        mediaId: null,
                                        key: null,
                                    }
                                    : {}),

                                __cropped: true,
                            }
                        })
                    )
                )
            } catch (err) {
                console.error(err)
                Modal.info({
                    title: 'Error',
                    content: 'Cannot auto-crop image. (CORS or image load error)',
                    centered: true,
                })
            }
        },
        [fileList, aspectRatio, setFileList, setRemoveMedia]
    )

    const handleVideoPreview = useCallback((videoUrl, isMuted) => {
        Swal.fire({
            html: `
        <video controls autoplay loop ${isMuted ? 'muted' : ''} class="w-full h-auto max-h-[80vh]">
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `,
            width: '80%',
            showConfirmButton: false,
            showCloseButton: true,
            background: '#000',
            didOpen: () => {
                const videoElement = Swal.getHtmlContainer().querySelector('video')
                if (videoElement) videoElement.play()
            },
            willClose: () => {
                const videoElement = Swal.getHtmlContainer().querySelector('video')
                if (videoElement) {
                    videoElement.pause()
                    videoElement.currentTime = 0
                }
            },
        })
    }, [])

    // keep your cover sync logic
    useEffect(() => {
        if (!Array.isArray(fileList) || fileList.length < 2) return

        const first = fileList[0]
        if (!first?.fromCover || !first?.url) return

        const coverUrl = first.url

        const getName = (u) => {
            if (!u || typeof u !== 'string') return ''
            const clean = u.split('?')[0]
            return clean.substring(clean.lastIndexOf('/') + 1)
        }

        const coverName = getName(coverUrl)

        const videoIdx = fileList.findIndex(
            (f, idx) =>
                idx !== 0 &&
                f?.type?.startsWith('video/') &&
                f?.coverUrl &&
                (f.coverUrl === coverUrl || getName(f.coverUrl) === coverName)
        )

        if (videoIdx > 0) {
            const next = [...fileList]
            next.splice(0, 1)

            const movedIndex = next.findIndex((x) => x.uid === fileList[videoIdx].uid)
            if (movedIndex > -1) {
                const [moved] = next.splice(movedIndex, 1)
                next.unshift(moved)
            }

            const nextUids = next.map((x) => x.uid).join('|')
            const curUids = fileList.map((x) => x.uid).join('|')
            if (nextUids !== curUids) setFileList(normalizeCover(next))
            return
        }

        const imageIdx = fileList.findIndex(
            (f, idx) =>
                idx !== 0 &&
                f?.type?.startsWith('image/') &&
                f?.url &&
                (f.url === coverUrl || getName(f.url) === coverName)
        )

        if (imageIdx > 0) {
            const next = [...fileList]
            next.splice(0, 1)

            const movedIndex = next.findIndex((x) => x.uid === fileList[imageIdx].uid)
            if (movedIndex > -1) {
                const [moved] = next.splice(movedIndex, 1)
                next.unshift(moved)
            }

            const nextUids = next.map((x) => x.uid).join('|')
            const curUids = fileList.map((x) => x.uid).join('|')
            if (nextUids !== curUids) setFileList(normalizeCover(next))
        }
    }, [fileList, setFileList])

    const handleSetCover = useCallback(
        (uid) => {
            const targetFile = fileList.find((file) => file.uid === uid)

            if (targetFile?.type?.startsWith('video/')) {
                showMessage(
                    'Cannot Set Cover',
                    'Click-to-set-cover works only on images. To use a video as post cover, drag that video to the first position.'
                )
                return
            }

            const idx = fileList.findIndex((f) => f.uid === uid)
            if (idx <= 0) {
                setFileList((prev) => normalizeCover(prev))
                return
            }

            const next = [...fileList]
            const [picked] = next.splice(idx, 1)
            next.unshift(picked)
            setFileList(normalizeCover(next))
        },
        [fileList, setFileList]
    )

    const handleRemove = useCallback(
        (fileToRemove) => {
            if (fileToRemove?.fromServer && fileToRemove?.mediaId) {
                setRemoveMedia((prev) => {
                    const next = Array.isArray(prev) ? [...prev] : []
                    if (!next.includes(fileToRemove.mediaId)) next.push(fileToRemove.mediaId)
                    return next
                })
            }

            setFileList((prev) => normalizeCover(prev.filter((f) => f.uid !== fileToRemove.uid)))
            return true
        },
        [setFileList, setRemoveMedia]
    )

    const handleUploadVideoCover = useCallback(
        (uid, coverImageObj) => {
            setFileList((prev) =>
                normalizeCover(
                    prev.map((file) =>
                        file.uid === uid
                            ? {
                                ...file,
                                coverImage: coverImageObj?.file || null,
                                coverUrl: coverImageObj?.fileUrl || null,
                                remoteCoverUrl: coverImageObj?.remoteUrl || null,
                            }
                            : file
                    )
                )
            )
        },
        [setFileList]
    )

    const handleToggleMute = useCallback(
        (uid) => {
            setFileList((prev) =>
                prev.map((file) => {
                    if (file.uid === uid && file.type?.startsWith('video/')) {
                        const newMutedState = !file.isMuted

                        Swal.fire({
                            icon: 'info',
                            title: newMutedState ? 'Video Muted' : 'Video Unmuted',
                            text: newMutedState ? 'Sound has been turned off for this video.' : 'Sound has been turned on for this video.',
                            timer: 1500,
                            showConfirmButton: false,
                        })

                        return { ...file, isMuted: newMutedState }
                    }
                    return file
                })
            )
        },
        [setFileList]
    )

    const handleUncrop = useCallback(
        (uid) => {
            setFileList((prev) =>
                normalizeCover(
                    prev.map((f) => {
                        if (f.uid !== uid) return f

                        // restore backup for server image or local
                        const b = f.__backup
                        if (b) {
                            return {
                                ...f,
                                url: b.url,
                                originalUrl: b.originalUrl || b.url,
                                fromServer: b.fromServer,
                                mediaId: b.mediaId,
                                key: b.key,
                                originFileObj: null,
                                name: f.name,
                                type: f.type,
                                __cropped: false,
                                __backup: null,
                            }
                        }

                        // fallback restore
                        return {
                            ...f,
                            url: f.originalUrl || f.url,
                            originFileObj: null,
                            __cropped: false,
                        }
                    })
                )
            )
        },
        [setFileList]
    )

    const handleDragOver = useCallback(
        (e, targetUid) => {
            e.preventDefault()
            if (!draggedUid || draggedUid === targetUid) return

            setFileList((prev) => {
                const currentIndex = prev.findIndex((x) => x.uid === draggedUid)
                const targetIndex = prev.findIndex((x) => x.uid === targetUid)
                if (currentIndex < 0 || targetIndex < 0) return prev

                const next = [...prev]
                const [moved] = next.splice(currentIndex, 1)
                next.splice(targetIndex, 0, moved)

                return normalizeCover(next)
            })
        },
        [draggedUid, setFileList]
    )

    const handleDragEnd = () => setDraggedUid(null)

    // -----------------------------
    // Crop modal: measure displayed image rect
    // -----------------------------
    // const computeImgRect = useCallback(() => {
    //     const stageEl = stageRef.current
    //     const imgEl = imgRef.current
    //     if (!stageEl || !imgEl) return

    //     const stage = stageEl.getBoundingClientRect()
    //     const img = imgEl.getBoundingClientRect()

    //     const rect = {
    //         left: img.left - stage.left,
    //         top: img.top - stage.top,
    //         width: img.width,
    //         height: img.height,
    //     }

    //     setImgRect(rect)

    //     const r = getRatioFromAspect(aspectRatio)

    //     setCropBox((prev) => {
    //         if (prev) return prev

    //         // fit box into rect with ratio
    //         const maxW = rect.width * 0.8
    //         const maxH = rect.height * 0.8

    //         let w = maxW
    //         let h = w / r
    //         if (h > maxH) {
    //             h = maxH
    //             w = h * r
    //         }

    //         return {
    //             x: (rect.width - w) / 2,
    //             y: (rect.height - h) / 2,
    //             width: w,
    //             height: h,
    //         }
    //     })
    // }, [aspectRatio])
    const computeImgRect = useCallback(() => {
        const stageEl = stageRef.current
        const imgEl = imgRef.current
        if (!stageEl || !imgEl) return

        const stageWidth = stageEl.clientWidth
        const stageHeight = stageEl.clientHeight
        const naturalWidth = imgEl.naturalWidth
        const naturalHeight = imgEl.naturalHeight

        if (!stageWidth || !stageHeight || !naturalWidth || !naturalHeight) return

        const stageRatio = stageWidth / stageHeight
        const imageRatio = naturalWidth / naturalHeight

        let width = 0
        let height = 0
        let left = 0
        let top = 0

        if (imageRatio > stageRatio) {
            // image is wider
            width = stageWidth
            height = width / imageRatio
            left = 0
            top = (stageHeight - height) / 2
        } else {
            // image is taller
            height = stageHeight
            width = height * imageRatio
            top = 0
            left = (stageWidth - width) / 2
        }

        const rect = { left, top, width, height }
        setImgRect(rect)

        const r = getRatioFromAspect(aspectRatio)

        setCropBox((prev) => {
            if (prev) return prev

            const maxW = rect.width * 0.8
            const maxH = rect.height * 0.8

            let w = maxW
            let h = w / r

            if (h > maxH) {
                h = maxH
                w = h * r
            }

            return {
                x: (rect.width - w) / 2,
                y: (rect.height - h) / 2,
                width: w,
                height: h,
            }
        })
    }, [aspectRatio])
    useEffect(() => {
        if (!cropModal.open) return
        const onResize = () => computeImgRect()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [cropModal.open, computeImgRect])

    // -----------------------------
    // Crop modal: pointer handlers
    // -----------------------------
    const getPoint = (e) => {
        const p = e.touches?.[0]
        return { x: p ? p.clientX : e.clientX, y: p ? p.clientY : e.clientY }
    }

    const startDragCrop = (type) => (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!imgRect || !cropBox) return

        const stage = stageRef.current.getBoundingClientRect()
        const pt = getPoint(e)

        dragStateRef.current = {
            type, // 'move' | 'l'|'r'|'t'|'b'|'tl'|'tr'|'bl'|'br'
            startX: pt.x,
            startY: pt.y,
            base: { ...cropBox },
            stageLeft: stage.left,
            stageTop: stage.top,
        }
    }

    const onMoveCrop = (e) => {
        const ds = dragStateRef.current
        if (!ds || !imgRect || !cropBox) return

        const pt = getPoint(e)
        const dx = pt.x - ds.startX
        const dy = pt.y - ds.startY

        const minSize = 40

        const base = ds.base
        let next = { ...base }

        // IMPORTANT: "inset crop" behavior you asked:
        // left handle only affects x/width, top only affects y/height, etc.
        switch (ds.type) {
            case 'move': {
                next.x = base.x + dx
                next.y = base.y + dy
                break
            }
            case 'l': {
                next.x = base.x + dx
                next.width = base.width - dx
                break
            }
            case 'r': {
                next.width = base.width + dx
                break
            }
            case 't': {
                next.y = base.y + dy
                next.height = base.height - dy
                break
            }
            case 'b': {
                next.height = base.height + dy
                break
            }
            case 'tl': {
                next.x = base.x + dx
                next.width = base.width - dx
                next.y = base.y + dy
                next.height = base.height - dy
                break
            }
            case 'tr': {
                next.width = base.width + dx
                next.y = base.y + dy
                next.height = base.height - dy
                break
            }
            case 'bl': {
                next.x = base.x + dx
                next.width = base.width - dx
                next.height = base.height + dy
                break
            }
            case 'br': {
                next.width = base.width + dx
                next.height = base.height + dy
                break
            }
            default:
                break
        }

        // enforce min size (without changing the "other sides")
        if (next.width < minSize) {
            if (ds.type.includes('l')) {
                // keep right fixed
                next.x = base.x + (base.width - minSize)
            }
            next.width = minSize
        }
        if (next.height < minSize) {
            if (ds.type.includes('t')) {
                // keep bottom fixed
                next.y = base.y + (base.height - minSize)
            }
            next.height = minSize
        }

        // clamp inside image rect (0..imgRect.width/height)
        // cropBox coords are relative to displayed IMAGE (not stage)
        next.x = clamp(next.x, 0, imgRect.width - next.width)
        next.y = clamp(next.y, 0, imgRect.height - next.height)

        // also clamp width/height so it cannot exceed bounds
        next.width = clamp(next.width, minSize, imgRect.width - next.x)
        next.height = clamp(next.height, minSize, imgRect.height - next.y)

        setCropBox(next)
    }

    const endMoveCrop = () => {
        dragStateRef.current = null
    }

    // -----------------------------
    // Apply crop
    // -----------------------------
    const handleApplyCrop = async () => {
        try {
            if (!cropModal.file || !imgRef.current || !imgRect || !cropBox) {
                showMessage('Crop not ready', 'Please move/resize the crop box, then click OK.')
                return
            }

            const imgEl = imgRef.current
            const displayedW = imgRect.width
            const displayedH = imgRect.height

            const scaleX = imgEl.naturalWidth / displayedW
            const scaleY = imgEl.naturalHeight / displayedH

            const pixelCrop = {
                x: cropBox.x * scaleX,
                y: cropBox.y * scaleY,
                width: cropBox.width * scaleX,
                height: cropBox.height * scaleY,
            }

            const croppedDataUrl = await cropToDataUrlNatural(imgEl, pixelCrop)

            //  IMPORTANT: make a real File so FormData uploads cropped image
            const croppedFile = await dataURLtoFile(croppedDataUrl, `crop_${cropModal.file.uid || Date.now()}.jpg`)

            //  If cropping a server image in EDIT mode => remove old mediaId + upload new
            if (cropModal.file?.fromServer && cropModal.file?.mediaId) {
                setRemoveMedia((prev) => {
                    const next = Array.isArray(prev) ? [...prev] : []
                    const id = String(cropModal.file.mediaId)
                    if (!next.includes(id)) next.push(id)
                    return next
                })
            }

            setFileList((prev) =>
                normalizeCover(
                    prev.map((f) => {
                        if (f.uid !== cropModal.file.uid) return f

                        //  turn it into an upload item (so EditPost will send it in addMedia)
                        const shouldBeNewUpload = !!f.fromServer

                        // return {
                        //     ...f,
                        //     url: croppedDataUrl, // preview
                        //     // keep originalUrl so "Uncrop" can restore preview
                        //     originalUrl: f.originalUrl || f.url,

                        //     //  THIS is what makes save work:
                        //     originFileObj: croppedFile,
                        //     name: croppedFile.name,
                        //     type: croppedFile.type,
                        //     __cropped: true,

                        //     __cropRect: cropBox,
                        //     //  for edited server image => now treat as a new upload
                        //     ...(shouldBeNewUpload
                        //         ? {
                        //             fromServer: false,
                        //             mediaId: null,
                        //             replacedFromMediaId: f.mediaId, // optional debug
                        //         }
                        //         : {}),
                        // }
                        return {
                            ...f,

                            // keep backup so uncrop works
                            __backup: f.__backup || {
                                url: f.url,
                                originalUrl: f.originalUrl,
                                fromServer: f.fromServer,
                                mediaId: f.mediaId,
                                key: f.key,
                            },

                            url: croppedDataUrl,
                            originalUrl: f.originalUrl || f.url,

                            originFileObj: croppedFile,
                            name: croppedFile.name,
                            type: croppedFile.type,
                            __cropped: __cropped,

                            ...(shouldBeNewUpload
                                ? {
                                    fromServer: false,
                                    mediaId: null,
                                    key: null,
                                    replacedFromMediaId: f.mediaId,
                                }
                                : {}),
                        }
                    })
                )
            )

            setCropModal({ open: false, file: null })
            setCropBox(null)
            setImgRect(null)
        } catch (err) {
            console.error(err)
            showMessage('Error', 'Could not crop the image. Please try again.')
        }
    }

    // -----------------------------
    // Upload props (your original)
    // -----------------------------
    const uploadProps = {
        multiple: true,
        accept: 'image/*,video/mp4,video/mov,video/quicktime',
        fileList,
        beforeUpload: () => false,
        onChange: async ({ fileList: newFileList }) => {
            const addedFiles = newFileList.filter((f) => !fileList.some((existing) => existing.uid === f.uid))

            const processedFiles = await Promise.all(
                addedFiles.map(async (file) => {
                    const originalUrl = await getBase64(file.originFileObj)

                    if (file.type?.startsWith('video/')) {
                        try {
                            const frameDataUrl = await extractVideoFrame(originalUrl, 0.5)
                            const thumbFile = await dataURLtoFile(frameDataUrl, `video_cover_${file.uid || Date.now()}.png`)

                            return {
                                ...file,
                                url: originalUrl,
                                originalUrl,
                                type: file.type,
                                fromServer: false,
                                mediaId: null,
                                coverImage: thumbFile,
                                coverUrl: frameDataUrl,
                                isMuted: true,
                            }
                        } catch (err) {
                            console.error('Failed to auto-generate video cover:', err)
                            return {
                                ...file,
                                url: originalUrl,
                                originalUrl,
                                type: file.type,
                                fromServer: false,
                                mediaId: null,
                                coverImage: null,
                                coverUrl: null,
                                isMuted: true,
                            }
                        }
                    }

                    return {
                        ...file,
                        url: originalUrl,
                        originalUrl,
                        type: file.type,
                        fromServer: false,
                        mediaId: null,
                        coverImage: file.originFileObj,
                        coverUrl: originalUrl,
                        isMuted: false,
                    }
                })
            )

            let updatedList = [...fileList, ...processedFiles]

            if (updatedList.length > 10) {
                message.error('You can upload a maximum of 10 media items (photos + videos).')
                updatedList = updatedList.slice(0, 10)
            }

            setFileList(normalizeCover(updatedList))
        },
        onRemove: handleRemove,
        itemRender: () => null,
        showUploadList: false,
    }

    useEffect(() => {
        const run = async () => {
            if (!cropModal.open || !cropModal.file) return

            const f = cropModal.file

            // cleanup old object url
            if (cropSrcRef.current) {
                URL.revokeObjectURL(cropSrcRef.current)
                cropSrcRef.current = null
            }

            //  if server image => fetch to blob => objectURL
            if (f.fromServer && f.url) {
                const objUrl = await urlToObjectUrl(f.url)
                cropSrcRef.current = objUrl
                setCropSrc(objUrl)
                return
            }

            //  local upload/base64
            setCropSrc(f.originalUrl || f.url)
        }

        run().catch((err) => {
            console.error(err)
            showMessage('Error', 'Cannot load image for cropping (CORS).')
        })

        return () => {
            if (cropSrcRef.current) {
                URL.revokeObjectURL(cropSrcRef.current)
                cropSrcRef.current = null
            }
        }
    }, [cropModal.open, cropModal.file])

    return (
        <div className="items-center flex justify-center sm:block justify-center font-sans remove-preview-photo">
            <div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio:</label>
                    <Select
                        disabled={disableMention}
                        defaultValue="aspect-[4/3]"
                        value={aspectRatio}
                        className="w-full md:w-1/3"

                        onChange={(value) => setAspectRatio(value)}
                        options={[
                            { value: 'aspect-[4/3]', label: 'Classic (4:3)' },
                            { value: 'aspect-square', label: 'Square (1:1)' },
                            { value: 'aspect-[3/4]', label: 'Portrait (3:4)' },
                        ]}
                    />
                </div>


                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {fileList.map((file, idx) => (
                        <div
                            key={file.uid}
                            className={`rounded-lg overflow-hidden relative border border-gray-200 ${disableMention ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                                }`}
                            style={{
                                ...aspectStyle[aspectRatio],
                                pointerEvents: disableMention ? 'none' : 'auto',
                            }}
                        >
                            <MediaItem
                                file={file}
                                isCover={idx === 0}
                                aspectRatio={aspectRatio}
                                aspectStyle={aspectStyle}
                                onSetCover={handleSetCover}
                                onRemove={() => handleRemove(file)}
                                onDragStart={() => setDraggedUid(file.uid)}
                                onDragOver={(e) => handleDragOver(e, file.uid)}
                                onDragEnd={handleDragEnd}
                                onCrop={() => {
                                    if (!file.type?.startsWith('image/')) return
                                    setCropModal({ open: true, file })
                                    setCropBox(null)
                                    setImgRect(null)
                                }}
                                onUncrop={handleUncrop}
                                onAutoCropToggle={handleAutoCropToggle}
                                onUploadVideoCover={handleUploadVideoCover}
                                onVideoPreview={handleVideoPreview}
                                onToggleMute={handleToggleMute}
                            />
                        </div>
                    ))}

                    <div
                        className="rounded-lg overflow-hidden relative border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-gray-50 transition-colors"
                        style={aspectStyle[aspectRatio]}
                    >
                        <Upload.Dragger
                            disabled={disableMention}
                            {...uploadProps}
                            className="!p-0 !m-0 w-full h-full flex items-center justify-center bg-transparent"
                            showUploadList={false}
                        >
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <PlusOutlined className="text-3xl" />
                                <span className="font-medium mt-2">Add Media</span>
                            </div>
                        </Upload.Dragger>
                    </div>
                </div>
            </div>

            <CropInsetModal
                cropModal={cropModal}
                setCropModal={setCropModal}
                setCropBox={setCropBox}
                setImgRect={setImgRect}
                dragStateRef={dragStateRef}
                handleApplyCrop={handleApplyCrop}
                stageRef={stageRef}
                onMoveCrop={onMoveCrop}
                endMoveCrop={endMoveCrop}
                imgRef={imgRef}
                cropSrc={cropSrc}
                computeImgRect={computeImgRect}
                imgRect={imgRect}
                cropBox={cropBox}
                startDragCrop={startDragCrop}
            />
        </div>
    )
}

export default Photo
