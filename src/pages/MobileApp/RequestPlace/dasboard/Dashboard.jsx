import React, { useState } from 'react'
import ExistingPlaceRequest from './RequestChart'
import NewPlaceRequest from './RequestChart'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('existing')

  return (
    <div>
      {/* Tab Buttons */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('existing')}
          style={{ marginRight: '1rem' }}
        >
          Request Existing Place
        </button>
        <button onClick={() => setActiveTab('new')}>Request New Place</button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'existing' && <ExistingPlaceRequest />}
        {activeTab === 'new' && <NewPlaceRequest />}
      </div>
    </div>
  )
}
