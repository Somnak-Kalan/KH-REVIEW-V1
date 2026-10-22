// import React, {
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from 'react'
// import {
//   Form,
//   Radio,
//   Select,
//   Spin,
// } from 'antd'

// import { AuthContext } from '../../../../../../../../../contexts/AuthContext'
// import useVibeStore from '../../../../../../../../../Stores/settings/setups/vibe.store'

// const { Option } = Select

// const normalizeKey = (str = '') => {
//   return String(str || '')
//     .normalize('NFD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9]/gi, '')
//     .toLowerCase()
// }

// export default function Other(props) {
//   const {
//     keyCat,
//     typeOfFood,
//     typeOfPlace,
//     form,
//   } = props

//   const { access_token } = useContext(AuthContext)

//   const [vibeSearch, setVibeSearch] = useState('')

//   // Use the names that actually exist in your store.
//   const storeVibes = useVibeStore(
//     (state) => state.vibes
//   )

//   const vibeLoading = useVibeStore(
//     (state) => state.loading
//   )

//   const fetchVibes = useVibeStore(
//     (state) => state.fetchVibes
//   )

//   const vibes = useMemo(() => {
//     return Array.isArray(storeVibes)
//       ? storeVibes
//       : []
//   }, [storeVibes])

//   useEffect(() => {
//     const categoryKey = normalizeKey(keyCat)

//     if (
//       categoryKey === 'eatery' ||
//       categoryKey === 'cafesbakery'
//     ) {
//       form.resetFields(['typeOfPlace'])
//     } else {
//       form.resetFields(['typeOfFood'])
//     }
//   }, [keyCat, form])

//   // Load all Vibes initially, then search from the API.
//   useEffect(() => {
//     if (!access_token) return
//     if (typeof fetchVibes !== 'function') return

//     const timer = setTimeout(() => {
//       fetchVibes({
//         access_token,
//         doc: {
//           search: vibeSearch.trim(),
//         },
//       }).catch((error) => {
//         console.error(
//           'Fetch vibe list error:',
//           error
//         )
//       })
//     }, 350)

//     return () => clearTimeout(timer)
//   }, [
//     access_token,
//     vibeSearch,
//     fetchVibes,
//   ])

//   const isAccommodation =
//     normalizeKey(keyCat) === 'accommodation'

//   const isFood =
//     normalizeKey(keyCat) === 'eatery' ||
//     normalizeKey(keyCat) === 'cafesbakery'

//   return (
//     <>
//       {isAccommodation && (
//         <Form.Item label='Star' name='star'>
//           <Radio.Group>
//             <Radio value={1}>1</Radio>
//             <Radio value={2}>2</Radio>
//             <Radio value={3}>3</Radio>
//             <Radio value={4}>4</Radio>
//             <Radio value={5}>5</Radio>
//             <Radio value={0}>No star</Radio>
//           </Radio.Group>
//         </Form.Item>
//       )}

//       {isFood ? (
//         <Form.Item
//           label='Type of Food'
//           name='typeOfFood'
//         >
//           <Select
//             mode='multiple'
//             placeholder='Select Type of food'
//             style={{ width: '100%' }}
//             allowClear
//             optionFilterProp='children'
//             showSearch
//           >
//             {Array.isArray(typeOfFood) &&
//               typeOfFood.map((item) => (
//                 <Option
//                   key={item._id}
//                   value={item._id}
//                 >
//                   {`${item?.nameKh || ''} – ${item?.nameEn || ''
//                     }`}
//                 </Option>
//               ))}
//           </Select>
//         </Form.Item>
//       ) : (
//         <Form.Item
//           label='Type Of Place'
//           name='typeOfPlace'
//         >
//           <Select
//             mode='multiple'
//             placeholder='Select Type of place'
//             style={{ width: '100%' }}
//             allowClear
//             optionFilterProp='children'
//             showSearch
//           >
//             {Array.isArray(typeOfPlace) &&
//               typeOfPlace.map((item) => (
//                 <Option
//                   key={item._id}
//                   value={item._id}
//                 >
//                   {`${item?.nameKh || ''} – ${item?.nameEn || ''
//                     }`}
//                 </Option>
//               ))}
//           </Select>
//         </Form.Item>
//       )}

//       <Form.Item
//         label='Vibe'
//         name='vibe'
//       >
//         <Select
//           mode='multiple'
//           placeholder='Select vibe'
//           style={{ width: '100%' }}
//           allowClear
//           showSearch
//           loading={vibeLoading}
//           filterOption={false}
//           maxTagCount='responsive'
//           onSearch={(value) => {
//             setVibeSearch(value || '')
//           }}
//           onClear={() => {
//             setVibeSearch('')
//           }}
//           notFoundContent={
//             vibeLoading ? (
//               <div className='flex justify-center py-2'>
//                 <Spin size='small' />
//               </div>
//             ) : (
//               <div className='py-2 text-center text-gray-400'>
//                 No vibe found
//               </div>
//             )
//           }
//         >
//           {vibes.map((item) => (
//             <Option
//               key={item._id}
//               value={item._id}
//             >
//               {`${item?.nameKh || ''} – ${item?.nameEn || ''
//                 }`}
//             </Option>
//           ))}
//         </Select>
//       </Form.Item>
//     </>
//   )
// }
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Form,
  Radio,
  Select,
  Spin,
  Row, Col
} from 'antd'

