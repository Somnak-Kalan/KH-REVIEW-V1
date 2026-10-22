

/**
 * Converts a Data URL (base64) to a Blob object.
 * This is useful because many browser APIs prefer Blob or File objects.
 * @param {string} dataurl - The Data URL string (e.g., "data:video/mp4;base64,...").
 * @returns {Blob} - A Blob object.
 */

const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
}

/**
 * Trims a video by recording a segment of it.
 * This will re-encode the video, which can be slow and may result in quality loss.
 * @param {string} videoUrl - Data URL or Blob URL of the video.
 * @param {number} start - Start time in seconds.
 * @param {number} end - End time in seconds.
 * @returns {Promise<string>} - Data URL of the trimmed video.
 */
export const trimVideo = (videoUrl, start, end) => {
    return new Promise((resolve, reject) => {
        const videoElement = document.createElement('video')
        videoElement.src = videoUrl
        videoElement.preload = 'metadata' // Load metadata quickly
        videoElement.muted = true // Mute during processing

        videoElement.onloadedmetadata = () => {
            const duration = videoElement.duration
            const finalStart = Math.max(0, start)
            const finalEnd = Math.min(duration, end)

            if (finalStart >= finalEnd) {
                reject(new Error('Invalid trim range: start time must be less than end time.'))
                return
            }

            videoElement.currentTime = finalStart

            const stream = videoElement.captureStream()
            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8,opus' }) // WebM is widely supported for recording

            const chunks = []
            recorder.ondataavailable = (event) => {
                chunks.push(event.data)
            }

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' })
                resolve(URL.createObjectURL(blob))
                videoElement.remove() // Clean up
            }

            recorder.onerror = (event) => {
                reject(event.error)
                videoElement.remove() // Clean up
            }

            recorder.start()

            videoElement.onseeked = () => {
                // Once we've sought to the start, begin playing and set a timeout to stop recording
                videoElement.play()
                const recordDuration = (finalEnd - finalStart) * 1000 // Convert to milliseconds
                setTimeout(() => {
                    if (recorder.state === 'recording') {
                        recorder.stop()
                    }
                    videoElement.pause()
                }, recordDuration)
            }
        }

        videoElement.onerror = (e) => {
            console.error('Error loading video for trimming:', e)
            reject(new Error('Failed to load video for trimming.'))
            videoElement.remove()
        }
    })
}

/**
 * Extracts a frame from a video at a specific time.
 * @param {string} videoUrl - Data URL or Blob URL of the video.
 * @param {number} time - Time in seconds to extract the frame.
 * @returns {Promise<string>} - Data URL of the extracted image (PNG).
 */
export const extractVideoFrame = (videoUrl, time) => {
    return new Promise((resolve, reject) => {
        const videoElement = document.createElement('video')
        videoElement.src = videoUrl
        videoElement.preload = 'metadata' // Load metadata quickly
        videoElement.crossOrigin = 'anonymous' // Needed if video is from different origin

        videoElement.onloadedmetadata = () => {
            videoElement.currentTime = time
        }

        videoElement.onseeked = () => {
            const canvas = document.createElement('canvas')
            canvas.width = videoElement.videoWidth
            canvas.height = videoElement.videoHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

            try {
                const dataUrl = canvas.toDataURL('image/png')
                resolve(dataUrl)
            } catch (error) {
                reject(
                    new Error(
                        'Failed to convert canvas to data URL. Check for cross-origin issues or unsupported formats.'
                    )
                )
            } finally {
                videoElement.remove() // Clean up
                canvas.remove() // Clean up
            }
        }

        videoElement.onerror = (e) => {
            console.error('Error loading video for frame extraction:', e)
            reject(new Error('Failed to load video for frame extraction.'))
            videoElement.remove()
        }
    })
}

/**
 * Mutes a video permanently by recording it without the audio track.
 * This will re-encode the video.
 * @param {string} videoUrl - Data URL or Blob URL of the video.
 * @returns {Promise<string>} - Data URL of the muted video.
 */
export const muteVideo = (videoUrl) => {
    return new Promise((resolve, reject) => {
        const videoElement = document.createElement('video')
        videoElement.src = videoUrl
        videoElement.preload = 'metadata' // Load metadata quickly
        videoElement.muted = true // Ensure it's muted during capture
        videoElement.play() // Start playing to capture stream

        videoElement.onloadedmetadata = () => {
            // Get the video track, but no audio track
            const videoTrack = videoElement.captureStream().getVideoTracks()[0]
            if (!videoTrack) {
                reject(new Error('No video track found to mute.'))
                videoElement.remove()
                return
            }

            const newStream = new MediaStream([videoTrack])
            const recorder = new MediaRecorder(newStream, { mimeType: 'video/webm; codecs=vp8' }) // Only video codec

            const chunks = []
            recorder.ondataavailable = (event) => {
                chunks.push(event.data)
            }

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' })
                resolve(URL.createObjectURL(blob))
                videoElement.remove() // Clean up
            }

            recorder.onerror = (event) => {
                reject(event.error)
                videoElement.remove() // Clean up
            }

            recorder.start(100) // Start recording, collect data every 100ms
            setTimeout(() => {
                if (recorder.state === 'recording') {
                    recorder.stop()
                }
                videoElement.pause()
            }, videoElement.duration * 1000) // Stop recording after full duration
        }

        videoElement.onerror = (e) => {
            console.error('Error loading video for muting:', e)
            reject(new Error('Failed to load video for muting.'))
            videoElement.remove()
        }
    })
}
