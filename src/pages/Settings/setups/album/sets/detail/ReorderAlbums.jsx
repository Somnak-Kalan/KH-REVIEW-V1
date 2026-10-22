import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Button,
  Modal,
  Table,
  message,
} from 'antd'
import {
  HolderOutlined,
} from '@ant-design/icons'

import useAlbumSetStore from '../../../../../../Stores/settings/setups/AlbumSet'

const DragContext =
  createContext(null)

const AUTO_SCROLL_EDGE = 70
const AUTO_SCROLL_SPEED = 12

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  )
}

const getAlbumId = album => {
  if (!album) return null

  if (typeof album === 'string') {
    return album
  }

  return (
    album?._id ||
    album?.id ||
    album?.albumId ||
    null
  )
}

const moveArrayItem = (
  currentItems,
  fromIndex,
  toIndex
) => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex === toIndex
  ) {
    return currentItems
  }

  const nextItems = [
    ...currentItems,
  ]

  const [movedItem] =
    nextItems.splice(
      fromIndex,
      1
    )

  nextItems.splice(
    toIndex,
    0,
    movedItem
  )

  return nextItems
}

const DragHandle = ({
  disabled,
}) => {
  return (
    <span
      draggable={false}
      className={[
        'inline-flex h-7 w-7',
        'items-center justify-center',
        'rounded',
        'select-none',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'cursor-grab active:cursor-grabbing',
      ].join(' ')}
    >
      <HolderOutlined />
    </span>
  )
}

const DraggableRow = props => {
  const dragContext =
    useContext(DragContext)

  const rowId =
    String(
      props['data-row-key'] ||
      ''
    )

  const disabled =
    Boolean(
      dragContext?.disabled
    )

  const isDragging =
    dragContext?.draggedId ===
    rowId

  const isDragOver =
    Boolean(
      dragContext?.dragOverId ===
      rowId &&
      dragContext?.draggedId !==
      rowId
    )

  const style = {
    ...props.style,

    cursor:
      disabled
        ? 'default'
        : 'grab',

    opacity:
      isDragging
        ? 0.4
        : 1,

    transition:
      [
        'opacity 0.15s ease',
        'background-color 0.15s ease',
        'outline-color 0.15s ease',
      ].join(', '),

    ...(isDragging
      ? {
        background:
          'rgba(22, 119, 255, 0.05)',
      }
      : {}),

    ...(isDragOver
      ? {
        outline:
          '2px dashed #1677ff',

        outlineOffset:
          '-2px',

        background:
          'rgba(22, 119, 255, 0.1)',
      }
      : {}),
  }

  const handleDragStart =
    event => {
      if (
        disabled ||
        !rowId
      ) {
        event.preventDefault()
        return
      }

      dragContext?.onDragStart?.(
        event,
        rowId
      )
    }

  const handleDragOver =
    event => {
      if (
        disabled ||
        !rowId
      ) {
        return
      }

      dragContext?.onDragOver?.(
        event,
        rowId
      )
    }

  const handleDrop =
    event => {
      if (
        disabled ||
        !rowId
      ) {
        return
      }

      dragContext?.onDrop?.(
        event,
        rowId
      )
    }

  const handleDragEnd =
    event => {
      dragContext?.onDragEnd?.(
        event
      )
    }

  return (
    <tr
      {...props}
      draggable={!disabled}
      style={style}
      onDragStart={
        handleDragStart
      }
      onDragOver={
        handleDragOver
      }
      onDrop={
        handleDrop
      }
      onDragEnd={
        handleDragEnd
      }
    />
  )
}

