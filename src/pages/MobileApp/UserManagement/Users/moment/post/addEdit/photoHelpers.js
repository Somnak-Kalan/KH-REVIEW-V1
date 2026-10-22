// post/addEdit/photoHelpers.js

// -----------------------------
// helpers
// -----------------------------
export const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
    })

export const dataURLtoFile = async (dataUrl, filename) => {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return new File([blob], filename, { type: blob.type || 'image/jpeg' })
}

export const urlToObjectUrl = async (url) => {
    const bust = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`
    const res = await fetch(bust, {
        mode: 'cors',
        cache: 'no-store',
        credentials: 'omit',
    })
    if (!res.ok) throw new Error('Failed to fetch image for crop')
    const blob = await res.blob()
    return URL.createObjectURL(blob)
}

// ensure only FIRST item is cover
export const normalizeCover = (list) => {
    const arr = Array.isArray(list) ? [...list] : []
    if (arr.length === 0) return arr
    const firstUid = arr[0]?.uid
    return arr.map((f) => ({ ...f, isCover: f.uid === firstUid }))
}

// crop to dataURL using NATURAL pixel crop (no scaling inside)
export const cropToDataUrlNatural = async (imageEl, pixelCrop) => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(pixelCrop.width))
    canvas.height = Math.max(1, Math.round(pixelCrop.height))

    const ctx = canvas.getContext('2d')
    ctx.drawImage(
        imageEl,
        Math.round(pixelCrop.x),
        Math.round(pixelCrop.y),
        Math.round(pixelCrop.width),
        Math.round(pixelCrop.height),
        0,
        0,
        Math.round(pixelCrop.width),
        Math.round(pixelCrop.height)
    )

    return canvas.toDataURL('image/jpeg', 0.92)
}

export const getRatioFromAspect = (aspectRatio) => {
    switch (aspectRatio) {
        case 'aspect-[4/3]':
            return 4 / 3
        case 'aspect-square':
            return 1
        case 'aspect-[3/4]':
            return 3 / 4
        default:
            return 4 / 3
    }
}

// clamp
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n))
