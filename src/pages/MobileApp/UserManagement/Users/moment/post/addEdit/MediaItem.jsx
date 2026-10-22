// // post/addEdit/MediaItem.jsx

// import React, { useState, useMemo, useRef, useEffect } from 'react'
// import { Tag, Button } from 'antd'
// import { PlayCircleOutlined } from '@ant-design/icons'
// import Swal from 'sweetalert2'
// import VideoCoverModal from './SetVideoCoverModal'

// const MediaItem = ({
//     file,
//     isCover,
//     aspectRatio,
//     aspectStyle,
//     onSetCover,
//     onRemove,
//     onDragStart,
//     onDragOver,
//     onDragEnd,
//     onCrop,
//     onUncrop,
//     onUploadVideoCover,
//     onAutoCropToggle,
//     onVideoPreview,
//     onToggleMute,
// }) => {
//     const isVideo = file.type?.startsWith('video/')

//     const [coverMode, setCoverMode] = useState(false)
//     const [videoCoverModal, setVideoCoverModal] = useState({
//         open: false,
//         videoFile: null,
//     })
//     const videoRef = useRef(null)

//     // const isCropped = useMemo(() => file.url !== file.originalUrl, [file.url, file.originalUrl])
//     const isCropped = useMemo(() => !!file.__cropped, [file.__cropped])

//     // const handleToggleObjectFit = async (e) => {
//     //     e.stopPropagation()

//     //     // if already auto-cropped -> uncrop
//     //     if (isCropped) {
//     //         onUncrop(file.uid)
//     //         setCoverMode(false)
//     //         return
//     //     }

//     //     // do REAL crop (not just UI zoom)
//     //     await onAutoCropToggle(file.uid)

//     //     // optional: after crop, keep showing cover mode
//     //     setCoverMode(true)
//     // }
//     const handleToggleObjectFit = async (e) => {
//         e.stopPropagation()
//         // just toggle zoom for BOTH original and cropped
//         if (isCropped) {
//             onUncrop(file.uid)
//             setCoverMode(false)
//             return
//         }
//         setCoverMode((prev) => !prev)
//         await onAutoCropToggle(file.uid)
//     }

//     const videoPoster = file.coverUrl || null

//     useEffect(() => {
//         if (!videoCoverModal?.open) return
//         setVideoCoverModal((prev) => ({ ...prev, videoFile: file }))
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [file?.isMuted, file?.coverUrl, file?.url])

//     useEffect(() => {
//         if (videoRef.current) videoRef.current.muted = !!file.isMuted
//     }, [file.isMuted])

//     return (
//         <div
//             draggable
//             onDragStart={onDragStart}
//             onDragOver={onDragOver}
//             onDragEnd={onDragEnd}
//             className="group relative w-full h-full"
//             style={{ background: '#9DB8D8' }}
//         >
//             <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md">
//                 {isVideo ? (
//                     <>
//                         {videoPoster && (
//                             <img
//                                 src={videoPoster}
//                                 alt="video-cover"
//                                 className="absolute inset-0 w-full h-full object-cover"
//                                 draggable={false}
//                             />
//                         )}

//                         <video
//                             ref={videoRef}
//                             src={file.url}
//                             className="w-full h-full object-cover relative z-[1]"
//                             muted={!!file.isMuted}
//                             loop
//                             poster={file.coverUrl}
//                             preload="metadata"
//                             playsInline
//                             onClick={(e) => e.stopPropagation()}
//                         />

//                         <div
//                             className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-30 z-[2]"
//                             onClick={(e) => {
//                                 e.stopPropagation()
//                                 onVideoPreview(file.url, !!file.isMuted)
//                             }}
//                         >
//                             <PlayCircleOutlined className="text-white text-6xl opacity-75 hover:opacity-100 transition-opacity" />
//                         </div>

//                         <div
//                             onClick={(e) => {
//                                 e.stopPropagation()
//                                 setVideoCoverModal({ open: true, videoFile: file })
//                             }}
//                             className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center py-2 cursor-pointer z-[3]"
//                         >
//                             Cover
//                         </div>

//                         <p
//                             className="absolute top-2 left-2 text-white z-[3] cursor-pointer select-none"
//                             onClick={(e) => {
//                                 e.stopPropagation()
//                                 onToggleMute(file.uid)
//                             }}
//                         >
//                             {file.isMuted ? 'Unmute' : 'Mute'}
//                         </p>
//                     </>
//                 ) : (
//                     // <img
//                     //     src={file.url}
//                     //     alt={file.name}
//                     //     className={`w-full h-full ${coverMode ? 'object-cover' : 'object-contain'}`}
//                     //     onClick={() => onSetCover(file.uid)}
//                     // />
//                     <img
//                         src={file.url}
//                         alt={file.name}
//                         className={`w-full h-full ${(coverMode || isCropped) ? 'object-cover' : 'object-contain'}`}                        // className={`w-full h-full ${coverMode ? 'object-cover' : 'object-contain'}`}
//                         onClick={() => onSetCover(file.uid)}
//                     />
//                 )}

