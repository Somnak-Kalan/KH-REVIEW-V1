import { useState } from 'react'

// Function to safely truncate text to a specified length
const safeTruncate = (text, length) => {
  if (!text || text.length <= length) return text
  const truncated = text.slice(0, length)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  return truncated.slice(0, lastSpaceIndex) + '...'
}

// Function to break text into segments of 70 characters
const breakText = (text) => {
  if (!text) return ''
  const segments = []
  while (text.length > 0) {
    segments.push(text.substring(0, 70))
    text = text.substring(70)
  }
  return segments.join('<br/>')
}

const ReadMore = ({ text = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const toggleReadMore = () => {
    setIsExpanded(!isExpanded)
  }

  const limit = 70

  // Truncate text if it exceeds the limit
  const truncatedText = safeTruncate(text, limit)
  const displayText = isExpanded ? text : truncatedText

  // Break text into segments
  const brokenText = breakText(text)

  // Determine if the text contains Khmer characters
  const containsKhmer =
    /[\u1780-\u17FF]/.test(brokenText) ||
    /[\u1780-\u17FF]/.test(text?.substring(0, 70))

  return (
    <span>
      <span
        style={{
          fontFamily: containsKhmer ? 'Kh Battambang' : '',
        }}
        dangerouslySetInnerHTML={{
          __html: isExpanded
            ? brokenText
            : `${
                text?.substring(0, 70) !== undefined
                  ? text?.substring(0, 70)
                  : ''
              }`,
        }}
      />
      {text && text.length > 70 && (
        <span
          onClick={toggleReadMore}
          style={{ color: 'blue', cursor: 'pointer', marginLeft: '5px' }}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </span>
      )}
    </span>
  )
}

export default ReadMore
