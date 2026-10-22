import { useContext, useMemo } from 'react'
import {
  SettingOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  BarsOutlined,
  HomeOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { AuthContext } from '../contexts/AuthContext'
import { FaPalette } from "react-icons/fa6";
import { TbMessageStar } from 'react-icons/tb'
import { LuFileText } from 'react-icons/lu'


// Helper to build Menu items
const getItem = (label, key, icon, children, type) => ({
  key,
  icon,
  children,
  label,
  type,
})

const useMenuSideBar = (collapsed) => {
  const { access_token } = useContext(AuthContext)

  const requiredItems = useMemo(
    () => [
      '/album',
      '/dashboard',
      '/banner',
      '/ads-moment',
      '/ads-popup',
      '/area',
      '/task-comment',
      '/creator-request',
      '/theme',
      // use real default page for General
      '/general/moment',
      '/vibe',
      //REVIEW MANGEMENT 
      '/allReview',
      '/reviewTemplate'
    ],
    []
  )

  // Canonical definition of every possible item
  const menuItems = useMemo(
    () => [
      {
        label: collapsed ? '' : 'DASHBOARD',
        key: 'group.dashboard',
        type: 'group',
        index: 1,
      },
      {
        label: 'Dashboard',
        key: '/dashboard',
        type: 'key',
        index: 1,
        gKey: 'group.dashboard',
        icon: <DashboardOutlined />,
      },

      {
        label: collapsed ? '' : 'MOBILES APP',
        key: 'group.mobile',
        type: 'group',
        index: 2,
      },
      {
        label: 'App',
        key: '/app',
        type: 'parent',
        index: 1,
        gKey: 'group.mobile',
        icon: <AppstoreOutlined />,
      },
      {
        label: 'User',
        key: '/app/user',
        type: 'key',
        index: 1,
        pKey: '/app',
      },
      {
        label: 'Creator Request',
        key: '/creator-request',
        type: 'key',
        index: 2,
        gKey: 'group.mobile',
        icon: <UserAddOutlined />,
      },

      {
        label: collapsed ? '' : 'SETTING',
        key: 'group.setting',
        type: 'group',
        index: 3,
      },
      {
        label: 'General',
        key: '/general/moment',
        type: 'key',
        index: 1,
        gKey: 'group.setting',
        icon: <SettingOutlined />,
      },
      {
        label: 'Theme Management',
        key: '/theme',
        type: 'key',
        index: 2,
        gKey: 'group.setting',
        icon: <FaPalette />
        ,
      },
      {
        label: 'Setup',
        key: '/setup',
        type: 'parent',
        index: 2,
        gKey: 'group.setting',
        icon: <SettingOutlined />,
      },

      {
        label: 'Province',
        key: '/province',
        type: 'key',
        index: 1,
        pKey: '/setup',
      },
      {
        label: 'Category',
        key: '/category',
        type: 'key',
        index: 2,
        pKey: '/setup',
      },
      {
        label: 'Sub Category',
        key: '/sub-category',
        type: 'key',
        index: 3,
        pKey: '/setup',
      },
      {
        label: 'Type',
        key: '/type',
        type: 'key',
        index: 4,
        pKey: '/setup',
      },
      {
        label: 'Vibe',
        key: '/vibe',
        type: 'key',
        index: 5,
        pKey: '/setup',
      },
      {
        label: 'Activity',
        key: '/activity',
        type: 'key',
        index: 6,
        pKey: '/setup',
      },
      {
        label: 'Amenity',
        key: '/amenity',
        type: 'key',
        index: 7,
        pKey: '/setup',
      },
      {
        label: 'Privacy',
        key: '/privacy',
        type: 'key',
        index: 8,
        pKey: '/setup',
      },
      {
        label: 'Area',
        key: '/area',
        type: 'key',
        index: 9,
        pKey: '/setup',
      },
      {
        label: 'Keyword',
        key: '/keyword',
        type: 'key',
        index: 10,
        pKey: '/setup',
      },
      {
        label: 'Album',
        key: '/album',
        type: 'key',
        index: 11,
        pKey: '/setup',
      },

      {
        label: collapsed ? '' : 'Post',
        key: 'group.posts',
        type: 'group',
        index: 4,
      },
      {
        label: 'Post',
        key: '/posts',
        type: 'parent',
        index: 1,
        gKey: 'group.posts',
        icon: <BarsOutlined />,
      },
      {
        label: 'List Place',
        key: '/list-place',
        type: 'key',
        index: 1,
        pKey: '/posts',
      },
      {
        label: 'Moment',
        key: '/moment',
        type: 'key',
        index: 2,
        pKey: '/posts',
      },
      {
        label: 'Banner',
        key: '/banner',
        type: 'key',
        index: 3,
        pKey: '/posts',
      },
      {
        label: 'Ads as Moment',
        key: '/ads-moment',
        type: 'key',
        index: 1,
        pKey: '/advertisement',
      },
      {
        label: 'Ads as Popup',
        key: '/ads-popup',
        type: 'key',
        index: 2,
        pKey: '/advertisement',
      },

      {
        label: collapsed ? '' : 'Manage Property',
        key: 'group.manage_property',
        type: 'group',
        index: 5,
      },
      {
        label: 'Place Listing',
        key: '/placeListing',
        type: 'parent',
        index: 1,
        gKey: 'group.manage_property',
        icon: <HomeOutlined />,
      },
      {
        label: 'All Property',
        key: '/property',
        type: 'key',
        index: 1,
        pKey: '/placeListing',
      },
      {
        label: 'Task',
        key: '/task-comment',
        type: 'key',
        index: 2,
        pKey: '/placeListing',
      },
      {
        label: 'Review Import',
        key: '/review-import',
        type: 'key',
        index: 3,
        pKey: '/placeListing',
      },

      {
        label: collapsed ? '' : 'REVIEW MANAGEMENT',
        key: 'group.reviewManagement',
        type: 'group',
        index: 6,
      },
      {
        label: 'All Review',
        key: '/allReview',
        type: 'key',
        index: 1,
        gKey: 'group.reviewManagement',
        icon: <TbMessageStar size={18} />,

      },
      {
        label: 'Review Template',
        key: '/reviewTemplate',
        type: 'key',
        index: 2,
        gKey: 'group.reviewManagement',
        icon: <LuFileText size={18} />,
      },

    ],
    [collapsed]
  )

  const menuKeys = useMemo(() => {
    if (!access_token) return []

    const raw = localStorage.getItem('menu_sidebar')

    let menuSideBar = []

    try {
      menuSideBar = raw ? JSON.parse(raw) : []
    } catch {
      menuSideBar = []
    }

    // support old saved key /general
    const normalizedMenuSideBar = menuSideBar.map((key) =>
      key === '/general' ? '/general/moment' : key
    )

    return [...new Set([...normalizedMenuSideBar, ...requiredItems])]
  }, [access_token, requiredItems])

  // Order map by canonical menuItems order
  const orderedMenuBar = useMemo(() => {
    const orderMap = menuItems.reduce((acc, item, idx) => {
      acc[item.key] = idx
      return acc
    }, {})

    return [...menuKeys].sort(
      (a, b) => (orderMap[a] ?? 0) - (orderMap[b] ?? 0)
    )
  }, [menuItems, menuKeys])

  // Build nested menu from keys
  const builtMenu = useMemo(() => {
    let menu = []

    for (let i = 0; i < orderedMenuBar.length; i++) {
      const menuKey = orderedMenuBar[i]
      const menuItem = menuItems.find((el) => el.key === menuKey)

      if (!menuItem) continue

      // key inside a parent
      if (menuItem.type === 'key' && menuItem.pKey) {
        const parentItem = menuItems.find(
          (el) => el.key === menuItem.pKey && el.type === 'parent'
        )

        if (!parentItem) continue

        const groupItem = menuItems.find(
          (el) => el.key === parentItem.gKey && el.type === 'group'
        )

        if (!groupItem) continue

        const groupExists = menu.some((el) => el.key === groupItem.key)

        if (groupExists) {
          const gIdx = menu.findIndex((el) => el.key === groupItem.key)
          const parentExists = menu[gIdx].children?.some(
            (el) => el.key === parentItem.key
          )

          if (parentExists) {
            const pIdx = menu[gIdx].children.findIndex(
              (el) => el.key === parentItem.key
            )

            menu[gIdx].children[pIdx].children =
              menu[gIdx].children[pIdx].children || []

            menu[gIdx].children[pIdx].children.push({
              ...getItem(menuItem.label, menuItem.key, menuItem.icon),
              index: menuItem.index,
            })
          } else {
            menu[gIdx].children = menu[gIdx].children || []

            menu[gIdx].children.push({
              ...getItem(parentItem.label, parentItem.key, parentItem.icon),
              children: [
                {
                  ...getItem(menuItem.label, menuItem.key, menuItem.icon),
                  index: menuItem.index,
                },
              ],
              index: parentItem.index,
            })
          }
        } else {
          menu.push({
            ...getItem(
              groupItem.label,
              groupItem.key,
              groupItem.icon,
              [],
              groupItem.type
            ),
            children: [
              {
                ...getItem(parentItem.label, parentItem.key, parentItem.icon),
                children: [
                  {
                    ...getItem(menuItem.label, menuItem.key, menuItem.icon),
                    index: menuItem.index,
                  },
                ],
                index: parentItem.index,
              },
            ],
            index: groupItem.index,
          })
        }
      } else if (menuItem.type === 'key' && !menuItem.pKey) {
        // standalone key directly under a group
        const groupItem = menuItems.find(
          (el) => el.key === menuItem.gKey && el.type === 'group'
        )

        if (!groupItem) continue

        const groupExists = menu.some((el) => el.key === groupItem.key)

        if (groupExists) {
          const gIdx = menu.findIndex((el) => el.key === groupItem.key)

          menu[gIdx].children = menu[gIdx].children || []

          menu[gIdx].children.push({
            ...getItem(menuItem.label, menuItem.key, menuItem.icon),
            index: menuItem.index,
          })
        } else {
          menu.push({
            ...getItem(
              groupItem.label,
              groupItem.key,
              groupItem.icon,
              [],
              groupItem.type
            ),
            children: [
              {
                ...getItem(menuItem.label, menuItem.key, menuItem.icon),
                index: menuItem.index,
              },
            ],
            index: groupItem.index,
          })
        }
      }
    }

    const sortRecursively = (arr) =>
      arr
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map((item) =>
          item.children && item.children.length
            ? { ...item, children: sortRecursively(item.children) }
            : item
        )

    return sortRecursively(menu)
  }, [menuItems, orderedMenuBar])

  return builtMenu
}

export default useMenuSideBar