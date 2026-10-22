
import React, { useEffect, useState } from 'react'
import { Form, Collapse, Input, Button, message } from 'antd'
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons'

const AddReference = ({ form: externalForm, referenceLink }) => {
  /* 1️⃣  create-or-use form */
  const [internalForm] = Form.useForm()
  const form = externalForm ?? internalForm

  /* 2️⃣  local state */
  const [newLink, setNewLink] = useState('')
  const [linksCollapsed, setLinksCollapsed] = useState(true)

  /* 3️⃣  sync initial links */

  useEffect(() => {
    const validLinks = Array.isArray(referenceLink)
      ? referenceLink.filter((link) => typeof link === 'string' && link?.trim() !== '')
      : []

    form.setFieldsValue({ referenceLinks: validLinks })
  }, [referenceLink, form])

  /* 4️⃣  add-link helper */
  const handleAddLink = (add) => {
    if (newLink.trim()) {
      add(newLink.trim())
      setNewLink('')
    } else {
      message.error('Please type a link before adding.')
    }
  }

  /* 5️⃣  Collapse panel content */
  const renderPanelContent = (fields, { add, remove }, { errors }) => (
    <>
      {/* add bar */}
      <div style={{ display: 'flex', marginBottom: 8 }}>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          style={{ marginRight: 8, borderRadius: 40 }}
          onClick={() => handleAddLink(add)}
        />
        <Input
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          placeholder='Enter reference link'
          style={{ flex: 1 }}
        />
      </div>

      {/* existing links */}
      {fields.map((field) => {
        const { key, ...fieldProps } = field // 🟢 pull key out
        return (
          <div key={key} style={{ display: 'flex' }}>
            <Button
              onClick={() => remove(field.name)}
              icon={
                <CloseCircleOutlined style={{ color: 'red', fontSize: 20 }} />
              }
              style={{ marginRight: 8, border: 'none' }}
            />
            <Form.Item
              {...fieldProps} // 🔑 no “key” inside spread
              name={[field.name]}
              style={{ flex: 1, margin: '1px' }}
            >
              <Input placeholder='Link' style={{ color: '#60A5FA' }} />
            </Form.Item>
          </div>
        )
      })}

      {/* validation errors */}
      {errors.length > 0 && (
        <div style={{ color: 'red', marginTop: 4 }}>
          {errors.map((err, idx) => (
            <div key={idx}>{err}</div>
          ))}
        </div>
      )}
    </>
  )

  /* 6️⃣  Collapse items (new API) */
  const collapseItems = [
    {
      key: '1',
      label: (
        <>
          <span className='text-red-500'>*</span>
          <span>Add a reference link</span>
        </>
      ),
      children: (
        <Form.List
          name='referenceLinks'
          rules={[
            {
              required: true,
              message: 'Please add at least one reference link.',
            },
          ]}
        >
          {renderPanelContent}
        </Form.List>
      ),
    },
  ]

  /* 7️⃣  render */
  return (
    <Form form={form} layout='vertical' name='referenceLinksForm'>
      <Collapse
        bordered={false}
        items={collapseItems}
        activeKey={linksCollapsed ? ['1'] : []}
        onChange={(k) => setLinksCollapsed(k.length === 1)}
        style={{
          marginTop: 0,
          width: '100%',
          background: '#fff',
          border: '1px solid #d9d9d9',
        }}
      />
    </Form>
  )
}

export default AddReference
