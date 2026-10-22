import React, { useRef } from 'react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
const ImageUpload = ({
    label,
    image,
    setImage,
    handleImageChange,
    handleRemoveImage,
    langLabel,
    size,
    activeTab
}) => {
    const fileInputRef = useRef(null)
    const uploadLabel = `Upload ${label}`
    const id = `${langLabel}-${size}-upload`
    const onChange = (e) => {
        handleImageChange(e, setImage, fileInputRef, `${langLabel}-${size}`, size)
    }
    const onRemove = () => {
        handleRemoveImage(setImage, fileInputRef, `${langLabel}-${size}`)
    }
    // const homeTopText = size === 'Large' ? '294x267px' : '200x267px'
    // const homeTopSize = size === 'Large' ? 'w-[294px] h-[267px]' : 'w-[300px] h-[104.83px]'
    // const bannerInMomentText = size === 'Large' ? '294x267px' : '200x267px'
    // const bannerInMomentSize = size === 'Large' ? 'w-[200px] h-[181.63px]' : 'w-[200px] h-[267px]'
    // const dimensionsText = activeTab === 'bannerInMoment' ? bannerInMomentText : homeTopText
    // // const containerSizeClasses = activeTab === 'bannerInMoment' ? bannerInMomentSize : homeTopSize
    // const homeTopText = size === 'Large' ? '294x267px' : '200x267px'
    // const homeTopSize = size === 'Large' ? 'w-[294px] h-[267px]' : 'w-[300px] h-[104.83px]'
    const bannerInMomentText = size === ''
    const bannerInMomentSize = size === 'Large' ? 'w-full h-[267px]' : 'w-full h-[267px]'
    const dimensionsText = bannerInMomentText
    const containerSizeClasses = bannerInMomentSize
    const handlePreview = () => {
        if (!image) return;
        Swal.fire({
            title: ` `,
            html: `
            <div style="display: flex; justify-content: center;">
                <img 
                    src="${image}" 
                    alt="${label} Preview"
                    style="
                        max-width: 100%;
                        max-height: 400px;
                        object-fit: contain;
                        border-radius: 8px;
                    "
                />
            </div>
        `,
            showCloseButton: true,
            showConfirmButton: false,
            showCancelButton: false,
            customClass: {
                popup: 'rounded-xl shadow-lg',
                closeButton: 'text-red-500 hover:text-red-500 text-xl' // optional style
            }
        });
    };
    return (
        <div className={`flex flex-col relative ${fileInputRef !== null ? 'mb-10' : ''} ${containerSizeClasses}`}>
            <label
                htmlFor={id}
                className="flex flex-col items-center justify-center w-full h-full 
                           border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50"
            >
                {image ? (
                    <img
                        src={image}
                        alt={`${label} Preview`}
                        className="object-contain w-full h-full rounded-lg"
                        onClick={handlePreview}
                    />
                ) : (
                    <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4h20M28 8h16M40 36h-16M36 12h4m-2-4h4m-4 4h-4"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span className="mt-2 block text-sm font-medium text-gray-700">{uploadLabel}</span>
                        <span className="mt-1 block text-xs text-gray-500">{dimensionsText}</span>
                    </>
                )}
            </label>

            <input
                ref={fileInputRef}
                style={{ display: 'none' }}
                id={id}
                type="file"
                accept="image/*"
                onChange={onChange}
            />

            {image && (
                <div className="flex justify-between mt-2">
                    <button
                        type="button"
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg"
                        onClick={handlePreview} // 👈 Preview button
                    >
                        Preview
                    </button>
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'absolute',
                            top: 0,
                            right: 0
                        }}
                        onClick={onRemove}
                        type="button"
                    >
                        <i
                            className="fa-regular fa-circle-xmark"
                            style={{
                                fontSize: '20px',
                                color: 'red',
                                background: 'white',
                                borderRadius: '50%',
                            }}
                        ></i>
                    </button>
                </div>
            )}
        </div>
    )
}
export default ImageUpload
