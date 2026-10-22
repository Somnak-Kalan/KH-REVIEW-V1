import React from "react";
import { Table, Button, Space, Tooltip } from "antd";
import {
    UserOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import StatusTag from "./StatusTag";

export default function RequestList({
    data = [],
    pagination,
    onView,
    onApprove,
    onReject,
}) {
    const columns = [
        {
            title: "User",
            dataIndex: "name",
            key: "user",
            render: (_, r) => {
                const initials = (r.name || "-")
                    .split(" ")
                    .map((item) => item[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                return (
                    <div className="flex items-center gap-3">
                        {r?.userSnapshot?.avatar ? (
                            <img
                                src={r?.userSnapshot?.avatar}

                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300 text-base font-medium text-white">
                                {initials}
                            </div>
                        )}

                        <div>
                            <div className="text-[14px] font-medium text-gray-900">
                                {r.name || "-"}
                            </div>
                            <div className="text-sm text-gray-400">
                                {r.location || "-"} • {r.followers || 0} followers
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (_, r) => {
                const statusNode = <StatusTag status={r.status} />;
                const showTooltip =
                    ["approved", "rejected"].includes(String(r.status).toLowerCase()) &&
                    r.reason;

                return showTooltip ? (
                    <Tooltip title={r.reason} placement="top">
                        <span className="inline-block cursor-pointer">{statusNode}</span>
                    </Tooltip>
                ) : (
                    statusNode
                );
            },
        },
        {
            title: "About",
            dataIndex: "about",
            key: "about",
            render: (text) => {
                const value = text || "-";
                const shouldTooltip = typeof text === "string" && text.length > 35;

                const content = (
                    <span className="block max-w-[220px] cursor-pointer truncate text-gray-600">
                        {value}
                    </span>
                );

                return shouldTooltip ? (
                    <Tooltip title={text} placement="topLeft">
                        {content}
                    </Tooltip>
                ) : (
                    content
                );
            },
        },
        {
            title: "Content Types",
            dataIndex: "contentTypes",
            key: "contentTypes",
            render: (contentTypes) => {
                const value =
                    Array.isArray(contentTypes) && contentTypes.length > 0
                        ? contentTypes.join(", ")
                        : "-";

                const shouldTooltip = value !== "-" && value.length > 30;

                const content = (
                    <span className="block max-w-[220px] cursor-pointer truncate text-gray-600">
                        {value}
                    </span>
                );

                return shouldTooltip ? (
                    <Tooltip title={value} placement="topLeft">
                        {content}
                    </Tooltip>
                ) : (
                    content
                );
            },
        },
        {
            title: "Request By",
            key: "requestBy",
            align: "center",
            render: (_, r) => {
                const role = r?.requestBy?.role || "Admin";
                const name = r?.requestBy?.role || "-";

                return (
                    <div className="flex flex-col gap-2">
                        <div
                            className={`inline-flex w-fit items-center gap-2 rounded-xl px-4 ${role === "App"
                                ? "bg-green-50 text-green-600"
                                : "bg-blue-50 text-blue-600"
                                }`}
                        >
                            <UserOutlined className="text-[12px]" />
                            <span className="text-[12px] font-medium">{role}</span>
                        </div>

                        <div className="text-[12px] font-medium text-[#8c8c8c]">
                            {name}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => {
                if (!text) return "-";

                const date = new Date(text);
                if (Number.isNaN(date.getTime())) return "-";

                return date.toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                });
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, r) => {
                const isPending = r.status === "pending";
                const isApproved = r.status === "approved";
                const isRejected = r.status === "rejected";

                return (
                    <Space wrap>
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => onView?.(r)}
                        >
                            View
                        </Button>

                        {isPending && (
                            <>
                                <Button
                                    size="small"
                                    icon={<CheckCircleOutlined />}
                                    className="!border-green-500 !bg-green-500 !text-white hover:!border-green-600 hover:!bg-green-600"
                                    onClick={() => onApprove?.(r)}
                                >
                                    Approve
                                </Button>
                                <Button
                                    size="small"
                                    icon={<CloseCircleOutlined />}
                                    className="!border-red-500 !bg-red-500 !text-white hover:!border-red-600 hover:!bg-red-600"
                                    onClick={() => onReject?.(r)}
                                >
                                    Reject
                                </Button>
                            </>
                        )}

                        {isApproved && (
                            <Button
                                size="small"
                                icon={<CheckCircleOutlined />}
                                className="!cursor-default !border-green-100 !bg-green-50 !text-green-600 hover:!border-green-100 hover:!bg-green-50 hover:!text-green-600"
                            >
                                Approved
                            </Button>
                        )}

                        {isRejected && (
                            <Button
                                size="small"
                                icon={<CloseCircleOutlined />}
                                className="!cursor-default !border-red-100 !bg-red-50 !text-red-600 hover:!border-red-100 hover:!bg-red-50 hover:!text-red-600"
                            >
                                Rejected
                            </Button>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <Table
            rowKey={(record) => record?._id || record?.id}
            columns={columns}
            dataSource={data}
            size="small"
            scroll={{ x: "max-content" }}
            pagination={pagination}
        />
    );
}