const ReorderAlbums = ({
  open,
  setOpen,
  accessToken,
  setDetail,
  onUpdated,
}) => {
  const updateSet =
    useAlbumSetStore(
      state =>
        state.updateSet
    )

  const updating =
    useAlbumSetStore(
      state =>
        state.updating
    )

  const tableWrapperRef =
    useRef(null)

  const draggedIdRef =
    useRef(null)

  const lastDragOverIdRef =
    useRef(null)

  const autoScrollFrameRef =
    useRef(null)

  const autoScrollDirectionRef =
    useRef(0)

  const [
    items,
    setItems,
  ] = useState([])

  const [
    draggedId,
    setDraggedId,
  ] = useState(null)

  const [
    dragOverId,
    setDragOverId,
  ] = useState(null)

  const getScrollContainer = () => {
    return (
      tableWrapperRef.current
        ?.querySelector(
          '.ant-table-body'
        ) ||
      null
    )
  }

  const stopAutoScroll = () => {
    autoScrollDirectionRef.current =
      0

    if (
      autoScrollFrameRef.current
    ) {
      cancelAnimationFrame(
        autoScrollFrameRef.current
      )

      autoScrollFrameRef.current =
        null
    }
  }

  const startAutoScroll =
    direction => {
      autoScrollDirectionRef.current =
        direction

      if (
        autoScrollFrameRef.current
      ) {
        return
      }

      const scrollStep = () => {
        const scrollContainer =
          getScrollContainer()

        const scrollDirection =
          autoScrollDirectionRef
            .current

        if (
          !scrollContainer ||
          scrollDirection === 0
        ) {
          autoScrollFrameRef.current =
            null

          return
        }

        scrollContainer.scrollTop +=
          scrollDirection *
          AUTO_SCROLL_SPEED

        autoScrollFrameRef.current =
          requestAnimationFrame(
            scrollStep
          )
      }

      autoScrollFrameRef.current =
        requestAnimationFrame(
          scrollStep
        )
    }

  const handleAutoScroll =
    event => {
      const scrollContainer =
        getScrollContainer()

      if (!scrollContainer) {
        stopAutoScroll()
        return
      }

      const rect =
        scrollContainer
          .getBoundingClientRect()

      const mouseY =
        event.clientY

      const isNearTop =
        mouseY <
        rect.top +
        AUTO_SCROLL_EDGE

      const isNearBottom =
        mouseY >
        rect.bottom -
        AUTO_SCROLL_EDGE

      const canScrollUp =
        scrollContainer.scrollTop >
        0

      const canScrollDown =
        scrollContainer.scrollTop +
        scrollContainer.clientHeight <
        scrollContainer.scrollHeight -
        1

      if (
        isNearTop &&
        canScrollUp
      ) {
        startAutoScroll(-1)
        return
      }

      if (
        isNearBottom &&
        canScrollDown
      ) {
        startAutoScroll(1)
        return
      }

      stopAutoScroll()
    }

  const resetDragState = () => {
    stopAutoScroll()

    draggedIdRef.current =
      null

    lastDragOverIdRef.current =
      null

    setDraggedId(null)
    setDragOverId(null)
  }

  useEffect(() => {
    if (!open) {
      setItems([])
      resetDragState()
      return
    }

    const currentAlbums =
      Array.isArray(
        setDetail?.albums
      )
        ? setDetail.albums
        : []

    setItems([
      ...currentAlbums,
    ])

    resetDragState()
  }, [
    open,
    setDetail?.albums,
  ])

  useEffect(() => {
    return () => {
      stopAutoScroll()
    }
  }, [])

  const handleDragStart = (
    event,
    rowId
  ) => {
    if (
      updating ||
      !rowId
    ) {
      event.preventDefault()
      return
    }

    draggedIdRef.current =
      rowId

    lastDragOverIdRef.current =
      null

    setDraggedId(rowId)
    setDragOverId(null)

    event.dataTransfer.effectAllowed =
      'move'

    event.dataTransfer.setData(
      'text/plain',
      rowId
    )
  }

  const handleDragOver = (
    event,
    targetId
  ) => {
    event.preventDefault()

    if (updating) {
      return
    }

    event.dataTransfer.dropEffect =
      'move'

    handleAutoScroll(event)

    const sourceId =
      draggedIdRef.current ||
      event.dataTransfer.getData(
        'text/plain'
      )

    if (
      !sourceId ||
      !targetId ||
      sourceId === targetId
    ) {
      setDragOverId(null)
      return
    }

    setDragOverId(targetId)

    /*
     * Prevent the item from moving
     * repeatedly while the mouse is
     * still over the same row.
     */
    if (
      lastDragOverIdRef.current ===
      targetId
    ) {
      return
    }

    lastDragOverIdRef.current =
      targetId

    setItems(currentItems => {
      const fromIndex =
        currentItems.findIndex(
          item =>
            String(
              getAlbumId(item)
            ) ===
            String(sourceId)
        )

      const toIndex =
        currentItems.findIndex(
          item =>
            String(
              getAlbumId(item)
            ) ===
            String(targetId)
        )

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex === toIndex
      ) {
        return currentItems
      }

      return moveArrayItem(
        currentItems,
        fromIndex,
        toIndex
      )
    })
  }

  const handleDrop = (
    event,
    targetId
  ) => {
    event.preventDefault()

    if (updating) {
      resetDragState()
      return
    }

    const sourceId =
      draggedIdRef.current ||
      event.dataTransfer.getData(
        'text/plain'
      )

    /*
     * The array was already reordered
     * during onDragOver.
     *
     * This fallback handles a direct
     * drop where onDragOver did not
     * reorder the item.
     */
    if (
      sourceId &&
      targetId &&
      sourceId !== targetId &&
      lastDragOverIdRef.current !==
      targetId
    ) {
      setItems(currentItems => {
        const fromIndex =
          currentItems.findIndex(
            item =>
              String(
                getAlbumId(item)
              ) ===
              String(sourceId)
          )

        const toIndex =
          currentItems.findIndex(
            item =>
              String(
                getAlbumId(item)
              ) ===
              String(targetId)
          )

        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex === toIndex
        ) {
          return currentItems
        }

        return moveArrayItem(
          currentItems,
          fromIndex,
          toIndex
        )
      })
    }

    resetDragState()
  }

  const handleDragEnd = () => {
    resetDragState()
  }

  const handleCancel = () => {
    if (updating) return

    resetDragState()
    setOpen(false)
  }

  const handleSave = async () => {
    if (!setDetail?._id) {
      message.error(
        'Album set ID was not found.'
      )

      return
    }

    try {
      const albumIds =
        items
          .map(getAlbumId)
          .filter(Boolean)

      const updatedSet =
        await updateSet({
          access_token:
            accessToken,

          doc: {
            _id:
              setDetail._id,

            nameEn:
              setDetail.nameEn,

            nameKh:
              setDetail.nameKh ||
              '',

            /*
             * Send the complete ordered
             * album ID array.
             */
            albums:
              albumIds,
          },
        })

      if (
        typeof onUpdated ===
        'function'
      ) {
        onUpdated(
          updatedSet
        )
      }

      message.success(
        'Album order saved successfully.'
      )

      resetDragState()
      setOpen(false)
    } catch (error) {
      console.error(error)

      message.error(
        getErrorMessage(
          error,
          'Could not save the album order.'
        )
      )
    }
  }

  const columns =
    useMemo(
      () => [
        {
          title: 'No',
          width: 60,
          align: 'center',

          render: (
            _,
            __,
            index
          ) => index + 1,
        },
        {
          title: '',
          key: 'drag',
          width: 55,
          align: 'center',

          render: () => (
            <DragHandle
              disabled={
                updating
              }
            />
          ),
        },
        {
          title:
            'Album Name',

          dataIndex:
            'nameEn',

          key: 'nameEn',

          render: (
            _,
            record
          ) => (
            <div className='leading-tight'>
              <div className='font-semibold text-blue-800 dark:text-slate-300'>
                {record?.nameEn ||
                  '-'}
              </div>

              <div className='mt-1 text-xs font-medium text-gray-500'>
                {record?.nameKh ||
                  ''}
              </div>
            </div>
          ),
        },
      ],
      [
        updating,
      ]
    )

  const dragContextValue =
    useMemo(
      () => ({
        disabled:
          updating,

        draggedId,
        dragOverId,

        onDragStart:
          handleDragStart,

        onDragOver:
          handleDragOver,

        onDrop:
          handleDrop,

        onDragEnd:
          handleDragEnd,
      }),
      [
        updating,
        draggedId,
        dragOverId,
      ]
    )

  return (
    <Modal
      title='Reorder Albums'
      open={open}
      onCancel={
        handleCancel
      }
      width={720}
      destroyOnClose
      maskClosable={
        !updating
      }
      keyboard={
        !updating
      }
      footer={[
        <Button
          key='cancel'
          disabled={
            updating
          }
          onClick={
            handleCancel
          }
        >
          Cancel
        </Button>,

        <Button
          key='save'
          type='primary'
          loading={
            updating
          }
          disabled={
            items.length === 0
          }
          onClick={
            handleSave
          }
        >
          Save Order
        </Button>,
      ]}
    >
      <p className='mb-3 text-sm text-gray-500'>
        Drag an album up or down.
        The list automatically
        scrolls when the cursor is
        near the top or bottom.
      </p>

      <DragContext.Provider
        value={
          dragContextValue
        }
      >
        <div
          ref={
            tableWrapperRef
          }
        >
          <Table
            rowKey={record =>
              String(
                getAlbumId(
                  record
                )
              )
            }
            components={{
              body: {
                row:
                  DraggableRow,
              },
            }}
            columns={columns}
            dataSource={items}
            size='small'

            /*
             * Do not use pagination for
             * ordering. Every album must
             * remain in the same ordered
             * array.
             */
            pagination={false}

            /*
             * Keep a fixed scroll area.
             * Auto-scroll works inside
             * this table body.
             */
            scroll={{
              y: 460,
            }}

            rowClassName={record => {
              const rowId =
                String(
                  getAlbumId(
                    record
                  )
                )

              if (
                draggedId ===
                rowId
              ) {
                return 'album-dragging-row'
              }

              if (
                dragOverId ===
                rowId
              ) {
                return 'album-drag-over-row'
              }

              return ''
            }}
          />
        </div>
      </DragContext.Provider>
    </Modal>
  )
}

export default ReorderAlbums