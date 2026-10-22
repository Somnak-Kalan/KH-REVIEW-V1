// Notification.jsx
import React from 'react'
import { notification } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

export const openNotification = () => {
  let interval
  notification.open({
    message: (
      <>
        <CheckCircleOutlined style={{ color: '#0E9F6E' }} className='mx-1' />
        <span style={{ color: '#0E9F6E' }} className='mx-1'>
          Success!
        </span>
      </>
    ),
    duration: 2, // Closes after 2 seconds
    style: {
      backgroundColor: 'white',
      color: '#0E9F6E',
      width: '300px',
      position: 'relative',
      padding: 4,
      borderRadius: '5px',
      transition: 'all 1s ease-out',
    },
    onClose: () => clearInterval(interval),
    closable: false,
    className: 'custom-notification',
  })

  // Wait for the notification to be rendered before appending the progress bar
  setTimeout(() => {
    const notificationElement = document.querySelector(
      '.ant-notification-notice'
    )
    if (notificationElement) {
      const progressBar = document.createElement('div')
      progressBar.id = 'bottom-border-progress'
      progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 4px;
        width: 0%;
        background-color: #0E9F6E;
      `
      notificationElement.appendChild(progressBar)

      // Smooth progress using requestAnimationFrame
      let startTime = null
      const duration = 2000 // Duration of the progress (in milliseconds)
      const updateProgress = (timestamp) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min(
          ((timestamp - startTime) / duration) * 100,
          100
        )
        progressBar.style.width = `${progress}%`

        if (progress < 100) {
          requestAnimationFrame(updateProgress)
        }
      }

      requestAnimationFrame(updateProgress) // Start the animation
    }
  }, 2)
}
