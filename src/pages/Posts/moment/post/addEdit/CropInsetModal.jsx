// post/addEdit/CropInsetModal.jsx

import React from 'react'
import { Modal } from 'antd'

const CropInsetModal = ({
    cropModal,
    setCropModal,
    setCropBox,
    setImgRect,
    dragStateRef,
    handleApplyCrop,
    stageRef,
    onMoveCrop,
    endMoveCrop,
    imgRef,
    cropSrc,
    computeImgRect,
    imgRect,
    cropBox,
    startDragCrop,
}) => {
    return (
        <>
            {/* -----------------------------
          Custom Crop Modal (INSET STYLE)
         ----------------------------- */}
            <Modal
                open={cropModal.open}
                onCancel={() => {
                    setCropModal({ open: false, file: null })
                    setCropBox(null)
                    setImgRect(null)
                    dragStateRef.current = null
                }}
                onOk={handleApplyCrop}
                width={900}
                centered
                destroyOnHidden
            >
                <div
                    ref={stageRef}
                    className="w-full bg-black rounded-md overflow-hidden relative"
                    style={{
                        height: 600,
                        touchAction: 'none',
                        userSelect: 'none',
                    }}
                    onMouseMove={onMoveCrop}
                    onMouseUp={endMoveCrop}
                    onMouseLeave={endMoveCrop}
                    onTouchMove={onMoveCrop}
                    onTouchEnd={endMoveCrop}
                >
                    {/* IMAGE (contain) */}
                    {cropModal.file?.type?.startsWith('image/') && (
                        <img
                            ref={imgRef}
                            src={cropSrc || ''}
                            alt="crop"
                            draggable={false}
                            onLoad={() => requestAnimationFrame(() => computeImgRect())}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                margin: 'auto',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                            }}
                        />

                    )}

                    {/* CROP OVERLAY (placed on top of displayed image area) */}
                    {imgRect && cropBox && (
                        <div
                            style={{
                                position: 'absolute',
                                left: imgRect.left + cropBox.x,
                                top: imgRect.top + cropBox.y,
                                width: cropBox.width,
                                height: cropBox.height,
                                border: '2px solid rgba(255,255,255,0.95)',
                                boxSizing: 'border-box',
                            }}
                        >
                            {/* grid */}
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    pointerEvents: 'none',
                                    backgroundImage:
                                        'linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)',
                                    backgroundSize: '33.333% 100%, 100% 33.333%',
                                }}
                            />

                            {/* move inside */}
                            <div
                                onMouseDown={startDragCrop('move')}
                                onTouchStart={startDragCrop('move')}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    cursor: 'move',
                                }}
                            />

                            {/* handles */}
                            {[
                                // sides
                                { k: 't', style: { top: -6, left: 16, right: 16, height: 12, cursor: 'ns-resize' } },
                                { k: 'b', style: { bottom: -6, left: 16, right: 16, height: 12, cursor: 'ns-resize' } },
                                { k: 'l', style: { left: -6, top: 16, bottom: 16, width: 12, cursor: 'ew-resize' } },
                                { k: 'r', style: { right: -6, top: 16, bottom: 16, width: 12, cursor: 'ew-resize' } },
                                // corners
                                { k: 'tl', style: { left: -8, top: -8, width: 16, height: 16, cursor: 'nwse-resize' } },
                                { k: 'tr', style: { right: -8, top: -8, width: 16, height: 16, cursor: 'nesw-resize' } },
                                { k: 'bl', style: { left: -8, bottom: -8, width: 16, height: 16, cursor: 'nesw-resize' } },
                                { k: 'br', style: { right: -8, bottom: -8, width: 16, height: 16, cursor: 'nwse-resize' } },
                            ].map((h) => (
                                <div
                                    key={h.k}
                                    onMouseDown={startDragCrop(h.k)}
                                    onTouchStart={startDragCrop(h.k)}
                                    style={{
                                        position: 'absolute',
                                        background: 'rgba(255,255,255,0.001)', // invisible but clickable
                                        ...h.style,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* darken outside crop */}
                    {imgRect && cropBox && (
                        <>
                            {/* top */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: imgRect.left,
                                    top: imgRect.top,
                                    width: imgRect.width,
                                    height: cropBox.y,
                                    background: 'rgba(0,0,0,0.55)',
                                    pointerEvents: 'none',
                                }}
                            />
                            {/* bottom */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: imgRect.left,
                                    top: imgRect.top + cropBox.y + cropBox.height,
                                    width: imgRect.width,
                                    height: imgRect.height - (cropBox.y + cropBox.height),
                                    background: 'rgba(0,0,0,0.55)',
                                    pointerEvents: 'none',
                                }}
                            />
                            {/* left */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: imgRect.left,
                                    top: imgRect.top + cropBox.y,
                                    width: cropBox.x,
                                    height: cropBox.height,
                                    background: 'rgba(0,0,0,0.55)',
                                    pointerEvents: 'none',
                                }}
                            />
                            {/* right */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: imgRect.left + cropBox.x + cropBox.width,
                                    top: imgRect.top + cropBox.y,
                                    width: imgRect.width - (cropBox.x + cropBox.width),
                                    height: cropBox.height,
                                    background: 'rgba(0,0,0,0.55)',
                                    pointerEvents: 'none',
                                }}
                            />
                        </>
                    )}
                </div>

                <div className="text-xs text-gray-500 mt-2">
                    Drag edges: only that side moves. Drag corners: both sides. Drag inside: move box.
                </div>
            </Modal>
        </>
    )
}

export default CropInsetModal
