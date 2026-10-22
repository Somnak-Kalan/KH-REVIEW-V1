// utils/extension.js
export function getExtensionData(messageType, timeout = 2000) {
    return new Promise((resolve) => {
        if (!window.chrome || !chrome.runtime) return resolve(null)

        try {
            let resolved = false
            chrome.runtime.sendMessage({ type: messageType }, (response) => {
                if (chrome.runtime.lastError) {
                    // ignore errors like "port closed due to bfcache"
                    resolve(null)
                    return
                }
                if (!resolved) {
                    resolved = true
                    resolve(response)
                }
            })

            setTimeout(() => {
                if (!resolved) resolve(null)
            }, timeout)
        } catch (err) {
            resolve(null)
        }
    })
}
