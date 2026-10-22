import React, { useEffect, useState } from "react";
import { Modal, Input, Button } from "antd";
import { CloseOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function RejectModal({
    open,
    onCancel,
    onSubmit,
    data,
}) {
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (!open) {
            setReason("");
        }
    }, [open]);

    const handleClose = () => {
        setReason("");
        onCancel?.();
    };

    const handleReject = () => {
        if (!reason.trim()) return;

        onSubmit?.({
            ...data,
            rejectReason: reason.trim(),
        });
    };

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            footer={null}
            centered
            width={700}
            destroyOnHidden
            title={null}
            closeIcon={<CloseOutlined className="text-[18px] text-gray-400" />}
            styles={{
                body: { padding: 0 },
                content: {
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                },
            }}
        >
            <div className="px-2 ">
                {/* Header */}
                <div className="mb-2">
                    <h2 className="m-0 text-[20px] font-semibold text-gray-800">
                        Reject Creator Request
                    </h2>

                    <p className="mt-1 mb-0 text-[15px] leading-8 text-gray-500">
                        Please provide a reason for rejecting this request. The user will be
                        notified.
                    </p>
                </div>

                {/* Form */}
                <div className="mb-8">
                    <label className="mb-3 block text-[15px] font-medium text-gray-800">
                        <span className="mr-1 text-red-500">*</span>
                        Rejection Reason
                    </label>

                    <TextArea
                        rows={5}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain why this request is being rejected..."
                        className="!rounded-lg !py-3 !text-[15px]"
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3">
                    <Button
                        onClick={handleClose}
                        className=" !rounded-lg !px-7 !text-[15px]"
                    >
                        Cancel
                    </Button>

                    <Button
                        danger
                        type="primary"
                        style={{ color: 'white' }}
                        icon={<CloseCircleOutlined />}
                        onClick={handleReject}
                        className="!rounded-lg !border-[#ff4d4f] !bg-[#ff4d4f] !px-7 !text-[15px] !font-medium hover:!border-[#ff7875] hover:!bg-[#ff7875]"
                        disabled={!reason.trim()}
                    >
                        Reject Request
                    </Button>
                </div>
            </div>
        </Modal>
    );
}