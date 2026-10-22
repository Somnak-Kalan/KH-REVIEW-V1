// import React from 'react'

// const PostDashboard = () => {
//     const stats = [
//         {
//             value: 89,
//             label: 'Total Viewed',
//             valueColor: '#1890ff',
//             bgColor: '#eaf5ff',
//         },
//         {
//             value: 34,
//             label: 'Total Liked',
//             valueColor: '#ff0000',
//             bgColor: '#fff0f0',
//         },
//         {
//             value: 89,
//             label: 'Total Saved',
//             valueColor: '#fa8c16',
//             bgColor: '#fff4ec',
//         },
//         {
//             value: 12,
//             label: 'Total Shared',
//             valueColor: '#334155',
//             bgColor: '#f1f2f4',
//         },
//         {
//             value: 12,
//             label: 'Total Reposts',
//             valueColor: '#334155',
//             bgColor: '#f1f2f4',
//         },
//         {
//             value: 18,
//             label: 'Total Comments',
//             valueColor: '#00b96b',
//             bgColor: '#eafaf1',
//         },
//     ]

//     return (
//         <div className="dashboard-stat-wrapper">
//             <div className="dashboard-stat-scroll">
//                 {stats.map((item, index) => (
//                     <div
//                         key={index}
//                         className="dashboard-stat-card"
//                         style={{ backgroundColor: item.bgColor }}
//                     >
//                         <div
//                             className="dashboard-stat-value"
//                             style={{ color: item.valueColor }}
//                         >
//                             {item.value}
//                         </div>

//                         <div className="dashboard-stat-label">
//                             {item.label}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             <style>{`
//                 .dashboard-stat-wrapper {
//                     width: 100%;
//                     background: #ffffff;
//                     border-radius: 8px;
//                     box-sizing: border-box;
//                 }

//                 .dashboard-stat-scroll {
//                     display: flex;
//                     gap: 12px;
//                     width: 100%;
//                     overflow-x: auto;
//                     overflow-y: hidden;
//                     padding-bottom: 2px;
//                     scrollbar-width: thin;
//                 }

//                 .dashboard-stat-scroll::-webkit-scrollbar {
//                     height: 4px;
//                 }

//                 .dashboard-stat-scroll::-webkit-scrollbar-thumb {
//                     background: #d9d9d9;
//                     border-radius: 20px;
//                 }

//                 .dashboard-stat-card {
//                     flex: 1;
//                     min-width: 150px;
//                     height: 80px;
//                     border-radius: 8px;
//                     display: flex;
//                     flex-direction: column;
//                     align-items: center;
//                     justify-content: center;
//                     box-sizing: border-box;
//                     transition: all 0.2s ease;
//                 }

//                 .dashboard-stat-card:hover {
//                     transform: translateY(-1px);
//                     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
//                 }

//                 .dashboard-stat-value {
//                     font-size: 15px;
//                     font-weight: 700;
//                     line-height: 20px;
//                 }

//                 .dashboard-stat-label {
//                     margin-top: 2px;
//                     font-size: 11px;
//                     font-weight: 400;
//                     color: #64748b;
//                     line-height: 16px;
//                     white-space: nowrap;
//                 }

//                 @media (max-width: 768px) {
//                     .dashboard-stat-wrapper {
//                         padding: 8px;
//                     }

//                     .dashboard-stat-scroll {
//                         gap: 8px;
//                     }

//                     .dashboard-stat-card {
//                         flex: 0 0 145px;
//                         min-width: 145px;
//                     }
//                 }
//             `}</style>
//         </div>
//     )
// }

// export default PostDashboard
import React, { useMemo } from 'react'

const defaultStats = [
    {
        key: 'views',
        value: 0,
        label: 'Total Viewed',
        valueColor: '#1890ff',
        bgColor: '#eaf5ff',
    },
    {
        key: 'likes',
        value: 0,
        label: 'Total Liked',
        valueColor: '#ff0000',
        bgColor: '#fff0f0',
    },
    {
        key: 'saves',
        value: 0,
        label: 'Total Saved',
        valueColor: '#fa8c16',
        bgColor: '#fff4ec',
    },
    {
        key: 'shares',
        value: 0,
        label: 'Total Shared',
        valueColor: '#334155',
        bgColor: '#f1f2f4',
    },
    {
        key: 'reposts',
        value: 0,
        label: 'Total Reposts',
        valueColor: '#334155',
        bgColor: '#f1f2f4',
    },
    {
        key: 'comments',
        value: 0,
        label: 'Total Comments',
        valueColor: '#00b96b',
        bgColor: '#eafaf1',
    },
]

const PostDashboard = ({ stats }) => {
    const finalStats = useMemo(() => {
        if (Array.isArray(stats) && stats.length > 0) {
            return stats
        }

        return defaultStats
    }, [stats])

    return (
        <div className="dashboard-stat-wrapper">
            <div className="dashboard-stat-scroll">
                {finalStats.map((item, index) => (
                    <div
                        key={item.key || index}
                        className="dashboard-stat-card"
                        style={{ backgroundColor: item.bgColor }}
                    >
                        <div
                            className="dashboard-stat-value"
                            style={{ color: item.valueColor }}
                        >
                            {item.value || 0}
                        </div>

                        <div className="dashboard-stat-label">
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .dashboard-stat-wrapper {
                    width: 100%;
                    background: #ffffff;
                    border-radius: 8px;
                    box-sizing: border-box;
                }

                .dashboard-stat-scroll {
                    display: flex;
                    gap: 12px;
                    width: 100%;
                    overflow-x: auto;
                    overflow-y: hidden;
                    padding-bottom: 2px;
                    scrollbar-width: thin;
                }

                .dashboard-stat-scroll::-webkit-scrollbar {
                    height: 4px;
                }

                .dashboard-stat-scroll::-webkit-scrollbar-thumb {
                    background: #d9d9d9;
                    border-radius: 20px;
                }

                .dashboard-stat-card {
                    flex: 1;
                    min-width: 150px;
                    height: 80px;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    transition: all 0.2s ease;
                }

                .dashboard-stat-card:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                }

                .dashboard-stat-value {
                    font-size: 15px;
                    font-weight: 700;
                    line-height: 20px;
                }

                .dashboard-stat-label {
                    margin-top: 2px;
                    font-size: 11px;
                    font-weight: 400;
                    color: #64748b;
                    line-height: 16px;
                    white-space: nowrap;
                }

                @media (max-width: 768px) {
                    .dashboard-stat-wrapper {
                        padding: 8px;
                    }

                    .dashboard-stat-scroll {
                        gap: 8px;
                    }

                    .dashboard-stat-card {
                        flex: 0 0 145px;
                        min-width: 145px;
                    }
                }
            `}</style>
        </div>
    )
}

export default PostDashboard