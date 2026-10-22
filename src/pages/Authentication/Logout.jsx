import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
//
import AuthService from 'services/auth/auth'
import { AuthContext } from 'contexts/AuthContext'
//
//
const Logout = () => {
  const { removeToken } = useContext(AuthContext)
  //
  const navigate = useNavigate()
  //
  useEffect(() => {
    removeToken()
    navigate('/login')
    AuthService.logout()
    localStorage.removeItem('markedComments')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

export default Logout
