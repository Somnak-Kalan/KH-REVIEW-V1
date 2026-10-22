import { CheckCircleOutlined } from '@ant-design/icons'
import { Card, Col, Divider, Empty, Row, Skeleton } from 'antd'
import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

const Roles = () => {
  const { roles } = useOutletContext()
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
    if (roles?.length > 0) {
      setLoading(false)
    }

    if (roles?.length > 0) {
      setIsLengthEmpty(false)
    }
  }, [roles])

  return (
    <>
      <Card
        title={<span className='text-gray-800 font-semibold'>Role</span>}
        className='shadow-md'
      >
        <div>
          {loading ? (
            <Skeleton active />
          ) : roles?.length === 0 ? (
            <Empty description='No modules available' />
          ) : (
            <>
              {roles?.map((index, role) => (
                <div key={index}>
                  {role?.name && role?._id ? (
                    <div key={role._id}>
                      <div className='mx-0 my-5 bg-gray-100 p-2 rounded-sm text-gray-500 font-semibold'>
                        {role?.name}
                      </div>

                      {Object.entries(
                        groupPermissions(role?.permissions || [])
                      )?.map(([groupTitle, permissions]) => (
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

export default Roles
