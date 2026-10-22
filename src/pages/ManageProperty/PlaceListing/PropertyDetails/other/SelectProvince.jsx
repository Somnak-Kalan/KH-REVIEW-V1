import React, { useState } from 'react'
import { Cascader, Form, Input, Card } from 'antd'
// import Map from '../../../other/Map'

// Example mock data for city → district → commune → village
const locationOptions = [
  {
    value: 'Phnom Penh',
    label: 'Phnom Penh',
    children: [
      {
        value: 'Chamkar Mon',
        label: 'Chamkar Mon',
        children: [
          {
            value: 'Tuol Svay Prey I',
            label: 'Tuol Svay Prey I',
            children: [
              { value: 'Village 1', label: 'Village 1' },
              { value: 'Village 2', label: 'Village 2' },
            ],
          },
          {
            value: 'Phsar Daeum Thkov',
            label: 'Phsar Daeum Thkov',
            children: [
              { value: 'Village 3', label: 'Village 3' },
              { value: 'Village 4', label: 'Village 4' },
            ],
          },
        ],
      },
      {
        value: 'Doun Penh',
        label: 'Doun Penh',
        children: [
          // ...
        ],
      },
    ],
  },
  {
    value: 'Kandal',
    label: 'Kandal',
    children: [
      // ...
    ],
  },
  // Add more provinces as needed
]

// Mapping of provinces to abbreviations
const provinceAbbreviations = {
  'Phnom Penh': 'PP',
  Kandal: 'KD',
  // add more as needed, e.g., 'Ratanakiri': 'RTK', etc.
}

export default function PlaceAddress({ form }) {
  // This state holds counts for each province (prefix)
  const [placeIdCount, setPlaceIdCount] = useState({})

  // When a location is selected, generate a Place ID.
  const handleLocationChange = (value) => {
    if (value && value.length > 0) {
      // Get the top-level (province) value.
      const province = value[0]
      // Determine prefix using our mapping or fallback to the first 2 uppercase letters.
      const prefix =
        provinceAbbreviations[province] || province.slice(0, 2).toUpperCase()
      // Get current count for this province, defaulting to 0.
      let count = placeIdCount[prefix] || 0
      count += 1
      // Update the count state so future selections increment further.
      setPlaceIdCount((prev) => ({ ...prev, [prefix]: count }))
      // Format count as three digits (e.g. 001, 002, etc.)
      const newPlaceId = `${prefix}${String(count).padStart(3, '0')}`
      // Set the generated Place ID into the form field named "placeId"
      form.setFieldsValue({ placeId: newPlaceId })
    }
  }

  return (
    <Form form={form} layout='vertical'>
      <Form.Item
        label='Select Location'
        name='location'
        rules={[{ required: true, message: 'Please select a location' }]}
      >
        <Cascader
          options={locationOptions}
          placeholder='Select City/Province - District/Khan - Commune/Sangkat - Village'
          changeOnSelect
          style={{ width: '100%' }}
          onChange={handleLocationChange}
        />
      </Form.Item>
      {/* <Map /> */}
    </Form>
  )
}
