import React, { useEffect, useRef } from 'react'
import { Row, Col, Select } from 'antd'
import Search from './Search'
import { useAddressOptStore } from '../../../../../Stores/Address/Address'

export default function FilterSelection({ access_token, onCityChange, setSearch }) {
  const aliveRef = useRef(true)
  const { provinces, fetchProvinceOpts } = useAddressOptStore()

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
    }
  }, [])
  useEffect(() => {
    const run = async () => {
      try {
        if (!access_token) return
        await fetchProvinceOpts(access_token)
      } catch (e) {
        console.error(e)
      }
    }

    run()
  }, [access_token, fetchProvinceOpts])

  return (
    <Row gutter={[8, 8]} className="my-2">
      <Col xs={24} md={12}>
        <Select
          allowClear
          showSearch
          labelInValue
          placeholder="Search province"
          optionFilterProp="label"
          style={{ width: '100%' }}
          filterSort={(a, b) =>
            (a?.label ?? '').toLowerCase().localeCompare((b?.label ?? '').toLowerCase())
          }
          onChange={(value) => onCityChange?.(value ?? null)}
          options={(provinces || []).map((p) => ({
            value: p.provinceId,
            key: p.provinceEn,
            label: `${p.provinceEn} – ${p.provinceKh}`,
          }))}
        />
      </Col>

      <Col xs={24} md={12}>
        <Search setSearch={setSearch} />
      </Col>
    </Row>
  )
}