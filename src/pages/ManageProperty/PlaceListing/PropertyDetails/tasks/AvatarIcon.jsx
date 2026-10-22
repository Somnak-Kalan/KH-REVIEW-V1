import React from 'react'
import { Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'

const UserAvatar = ({ name }) => {
    const firstLetter = name ? name.charAt(0).toUpperCase() : null

    // Generate a consistent color based on the first letter
    const colors = [
        '#F56A00', '#7265E6', '#FFBF00', '#00A2AE',
        '#FF4D4F', '#52C41A', '#1890FF', '#13C2C2',
        '#722ED1', '#EB2F96', '#2F54EB', '#FA8C16'
    ]

    // Pick a color deterministically (same letter → same color)
    const colorIndex = firstLetter ? (firstLetter.charCodeAt(0) % colors.length) : 0
    const backgroundColor = colors[colorIndex]

    return (
        <Avatar
            shape='square'
            src=''
            icon={!firstLetter && <UserOutlined />}
            style={{
                marginRight: 5,
                width: 40,
                height: 40,
                backgroundColor: firstLetter ? backgroundColor : '#ccc',
                color: '#fff',
                fontWeight: 'bold',
            }}
        >
            {firstLetter}
        </Avatar>
    )
}

export default UserAvatar
