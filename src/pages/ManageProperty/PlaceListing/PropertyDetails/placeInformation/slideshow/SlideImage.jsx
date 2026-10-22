import React from 'react'
import CoverSlideshow from './CoverSlideShow'

export default function DemoCoverSlideshow(props) {
  const { getFileByName, slideShow, media } = props
  return (
    <div className='mx-2'>
      <CoverSlideshow
        galleries={slideShow}
        media={media}
        getFileByName={getFileByName}
      />
    </div>
  )
}
