import Config from './config'

function getFile(path) {
  if (!path) return null
  return path.replace('public', Config.baseURL)
}

function getFileImage(path) {
  if (!path) return null
  return `${Config.baseURLImage}${path}`
}
function getNewFileImage(path) {
  if (!path) return null
  return `${Config.baseURLImage}${path}`
}
function getFileByName(path) {
  if (!path) return null
  return `${Config.baseURLImage}${path}`
}
function getFileByNewUrl(path) {
  if (!path) return null
  return `${Config.newbaseURL}${path}`
}

export default { getFile, getFileImage, getFileByName, getFileByNewUrl, getNewFileImage }
