import React from 'react'
import AlbumTabs from './AlbumTabs'

export default function ImagesTab({
  galleries = [],
  albumSets = [],
  getFileByName,
  id,
  access_token,
}) {
  return (
    <div style={{ padding: 4 }}>
      <AlbumTabs
        galleries={
          Array.isArray(galleries)
            ? galleries
            : []
        }
        albumSets={
          Array.isArray(albumSets)
            ? albumSets
            : []
        }
        id={id}
        access_token={access_token}
        getFileByName={getFileByName}
      />
    </div>
  )
}