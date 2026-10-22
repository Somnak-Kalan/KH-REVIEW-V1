import React from 'react'
import { Row, Col, Card, Avatar, Dropdown, Button, Tag } from 'antd'
const DeleteIcon = (
  <svg
    width='8'
    fill='red'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 448 512'
  >
    <path d='M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z' />
  </svg>
)
// Helper to map status to color (for the status pill)
function getStatusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return '#52c41a' // green
    case 'inactive':
      return '#ff4d4f' // red
    case 'pending':
      return '#faad14' // orange
    case 'in review':
      return '#fadb14' // gold
    default:
      return '#d9d9d9' // gray or fallback
  }
}

export default function CardView({ data, currentPage, pageSize, handleView }) {
  // Paginate data
  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <Row gutter={[16, 16]}>
      {paginatedData.map((item) => {
        const statusColor = getStatusColor(item.status)
        return (
          <Col key={item.key} xs={24} sm={12} md={12} lg={12} xl={8} xxl={6}>
            <Card
              hoverable
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
              }}
              cover={
                <div style={{ position: 'relative' }}>
                  {/* Status Pill */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      padding: '2px 8px',
                      borderRadius: 16,
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 12,
                      backgroundColor: statusColor,
                      zIndex: 2,
                    }}
                  >
                    {item.status}
                  </div>
                  {/* Image or fallback */}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.location_name_en}
                      style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    'N/A'
                  )}
                  {/* Action icons in top-right (buildCardFooterActions) */}
                  <div style={{ position: 'absolute', top: 5, right: 5 }}></div>
                </div>
              }
            >
              <Card.Meta
                title={
                  <>
                    {/* Khmer Name */}
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#333',
                        marginBottom: 2,
                      }}
                    >
                      {item.location_name_kh}
                    </div>
                    {/* English Name */}
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: 6,
                      }}
                    >
                      {item.location_name_en}
                    </div>
                  </>
                }
                description={
                  <>
                    {/* Row with Click Count and Place Info */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{ color: '#1890ff', cursor: 'pointer' }}
                        onClick={() => {
                          console.log('Click count clicked:', item.click_count)
                        }}
                      >
                        Click count: {item.click_count}
                      </span>
                      <span style={{ color: '#666' }}>
                        {item.placeID} - {item.ownership}
                      </span>
                    </div>

                    {/* Info box for location details */}
                    <div
                      style={{
                        backgroundColor: '#fafafa',
                        padding: '8px',
                        borderRadius: 8,
                        marginBottom: 8,
                        fontSize: 13,
                        color: '#333',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 13,
                          marginTop: 8,
                        }}
                      >
                        <span style={{ color: '#333' }}>
                          {item.city_province}
                        </span>
                        <span style={{ color: '#666' }}>
                          {item.district_khan}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 13,
                          marginTop: 8,
                        }}
                      >
                        <span style={{ color: '#333' }}>
                          {item.commune_sangkat}
                        </span>
                        <span style={{ color: '#666' }}>
                          {item.district_khan}
                        </span>
                      </div>
                    </div>
                  </>
                }
              />
            </Card>
          </Col>
        )
      })}
    </Row>
  )
}
