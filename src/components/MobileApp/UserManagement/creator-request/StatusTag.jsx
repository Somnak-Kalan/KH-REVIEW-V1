import React from "react";

export default function StatusTag({ status }) {
    const normalizedStatus = String(status || "pending").toLowerCase();

    const map = {
        pending: "bg-yellow-500",
        approved: "bg-green-500",
        rejected: "bg-red-500",
    };

    const labelMap = {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${map[normalizedStatus] || "bg-gray-400"
                }`}
        >
            {labelMap[normalizedStatus] || normalizedStatus}
        </span>
    );
}