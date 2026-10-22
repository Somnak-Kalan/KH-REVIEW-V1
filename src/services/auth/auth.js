import httpCommon from 'utils/http-common'

const login = async (payload) => {
  try {
    const res = await httpCommon.post('/auth/login', {
      username: payload.username,
      password: payload.password,
    })
    if (res?.data?.msg) {
      throw new Error(res.data.msg)
    }
    localStorage.setItem('user_info', JSON.stringify(res.data))
    return res.data // Resolve with user data
  } catch (err) {
    console.error('Login error:', err)
    const errorMessage = err.response?.data || 'An unexpected error occurred'
    throw errorMessage // Reject with error message
  }
}
const logout = () => {
  // eslint-disable-next-line no-undef
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    localStorage.removeItem('user_info')
    localStorage.removeItem('permissions')
    localStorage.removeItem('isAdmin')
    resolve('logout')
  })
}

const AuthService = {
  login,
  logout,
}

export default AuthService
