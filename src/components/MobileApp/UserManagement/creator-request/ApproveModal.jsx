// import React, { useState } from "react";
// import { Modal, Input, Button } from "antd";
// import { CloseOutlined, CheckCircleOutlined } from "@ant-design/icons";

// const { TextArea } = Input;

// export default function ApproveModal({
//     open,
//     onCancel,
//     onSubmit,
//     data,
// }) {
//     const [reason, setReason] = useState("");

//     const handleClose = () => {
//         setReason("");
//         onCancel?.();
//     };

//     const handleApprove = () => {
//         onSubmit?.({
//             ...data,
//             approveReason: reason,
//         });
//         onCancel?.();
//         setReason("");
//     };

//     return (
//         <Modal
//             open={open}
//             onCancel={handleClose}
//             footer={null}
//             centered
//             width={700}
//             destroyOnHidden
//             title={null}
//             closeIcon={<CloseOutlined className="text-[18px] text-gray-400" />}
//             styles={{
//                 body: { padding: 0 },
//                 content: {
//                     borderRadius: 12,
//                     overflow: "hidden",
//                     boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
//                 },
//             }}
//         >
//             <div className="px-2 py-0">
//                 {/* Header */}
//                 <div className="mb-2">
//                     <h2 className="m-0 text-[20px] font-semibold text-gray-800">
//                         Approve Creator Request
//                     </h2>
//                     <p className="mt-2 mb-0 text-[15px] leading-5 text-gray-500">
//                         You can optionally provide a reason or note for approving this request.
//                         <br />
//                         The user will be promoted to Content Creator.
//                     </p>
//                 </div>

//                 {/* Input */}
//                 <div className="mb-8">
//                     <label className="mb-3 block text-[15px] font-medium text-gray-800">
//                         Approval Reason (Optional)
//                     </label>

//                     <TextArea
//                         rows={5}
//                         value={reason}
//                         onChange={(e) => setReason(e.target.value)}
//                         placeholder="You can add a note or reason for approving this request (optional)..."
//                         className="!rounded-lg !py-3 !text-[15px]"
//                     />
//                 </div>

//                 {/* Footer */}
//                 <div className="flex justify-end gap-3">
//                     <Button
//                         onClick={handleClose}
//                         className=" !rounded-lg !px-6 !text-[15px]"
//                     >
//                         Cancel
//                     </Button>

//                     <Button
//                         type="primary"
//                         icon={<CheckCircleOutlined />}
//                         onClick={handleApprove}
//                         className=" !rounded-lg !px-6 !text-[15px] !font-medium"
//                     >
//                         Approve as Creator
//                     </Button>
//                 </div>
//             </div>
//         </Modal>
//     );
// }
import React, { useState, useEffect } from "react";
import { Modal, Input, Button } from "antd";
import { CloseOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function ApproveModal({
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

    const handleApprove = () => {
        onSubmit?.({
            ...data,
            approveReason: reason,
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
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                },
            }}
        >
            <div className="px-2 py-0">
                {/* Header */}
                <div className="mb-2">
                    <h2 className="m-0 text-[20px] font-semibold text-gray-800">
                        Approve Creator Request
                    </h2>
                    <p className="mt-2 mb-0 text-[15px] leading-5 text-gray-500">
                        You can optionally provide a reason or note for approving this request.
                        <br />
                        The user will be promoted to Content Creator.
                    </p>
                </div>

                {/* Input */}
                <div className="mb-8">
                    <label className="mb-3 block text-[15px] font-medium text-gray-800">
                        Approval Reason (Optional)
                    </label>

                    <TextArea
                        rows={5}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="You can add a note or reason for approving this request (optional)..."
                        className="!rounded-lg !py-3 !text-[15px]"
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3">
                    <Button
                        onClick={handleClose}
                        className=" !rounded-lg !px-6 !text-[15px]"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handleApprove}
                        className=" !rounded-lg !px-6 !text-[15px] !font-medium"
                    >
                        Approve as Creator
                    </Button>
                </div>
            </div>
        </Modal>
    );
}