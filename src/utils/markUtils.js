// utils/markUtils.js

export const getMarkedComments = (userId) => {
  const userKey = `markedComments_${userId}`
  return JSON.parse(localStorage.getItem(userKey)) || []
}

export const setMarkedComments = (userId, ids) => {
  const userKey = `markedComments_${userId}`
  localStorage.setItem(userKey, JSON.stringify(ids))
}

export const clearMarkedComments = (userId) => {
  const userKey = `markedComments_${userId}`
  localStorage.removeItem(userKey)
}
