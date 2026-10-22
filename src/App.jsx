import React, { useContext, useEffect, useMemo, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { message } from 'antd'
import { publicRoute, authRoute } from './router/Index'
import './styles/colors.scss'
import './styles/darkModePart1.scss'
import { AuthContext } from './contexts/AuthContext'
// At the very top of your file, BEFORE the App component
const originalAddEventListener = EventTarget.prototype.addEventListener


const App = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const { access_token, setPermissions, setIsAdminFn, setMenuSideBar } =
    useContext(AuthContext)
  const [connection, setConnection] = useState(navigator.onLine)

  const handleOffline = () => {
    setConnection(false)
    messageApi.open({
      key: 'internetStatus',
      type: 'loading',
      content: <b style={{ color: 'red' }}>Error: No internet connection!</b>,
      duration: 0,
    })
  }

  const handleOnline = () => {
    setConnection(true)
    messageApi.open({
      key: 'internetStatus',
      type: 'success',
      content: <b>Internet connected!</b>,
      duration: 2,
    })
  }

  useEffect(() => {
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [connection])

  //  Create the router once (prevents re-creating routes on every render)
  // This also avoids edge-cases where React Router can temporarily render
  // its default error boundary during rapid re-mounts.
  const router = useMemo(
    () => createBrowserRouter([...publicRoute(), ...authRoute()]),
    []
  )

  return (
    <React.Fragment>
      {contextHolder}
      <RouterProvider router={router} />
    </React.Fragment>
  )
}

export default App
