import React from "react";
import { Modal, Button, Avatar } from "antd";
import {
    CloseOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    PhoneOutlined,
    SendOutlined,
    GlobalOutlined,
} from "@ant-design/icons";
import {
    FaFacebookSquare,
    FaTiktok,
    FaGlobe,
    FaInstagram,
    FaYoutube,
} from "react-icons/fa";

export default function ViewRequestModal({
    open,
    onCancel,
    onApprove,
    onReject,
    data,
}) {
    if (!data) return null;

    const status = (data?.status || "pending").toLowerCase();
    const review = data?.review || {};
    const socialLinks = data?.socialLinks || {};
    const locationContact = data?.locationContact || {};
    const actionAudit = data?.actionAudit || {};
    const user = data?.user || {};
    const userSnapshot = data?.userSnapshot || {};
    const rejectedBy = data?.actionAudit?.rejectedBy?.username
    const approvedBy = data?.actionAudit?.approvedBy?.username
    const fullName =
        userSnapshot?.fullName ||
        user?.nickname ||
        user?.username ||
        "Unknown User";

    const avatar =
        userSnapshot?.avatar && user?.profileName
            ? `${userSnapshot.avatar}/${user.profileName}`
            : userSnapshot?.avatar || null;

    const followers =
        userSnapshot?.followersCount ??
        user?.follower ??
        0;

    const currentRole = status === "approved" ? "Creator" : "Normal";

    const formatDateTime = (value) => {
        if (!value) return "-";
        try {
            return new Date(value).toLocaleString();
        } catch (error) {
            return value;
        }
    };

    const getStatusStyle = () => {
        if (status === "approved") {
            return "bg-lime-500 text-white";
        }
        if (status === "rejected") {
            return "bg-red-500 text-white";
        }
        return "bg-amber-400 text-white";
    };

    const getStatusLabel = () => {
        if (status === "approved") return "Approved";
        if (status === "rejected") return "Rejected";
        return "Pending";
    };

    const getReasonBox = () => {
        if (status === "approved" && review?.note) {
            return (
                <div className="rounded-md border border-lime-300 bg-lime-50 px-4 py-3">
                    <div className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-lime-700">
                        <CheckCircleOutlined />
                        Approval Reason
                    </div>
                    <div className="text-[13px] leading-6 text-gray-700">
                        {review.note}
                    </div>
                </div>
            );
        }

        if (status === "rejected" && (review?.rejectionReason || review?.note)) {
            return (
                <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3">
                    <div className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-red-600">
                        <CloseCircleOutlined />
                        Rejection Reason
                    </div>
                    <div className="text-[13px] leading-6 text-gray-700">
                        {review?.rejectionReason || review?.note}
                    </div>
                </div>
            );
        }

        return null;
    };

    const socialItems = [
        {
            key: "tiktok",
            value: socialLinks?.tiktok,
            icon: <FaTiktok className="text-[16px] text-black" />,
        },
        {
            key: "facebook",
            value: socialLinks?.facebook,
            icon: <FaFacebookSquare className="text-[16px] text-[#1877F2]" />,
        },
        {
            key: "instagram",
            value: socialLinks?.instagram,
            icon: <FaInstagram className="text-[16px] text-[#ff4d6d]" />,
        },
        {
            key: "youtube",
            value: socialLinks?.youtube,
            icon: <FaYoutube className="text-[16px] text-[#ff0000]" />,
        },
        {
            key: "portfolioWebsite",
            value: socialLinks?.portfolioWebsite,
            icon: <GlobalOutlined className="text-[15px] text-[#7c3aed]" />,
        },
        {
            key: "otherLink",
            value: socialLinks?.otherLink,
            icon: <FaGlobe className="text-[16px] text-[#7c3aed]" />,
        },
    ].filter((item) => item.value);

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            width={760}
            title={null}
            closeIcon={<CloseOutlined className="text-[18px] text-gray-400" />}
            styles={{
                body: { padding: 0 },
                content: { borderRadius: 12, padding: 0 },
            }}
        >
            <div className="px-5 py-4 md:px-6 md:py-5">
                {/* Header */}
                <div className="mb-4 text-[16px] font-semibold text-gray-800">
                    Creator Request Details
                </div>

                <div className="mb-5 flex items-start gap-4">
                    <div className="shrink-0">
                        {avatar ? (
                            <Avatar
                                src={avatar}
                                size={58}
                                className="border border-gray-200"
                            />
                        ) : (
                            <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-gray-300 text-[18px] font-semibold text-white">
                                {fullName?.slice(0, 2)?.toUpperCase() || "NA"}
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="text-[28px] leading-none font-semibold text-gray-900">
                            {fullName}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusStyle()}`}
                            >
                                {getStatusLabel()}
                            </span>

                            <span className="rounded bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">
                                Current: {currentRole}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-5 border-t border-gray-200" />

                {/* About */}
                <div className="mb-5">
                    <div className="mb-2 text-[14px] font-semibold text-gray-800">
                        About
                    </div>
                    <p className="whitespace-pre-line text-[13px] leading-6 text-gray-700">
                        {data?.about || "-"}
                    </p>
                </div>

                {/* Content Types */}
                <div className="mb-5">
                    <div className="mb-2 text-[14px] font-semibold text-gray-800">
                        Content Types
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(data?.contentTypes || []).length > 0 ? (
                            data.contentTypes.map((item, index) => (
                                <span
                                    key={`${item}-${index}`}
                                    className="rounded-md bg-blue-50 px-2.5 py-1 text-[12px] text-blue-600"
                                >
                                    {item}
                                </span>
                            ))
                        ) : (
                            <span className="text-[13px] text-gray-400">-</span>
                        )}
                    </div>
                </div>

                {/* Location & Contact */}
                <div className="mb-5">
                    <div className="mb-2 text-[14px] font-semibold text-gray-800">
                        Location & Contact
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 px-3 py-3">
                            <div className="text-[12px] text-gray-400">Province</div>
                            <div className="mt-1 text-[13px] font-medium text-gray-800">
                                {locationContact?.provinceName || "-"}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 px-3 py-3">
                            <div className="text-[12px] text-gray-400">Phone</div>
                            <div className="mt-1 flex items-center gap-2 text-[13px] font-medium text-gray-800">
                                <PhoneOutlined />
                                {locationContact?.phone || "-"}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 px-3 py-3">
                            <div className="text-[12px] text-gray-400">Phone (Telegram)</div>
                            <div className="mt-1 flex items-center gap-2 text-[13px] font-medium text-gray-800">
                                <SendOutlined />
                                {locationContact?.telegramPhone || "-"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="mb-5">
                    <div className="mb-2 text-[14px] font-semibold text-gray-800">
                        Social Media & Portfolio
                    </div>

                    <div className="space-y-2 text-[13px]">
                        {socialItems.length > 0 ? (
                            socialItems.map((item) => {
                                const href =
                                    item.value?.startsWith("http://") ||
                                        item.value?.startsWith("https://")
                                        ? item.value
                                        : `https://${item.value}`;

                                return (
                                    <a
                                        key={item.key}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={item.value}
                                        className="flex items-start gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        <span className="mt-[2px] shrink-0">{item.icon}</span>
                                        <span className="min-w-0 flex-1 truncate">
                                            {item.value}
                                        </span>
                                    </a>
                                );
                            })
                        ) : (
                            <div className="text-[13px] text-gray-400">-</div>
                        )}
                    </div>
                </div>

                {/* Current Performance */}
                <div className="mb-5">
                    <div className="mb-2 text-[14px] font-semibold text-gray-800">
                        Current Performance
                    </div>

                    <div className="rounded-lg border border-gray-200 px-3 py-3">
                        <div className="text-[12px] text-gray-400">Followers</div>
                        <div className="mt-1 text-[16px] font-semibold text-gray-900">
                            {followers}
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="mb-5">
                    <div className="mb-2 text-[14px] font-semibold text-gray-800">
                        Timeline
                    </div>

                    <div className="space-y-2 text-[13px] text-gray-600">
                        <div>
                            <span className="text-gray-400">Requested:</span>{" "}
                            {formatDateTime(actionAudit?.requestedAt || data?.createdAt)}
                        </div>

                        {status === "approved" && (
                            <div>
                                <span className="text-gray-400">Reviewed:</span>{" "}
                                {formatDateTime(
                                    actionAudit?.approvedAt || review?.reviewedAt || data?.updatedAt
                                )} By {approvedBy}
                            </div>
                        )}

                        {status === "rejected" && (
                            <div>
                                <span className="text-gray-400">Reviewed:</span>{" "}
                                {formatDateTime(
                                    actionAudit?.rejectedAt || review?.reviewedAt || data?.updatedAt
                                )} By {rejectedBy}
                            </div>
                        )}

                        {status === "pending" && (
                            <div>
                                <span className="text-gray-400">Reviewed:</span> -
                            </div>
                        )}
                    </div>
                </div>

                {/* Review Reason */}
                {getReasonBox() && <div className="mb-5">{getReasonBox()}</div>}

                {/* Footer */}
                <div className="flex justify-end gap-3">
                    <Button onClick={onCancel} size="middle">
                        Close
                    </Button>

                    {status === "pending" && (
                        <>
                            <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => onReject?.(data)}
                            >
                                Reject
                            </Button>

                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => onApprove?.(data)}
                            >
                                Approve
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}