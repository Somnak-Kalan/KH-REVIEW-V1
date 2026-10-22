import React, {
  useMemo,
  useState,
} from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

import All from './groupTab/all/All'
import Video from './groupTab/video/Video'
import ImagesTab from './groupTab/images/Tabs'
import EditVideo from './updateVideoImage/EditVdieo'
import EditAlbum from './updateVideoImage/EditAlbum'

import './MediaTabs.css'

const normalizeVideos = videoData => {
  if (!Array.isArray(videoData)) {
    return []
  }

  const videos =
    videoData.length === 1 &&
      Array.isArray(videoData[0])
      ? videoData[0]
      : videoData

  return videos.filter(
    item =>
      typeof item === 'string' &&
      item.trim()
  )
}

export default function MediaTabs({
  media,
  getFileByName,
  access_token,
  id,
  getBusinessProperty,
}) {
  const [activeKey, setActiveKey] =
    useState('all')

  const [openVideo, setOpenVideo] =
    useState(false)

  const [openAlbum, setOpenAlbum] =
    useState(false)

  const videos = useMemo(
    () => normalizeVideos(media?.video),
    [media?.video]
  )

  const galleries = useMemo(
    () =>
      Array.isArray(media?.gallery)
        ? media.gallery
        : [],
    [media?.gallery]
  )

  const albumSets = useMemo(
    () =>
      Array.isArray(media?.albumSets)
        ? media.albumSets
        : [],
    [media?.albumSets]
  )

  const tabs = useMemo(
    () => [
      {
        key: 'all',
        label: 'All',
        content: (
          <All
            videos={videos}
            gallery={galleries}
            id={id}
            access_token={access_token}
            getBusinessProperty={
              getBusinessProperty
            }
            getFileByName={getFileByName}
          />
        ),
      },
      {
        key: 'video',
        label: 'Video',
        content: (
          <Video videos={videos} />
        ),
      },
      {
        key: 'images',
        label: 'Images',
        content: (
          <ImagesTab
            galleries={galleries}
            albumSets={albumSets}
            getFileByName={getFileByName}
            id={id}
            access_token={access_token}
          />
        ),
      },
    ],
    [
      videos,
      galleries,
      albumSets,
      id,
      access_token,
      getBusinessProperty,
      getFileByName,
    ]
  )

  const activeContent =
    tabs.find(
      tab => tab.key === activeKey
    )?.content || null

  const renderAction = () => {
    if (activeKey === 'images') {
      return (
        <Button
          type='primary'
          icon={<PlusOutlined />}
          className='media-header-action'
          onClick={() =>
            setOpenAlbum(true)
          }
        >
          Add New Image
        </Button>
      )
    }

    if (activeKey === 'video') {
      return (
        <Button
          type='primary'
          icon={<PlusOutlined />}
          className='media-header-action'
          onClick={() =>
            setOpenVideo(true)
          }
        >
          Add New Video
        </Button>
      )
    }

    return (
      <div className='media-header-actions'>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          className='media-header-action'
          onClick={() =>
            setOpenVideo(true)
          }
        >
          Add New Video
        </Button>

        <Button
          type='primary'
          icon={<PlusOutlined />}
          className='media-header-action'
          onClick={() =>
            setOpenAlbum(true)
          }
        >
          Add New Image
        </Button>
      </div>
    )
  }

  return (
    <>
      <EditAlbum
        open={openAlbum}
        setOpen={setOpenAlbum}
        access_token={access_token}
        id={id}
        getBusinessProperty={
          getBusinessProperty
        }
      />

      <EditVideo
        open={openVideo}
        setOpen={setOpenVideo}
        access_token={access_token}
        getFileByName={getFileByName}
        videos={videos}
        id={id}
        getBusinessProperty={
          getBusinessProperty
        }
      />

      <div className='media-tabs-container ' >
        <div className='media-tabs-header'>
          <div
            className='media-tabs-navigation'
            role='tablist'
            aria-label='Media tabs'
          >
            {tabs.map(tab => {
              const isActive =
                activeKey === tab.key

              return (
                <button
                  key={tab.key}
                  type='button'
                  role='tab'
                  aria-selected={isActive}
                  className={`media-tab-button${isActive
                    ? ' media-tab-button-active'
                    : ''
                    }`}
                  onClick={() =>
                    setActiveKey(tab.key)
                  }
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className='media-tabs-action'>
            {renderAction()}
          </div>
        </div>

        <div
          className='media-tabs-content'
          role='tabpanel'
        >
          {activeContent}
        </div>
      </div>
    </>
  )
}