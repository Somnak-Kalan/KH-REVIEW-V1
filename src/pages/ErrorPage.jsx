import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate, useRouteError } from 'react-router-dom'

export default function ErrorPage() {
    const navigate = useNavigate()
    const err = useRouteError()

    return (
        <Result
            status="500"
            title="Something went wrong"
            subTitle={err?.message || 'Please refresh and try again.'}
            extra={[
                <Button key="home" type="primary" onClick={() => navigate('/')}>Go Home</Button>,
                <Button key="reload" onClick={() => window.location.reload()}>Reload</Button>,
            ]}
        />
    )
}
