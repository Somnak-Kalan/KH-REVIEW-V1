import axios from 'axios'
import Config from './config'

const httpCommon = axios.create({
  baseURL: Config.baseURL,

  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 60000,
})

// =========================================================
// REQUEST
// =========================================================

httpCommon.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token')

    if (token) {
      config.headers =
        config.headers || {}

      config.headers.Authorization =
        `Bearer ${token}`
    }

    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)

// =========================================================
// RESPONSE
// =========================================================

httpCommon.interceptors.response.use(
  (response) => {
    return response
  },

  (error) => {
    const status =
      error?.response?.status

    const pathname =
      window.location.pathname || ''

    const isWebViewPage =
      pathname.startsWith('/webview')

    const isLoginPage =
      pathname === '/login'

    const isLogoutPage =
      pathname === '/logout'

    // Don't automatically remove token here yet.
    //
    // Your current backend does not appear to have
    // a working refresh-token flow, so we should not
    // automatically log the user out on every 401.

    /*
    if (status === 401) {
      if (
        isWebViewPage ||
        isLoginPage ||
        isLogoutPage
      ) {
        return Promise.reject(error)
      }

      localStorage.removeItem('token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('permissions')
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('menu_sidebar')

      window.location.href = '/login'
    }
    */

    return Promise.reject(error)
  }
)

export default httpCommon