//                 <VideoCoverModal
//                     aspectStyle={aspectStyle}
//                     aspectRatio={aspectRatio}
//                     videoRef={videoRef}
//                     file={videoCoverModal.videoFile || null}
//                     onUploadVideoCover={onUploadVideoCover}
//                     videoCoverModal={videoCoverModal}
//                     setVideoCoverModal={setVideoCoverModal}
//                     onToggleMute={onToggleMute}
//                 />

//                 {!isVideo && (
//                     <>
//                         <Button
//                             shape="circle"
//                             size="small"
//                             onClick={handleToggleObjectFit}
//                             className="absolute bottom-2 left-2 bg-black/50 text-white z-10"
//                             icon={
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     viewBox="0 0 24 24"
//                                     fill="currentColor"
//                                     className="w-4 h-4 text-white"
//                                 >
//                                     <path
//                                         fillRule="evenodd"
//                                         d="M3.75 3.75H7.5a.75.75 0 0 1 0 1.5H5.25v2.25a.75.75 0 0 1-1.5 0V3.75ZM16.5 3.75h3.75v3.75a.75.75 0 0 1-1.5 0V5.25h-2.25a.75.75 0 0 1 0-1.5ZM3.75 16.5V20.25H7.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75V16.5a.75.75 0 0 1 1.5 0ZM16.5 20.25h3.75V16.5a.75.75 0 0 1 1.5 0v3.75a.75.75 0 0 1-.75.75H16.5a.75.75 0 0 1 0-1.5Z"
//                                         clipRule="evenodd"
//                                     />
//                                 </svg>
//                             }
//                         />

//                         <Button
//                             shape="circle"
//                             size="small"
//                             onClick={(e) => {
//                                 e.stopPropagation()
//                                 onCrop()
//                             }}
//                             className="absolute bottom-2 right-2 bg-black/50 text-white z-10"
//                             icon={
//                                 <svg
//                                     width="24"
//                                     height="24"
//                                     viewBox="0 0 24 24"
//                                     className="w-3 h-4 text-white"
//                                     fill="none"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                 >
//                                     <path
//                                         d="M17 1H1V17H6V6H17V1Z"
//                                         stroke="currentColor"
//                                         strokeWidth="2"
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                     />
//                                     <path
//                                         d="M6 6V23H23V6H6Z"
//                                         stroke="currentColor"
//                                         strokeWidth="2"
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                     />
//                                     <line
//                                         x1="6"
//                                         y1="6"
//                                         x2="23"
//                                         y2="23"
//                                         stroke="currentColor"
//                                         strokeWidth="1"
//                                         strokeDasharray="3 3"
//                                     />
//                                 </svg>
//                             }
//                         />
//                     </>
//                 )}

//                 {isCover && (
//                     <Tag color="indigo" className="absolute top-2 left-2 !m-0 z-10">
//                         Cover
//                     </Tag>
//                 )}

//                 <Button
//                     type="primary"
//                     shape="circle"
//                     danger
//                     onClick={(e) => {
//                         e.stopPropagation()
//                         onRemove()
//                     }}
//                     className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
//                     size="small"
//                 >
//                     &times;
//                 </Button>
//             </div>
//         </div>
//     )
// }
// export default MediaItem
import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Tag, Button } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
import Swal from 'sweetalert2'
import VideoCoverModal from './SetVideoCoverModal'

