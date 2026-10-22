import React from 'react'
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons'

// viewMode can be either 'card' or 'table', for example.
// onViewModeChange is a callback that sets the selected view in your parent component.
export default function ViewSwitcher({ viewMode, onViewModeChange }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        borderRadius: '9999px', // fully rounded container
        backgroundColor: '#EBF2FE', // light background
        padding: '4px', // some spacing inside
      }}
    >
      {/* Card View Button */}
      <div
        onClick={() => onViewModeChange('card')}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          cursor: 'pointer',
          backgroundColor: viewMode === 'card' ? '#0076CE' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '4px', // small gap between the two icons
        }}
      >
        <AppstoreOutlined
          style={{ color: viewMode === 'card' ? '#fff' : '#000' }}
        />
      </div>

      {/* Table View Button */}
      <div
        onClick={() => onViewModeChange('table')}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          cursor: 'pointer',
          backgroundColor: viewMode === 'table' ? '#0076CE' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <UnorderedListOutlined
          style={{ color: viewMode === 'table' ? '#fff' : '#000' }}
        />
      </div>
    </div>
  )
}
