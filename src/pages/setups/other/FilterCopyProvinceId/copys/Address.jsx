import React, { useContext, useEffect, useState } from 'react'
import {
  Breadcrumb,
  Select,
  Table,
  Input,
  Row,
  Col,
  Tooltip,
  message,
  Form,
  Tabs,
} from 'antd'
// cspell:ignore uuidv
import { v4 as uuidv4 } from 'uuid'

import { AuthContext } from '../../../../../contexts/AuthContext'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { CopyOutlined, HomeOutlined } from '@ant-design/icons'
const { Search } = Input
import AddressService from '../../../../../services/settings/others/Address'
import SettingOtherAddressOptServices from '../../../../../services/options/settings/other/address/Address'

const Address = () => {
  const { access_token } = useContext(AuthContext)
  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(true)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [communes, setCommunes] = useState([])
  const [address, setAddress] = useState([])

  const [filterProvince, setFilterProvince] = useState(12)
  const [filterDistrict, setFilterDistrict] = useState(null)
  const [filterCommune, setFilterCommune] = useState(null)
  const [search, setSearch] = useState('')

  const getAddress = async (filterPro, filterDist, filterCom, keyword) => {
    setLoading(true)
    try {
      const doc = {
        page: 1,
        size: 20,
        search: keyword || '',
        provinceId: filterPro,
        districtId: filterDist,
        communeId: filterCom || null,
      }
      const data = await AddressService.getAddress({ doc, access_token })
      if (data) {
        setAddress(data?.data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (filterProvince || filterDistrict || filterCommune || search) {
      getAddress(filterProvince, filterDistrict, filterCommune, search)
    }
  }, [filterProvince, filterDistrict, filterCommune, search])

  const getProvince = async () => {
    try {
      const provinces = await SettingOtherAddressOptServices.getProvinceOpt({
        access_token,
      })
      if (provinces) {
        setProvinces(provinces)
      }
    } catch { }
  }
  useEffect(() => {
    getProvince()
  }, [])

  const handleProvince = (value) => {
    setFilterProvince(value?.provinceId)
    setFilterDistrict(null)
    setFilterCommune(null)
    getDistrict(value?.provinceId)
    setSearch('')
    setDistricts([])
    setCommunes([])
    form.setFieldsValue({
      district: null,
      commune: null,
      village: null,
    })
  }
  const handleAllowClearProvince = () => {
    setSearch('')
    setDistricts([])
    setCommunes([])
    setFilterDistrict(null)
    setFilterCommune(null)
    form.setFieldsValue({
      district: null,
      commune: null,
      village: null,
    })
  }

  const handleDistrict = (value) => {
    setFilterDistrict(value?.districtId)
    setFilterCommune(null)
    getCommune(value?.districtId)
    setSearch('')
    setCommunes([])
    form.setFieldsValue({
      commune: null,
      village: null,
    })
  }
  const handleAllowClearDistrict = () => {
    setSearch('')
    setCommunes([])
    form.setFieldsValue({
      commune: null,
      village: null,
    })
  }

  const handleCommune = (value) => {
    setFilterCommune(value?.communeId)
    setSearch('')
    form.setFieldsValue({
      village: null,
    })
  }
  const handleAllowClearCommune = () => {
    setSearch('')

    form.setFieldsValue({
      village: null,
    })
  }

  const getDistrict = async (id) => {
    try {
      const doc = { id: id }
      const district = await SettingOtherAddressOptServices.getDistrictOpt({
        doc,
        access_token,
      })
      setDistricts(district)
    } catch { }
  }

  const getCommune = async (id) => {
    try {
      const doc = { id: id }
      const commune = await SettingOtherAddressOptServices.getCommuneOpt({
        doc,
        access_token,
      })
      if (commune) {
        setCommunes(commune)
      }
    } catch { }
  }

  const previewID = (fullId) => {
    return fullId?.length > 20
      ? `${fullId?.slice(0, 6)}...${fullId?.slice(-4)}`
      : fullId
  }

  const renderNo = (_, __, index) => {
    return (currentPage - 1) * pageSize + index + 1
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    message.success(`Copied ID: ${text}`)
  }

  const columns = [
    {
      title: 'No',
      width: 50,
      align: 'center',
      render: renderNo,
    },
    {
      title: 'Province',
      dataIndex: 'provinceEn',
      render: (_, record) => (
        <div className='flex items-start items-center space-x-2'>
          <div className='flex flex-col items-center'>
            <span className='text-xs text-gray-400 mt-1 max-w-[80px] text-center break-all'>
              ({previewID(record?.provinceId)})
            </span>
          </div>
          <div>
            <p className='text-gray-900 font-semibold'>{record.provinceEn}</p>
            <p className='text-gray-500 text-sm'>{record.provinceKh}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'District',
      dataIndex: 'districtEn',
      key: 'districtEn',
      render: (_, record) => (
        <div className='flex items-center space-x-2'>
          <div className='flex flex-col items-center'>
            <CopyOutlined
              onClick={() =>
                copyToClipboard(`${record.provinceId},${record.districtId}`)
              }
              className='text-blue-500 hover:text-blue-600 cursor-pointer text-lg'
            />
            <span className='text-xs text-gray-400 mt-1 max-w-[80px] text-center break-all'>
              ({previewID(record?.districtId)})
            </span>
          </div>
          <div>
            <p className='text-gray-900 font-bold'>{record?.districtEn}</p>
            <p className='text-gray-500'> {record?.districtKh}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Commune',
      dataIndex: 'communeEn',
      key: 'communeEn',
      render: (_, record) => (
        <div className='flex items-center space-x-2'>
          <div className='flex flex-col items-center'>
            <CopyOutlined
              onClick={() =>
                copyToClipboard(
                  `${record.provinceId},${record.districtId},${record.communeId}`
                )
              }
              className='text-blue-500 hover:text-blue-600 cursor-pointer text-lg'
            />
            <span className='text-xs text-gray-400 mt-1 max-w-[80px] text-center break-all'>
              ({previewID(record?.communeId)})
            </span>
          </div>
          <div>
            <p className='text-gray-900 font-bold'>{record?.communeEn}</p>
            <p className='text-gray-500'> {record?.communeKh}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Village ',
      dataIndex: 'villageEn',
      key: 'villageEn',
      render: (_, record) => (
        <div className='flex items-center space-x-2'>
          <div className='flex flex-col items-center'>
            <CopyOutlined
              onClick={() =>
                copyToClipboard(
                  `${record.provinceId},${record.districtId},${record.communeId},${record.villageId}`
                )
              }
              className='text-blue-500 hover:text-blue-600 cursor-pointer text-lg'
            />
            <span className='text-xs text-gray-400 mt-1 max-w-[80px] text-center break-all'>
              ({previewID(record?.villageId)})
            </span>
          </div>
          <div>
            <p className='text-gray-900 font-bold'>{record?.villageEn}</p>
            <p className='text-gray-500'> {record?.villageKh}</p>
          </div>
        </div>
      ),
    },
  ]

  const pagination = {
    current: currentPage,
    pageSize: pageSize,
    total: address?.length,
    onChange: (page, pageSize) => {
      setCurrentPage(page)
      setPageSize(pageSize)
    },
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  }

  const cleanedAddress = address.map((item) => ({ ...item, _id: uuidv4() }))

  return (
    <>
      <div
        className='mb-2'
        style={{ borderRadius: '5px', background: 'white' }}
      >
        <div className='mb-2 px-5 py-4 bg-white shadow-lg rounded-lg border-l-4 border-blue-500'>
          <Form form={form} layout='vertical'>
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={12} md={12} lg={12} xl={6} xxl={6}>
                <Form.Item
                  name='province'
                  style={{ marginBottom: '0px', marginTop: '0px' }}
                >
                  <Select
                    allowClear
                    showSearch
                    placeholder='Filter by Province'
                    className='w-full'
                    optionFilterProp='children'
                    onChange={(value, option) => {
                      if (value === undefined) {
                        handleAllowClearProvince()
                      } else {
                        // Normal selection
                        handleProvince(option.data)
                      }
                    }}
                  >
                    {provinces?.map((province) => (
                      <Select.Option
                        key={province._id}
                        value={province._id}
                        data={province}
                        label={`${province.provinceEn} (${province.provinceKh})`}
                      >
                        {province.provinceEn} ({province.provinceKh})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12} lg={12} xl={6} xxl={6}>
                <Form.Item
                  name='district'
                  style={{ marginBottom: '0px', marginTop: '0px' }}
                >
                  <Select
                    allowClear
                    showSearch
                    placeholder='Filter by District'
                    className='w-full'
                    optionFilterProp='children'
                    onChange={(value, option) => {
                      if (value === undefined) {
                        handleAllowClearDistrict()
                      } else {
                        // Normal selection
                        handleDistrict(option?.data)
                      }
                    }}
                  >
                    {districts?.map((district) => (
                      <Select.Option
                        key={district?._id}
                        value={district?._id}
                        data={district}
                        label={`${district?.districtEn} (${district?.districtKh})`}
                      >
                        {district?.districtEn} ({district?.districtKh})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12} lg={12} xl={6} xxl={6}>
                <Form.Item
                  name='commune'
                  style={{ marginBottom: '0px', marginTop: '0px' }}
                >
                  <Select
                    allowClear
                    showSearch
                    placeholder='Filter by Commune'
                    className='w-full'
                    optionFilterProp='children'
                    onChange={(value, option) => {
                      if (value === undefined) {
                        handleAllowClearCommune()
                      } else {
                        // Normal selection
                        handleCommune(option?.data)
                      }
                    }}
                  >
                    {communes?.map((commune) => (
                      <Select.Option
                        key={commune._id}
                        value={commune._id}
                        data={commune}
                        label={`${commune?.communeEn} (${commune?.communeKh})`}
                      >
                        {commune?.communeEn} ({commune.communeKh})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={12} lg={12} xl={6} xxl={6}>
                <Form.Item
                  name='village'
                  style={{ marginBottom: '0px', marginTop: '0px' }}
                >
                  <Search
                    placeholder='Search by Province, District, Commune or Village'
                    className='w-full'
                    onSearch={(value) => setSearch(value)}
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>

      <Table
        rowKey={(record) => record._id}
        dataSource={cleanedAddress}
        columns={columns}
        bordered={false}
        size='small'
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={pagination}
        rowClassName={(record, index) =>
          index % 2 === 0 ? 'even-row' : 'odd-row'
        }
      />
    </>
  )
}

export default Address