const MediaItem = ({
    file,
    isCover,
    aspectRatio,
    aspectStyle,
    onSetCover,
    onRemove,
    onDragStart,
    onDragOver,
    onDragEnd,
    onCrop,
    onUncrop,
    onUploadVideoCover,
    onAutoCropToggle,
    onVideoPreview,
    onToggleMute,
}) => {
    const isVideo = file.type?.startsWith('video/')

    const [coverMode, setCoverMode] = useState(false)
    const [videoCoverModal, setVideoCoverModal] = useState({
        open: false,
        videoFile: null,
    })
    const videoRef = useRef(null)

    const isCropped = useMemo(() => !!file.__cropped, [file.__cropped])

    const handleToggleObjectFit = async (e) => {
        e.stopPropagation()

        // zoom / unzoom only
        setCoverMode((prev) => !prev)
        await onAutoCropToggle(file.uid)
    }

    const videoPoster = file.coverUrl || null

    useEffect(() => {
        if (!videoCoverModal?.open) return
        setVideoCoverModal((prev) => ({ ...prev, videoFile: file }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file?.isMuted, file?.coverUrl, file?.url])

    useEffect(() => {
        if (videoRef.current) videoRef.current.muted = !!file.isMuted
    }, [file.isMuted])

    useEffect(() => {
        if (isCropped) {
            setCoverMode(true)
        }
    }, [isCropped])

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            className="group relative w-full h-full"
            style={{ background: '#9DB8D8' }}
        >
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md">
                {isVideo ? (
                    <>
                        {videoPoster && (
                            <img
                                src={videoPoster}
                                alt="video-cover"
                                className="absolute inset-0 w-full h-full object-cover"
                                draggable={false}
                            />
                        )}

                        <video
                            ref={videoRef}
                            src={file.url}
                            className="w-full h-full object-cover relative z-[1]"
                            muted={!!file.isMuted}
                            loop
                            poster={file.coverUrl}
                            preload="metadata"
                            playsInline
                            onClick={(e) => e.stopPropagation()}
                        />

                        <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-30 z-[2]"
                            onClick={(e) => {
                                e.stopPropagation()
                                onVideoPreview(file.url, !!file.isMuted)
                            }}
                        >
                            <PlayCircleOutlined className="text-white text-6xl opacity-75 hover:opacity-100 transition-opacity" />
                        </div>

                        <div
                            onClick={(e) => {
                                e.stopPropagation()
                                setVideoCoverModal({ open: true, videoFile: file })
                            }}
                            className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center py-2 cursor-pointer z-[3]"
                        >
                            Cover
                        </div>

                        <p
                            className="absolute top-2 left-2 text-white z-[3] cursor-pointer select-none"
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleMute(file.uid)
                            }}
                        >
                            {file.isMuted ? 'Unmute' : 'Mute'}
                        </p>
                    </>
                ) : (
                    <img
                        src={file.url}
                        alt={file.name}
                        className={`w-full h-full ${(coverMode || isCropped) ? 'object-cover' : 'object-contain'}`}
                        onClick={() => onSetCover(file.uid)}
                    />
                )}

                <VideoCoverModal
                    aspectStyle={aspectStyle}
                    aspectRatio={aspectRatio}
                    videoRef={videoRef}
                    file={videoCoverModal.videoFile || null}
                    onUploadVideoCover={onUploadVideoCover}
                    videoCoverModal={videoCoverModal}
                    setVideoCoverModal={setVideoCoverModal}
                    onToggleMute={onToggleMute}
                />

                {!isVideo && (
                    <>
                        <Button
                            shape="circle"
                            size="small"
                            onClick={handleToggleObjectFit}
                            className="absolute bottom-2 left-2 bg-black/50 text-white z-10"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-4 h-4 text-white"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3.75 3.75H7.5a.75.75 0 0 1 0 1.5H5.25v2.25a.75.75 0 0 1-1.5 0V3.75ZM16.5 3.75h3.75v3.75a.75.75 0 0 1-1.5 0V5.25h-2.25a.75.75 0 0 1 0-1.5ZM3.75 16.5V20.25H7.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75V16.5a.75.75 0 0 1 1.5 0ZM16.5 20.25h3.75V16.5a.75.75 0 0 1 1.5 0v3.75a.75.75 0 0 1-.75.75H16.5a.75.75 0 0 1 0-1.5Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            }
                        />

                        {isCropped && (
                            <Button
                                shape="circle"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onUncrop(file.uid)
                                    setCoverMode(false)
                                }}
                                className="absolute bottom-2 left-12 bg-black/50 text-white z-10"
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-4 h-4 text-white"
                                    >
                                        <path d="M9.53 3.47a.75.75 0 0 1 0 1.06L6.81 7.25H15a6 6 0 1 1 0 12h-3.75a.75.75 0 0 1 0-1.5H15a4.5 4.5 0 1 0 0-9H6.81l2.72 2.72a.75.75 0 1 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06l4-4a.75.75 0 0 1 1.06 0Z" />
                                    </svg>
                                }
                            />
                        )}

                        <Button
                            shape="circle"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation()
                                onCrop()
                            }}
                            className="absolute bottom-2 right-2 bg-black/50 text-white z-10"
                            icon={
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    className="w-3 h-4 text-white"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M17 1H1V17H6V6H17V1Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M6 6V23H23V6H6Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <line
                                        x1="6"
                                        y1="6"
                                        x2="23"
                                        y2="23"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeDasharray="3 3"
                                    />
                                </svg>
                            }
                        />
                    </>
                )}

                {isCover && (
                    <Tag color="indigo" className="absolute top-2 left-2 !m-0 z-10">
                        Cover
                    </Tag>
                )}

                <Button
                    type="primary"
                    shape="circle"
                    danger
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove()
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    size="small"
                >
                    &times;
                </Button>
            </div>
        </div>
    )
}

export default MediaItem