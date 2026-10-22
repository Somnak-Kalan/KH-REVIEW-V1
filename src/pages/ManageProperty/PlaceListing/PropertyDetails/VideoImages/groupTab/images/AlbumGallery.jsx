import React, {
    useMemo,
    useState,
} from 'react'
import {
    Button,
    Checkbox,
    Empty,
    Modal,
    Select,
} from 'antd'
import {
    CheckOutlined,
    DeleteOutlined,
    FolderAddOutlined,
    HolderOutlined,
    SaveOutlined,
} from '@ant-design/icons'

import ImageLoading from '../../../../../../../components/Loading/ImageLoading'
import PropertyAlbumServices from '../../../../../../../services/ManageProperty/PlaceListing/Album'
const getSelectedLabel = count => {
    if (count === 0) {
        return 'None Selected'
    }

    return `${count} Image${count === 1 ? '' : 's'
        } Selected`
}

export default function AlbumGallery({
    group,
    destinationOptions = [],

    selectionMode = false,
    selectedImageIds = [],

    reorderMode = false,
    reorderImages = [],
    reorderChanged = false,

    deleting = false,
    moving = false,
    savingOrder = false,

    onToggleImage,
    onSelectAll,
    onCancelSelection,
    onDeleteSelected,
    onMoveSelected,

    onReorderChange,
    onCancelReorder,
    onSaveReorder,

    onPreview,
    imgLoading = {},
    onImageLoad,
    onImageError,
}) {
    const [
        deleteModalOpen,
        setDeleteModalOpen,
    ] = useState(false)

    const [
        moveModalOpen,
        setMoveModalOpen,
    ] = useState(false)

    const [
        targetAlbumKey,
        setTargetAlbumKey,
    ] = useState()

    const [
        draggedImageId,
        setDraggedImageId,
    ] = useState(null)

    const [
        dragOverImageId,
        setDragOverImageId,
    ] = useState(null)

    const selectedSet = useMemo(
        () => new Set(selectedImageIds),
        [selectedImageIds]
    )

    const displayImages =
        reorderMode
            ? reorderImages
            : group?.images || []

    const selectedCount =
        selectedImageIds.length

    const isAllSelected =
        Boolean(
            group?.images?.length &&
            group.images.every(image =>
                selectedSet.has(image.id)
            )
        )

    const closeMoveModal = () => {
        if (moving) {
            return
        }

        setMoveModalOpen(false)
        setTargetAlbumKey(undefined)
    }

    const confirmDelete = async () => {
        const success =
            await onDeleteSelected()

        if (success) {
            setDeleteModalOpen(false)
        }
    }

    const confirmMove = async () => {
        if (!targetAlbumKey) {
            return
        }

        const success =
            await onMoveSelected(
                targetAlbumKey
            )

        if (success) {
            closeMoveModal()
        }
    }

    const resetDragState = () => {
        setDraggedImageId(null)
        setDragOverImageId(null)
    }

    const handleDragStart = (
        event,
        imageId
    ) => {
        if (!reorderMode || savingOrder) {
            event.preventDefault()
            return
        }

        setDraggedImageId(imageId)

        event.dataTransfer.effectAllowed =
            'move'

        event.dataTransfer.setData(
            'text/plain',
            imageId
        )
    }

    const handleDragOver = (
        event,
        imageId
    ) => {
        if (!reorderMode || savingOrder) {
            return
        }

        event.preventDefault()

        event.dataTransfer.dropEffect =
            'move'

        if (imageId !== draggedImageId) {
            setDragOverImageId(imageId)
        }
    }

    const handleDrop = (
        event,
        targetImageId
    ) => {
        if (!reorderMode || savingOrder) {
            return
        }

        event.preventDefault()

        const sourceImageId =
            draggedImageId ||
            event.dataTransfer.getData(
                'text/plain'
            )

        if (
            !sourceImageId ||
            sourceImageId === targetImageId
        ) {
            resetDragState()
            return
        }

        const nextImages = [
            ...displayImages,
        ]

        const sourceIndex =
            nextImages.findIndex(
                image =>
                    image.id === sourceImageId
            )

        const targetIndex =
            nextImages.findIndex(
                image =>
                    image.id === targetImageId
            )

        if (
            sourceIndex === -1 ||
            targetIndex === -1
        ) {
            resetDragState()
            return
        }

        const [movedImage] =
            nextImages.splice(
                sourceIndex,
                1
            )

        nextImages.splice(
            targetIndex,
            0,
            movedImage
        )

        onReorderChange(nextImages)
        resetDragState()
    }

    if (!displayImages.length) {
        return (
            <div className='album-gallery-empty'>

                <Empty
                    description={`No images in ${group?.nameEn ||
                        'this album'
                        }`}
                />
            </div>
        )
    }

    return (
        <>
            {reorderMode && (
                <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                    <div>
                        <div className='text-[13px] font-medium text-[#111827]'>
                            Reorder images
                        </div>

                        <div className='mt-1 text-[11px] text-[#8c8c8c]'>
                            Drag and drop images,
                            then click Save.
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        <Button
                            disabled={savingOrder}
                            onClick={onCancelReorder}
                        >
                            Cancel
                        </Button>

                        <Button
                            type='primary'
                            icon={<SaveOutlined />}
                            loading={savingOrder}
                            disabled={!reorderChanged}
                            onClick={onSaveReorder}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            )}

            {selectionMode && (
                <div className='album-selection-toolbar'>
                    <div className='album-selection-count'>
                        {getSelectedLabel(
                            selectedCount
                        )}
                    </div>

                    <div className='album-selection-actions'>
                        <Button
                            disabled={
                                deleting || moving
                            }
                            onClick={
                                onCancelSelection
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            icon={
                                <Checkbox
                                    checked={isAllSelected}
                                    indeterminate={
                                        selectedCount > 0 &&
                                        !isAllSelected
                                    }
                                    className='album-select-all-checkbox'
                                />
                            }
                            disabled={
                                deleting || moving
                            }
                            onClick={onSelectAll}
                        >
                            Select All
                        </Button>

                        <Button
                            danger
                            type='primary'
                            icon={
                                <DeleteOutlined />
                            }
                            className='album-delete-action-btn'
                            disabled={
                                selectedCount === 0 ||
                                moving
                            }
                            loading={deleting}
                            onClick={() =>
                                setDeleteModalOpen(true)
                            }
                        >
                            Delete
                        </Button>

                        <Button
                            type='primary'
                            icon={
                                <FolderAddOutlined />
                            }
                            className='album-move-action-btn'
                            disabled={
                                selectedCount === 0 ||
                                deleting
                                ||
                                destinationOptions
                                    .length === 0
                            }
                            loading={moving}
                            onClick={() =>
                                setMoveModalOpen(true)
                            }
                        >
                            Move Images
                        </Button>
                    </div>
                </div>
            )}

            <div className='album-image-grid mt-4'>
                {displayImages.map(
                    (image, imageIndex) => {
                        const isSelected =
                            selectedSet.has(image.id)

                        const isDragOver =
                            reorderMode &&
                            dragOverImageId ===
                            image.id &&
                            draggedImageId !==
                            image.id

                        const cardClassName = [
                            'album-image-card',

                            selectionMode
                                ? 'album-image-card-selectable'
                                : '',

                            isSelected
                                ? 'album-image-card-selected'
                                : '',

                            reorderMode
                                ? 'cursor-grab select-none active:cursor-grabbing'
                                : '',

                            draggedImageId ===
                                image.id
                                ? 'opacity-50'
                                : '',

                            isDragOver
                                ? 'ring-2 ring-[#1677ff] ring-offset-2'
                                : '',
                        ]
                            .filter(Boolean)
                            .join(' ')

                        return (
                            <div
                                key={image.id}
                                draggable={
                                    reorderMode &&
                                    !savingOrder
                                }
                                aria-grabbed={
                                    reorderMode
                                        ? draggedImageId ===
                                        image.id
                                        : undefined
                                }
                                className={
                                    cardClassName
                                }
                                role={
                                    selectionMode
                                        ? 'button'
                                        : undefined
                                }
                                tabIndex={
                                    selectionMode
                                        ? 0
                                        : undefined
                                }
                                onDragStart={event =>
                                    handleDragStart(
                                        event,
                                        image.id
                                    )
                                }
                                onDragOver={event =>
                                    handleDragOver(
                                        event,
                                        image.id
                                    )
                                }
                                onDrop={event =>
                                    handleDrop(
                                        event,
                                        image.id
                                    )
                                }
                                onDragEnd={
                                    resetDragState
                                }
                                onClick={() => {
                                    if (reorderMode) {
                                        return
                                    }

                                    if (selectionMode) {
                                        onToggleImage(
                                            image.id
                                        )

                                        return
                                    }

                                    onPreview(image)
                                }}
                                onKeyDown={event => {
                                    if (
                                        !selectionMode ||
                                        ![
                                            'Enter',
                                            ' ',
                                        ].includes(
                                            event.key
                                        )
                                    ) {
                                        return
                                    }

                                    event.preventDefault()

                                    onToggleImage(
                                        image.id
                                    )
                                }}
                            >
                                <div className='album-image-ratio'>
                                    {/* <img
                                        src={image.url}
                                        alt={
                                            image
                                                .albumNameEn ||
                                            group?.nameEn ||
                                            'Gallery image'
                                        }
                                        className='album-image'
                                        draggable={false}
                                        onLoad={() =>
                                            onImageLoad(
                                                image.url
                                            )
                                        }
                                        onError={() =>
                                            onImageError(
                                                image.url
                                            )
                                        }
                                    /> */}
                                    <img
                                        src={image.url}
                                        alt={
                                            image.albumNameEn ||
                                            group?.nameEn ||
                                            'Gallery image'
                                        }
                                        className='album-image'
                                        draggable={false}

                                        // Do not load all images immediately
                                        loading='lazy'

                                        //  Decode image without blocking scrolling
                                        decoding='async'

                                        onLoad={() =>
                                            onImageLoad(
                                                image.url
                                            )
                                        }
                                        onError={() =>
                                            onImageError(
                                                image.url
                                            )
                                        }
                                    />

                                    {imgLoading[
                                        image.url
                                    ] && (
                                            <ImageLoading />
                                        )}

                                    {!selectionMode &&
                                        !reorderMode && (
                                            <button
                                                type='button'
                                                className='album-preview-button'
                                                onClick={
                                                    event => {
                                                        event
                                                            .stopPropagation()

                                                        onPreview(
                                                            image
                                                        )
                                                    }
                                                }
                                            >
                                                Preview
                                            </button>
                                        )}

                                    {selectionMode && (
                                        <span
                                            className={[
                                                'album-image-check',

                                                isSelected
                                                    ? 'album-image-check-active'
                                                    : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                            aria-hidden='true'
                                        >
                                            {isSelected && (
                                                <CheckOutlined />
                                            )}
                                        </span>
                                    )}

                                    {reorderMode && (
                                        <>
                                            <span className='absolute left-2 top-2 z-10 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-black/60 px-1.5 text-[11px] font-medium text-white'>
                                                {imageIndex + 1}
                                            </span>

                                            <span className='absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-[15px] text-[#1677ff] shadow'>
                                                <HolderOutlined />
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    }
                )}
            </div>

            <Modal
                open={deleteModalOpen}
                centered
                width={400}
                closable={!deleting}
                maskClosable={!deleting}
                footer={null}
                className='album-delete-modal'
                onCancel={() => {
                    if (!deleting) {
                        setDeleteModalOpen(
                            false
                        )
                    }
                }}
            >
                <div className='album-delete-content'>
                    <div className='album-delete-icon'>
                        <DeleteOutlined />
                    </div>

                    <h3>
                        Delete {selectedCount}{' '}
                        image
                        {selectedCount === 1
                            ? ''
                            : 's'}
                    </h3>

                    <p>
                        Are you sure you want to
                        delete
                        {selectedCount === 1
                            ? ' this image?'
                            : ' these images?'}
                    </p>

                    <div className='album-delete-actions'>
                        <Button
                            block
                            size='large'
                            disabled={deleting}
                            onClick={() =>
                                setDeleteModalOpen(
                                    false
                                )
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            block
                            danger
                            type='primary'
                            size='large'
                            className='album-delete-confirm-btn'
                            loading={deleting}
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                title={`Move from “${group?.nameEn || 'Album'
                    }”`}
                open={moveModalOpen}
                width={440}
                closable={!moving}
                maskClosable={!moving}
                destroyOnHidden
                className='album-move-modal'
                onCancel={closeMoveModal}
                footer={
                    <div className='album-move-footer'>
                        <Button
                            disabled={moving}
                            onClick={closeMoveModal}
                        >
                            Cancel
                        </Button>

                        <Button
                            type='primary'
                            loading={moving}
                            className='album-delete-confirm-btn'
                            disabled={
                                !targetAlbumKey
                            }
                            onClick={confirmMove}
                        >
                            Move Images
                        </Button>
                    </div>
                }
            >
                <div className='album-move-field'>
                    <label>
                        <span>*</span>{' '}
                        Select destination album
                    </label>

                    <Select
                        showSearch
                        allowClear
                        value={targetAlbumKey}
                        placeholder='Select album'
                        optionFilterProp='label'
                        options={
                            destinationOptions
                        }
                        disabled={moving}
                        onChange={
                            setTargetAlbumKey
                        }
                        style={{
                            width: '100%',
                        }}
                    />
                </div>
            </Modal>
        </>
    )
}