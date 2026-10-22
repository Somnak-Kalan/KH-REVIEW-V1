import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '@/contexts/AuthContext'

export default function RootRedirect() {
  const { access_token } = useContext(AuthContext)

  const token =
    access_token ||
    localStorage.getItem('token') ||
    ''

  return (
    <Navigate
      to={token ? '/dashboard' : '/login'}
      replace
    />
  )
}