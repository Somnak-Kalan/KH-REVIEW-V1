import React from 'react'
import { Modal, Button } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'

export default function ConfirmStatusModal({ open, status, onCancel, onConfirm, loading = false }) {
    const isActive = String(status || '').toLowerCase() === 'active'

    return (
        <Modal
            open={open}
            onCancel={loading ? undefined : onCancel}
            footer={null}
            centered
            width={520}
            closable={!loading}
            maskClosable={!loading}
        >
            <div className="text-center py-2">
                <div className="flex justify-center mb-4">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: isActive ? '#dcfce7' : '#fee2e2' }}
                    >
                        {isActive ? (
                            <EyeOutlined style={{ fontSize: 22, color: '#16a34a' }} />
                        ) : (
                            <EyeInvisibleOutlined style={{ fontSize: 22, color: '#e11d48' }} />
                        )}
                    </div>
                </div>

                <div className="text-xl font-semibold">
                    {isActive ? 'Active this user' : 'Inactive this user'}
                </div>

                <div className="text-slate-500 mt-2">
                    Are you sure you want to {isActive ? 'active' : 'inactive'} this user
                </div>

                <div className="flex justify-center gap-3 mt-6">
                    <Button className="rounded-full px-8" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>

                    <Button
                        className="rounded-full px-10"
                        type="primary"
                        onClick={onConfirm}
                        loading={loading}
                        style={{
                            background: isActive ? '#22c55e' : '#ef4444',
                            borderColor: isActive ? '#22c55e' : '#ef4444',
                        }}
                    >
                        {isActive ? 'Active' : 'Inactive'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}