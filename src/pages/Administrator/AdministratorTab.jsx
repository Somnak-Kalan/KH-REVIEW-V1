import React, { useContext, useEffect, useState } from 'react'
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
import { Breadcrumb, Button, Card, message, Tabs } from 'antd'
import { HomeOutlined, PlusOutlined } from '@ant-design/icons'
import styles from './TabAdmin.module.css'

import { useNavigate, useLocation, useOutletContext } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import { PERMS } from '../../constants/permission/perms'

/* ---------- your four pages & helpers ---------- */
import Users from './users/User'
import Roles from './roles/RoleList'
import Modules from './Modules/Modules'
import ModuleUser from './ModuleUser/ModuleUser'
import AdminSearch from './AdminSearch'
import ReadMoreComponent from '../../components/ReadMore'
import SupperAdmin from './superAdmin/SuperAdmin'

/* ---------------- drag handle ------------------ */
const DraggableTabNode = ({ setClickedKey, className, ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props['data-node-key'] })

  const style = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'pointer',
  }

  return React.cloneElement(props.children, {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
    className: `${className} ${styles.draggableTab}`,
    onClick: () => setClickedKey(props['data-node-key']),
  })
}

/* =================================================
   Main component
   ================================================= */
export default function AdministratorTabs() {
  /* ---------- context / hooks ---------- */
  const { checkPermission, access_token } = useContext(AuthContext)
  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()

  /* ---------- helpers ---------- */
  const msg = (type) => (content) => message[type]({ content })
  const success = msg('success')
  const warning = msg('warning')

  /* ---------- 1. master list of all tabs ---------- */
  const ALL_TABS = [
    {
      key: '1',
      route: 'user',
      perm: PERMS.USER_LIST,
      label: 'User',
      element: (
        <Users
          access_token={access_token}
          success={success}
          warning={warning}
          ReadMoreComponent={ReadMoreComponent}
        />
      ),
    },
    {
      key: '2',
      route: 'role',
      perm: PERMS.ROLE_LIST,
      label: 'Role',
      element: (
        <Roles
          access_token={access_token}
          success={success}
          warning={warning}
          ReadMoreComponent={ReadMoreComponent}
        />
      ),
    },
    {
      key: '3',
      route: 'module',
      perm: PERMS.MODULE_LIST,
      label: 'Module',
      element: (
        <Modules
          access_token={access_token}
          success={success}
          warning={warning}
          ReadMoreComponent={ReadMoreComponent}
        />
      ),
    },
    {
      key: '4',
      route: 'supperadmin',
      perm: PERMS.MODULE_LIST,
      label: 'Super Admin',
      element: (
        <SupperAdmin
          access_token={access_token}
        />
      ),
    },
    {
      key: '5',
      route: 'module-user',
      perm: PERMS.MANAGE_PARTNER,
      label: 'Module User',
      element: (
        <ModuleUser
          access_token={access_token}
        />
      ),

    },
  ]

  /* ---------- 2. tabs visible for THIS user ---------- */
  const visibleTabs = ALL_TABS.filter((t) => checkPermission(t.perm))

  /* ---------- 3. derive helpers ---------- */
  const firstKey = visibleTabs[0]?.key ?? '' // ‘’ if none
  const componentMap = Object.fromEntries(
    visibleTabs.map((t) => [t.key, t.element])
  )
  const items = visibleTabs.map((t) => ({
    key: t.key,
    label: <span className='px-2 text-gray-700 font-semibold'>{t.label}</span>,
  }))

  /* ---------- 4. state: which tab is selected ---------- */
  const [clickedKey, setClickedKey] = useState(() => {
    const saved = localStorage.getItem('clickedKey')
    return visibleTabs.some((t) => t.key === saved) ? saved : firstKey
  })
  // check route
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '')
    if (path !== '/administrator') return
    if (!firstKey) return // no tabs at all (unlikely)
    setClickedKey(firstKey)
    localStorage.setItem('clickedKey', firstKey)
    const dest = visibleTabs.find((t) => t.key === firstKey)?.route
    if (dest) navigate(dest, { replace: true })
  }, [location.pathname, firstKey, navigate])

  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '')
    if (path === '/administrator') return

    const current = visibleTabs.find((t) => t.key === clickedKey)
    if (!current) return // should not happen
    localStorage.setItem('clickedKey', clickedKey)
    if (!location.pathname.endsWith(`/${current.route}`))
      navigate(current.route)
  }, [clickedKey, location.pathname, navigate])
  // check route
  /* ---------- 7. DnD sensors ---------- */
  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  })
  const onDragEnd = ({ active, over }) => {
    if (active.id === over?.id) return
    setClickedKey(active.id) // keep focus
    const old = items.findIndex((i) => i.key === active.id)
    const idx = items.findIndex((i) => i.key === over?.id)
    const ordered = arrayMove(items, old, idx)
    // re-order both items & visibleTabs consistently
    setItems(ordered)
  }

  /* ---------- 8. render ---------- */
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-2'>
        <div className='font-semibold' style={{ color: '#495057' }}>
          Administrator
        </div>
        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
            {
              title: (
                <span className='text-gray-500 font-medium'>administrator</span>
              ),
            },
          ]}
        />
      </div>
    )
  }, [setDisplayEmitContent])
  const onHandleAdd = (rank) => {
    if (rank === '1') {
      navigate('/administrator/user/form')
    } else if (rank === '2') {
      navigate('/administrator/role/form')
    } else {
      navigate('/administrator/module/form')
    }
  }
  return (
    <Card>
      <div className='my-5'>
        <AdminSearch clickedKey={clickedKey} />
      </div>
      <Tabs
        activeKey={clickedKey}
        onChange={setClickedKey}
        items={items.map((i) => ({ ...i, children: componentMap[i.key] }))}
        tabBarExtraContent={
          <>
            {checkPermission(PERMS.ASSIGNED_USER) && clickedKey !== '4' && clickedKey !== '5' ? (
              <div>
                <Button onClick={() => onHandleAdd(clickedKey)}>Add</Button>
              </div>
            ) : ''}
          </>
        }
        renderTabBar={(props, Default) => (
          <DndContext
            sensors={[sensor]}
            onDragEnd={onDragEnd}
            collisionDetection={closestCenter}
          >
            <SortableContext
              items={items.map((i) => i.key)}
              strategy={horizontalListSortingStrategy}
            >
              <Default {...props}>
                {(node) => (
                  <DraggableTabNode
                    {...node.props}
                    key={node.key}
                    setClickedKey={setClickedKey}
                  >
                    {node}
                  </DraggableTabNode>
                )}
              </Default>
            </SortableContext>
          </DndContext>
        )}
      />
    </Card>
  )
}
