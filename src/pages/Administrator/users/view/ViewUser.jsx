import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
} from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Breadcrumb, Button, Card, Form, message, Tabs } from 'antd'
import styles from './ViewUser.module.css'
import { useContent } from '../../../../contexts/ContentContext'
import { useOutletContext, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeftOutlined,
  EditOutlined,
  HomeOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import Swal from 'sweetalert2'

import ReadMoreComponent from '../../../../components/ReadMore'
import { AuthContext } from '../../../../contexts/AuthContext'
//
import UserInfo from './UserInfor'
import UserPassword from './UserPassword'
import UserPermission from './UserPermission'

import AdminUserServices from '../../../../services/admin/User'
//permission
import { PERMS } from '../../../../constants/permission/perms'
//end permission
const DraggableTabNode = ({ className, setClickedKey, ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props['data-node-key'],
    })

  const style = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'pointer',
  }

  const handleClick = () => {
    const key = props['data-node-key']
    setClickedKey(key)
  }

  return React.cloneElement(props.children, {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
    className: `${className} ${styles.draggableTab}`,
    onClick: handleClick,
  })
}

const ViewUser = () => {
  const { collapsed } = useOutletContext()
  //
  const { setDisplayEmitContent } = useOutletContext()
  const [isEditing, setIsEditing] = useState(false)
  const [loading_btn, setLoadingBtn] = useState(false)

  //
  const navigate = useNavigate()
  const { userId } = useParams()

  const { username, access_token, checkPermission } = useContext(AuthContext)
  // check permission
  !checkPermission(PERMS.USER_LIST) && navigate('/administrator/user')
  // end check permission
  const [clickedKey, setClickedKey] = useState(
    localStorage.getItem('clickedKey_user') || '1'
  ) //

  const [user, setUser] = useState()
  const userInfoRef = useRef()
  const userPasswordRef = useRef()
  const userPermissionRef = useRef()
  const success = ({ content }) => {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: content,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const warning = ({ content }) => {
    Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: content,
      timer: 2000,
      showConfirmButton: false,
    })
  }
  const getUserById = async (id) => {
    try {
      const doc = { _id: id }
      const user = await AdminUserServices.fetchUserById({ doc, access_token })
      if (user) {
        setUser(user)
      }
    } catch { }
  }
  useEffect(() => {
    getUserById(userId)
  }, [userId])
  //
  const onHandleUpdateUser = (key) => {
    switch (key) {
      case '1':
        if (userInfoRef.current) {
          userInfoRef.current.triggerSubmit()
        }
        break
      case '2':
        if (userPermissionRef.current) {
          userPermissionRef.current.triggerSubmit()
        }
        break
      case '3':
        if (userPasswordRef.current) {
          userPasswordRef.current.triggerSubmit()
        }
        break
      default:
        break
    }
    setIsEditing(false)
  }

  const componentMap = {
    1: (
      <UserInfo
        user={user}
        ref={userInfoRef}
        access_token={access_token}
        warning={warning}
        success={success}
        getUserById={getUserById}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    ),
    2: (
      <UserPermission
        user={user}
        ref={userPermissionRef}
        access_token={access_token}
        warning={warning}
        success={success}
        getUserById={getUserById}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    ),
    3: (
      <UserPassword
        user={user}
        ref={userPasswordRef}
        access_token={access_token}
        warning={warning}
        success={success}
        getUserById={getUserById}
        ReadMoreComponent={ReadMoreComponent}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    ),
  }

  const [items, setItems] = useState([
    {
      key: '1',
      label: (
        <span className='px-10 text-gray-700 font-semibold'>User Info</span>
      ),
    },
    {
      key: '2',
      label: (
        <span className='px-10 text-gray-700 font-semibold'>
          User Permission
        </span>
      ),
    },
    {
      key: '3',
      label: (
        <span className='px-10 text-gray-700 font-semibold'>User Password</span>
      ),
    },
  ])
  //end pages
  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  })

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setItems((prev) => {
        const activeIndex = prev.findIndex((i) => i.key === active.id)
        const overIndex = prev.findIndex((i) => i.key === over?.id)
        return arrayMove(prev, activeIndex, overIndex)
      })
    }
  }

  useEffect(() => {
    setIsEditing(false)
    if (location?.pathname === `/administrator/user/${userId}`) {
      localStorage.setItem('clickedKey_user', '1')
      navigate('info')
      setClickedKey('1')
    } else {
      const currentKey = localStorage.getItem('clickedKey_user')
      if (clickedKey !== currentKey) {
        localStorage.setItem('clickedKey_user', clickedKey)
        if (clickedKey === '1') navigate('info')
        else if (clickedKey === '2') navigate('permission')
        else if (clickedKey === '3') navigate('password')
      }
    }
  }, [clickedKey, location.pathname])

  //edit function
  //group btn
  const handleBack = () => {
    navigate('/administrator/user')
  }
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-2'>
        <div className='flex space-x-1'>
          <Button
            type='primary'
            style={{ background: '#1677ff' }}
            icon={<ArrowLeftOutlined style={{ color: 'white' }} />}
            onClick={handleBack}
          >
            Back
          </Button>

          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)}>
                <EditOutlined style={{ fontSize: '20px', color: '' }} />
                Cancel
              </Button>
              <Button
                type='primary'
                style={{ background: '#1677ff' }}
                className='cursor-pointer text-white'
                onClick={() =>
                  onHandleUpdateUser(localStorage.getItem('clickedKey_user'))
                }
              >
                <SaveOutlined style={{ fontSize: '16px', color: 'white' }} />
                Update
              </Button>
            </>
          ) : (
            <>
              {checkPermission(PERMS?.ASSIGNED_USER) && (
                <Button onClick={() => setIsEditing(true)}>
                  <EditOutlined style={{ fontSize: '20px', color: '' }} />
                  Edit
                </Button>
              )}
            </>
          )}
        </div>
        <Breadcrumb
          items={[
            {
              title: <HomeOutlined style={{ cursor: 'pointer' }} />,
            },
            {
              title: (
                <span className='text-gray-600 font-medium'>update user</span>
              ),
            },
          ]}
        ></Breadcrumb>
      </div>
    )
  }, [navigate, isEditing])

  return (
    <>
      <Card>
        <Tabs
          onChange={(key) => setClickedKey(key)}
          activeKey={clickedKey}
          items={items.map((item) => ({
            ...item,
            children: componentMap[item.key],
          }))}
          renderTabBar={(tabBarProps, DefaultTabBar) => (
            <DndContext
              sensors={[sensor]}
              onDragEnd={onDragEnd}
              collisionDetection={closestCenter}
            >
              <SortableContext
                items={items.map((i) => i.key)}
                strategy={horizontalListSortingStrategy}
              >
                <DefaultTabBar {...tabBarProps}>
                  {(node) => (
                    <DraggableTabNode
                      {...node.props}
                      key={node.key}
                      setClickedKey={setClickedKey}
                    >
                      {node}
                    </DraggableTabNode>
                  )}
                </DefaultTabBar>
              </SortableContext>
            </DndContext>
          )}
        />
      </Card>
    </>
  )
}

export default ViewUser
