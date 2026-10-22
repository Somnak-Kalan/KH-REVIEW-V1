import React from 'react'
import { Dropdown, Button } from 'antd'
import { EllipsisOutlined, EyeOutlined } from '@ant-design/icons'

export default function buildCardFooterActions(record, handleView) {
  const menuItems = [
    {
      key: 'view',
      label: 'View Place',
      icon: <EyeOutlined style={{ fontSize: 14, color: 'green' }} />,
    },
  ]

  const handleMenuClick = (e) => {
    console.log(e, 'test');

    if (e.key === 'view') {
      handleView(record)
    }
  }

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: handleMenuClick, // ✅ handle menu click here
      }}
      trigger={['click']}
    >
      <Button
        className='bg-white'
        style={{ transform: 'rotate(90deg)' }}
        icon={<EllipsisOutlined />}
      />
    </Dropdown>
  )
}
