import React from "react";
import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import SwitchViewMode from "../../../Action/Switch/SwitchViewMode";

export default function FilterBar({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
}) {
    return (
        <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-4 md:flex-row">
                    <Input
                        allowClear
                        placeholder="Search by name, email, or description..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={search}
                        onChange={(e) => setSearch?.(e.target.value)}
                        className="rounded-md md:!max-w-[520px]"
                    />

                    <Select
                        allowClear
                        value={statusFilter ?? ""}
                        onChange={(value) => setStatusFilter?.(value)}
                        className="!w-full md:!w-[220px]"
                        options={[
                            { label: "All Status", value: "" },
                            { label: "Approved", value: "approved" },
                            { label: "Pending", value: "pending" },
                            { label: "Rejected", value: "rejected" },
                        ]}
                    />
                </div>

                <SwitchViewMode
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />
            </div>
        </div>
    );
}