import { AuthContext } from '../../../../../../../../../contexts/AuthContext'
import useVibeStore from '../../../../../../../../../Stores/settings/setups/vibe.store'

const { Option } = Select

const normalizeKey = (str = '') => {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
}

export default function Other(props) {
  const {
    keyCat,
    typeOfFood,
    typeOfPlace,
    form,
  } = props

  const { access_token } = useContext(AuthContext)

  const [vibeSearch, setVibeSearch] = useState('')

  // Use the names that actually exist in your store.
  const storeVibes = useVibeStore(
    (state) => state.vibes
  )

  const vibeLoading = useVibeStore(
    (state) => state.loading
  )

  const fetchVibes = useVibeStore(
    (state) => state.fetchVibes
  )

  const vibes = useMemo(() => {
    return Array.isArray(storeVibes)
      ? storeVibes
      : []
  }, [storeVibes])

  useEffect(() => {
    const categoryKey = normalizeKey(keyCat)

    if (
      categoryKey === 'eatery' ||
      categoryKey === 'cafesbakery'
    ) {
      form.resetFields(['typeOfPlace'])
    } else {
      form.resetFields(['typeOfFood'])
    }
  }, [keyCat, form])

  // Load all Vibes initially, then search from the API.
  useEffect(() => {
    if (!access_token) return
    if (typeof fetchVibes !== 'function') return

    const timer = setTimeout(() => {
      fetchVibes({
        access_token,
        doc: {
          search: vibeSearch.trim(),
        },
      }).catch((error) => {
        console.error(
          'Fetch vibe list error:',
          error
        )
      })
    }, 350)

    return () => clearTimeout(timer)
  }, [
    access_token,
    vibeSearch,
    fetchVibes,
  ])

  const isAccommodation =
    normalizeKey(keyCat) === 'accommodation'

  const isFood =
    normalizeKey(keyCat) === 'eatery' ||
    normalizeKey(keyCat) === 'cafesbakery'

  return (
    <>
      {/* {isAccommodation && (
        <Form.Item label='Star' name='star'>
          <Radio.Group>
            <Radio value={1}>1</Radio>
            <Radio value={2}>2</Radio>
            <Radio value={3}>3</Radio>
            <Radio value={4}>4</Radio>
            <Radio value={5}>5</Radio>
            <Radio value={0}>No star</Radio>
          </Radio.Group>
        </Form.Item>
      )} */}


      <Row gutter={16}>

        <Col xs={24} md={12}>
          {isFood ? (
            <Form.Item
              label="Type of Food"
              name="typeOfFood"
            >
              <Select
                mode="multiple"
                placeholder="Select Type of food"
                style={{ width: '100%' }}
                allowClear
                optionFilterProp="children"
                showSearch
              >
                {Array.isArray(typeOfFood) &&
                  typeOfFood.map((item) => (
                    <Option
                      key={item._id}
                      value={item._id}
                    >
                      {`${item?.nameKh || ''} – ${item?.nameEn || ''}`}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              label="Type Of Place"
              name="typeOfPlace"
            >
              <Select
                mode="multiple"
                placeholder="Select Type of place"
                style={{ width: '100%' }}
                allowClear
                optionFilterProp="children"
                showSearch
              >
                {Array.isArray(typeOfPlace) &&
                  typeOfPlace.map((item) => (
                    <Option
                      key={item._id}
                      value={item._id}
                    >
                      {`${item?.nameKh || ''} – ${item?.nameEn || ''}`}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          )}
        </Col>


        <Col xs={24} md={12}>
          <Form.Item
            label="Vibe"
            name="vibe"
          >
            <Select
              mode="multiple"
              placeholder="Select vibe"
              style={{ width: '100%' }}
              allowClear
              showSearch
              loading={vibeLoading}
              filterOption={false}
              maxTagCount="responsive"
              onSearch={(value) => {
                setVibeSearch(value || '')
              }}
              onClear={() => {
                setVibeSearch('')
              }}
              notFoundContent={
                vibeLoading ? (
                  <div className="flex justify-center py-2">
                    <Spin size="small" />
                  </div>
                ) : (
                  <div className="py-2 text-center text-gray-400">
                    No vibe found
                  </div>
                )
              }
            >
              {vibes.map((item) => (
                <Option
                  key={item._id}
                  value={item._id}
                >
                  {`${item?.nameKh || ''} – ${item?.nameEn || ''}`}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

      </Row>
    </>
  )
}