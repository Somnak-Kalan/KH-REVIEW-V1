import React from "react";
import { Card, Avatar, Dropdown, Tooltip, Pagination, Empty } from "antd";
import {
    MoreOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import StatusTag from "./StatusTag";

const getInitials = (name = "") =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export default function RequestGrid({
    data = [],
    pagination,
    onView,
    onApprove,
    onReject,
}) {
    return (
        <div>
            {data.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {data.map((item) => {
                        const isPending = item.status === "pending";

                        const menuItems = isPending
                            ? [
                                {
                                    key: "view",
                                    label: (
                                        <button
                                            className="w-full text-left"
                                            onClick={() => onView?.(item)}
                                        >
                                            View
                                        </button>
                                    ),
                                },
                                {
                                    key: "approve",
                                    label: (
                                        <button
                                            className="w-full text-left"
                                            onClick={() => onApprove?.(item)}
                                        >
                                            Approve
                                        </button>
                                    ),
                                },
                                {
                                    key: "reject",
                                    label: (
                                        <button
                                            className="w-full text-left text-red-500"
                                            onClick={() => onReject?.(item)}
                                        >
                                            Reject
                                        </button>
                                    ),
                                },
                            ]
                            : [
                                {
                                    key: "view",
                                    label: (
                                        <button
                                            className="w-full text-left"
                                            onClick={() => onView?.(item)}
                                        >
                                            View
                                        </button>
                                    ),
                                },
                            ];

                        const requestRole = item.requestBy?.role || "App";
                        const aboutTooLong = (item.about || "").length > 95;
                        const contentValue =
                            Array.isArray(item.contentTypes) && item.contentTypes.length
                                ? item.contentTypes.join(", ")
                                : "-";
                        const contentTooLong = contentValue.length > 22;

                        const showStatusTooltip =
                            ["approved", "rejected"].includes(
                                String(item.status).toLowerCase()
                            ) && item.reason;

                        return (
                            <Card
                                key={item._id || item.id}
                                className="!rounded-2xl !border-gray-200 !shadow-sm"
                                styles={{ body: { padding: 20 } }}
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        {item.avatar ? (
                                            <Avatar src={item?.userSnapshot?.avatar} size={40} />
                                        ) : (
                                            <Avatar
                                                size={40}
                                                className="!bg-gray-300 !text-[18px] !text-white"
                                            >
                                                {getInitials(item.name)}
                                            </Avatar>
                                        )}

                                        <div>
                                            <div className="text-[18px] font-semibold text-gray-900">
                                                {item.name || "-"}
                                            </div>
                                            <div className="mt-1 text-[13px] text-gray-500">
                                                {item.location || "-"}{" "}
                                                <span className="mx-1">•</span>
                                                {item.followers || 0} followers
                                            </div>
                                        </div>
                                    </div>

                                    <Dropdown
                                        menu={{ items: menuItems }}
                                        trigger={["click"]}
                                        placement="bottomRight"
                                    >
                                        <button className="text-gray-500 hover:text-gray-700">
                                            <MoreOutlined className="text-[20px]" />
                                        </button>
                                    </Dropdown>
                                </div>

                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    {showStatusTooltip ? (
                                        <Tooltip title={item.reason}>
                                            <span className="inline-block cursor-pointer">
                                                <StatusTag status={item.status} />
                                            </span>
                                        </Tooltip>
                                    ) : (
                                        <StatusTag status={item.status} />
                                    )}

                                    <span
                                        className={`rounded-xl px-3 py-1 text-[14px] font-medium ${requestRole === "Admin"
                                            ? "bg-blue-50 text-blue-600"
                                            : "bg-green-50 text-green-600"
                                            }`}
                                    >
                                        {requestRole}
                                    </span>
                                </div>

                                <div className="mb-2 min-h-[58px] text-[15px] leading-6 text-gray-600">
                                    {aboutTooLong ? (
                                        <Tooltip title={item.about}>
                                            <p className="line-clamp-2 cursor-pointer">
                                                {item.about}
                                            </p>
                                        </Tooltip>
                                    ) : (
                                        <p className="line-clamp-2">{item.about || "-"}</p>
                                    )}
                                </div>

                                <div className="mb-3 text-[15px] text-gray-600">
                                    {contentTooLong ? (
                                        <Tooltip title={contentValue}>
                                            <span className="line-clamp-1 cursor-pointer">
                                                {contentValue}
                                            </span>
                                        </Tooltip>
                                    ) : (
                                        <span>{contentValue}</span>
                                    )}
                                </div>

                                <div className="mb-2 rounded-2xl bg-gray-50 px-5 py-2">
                                    <div className="grid grid-cols-2 gap-3 text-center">
                                        <div>
                                            <div className="text-[18px] font-semibold text-gray-900">
                                                {item.location || "-"}
                                            </div>
                                            <div className="text-[13px] text-gray-400">
                                                Location
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[18px] font-semibold text-gray-900">
                                                {item.followers || 0}
                                            </div>
                                            <div className="text-[13px] text-gray-400">
                                                Followers
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[14px] text-gray-400">
                                        <ClockCircleOutlined />
                                        <span>{formatDate(item.createdAt)}</span>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="py-10">
                    <Empty />
                </div>
            )}

            <div className="mt-5 flex justify-end">
                <Pagination {...pagination} />
            </div>
        </div>
    );
}