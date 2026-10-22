// src/hooks/useCan.js

import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
export default function useCan(...codes) {
  const { username, access_token, checkPermission } = useContext(AuthContext)
  return codes.every((code) => checkPermission(code))
}
