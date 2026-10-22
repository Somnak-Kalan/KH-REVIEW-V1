import React, { useContext, useEffect, useState } from 'react'
import {
  Menu,
  Avatar,
  message,
  Drawer,
  Button,
  Badge,
  Skeleton,
  Breadcrumb,
  Result,
} from 'antd'
import {
  UserOutlined,
  CheckCircleOutlined,
  LockOutlined,
  FolderOutlined,
  ApartmentOutlined,
  MenuOutlined,
  HomeOutlined,
  SmileOutlined,
} from '@ant-design/icons'

import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { AuthContext } from '../../../contexts/AuthContext'

import './Sidebar.css'
import { Outlet } from 'react-router-dom'
import AdminProfileInfoService from '../../../services/admin/profile/profileInfo'

const ProfileSidebar = () => {
  const navigate = useNavigate()
  const { collapsed, setDisplayEmitContent } = useOutletContext()
  const { username, access_token } = useContext(AuthContext)
  const [profileInfo, setProfileInfo] = useState()
  const [modules, setModules] = useState([])
  const [roles, setRoles] = useState([])
  const [userId, setUserId] = useState()
  const [menuBar, setMenuBar] = useState()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isAdmin, setIsAdmin] = useState(
    JSON.parse(localStorage.getItem('isAdmin'))
  )
  const [loading, setLoading] = useState(true)

  const success = ({ content }) => {
    message.success({ content })
  }

  const warning = ({ content }) => {
    message.warning({ content })
  }

  const getProfileInfo = async () => {
    try {
      const profileInfo = await AdminProfileInfoService.fetchProfileInfo({
        access_token,
      })
      if (profileInfo) {
        setProfileInfo(profileInfo)
        setModules(profileInfo?.module)
        setRoles(profileInfo?.role)
        setUserId(profileInfo?._id)
        setLoading(false)
      } else {
        setLoading(false)
      }
    } catch { }
  }

  useEffect(() => {
    getProfileInfo()
  }, [])
  const menuItems = [
    {
      key: 'info',
      icon: <UserOutlined />,
      label: 'Profile Info',
      to: 'info',
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: 'Password',
      to: 'password',
    },

    ...(isAdmin === false
      ? [
        {
          key: 'module',
          icon: <FolderOutlined />,
          label: 'Module',
          to: 'module',
        },
      ]
      : []),
    ...(isAdmin === false
      ? [
        {
          key: 'role',
          icon: <ApartmentOutlined />,
          label: 'Role',
          to: 'role',
        },
      ]
      : []),
  ]
  useEffect(() => {
    if (profileInfo) {
      setIsAdmin(profileInfo?.isAdmin)
    }
  }, [profileInfo])
  const handleClickMenu = (menu) => {
    setMenuBar(menu?.key)
    setDrawerVisible(false) // Close the drawer on menu click
  }

  const getActiveKey = () => {
    const path = location.pathname.split('/').pop()
    const activeItem = menuItems.find((item) => item.to === path)
    return activeItem ? activeItem.key : 'info'
  }
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className='font-semibold' style={{ color: '#495057' }}>
          Profile
        </div>
        <Breadcrumb
          items={[
            {
              title: <HomeOutlined style={{ cursor: 'pointer' }} />,
            },
            {
              title: <span className='text-gray-600 font-medium'>profile</span>,
            },
          ]}
        ></Breadcrumb>
      </div>
    )
  }, [navigate])

  return (
    <div className='flex flex-col md:flex-row'>
      {/* Sidebar for larger screens */}
      <div
        className='hidden md:block w-60 md:mr-3   bg-white h-[350px] flex flex-col rounded-lg '
        style={{
          boxShadow:
            'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px',
        }}
      >
        {/* Profile Section */}
        {/*  */}

        <div className='text-center border-b my-2  '>
          <Badge
            count={
              <Result
                className='custom-result'
                icon={
                  profileInfo?.status === 'Active' ? (
                    <svg
                      viewBox='0 0 12 13'
                      width='18'
                      height='18'
                      fill='currentColor'
                      title='Verified account'
                      color='blue'
                      className='xfx01vb x1lliihq x1tzjh5l x1k90msu x2h7rmj x1qfuztq'
                      style={{ '--color': 'var(--accent)' }}
                    >
                      <g fillRule='evenodd' transform='translate(-98 -917)'>
                        <path d='m106.853 922.354-3.5 3.5a.499.499 0 0 1-.706 0l-1.5-1.5a.5.5 0 1 1 .706-.708l1.147 1.147 3.147-3.147a.5.5 0 1 1 .706.708m3.078 2.295-.589-1.149.588-1.15a.633.633 0 0 0-.219-.82l-1.085-.7-.065-1.287a.627.627 0 0 0-.6-.603l-1.29-.066-.703-1.087a.636.636 0 0 0-.82-.217l-1.148.588-1.15-.588a.631.631 0 0 0-.82.22l-.701 1.085-1.289.065a.626.626 0 0 0-.6.6l-.066 1.29-1.088.702a.634.634 0 0 0-.216.82l.588 1.149-.588 1.15a.632.632 0 0 0 .219.819l1.085.701.065 1.286c.014.33.274.59.6.604l1.29.065.703 1.088c.177.27.53.362.82.216l1.148-.588 1.15.589a.629.629 0 0 0 .82-.22l.701-1.085 1.286-.064a.627.627 0 0 0 .604-.601l.065-1.29 1.088-.703a.633.633 0 0 0 .216-.819'></path>
                      </g>
                    </svg>
                  ) : (
                    ''
                  )
                }
                style={{
                  marginTop: '25px',
                  marginRight: '10px',
                }}
              />
            }
            offset={[0, 5]} // Adjust badge position
            showZero
          >
            <Avatar size={80} icon={<UserOutlined />} />
          </Badge>

          <div style={{}} className='my-2 text-gray-600 font-semibold'>
            <div>
              {loading ? (
                <Skeleton.Input active size={20} block={loading} />
              ) : (
                <span>{profileInfo?.username}</span>
              )}
            </div>
            <div>
              {loading ? (
                <Skeleton.Input active size={20} block={loading} />
              ) : (
                <span>{profileInfo?.positionTitle}</span>
              )}
            </div>
          </div>
        </div>
        <Menu
          mode='inline'
          defaultSelectedKeys={[menuBar]}
          className='custom-menu'
          selectedKeys={[getActiveKey()]}
          onClick={handleClickMenu}
          items={menuItems.map((item) => ({
            ...item,
            label: <Link to={`/profile/${item.to}`}>{item.label}</Link>,
          }))}
        />
      </div>
      {/* Hamburger Menu for smaller screens */}

      <div className='md:hidden'>
        <div className='text-center  border-b my-2'>
          <div className='py-2'>
            <Badge
              count={
                <span
                  style={{
                    backgroundColor: '#52c41a',
                    color: 'white',
                    paddingLeft: '2px',
                    paddingRight: '5px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                >
                  <CheckCircleOutlined className='mx-1' />
                  Active
                </span>
              }
              offset={[0, 5]} // Adjust badge position
              showZero
            >
              <Avatar size={80} icon={<UserOutlined />} />
            </Badge>
            <div className='my-2'>
              <div>
                {loading ? (
                  <Skeleton.Input active size={20} block={loading} />
                ) : (
                  <span>{profileInfo?.username}</span>
                )}
              </div>
              <div>
                {loading ? (
                  <Skeleton.Input active size={20} block={loading} />
                ) : (
                  <span>{profileInfo?.positionTitle}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* // */}
        <Menu
          mode='inline'
          defaultSelectedKeys={[menuBar]}
          selectedKeys={[getActiveKey()]}
          onClick={handleClickMenu}
          style={{ display: windowWidth <= 260 ? 'block' : 'flex' }}
          className='custom-menu'
          items={menuItems.map((item) => ({
            ...item,
            label: <Link to={`/profile/${item.to}`}>{item.label}</Link>,

            // ),
          }))}
        />
        {/*  */}
        <Button
          type='text'
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
        />
        <Drawer
          style={{ padding: 0, width: '70%' }}
          // title='Menu'
          placement='left'
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          className='custom-menu'
        >
          <div className='text-center  border-b'>
            <Badge
              count={
                <span
                  style={{
                    backgroundColor: '#52c41a',
                    color: 'white',
                    paddingLeft: '2px',
                    paddingRight: '5px',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                >
                  <CheckCircleOutlined className='mx-1' />
                  Active
                </span>
              }
              offset={[0, 5]} // Adjust badge position
              showZero
            >
              <Avatar size={80} icon={<UserOutlined />} />
            </Badge>
            <div className='my-2'>
              <div>
                {loading ? (
                  <Skeleton.Input active size={20} block={loading} />
                ) : (
                  <span>{profileInfo?.username}</span>
                )}
              </div>
              <div>
                {loading ? (
                  <Skeleton.Input active size={20} block={loading} />
                ) : (
                  <span>{profileInfo?.positionTitle}</span>
                )}
              </div>
            </div>
          </div>
          <Menu
            mode='inline'
            defaultSelectedKeys={[menuBar]}
            selectedKeys={[getActiveKey()]}
            onClick={handleClickMenu}
            className='custom-menu'
            items={menuItems.map((item) => ({
              ...item,
              label: <Link to={`/profile/${item.to}`}>{item.label}</Link>,
            }))}
          />
        </Drawer>
      </div>
      {/* Main Content */}
      <div className='flex-1 '>
        <Outlet
          context={{
            profileInfo,
            access_token,
            success,
            warning,
            modules,
            roles,
            userId,
          }}
        />
      </div>
    </div>
  )
}

export default ProfileSidebar
