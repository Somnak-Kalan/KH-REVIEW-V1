import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'
const loadAdministratorPage = () =>
  import('../../pages/Administrator/AdministratorTab')

const loadAddModule = () =>
  import('../../pages/Administrator/Modules/AddModule')

const loadViewRole = () =>
  import('../../pages/Administrator/roles/Edit/UpdateRole')

const loadUpdateModule = () =>
  import('../../pages/Administrator/Modules/UpdateModule')

const loadAddUser = () =>
  import('../../pages/Administrator/users/AddUser')

const loadAddRole = () =>
  import('../../pages/Administrator/roles/AddRole')

const loadUpdateRole = () =>
  import('../../pages/Administrator/roles/Edit/UpdateRole')

// Children administrator
const loadUserInfo = () =>
  import('../../pages/Administrator/users/view/UserInfor')

const loadRoles = () =>
  import('../../pages/Administrator/roles/RoleList')

const loadModuleUser = () =>
  import('../../pages/Administrator/ModuleUser/ModuleUser')

const loadModules = () =>
  import('../../pages/Administrator/Modules/Modules')
const loadSuperAdmin = () =>
  import('../../pages/Administrator/superAdmin/SuperAdmin')

// Keep React.lazy() for code splitting.
const AdministratorPage = React.lazy(loadAdministratorPage)
const AddModule = React.lazy(loadAddModule)
const ViewRole = React.lazy(loadViewRole)
const UpdateModule = React.lazy(loadUpdateModule)
const AddUser = React.lazy(loadAddUser)
const AddRole = React.lazy(loadAddRole)
const UpdateRole = React.lazy(loadUpdateRole)

// Children administrator
const UserInfo = React.lazy(loadUserInfo)
const Roles = React.lazy(loadRoles)
const ModuleUser = React.lazy(loadModuleUser)
const Modules = React.lazy(loadModules)
const SupperADmin = React.lazy(loadSuperAdmin)

// Quietly preload administrator route files after the main page loads.
// Your initial bundle remains smaller, but later navigation becomes smoother.
const preloadAdministratorRoutes = () => {
  void Promise.allSettled([
    loadAdministratorPage(),
    loadAddModule(),
    loadViewRole(),
    loadUpdateModule(),
    loadAddUser(),
    loadAddRole(),
    loadUpdateRole(),
    loadUserInfo(),
    loadRoles(),
    loadModuleUser(),
    loadModules(),
  ])
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadAdministratorRoutes, {
      timeout: 1500,
    })
  } else {
    window.setTimeout(preloadAdministratorRoutes, 300)
  }
}

// Avoid showing a loader for very fast lazy imports.
// This prevents the camera-like flash.
const DelayedRouteFallback = () => {
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowLoader(true)
    }, 250)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="min-h-[180px] flex items-center justify-center">
      {showLoader ? <Spin size="large" /> : null}
    </div>
  )
}

const withDelayedFallback = (element) => {
  return (
    <Suspense fallback={<DelayedRouteFallback />}>
      {element}
    </Suspense>
  )
}

const AdministratorRoutes = () => {
  const routes = [
    {
      path: '/administrator',
      element: withDelayedFallback(<AdministratorPage />),
      children: [
        {
          path: 'user',
          element: withDelayedFallback(<UserInfo />),
        },
        {
          path: 'role',
          element: withDelayedFallback(<Roles />),
        },
        {
          path: 'module',
          element: withDelayedFallback(<Modules />),
        },
        {
          path: 'supperAdmin',
          element: withDelayedFallback(<SupperADmin />),
        },
        {
          path: 'module-user',
          element: withDelayedFallback(<ModuleUser />),
        },
      ],
    },
    {
      path: '/administrator/user/form',
      element: withDelayedFallback(<AddUser />),
    },
    {
      path: '/administrator/module/form',
      element: withDelayedFallback(<AddModule />),
    },
    {
      path: '/administrator/module/form/:id',
      element: withDelayedFallback(<UpdateModule />),
    },
    {
      path: '/view-role',
      element: withDelayedFallback(<ViewRole />),
    },
    {
      path: '/administrator/role/form',
      element: withDelayedFallback(<AddRole />),
    },
    {
      path: '/administrator/role/form/:id',
      element: withDelayedFallback(<UpdateRole />),
    },
  ]

  return routes
}

export default AdministratorRoutes
