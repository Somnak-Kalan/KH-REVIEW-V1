import { CheckCircleOutlined } from '@ant-design/icons'
import { Card, Col, Divider, Empty, Row, Skeleton } from 'antd'
import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

const Module = () => {
  const { modules } = useOutletContext()
  const [loading, setLoading] = useState(true)
  const [isLengthEmpty, setIsLengthEmpty] = useState(true)
  // Group permissions by groupTitle
  const groupPermissions = (permissions) => {
    return permissions.reduce((acc, permission) => {
      const { groupTitle } = permission
      if (!acc[groupTitle]) {
        acc[groupTitle] = []
      }
      acc[groupTitle].push(permission)
      return acc
    }, {})
  }
  useEffect(() => {
    if (modules?.length > 0) {
      setLoading(false)
    } else {
      // Introduce a delay of 1 second
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
    if (modules?.length > 0) {
      setIsLengthEmpty(false)
    }
  }, [modules])

  return (
    <>
      <Card title='Module' className='shadow-md'>
        <div>
          {loading ? (
            <Skeleton active />
          ) : modules?.length === 0 ? (
            <Empty description='No modules available' />
          ) : (
            <>
              {modules &&
                modules.map((module, index) => (
                  <div key={index}>
                    {module?.name && module?._id ? (
                      <div key={module._id}>
                        <div className='mx-0 my-5 bg-gray-100 p-2 rounded-sm text-gray-500 font-semibold'>
                          {module?.name}
                        </div>

                        {/* Group permissions by groupTitle */}
                        {Object.entries(
                          groupPermissions(module?.permissions || [])
                        ).map(([groupTitle, permissions]) => (
                          <div key={groupTitle}>
                            <Divider orientation='left'>
                              <span className='text-gray-500 text-sm font-semibold'>
                                {groupTitle}
                              </span>
                            </Divider>
                            <Row gutter={[8, 2]}>
                              {permissions.map((permission) => (
                                <Col
                                  key={permission._id}
                                  xs={24}
                                  sm={10}
                                  md={12}
                                  lg={8}
                                  xl={8}
                                  xxl={8}
                                >
                                  <span className='mx-1'>
                                    <CheckCircleOutlined
                                      style={{ color: 'blue' }}
                                    />
                                  </span>
                                  <span className='mx-1'>
                                    {permission.system}
                                  </span>
                                </Col>
                              ))}
                            </Row>
                          </div>
                        ))}
                      </div>
                    ) : isLengthEmpty === true ? (
                      ''
                    ) : (
                      <Empty description='No modules available' />
                    )}
                  </div>
                ))}
            </>
          )}
        </div>
      </Card>
    </>
  )
}

export default Module
