import React from 'react'
import Swal from 'sweetalert2'
import { CaretDownOutlined } from '@ant-design/icons'

const truncateText = (text, maxLength = 50) => {
  if (typeof text === 'string' && text.length > maxLength) {
    return text.substring(0, maxLength) + '...'
  }
  return text
}

const renderRemarks = (record, activeTab) => {
  const data = activeTab === 'remark' ? record?.remark : record?.comments

  if (!data || !Array.isArray(data)) return null
  const handleClick = () => {
    Swal.fire({
      title: activeTab === 'remark' ? 'Remarks' : 'Comments',
      html: `
        <div id="remark-container" style="text-align: left; max-height: 300px; overflow-y: auto;">
          ${data
            .map(
              (item, index) => `

              <div style="display:flex;align-items:center;">
              
                    <div style="background-color:${activeTab === 'remark' ? '#6AC917' : '#F69523'}; color: white; min-width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 8px; cursor: pointer;">
                            ${index + 1}
                    </div>
                    <div>
                    
                    </div>
                    <div id="remark-${index}" style="margin-bottom: 10px;width:100%; padding: 10px; background: ${
                      activeTab === 'remark' ? '#F6F9F3' : '#FDFAF5'
                    }; border-radius: 8px; position: relative;">
                     
                      <div>
                        <div style="font-size: 12px; color: gray;">
                          ${item?.date} <span style="color: #4096ff;">${item?.time}</span>
                        </div>
                        <div style="font-size: 13px; margin-top: 4px;">
                          ${item?.text}
                        </div>
                      
                      </div>
                      
                      <button 
                        id="delete-btn-${index}" 
                        style="position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer;"
                    
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    
                    </div>
              </div>
              <hr style="margin-bottom:8px ; border: none; border-top: 1px solid ${activeTab === 'remark' ? '#F6F9F3' : '#FDFAF5'};" />

              `
            )
            .join('')}
          
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: 600,
      customClass: {
        title: 'swal-left-title', //
      },
      didOpen: () => {
        const style = document.createElement('style')
        style.innerHTML = `
        .swal-left-title {
          text-align: left !important;
          padding-left: 20px;
          font-weight: 600;
          font-size: 18px;
        }
      `
        document.head.appendChild(style)
        data.forEach((_, index) => {
          const btn = document.getElementById(`delete-btn-${index}`)
          if (btn) {
            btn.addEventListener('click', () => {
              // Remove the item from UI
              const el = document.getElementById(`remark-${index}`)
              if (el) el.remove()

              // Optional: console log or callback
              console.log(`Deleted item at index ${index}`)
            })
          }
        })
      },
    })
  }

  return (
    <div style={{ textAlign: 'left' }} className='flex'>
      {/* Badge with onClick */}
      <div
        onClick={handleClick}
        style={{
          backgroundColor: activeTab === 'remark' ? '#6AC917' : '#F69523',
          color: 'white',
          minWidth: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          marginRight: 8,
          cursor: 'pointer',
        }}
      >
        <span>
          {data.length}
          <CaretDownOutlined />
        </span>
      </div>

      {/* Short preview */}
      <div style={{ textAlign: 'left' }} className='flex text-xs'>
        {data.slice(0, 2).map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: 8,
              background: activeTab === 'remark' ? '#F6F9F3' : '#FDFAF5',
            }}
            className='mx-1 px-2 py-1 rounded-lg'
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: '12px',
                  marginBottom: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span className='text-gray-400'>{item?.date}</span>
                <span className='text-blue-400'>{item?.time}</span>
              </div>
              <div style={{ display: 'flex' }} className='items-center'>
                {truncateText(item?.text, 50)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default renderRemarks
