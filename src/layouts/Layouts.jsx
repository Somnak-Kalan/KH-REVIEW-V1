import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react'
import {
  Layout,
  Button,
  Avatar,
  Dropdown,
  Grid,
  Image,
  Space,
  Drawer,
  Popover,
  Divider,
  Menu,
} from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DownOutlined,
  PoweroffOutlined,
  SettingOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from 'contexts/AuthContext'
import vtsLogo from '../assets/logo/Newkhlogo.png'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { NotifyContext } from '../contexts/NotifyContext'
import './Layouts.scss'
import { Footer } from 'antd/es/layout/layout'
// NEW: useMenuSideBar hook (replaces GetMenuSideBar function)
import useMenuSideBar from './GetMenuSideBar'

const { useBreakpoint } = Grid
const { Header, Sider, Content } = Layout

const Layouts = () => {
  const screens = useBreakpoint()
  const navigate = useNavigate()
  const location = useLocation()

  // Drawer only below this width
  const DRAWER_BREAKPOINT = 800

  const [isDrawerMode, setIsDrawerMode] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= DRAWER_BREAKPOINT : false
  )

  useEffect(() => {
    const onResize = () => setIsDrawerMode(window.innerWidth <= DRAWER_BREAKPOINT)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // const [collapsed, setCollapsed] = useState(!screens.lg)
  // const [collapsed, setCollapsed] = useState(true)
  // const [smallScreen, setSmallScreen] = useState(true)
  const getInitialCollapsed = () => {
    if (typeof window === 'undefined') return true
    return window.innerWidth < 992
  }

  const [collapsed, setCollapsed] = useState(getInitialCollapsed)

  const { count, setCount } = useContext(NotifyContext)
  const [displayEmitContent, setDisplayEmitContent] = useState()

  // do not auto-open drawer
  const [drawerVisible, setDrawerVisible] = useState(false)

  // ----------------------------
  // Dark / Light mode
  // ----------------------------
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('theme-mode') || 'light'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('theme-mode', themeMode)

    document.documentElement.setAttribute('data-theme', themeMode)
    document.documentElement.classList.toggle('dark', themeMode === 'dark')
    document.body.classList.toggle('dark-mode', themeMode === 'dark')
    document.body.classList.toggle('light-mode', themeMode !== 'dark')
  }, [themeMode])

  const isDark = themeMode === 'dark'
  const toggleTheme = () => setThemeMode((m) => (m === 'dark' ? 'light' : 'dark'))

  const themeStyles = useMemo(() => {
    if (!isDark) {
      return {
        appBg: '#f5f5f5',
        headerBg: isDrawerMode ? '' : 'white',
        cardBg: 'white',
        text: '#111827',
        siderBg: '#001529',
        footerBg: '#f3f4f6',
        footerText: '#4b5563',
        divider: 'rgba(0,0,0,0.06)',
      }
    }
    return {
      appBg: '#0b1220',
      headerBg: '#0f172a',
      cardBg: '#0f172a',
      text: '#e5e7eb',
      siderBg: '',
      footerBg: '#0b1220',
      footerText: '#cbd5e1',
      divider: 'rgba(255,255,255,0.12)',
    }
  }, [isDark, isDrawerMode])
  useEffect(() => {
    if (!isDrawerMode) {
      setDrawerVisible(false)
    } else {
      setCollapsed(true)
    }
  }, [isDrawerMode])
  const { user } = useContext(AuthContext)
  const getSelectedMenuKey = (pathname) => {
    if (pathname === '/theme' || pathname.startsWith('/theme/')) {
      return '/theme'
    }

    if (pathname === '/general' || pathname.startsWith('/general/')) {
      return '/general/moment'
    }

    return pathname
  }
  const [activeKey, setActiveKey] = useState(() =>
    getSelectedMenuKey(location.pathname)
  )

  useEffect(() => {
    setActiveKey(getSelectedMenuKey(location.pathname))
  }, [location.pathname])

  const selectedKeys = useMemo(() => [activeKey], [activeKey])

  const [openKeys, setOpenKeys] = useState([])
  const [openDrawKeys, setOpenDrawKeys] = useState([])

  const onOpenChange = useCallback((keys) => {
    const arr = Array.isArray(keys) ? keys : []
    const latest = arr.length ? arr[arr.length - 1] : ''
    setOpenKeys(latest ? [latest] : [])
  }, [])

  const HandleDrawChange = useCallback((keys) => {
    const arr = Array.isArray(keys) ? keys : []
    const latest = arr.length ? arr[arr.length - 1] : ''
    setOpenDrawKeys(latest ? [latest] : [])
  }, [])

  const handleNavigate = useCallback(
    (key) => {
      const path = key.startsWith('/') ? key : `/${key}`

      setActiveKey(getSelectedMenuKey(path))

      if (location.pathname !== path) {
        navigate(path)
      }
    },
    [location.pathname, navigate]
  )

  // IMPORTANT: use hook at top-level (NOT inside useMemo)
  const siderItems = useMenuSideBar(collapsed)
  const drawerItems = useMenuSideBar(false)

  const itemsProfile = useMemo(
    () => [
      {
        key: 'profile/info',
        label: (
          <Button
            style={{ color: 'black', padding: 0, margin: 0 }}
            size="small"
            type="link"
            icon={<UserOutlined />}
          >
            <span className="text-gray-600 font-medium">{user?.username}</span>
          </Button>
        ),
        disabled: false,
      },
      { type: 'divider' },
      {
        key: 'version',
        label: (
          <div className='flex flex-col items-start leading-tight'>
            <span className='text-sm font-medium text-gray-600'>
              Version 1.0.0.0
            </span>
            <span className='mt-1 text-[10px] font-normal text-gray-400'>
              Sub-version 1.0.0.3
            </span>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' },
      {
        key: 'administrator',
        label: <span className="text-gray-600 font-medium">Administrator</span>,
        disabled: false,
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: (
          <Button
            onClick={() => navigate('/logout')}
            style={{ color: 'black', padding: 0, margin: 0 }}
            size="small"
            type="link"
            icon={<PoweroffOutlined style={{ color: 'red' }} />}
          >
            <span className="text-gray-600 font-medium">Logout</span>
          </Button>
        ),
      },
    ],
    [navigate, user?.username]
  )

  const itemsDrawer = useMemo(
    () => [
      { key: 'administrator', label: 'Administrator' },
      { key: 'profile/info', label: 'Profile' },
    ],
    []
  )
  return (
    // <Layout
    //   className={`h-screen ${collapsed ? 'collapsed' : ''}`}
    //   style={{
    //     position: 'fixed',
    //     top: 0,
    //     bottom: 0,
    //     left: 0,
    //     right: 0,
    //     height: '100dvh',
    //     minHeight: 0,
    //     overflow: 'hidden',
    //     background: themeStyles.appBg,
    //     color: themeStyles.text,
    //   }}
    // >
    <Layout
      className={
        collapsed
          ? 'collapsed'
          : ''
      }
      style={{
        width: '100%',
        height: '100dvh',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',

        background:
          themeStyles.appBg,

        color:
          themeStyles.text,
      }}
    >
      {/* drawer */}
      <div className="md:hidden" style={{ display: isDrawerMode ? 'block' : 'none' }}>
        <Drawer
          classNames="custom-drawer"
          style={{
            padding: 0,
            width: '62%',
            background: themeStyles.siderBg,
          }}
          footer={
            <div
              style={{
                borderBottom: `solid 1px ${isDark ? themeStyles.divider : 'white'}`,
                borderBottomLeftRadius: '5px',
                borderBottomRightRadius: '5px',
              }}
            >
              <Popover
                content={
                  <div className="text-center">
                    {itemsDrawer?.map((item, index) => (
                      <div key={index}>
                        <Divider style={{ margin: 0, padding: '1px' }} />
                        <Button
                          onClick={() => {
                            navigate(`/${item.key}`)
                            setDrawerVisible(false)
                          }}
                          type="text"
                          style={{ color: isDark ? themeStyles.text : undefined }}
                        >
                          {item.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                }
                title=" "
                trigger="click"
              >
                <button
                  className="cursor-pointer text-white py-2 mx-8"
                  style={{ color: isDark ? themeStyles.text : 'white' }}
                >
                  <SettingOutlined className="mx-1" />
                  Administrator
                </button>
              </Popover>
            </div>
          }
          placement="left"
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={isDrawerMode ? drawerVisible : false}
        >
          <div
            style={{
              height: '100%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                flexShrink: 0,
              }}
              className="m-0 p-0"
            >
              <Button
                hidden={!isDrawerMode}
                type="text"
                icon={<MenuUnfoldOutlined size="large" />}
                onClick={() => setDrawerVisible(!drawerVisible)}
                style={{
                  fontSize: '20px',
                  color: isDrawerMode ? (isDark ? themeStyles.text : 'white') : '',
                  margin: 0,
                  padding: 0,
                }}
              />
            </div>

            <div
              className="text-center m-0 px-0 border-b rounded-b-md"
              style={{ flexShrink: 0 }}
            >
              <Avatar
                hidden={!isDrawerMode}
                size={80}
                style={{ backgroundColor: '#f79421' }}
                src="https://cdn-icons-png.flaticon.com/512/3607/3607444.png"
              >
                {user ? user?.username?.[0].toUpperCase() : ''}
              </Avatar>

              <div
                className="mx-2 my-1"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                <FontAwesomeIcon
                  hidden={!isDrawerMode}
                  icon={faSignOutAlt}
                  style={{ fontSize: '15px', color: 'red', cursor: 'pointer' }}
                  onClick={() => {
                    setDrawerVisible(false)
                    navigate('/logout')
                  }}
                />
              </div>
            </div>

            <div
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <Menu
                openKeys={openDrawKeys}
                theme="dark"
                mode="inline"
                selectedKeys={selectedKeys}
                onOpenChange={HandleDrawChange}
                items={drawerItems}
                onSelect={({ key }) => {
                  handleNavigate(key)
                  setDrawerVisible(false)
                }}
                style={{
                  minHeight: '100%',
                  background: themeStyles.siderBg,
                }}
              />
            </div>
          </div>
        </Drawer>
      </div>

      <Sider
        className='main-app-sidebar'
        style={{
          display:
            isDrawerMode
              ? 'none'
              : 'block',

          position: 'relative',
          zIndex: 2000,

          height: '100dvh',
          minHeight: 0,
          flexShrink: 0,
          overflow: 'hidden',
          background:
            themeStyles.siderBg,
        }}
        trigger={null}
        collapsible
        collapsed={collapsed}
      // style={{
      //   display: isDrawerMode ? 'none' : 'block',
      //   height: '100dvh',
      //   minHeight: 0,
      //   overflow: 'hidden',
      //   background: themeStyles.siderBg,
      // }}
      // trigger={null}
      // collapsible
      // collapsed={collapsed}
      >
        <div
          style={{
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            className="logo"
            style={{
              borderBottom: 'solid 1px white',
              borderBottomLeftRadius: '5px',
              borderBottomRightRadius: '5px',
              padding: '20px',
              flexShrink: 0,
            }}
          >
            <div className="flex items-center">
              <div style={{ height: '3vh' }} className="flex justify-center items-center">
                <Image
                  alt="logo"
                  className="m-0 p-0"
                  src={vtsLogo}
                  style={{ width: collapsed ? '100%' : '80%', height: 'auto' }}
                  preview={false}
                  hidden={!screens.md}
                />
              </div>
              {collapsed ? '' : <span className="text-white text-2xl font-bold">Khreview</span>}
            </div>

            <div className="flex justify-between">
              <Avatar
                hidden={screens.md}
                size={50}
                style={{ backgroundColor: '#f79421' }}
                src="https://cdn-icons-png.flaticon.com/512/3607/3607444.png"
              >
                {user ? user?.username?.[0].toUpperCase() : ''}
              </Avatar>
            </div>
          </div>
          <div
            style={{
              flex: '1 1 auto',
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <Menu
              openKeys={openKeys}
              theme="dark"
              mode="inline"
              selectedKeys={selectedKeys}
              onOpenChange={onOpenChange}
              items={siderItems}
              onSelect={({ key }) => {
                handleNavigate(key)
              }}
              style={{
                minHeight: '100%',
                background: themeStyles.siderBg,
              }}
            />
          </div>
        </div>
      </Sider>

      <Layout
        style={{
          height: '100%',
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          background: themeStyles.appBg,
        }}
      >
        <Header
          style={{
            padding: 0,
            display: 'flex',
            flexShrink: 0,
            background: themeStyles.headerBg,
            color: themeStyles.text,
          }}
        >
          {/* button click open sidebar */}
          <div className="flex items-start my-4 mx-2">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() =>
                isDrawerMode ? setDrawerVisible(!drawerVisible) : setCollapsed(!collapsed)
              }
              style={{
                fontSize: 16,
                color: isDark ? themeStyles.text : isDrawerMode ? '#64748b' : '#111827',
              }}
            />
          </div>

          {/* vtsLogo on small screen */}
          <div
            className="logo flex justify-center items-center py-4 mb-2 relative"
            style={{
              textAlign: 'center',
              top: '50%',
              left: isDrawerMode ? '45%' : !screens?.xs ? '40%' : '',
              transform: 'translate(-80%, -50%)',
            }}
            hidden={!isDrawerMode}
          >
            <div className="flex items-center">
              <div
                style={{ height: '3vh', marginRight: screens.xs ? '20px' : '' }}
                className="flex justify-center items-center mt-2"
              >
                <Image
                  hidden={!isDrawerMode}
                  alt="logo"
                  className="m-0 p-0 mb-2"
                  src={vtsLogo}
                  style={{ width: collapsed ? '80%' : '80%', height: 'auto' }}
                  preview={false}
                />
              </div>
            </div>
          </div>

          {/* right side */}
          <div className="ml-auto mx-5 flex items-center">
            <Button
              type="text"
              onClick={toggleTheme}
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              style={{
                fontSize: 18,
                marginRight: 6,
                color: isDrawerMode ? (isDark ? themeStyles.text : 'white') : themeStyles.text,
              }}
              title={isDark ? 'Light mode' : 'Dark mode'}
            />

            <Dropdown
              menu={{
                items: itemsProfile,
                onClick: ({ key }) => {
                  //  IMPORTANT: no window.location (it refreshes and kills animation)
                  if (key === 'logout') return navigate('/logout')
                  navigate(`/${key}`)
                },
              }}
              trigger={['click']}
              className={`${isDrawerMode ? 'hidden' : ''}`}
            >
              {/*  keep same UI, but avoid <a href> */}
              <span style={{ cursor: 'pointer' }}>
                <Space>
                  <Avatar style={{ backgroundColor: '#f79421' }}>
                    {user ? user?.username?.[0].toUpperCase() : ''}
                  </Avatar>
                  <DownOutlined style={{ color: isDrawerMode ? '#FFFFFF' : themeStyles.text }} />
                </Space>
              </span>
            </Dropdown>
          </div>
        </Header>

        <div
          className="mt-2 mx-6 rounded-md"
          style={{
            flexShrink: 0,
            // background: themeStyles.cardBg,
            color: themeStyles.text,
          }}
        >
          <div className="mx-3">{displayEmitContent}</div>
        </div>

        <Content
          className='app-content-popup-boundary app-main-content px-6 py-1 rounded-lg'
          style={{
            position: 'relative',
            zIndex: 10,
            isolation: 'isolate',

            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',

            minHeight: 0,
            minWidth: 0,

            /*
             * Content itself must not scroll.
             * The child wrapper controls scrolling.
             */
            overflow: 'hidden',

            background:
              themeStyles.appBg,

            color:
              themeStyles.text,
          }}
        >
          <div className='app-content-inner'>
            <Outlet
              context={{
                collapsed,
                setDisplayEmitContent,
              }}
            />
          </div>
        </Content>

        <Footer
          className='app-main-footer border-t py-2 text-center'
          style={{
            position: 'relative',
            width: '100%',
            minHeight: 0,
            flex: '0 0 auto',
            flexShrink: 0,
            margin: 0,

            background:
              themeStyles.footerBg,

            color:
              themeStyles.footerText,

            borderTop:
              `1px solid ${themeStyles.divider}`,
          }}
        >
          <div className='mx-auto flex max-w-7xl flex-col items-center justify-between px-4 md:flex-row'>
            <div className='flex items-center space-x-2'>
              <img
                src={
                  vtsLogo
                }
                alt='Logo'
                className='h-10 w-10'
              />

              <span
                className='text-lg font-semibold'
                style={{
                  color:
                    themeStyles.footerText,
                }}
              >
                Khreview
              </span>
            </div>

            <div>
              <div
                className='mt-2 text-xs md:mt-0'
                style={{
                  color:
                    themeStyles.footerText,
                }}
              >
                © {new Date().getFullYear()}{' '}
                Khreview. All rights reserved.
              </div>
            </div>
          </div>
        </Footer>
      </Layout>
    </Layout>
  )
}

export default Layouts