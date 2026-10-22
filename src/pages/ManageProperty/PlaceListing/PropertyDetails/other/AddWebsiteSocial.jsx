import React, { useEffect, useState } from 'react'
import { Collapse, Form, Button, Input } from 'antd'
import {
  PlusOutlined,
  CloseCircleOutlined,
  RightOutlined,
} from '@ant-design/icons'

/* ------------------------------------------------------------------ */
/* helper                                                             */
const truncateText = (txt = '', len = 50) =>
  txt.length > len ? txt.slice(0, len) + '…' : txt

/* ------------------------------------------------------------------ */
export default function AddWebsiteSocial({ form, socialMedia }) {
  const [open, setOpen] = useState(false)
  const [newLink, setNewLink] = useState('')
  const [header, setHeader] = useState('Add Website/Social Media link')

  /* keep form state in-sync with incoming prop -------------------- */
  useEffect(() => {
    const validLinks = Array.isArray(socialMedia)
      ? socialMedia.filter((link) => typeof link === 'string' && link?.trim() !== '')
      : []

    form.setFieldsValue({ links: validLinks })
  }, [socialMedia, form])


  /* add link ------------------------------------------------------ */
  const handleAdd = (add) => {
    if (newLink.trim()) {
      add(newLink.trim())
      setNewLink('')
    }
  }

  /* panel body ---------------------------------------------------- */
  const body = (
    <Form
      form={form}
      layout='vertical'
      name='linksForm'
      initialValues={{ links: socialMedia || [] }}
    >
      <Form.List name='links'>
        {(fields, { add, remove }) => (
          <>
            {/* row to add a new link -------------------------------- */}
            <div
              style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}
            >
              <Button
                type='primary'
                icon={<PlusOutlined />}
                style={{ marginRight: 8, borderRadius: 400 }}
                onClick={() => handleAdd(add)}
              />
              <Input
                placeholder='Enter Website/Social Media Link'
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
            </div>

            {/* existing links -------------------------------------- */}
            {fields.map((field) => {
              const link = form.getFieldValue(['links', field.name]) || ''
              const { key, ...restField } = field
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 1,
                  }}
                >
                  <Button
                    className='border-none text-white mx-2'
                    style={{ borderRadius: 40 }}
                    onClick={() => remove(field.name)}
                    icon={
                      <CloseCircleOutlined
                        style={{ color: 'red', fontSize: 20 }}
                      />
                    }
                  />
                  <div
                    style={{
                      flex: 1,
                      border: '1px solid #d9d9d9',
                      borderRadius: 5,
                      paddingLeft: 4,
                    }}
                  >
                    <Form.Item {...restField} style={{ marginBottom: 0 }}>
                      <a
                        href={link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-400'
                      >
                        {link}
                      </a>
                    </Form.Item>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </Form.List>
    </Form>
  )

  /* collapse items ---------------------------------------------- */
  const items = [
    {
      key: '1',
      label: truncateText(header, 50),
      children: body,
      // extra: <RightOutlined rotate={open ? 90 : 0} />,
    },
  ]

  return (
    <Collapse
      bordered={false}
      items={items}
      activeKey={open ? ['1'] : []}
      onChange={(keys) => setOpen(keys.length === 1)}
      expandIconPosition='end'
      style={{
        background: '#fff',
        border: '1px solid #d9d9d9',
        boxSizing: 'border-box',
      }}
    />
  )
}
