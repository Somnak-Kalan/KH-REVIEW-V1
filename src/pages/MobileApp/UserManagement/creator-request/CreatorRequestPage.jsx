import React, { useMemo, useState, useEffect, useContext } from "react";
import { Card, Button, Row, Col, Empty, message } from "antd";
import {
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    UserAddOutlined
} from "@ant-design/icons";
import Swal from "sweetalert2";
import { useOutletContext, useNavigate } from "react-router-dom";

import PageHeader from "../../../../components/Action/PageHeader";
import TableHeader from "../../../../widgets/TableHeader";
import RequestList from "../../../../components/MobileApp/UserManagement/creator-request/RequestList";
import RequestGrid from "../../../../components/MobileApp/UserManagement/creator-request/RequestGrid";
import CreateRequestModal from "../../../../components/MobileApp/UserManagement/creator-request/CreateRequestModal";
import ViewRequestModal from "../../../../components/MobileApp/UserManagement/creator-request/ViewRequestModal";
import ApproveModal from "../../../../components/MobileApp/UserManagement/creator-request/ApproveModal";
import RejectModal from "../../../../components/MobileApp/UserManagement/creator-request/RejectModal";
import FilterBar from "../../../../components/MobileApp/UserManagement/creator-request/FilterBar";
import ImageLoading from "../../../../components/Loading/ImageLoading";
import { useCreatorRequestStore } from "../../../../Stores/MobilesApp/CreatorRequest/CreatorRequst.store";
import { AuthContext } from "../../../../contexts/AuthContext";

const StatCard = ({
    icon,
    value,
    label,
    borderColor,
    iconBg,
    textColor,
    iconColor,
}) => {
    return (
        <Card
            variant="borderless"
            className="overflow-hidden !rounded-2xl !border !border-gray-100 !shadow-sm"
            styles={{ body: { padding: 0 } }}
        >
            <div
                className="flex items-center gap-5 rounded-2xl border-l-[6px] bg-white px-2 py-3"
                style={{ borderLeftColor: borderColor }}
            >
                <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: iconBg }}
                >
                    <span className="text-[18px]" style={{ color: iconColor }}>
                        {icon}
                    </span>
                </div>

                <div className="leading-tight">
                    <div className="text-[16px] font-bold" style={{ color: textColor }}>
                        {value}
                    </div>
                    <div className="mt-2 text-[14px] font-medium text-gray-400">
                        {label}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default function CreatorRequestPage() {
    const { setDisplayEmitContent, userLogin } = useOutletContext();
    const { access_token } = useContext(AuthContext);
    const navigate = useNavigate();

    const VIEW_MODE_KEY = "creator-request-view-mode";
    const STATUS_FILTER_KEY = "creator-request-status-filter";
    const SEARCH_KEY = "creator-request-search";

    const [selected, setSelected] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [openApprove, setOpenApprove] = useState(false);
    const [openReject, setOpenReject] = useState(false);

    const [search, setSearch] = useState(() => localStorage.getItem(SEARCH_KEY) || "");
    const [statusFilter, setStatusFilter] = useState(
        // () => {
        // const saved = localStorage.getItem(STATUS_FILTER_KEY);
        // return saved ?? "";
        // }
    );

    const [viewMode, setViewMode] = useState(() => {
        const saved = localStorage.getItem(VIEW_MODE_KEY);
        return saved === "grid" || saved === "table" ? saved : "table";
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const {
        creatorRequests,
        pagination: storePagination,
        summary: summary,
        loading,
        fetchCreatorRequests,
        createCreatorRequest,
        approveCreatorRequest,
        rejectCreatorRequest,
    } = useCreatorRequestStore();

    useEffect(() => {
        localStorage.setItem(SEARCH_KEY, search);
    }, [search]);

    // useEffect(() => {
    //     localStorage.setItem(STATUS_FILTER_KEY, statusFilter);
    // }, [statusFilter]);

    useEffect(() => {
        localStorage.setItem(VIEW_MODE_KEY, viewMode);
    }, [viewMode]);
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const normalizedData = useMemo(() => {
        const list = Array.isArray(creatorRequests) ? creatorRequests : [];

        return list.map((item, index) => {
            const userObj = item?.user || item?.userId || item?.appUser || {};
            const socialLinks = item?.socialLinks || {};
            const locationContact = item?.locationContact || {};
            const provinceObj = locationContact?.province || item?.province || {};

            const fullName =
                item?.name ||
                userObj?.fullName ||
                userObj?.name ||
                `${userObj?.firstName || ""} ${userObj?.lastName || ""}`.trim() ||
                userObj?.username ||
                "Unknown User";

            const avatar =
                item?.avatar ||
                userObj?.avatar ||
                userObj?.profile ||
                userObj?.profileImage ||
                userObj?.image ||
                "";

            const provinceName =
                item?.location ||
                item?.provinceName ||
                provinceObj?.nameEn ||
                provinceObj?.nameKh ||
                locationContact?.provinceName ||
                locationContact?.provinceId ||
                "-";

            const followers =
                item?.followers ||
                userObj?.followers ||
                userObj?.followerCount ||
                userObj?.totalFollowers ||
                0;
            const rejectedBy = item?.actionAudit?.rejectedBy?.username
            const approvedBy = item?.actionAudit?.approvedBy?.username

            const status = String(item?.status || "pending").toLowerCase();

            const requestRole =
                item?.createdSource === "system"
                    ? "Admin"
                    : item?.createdSource === "system"
                        ? "Admin"
                        : "App";

            const requestByName =
                item?.requestByName ||
                item?.createdByName ||
                userLogin?.username ||
                userLogin?.name ||
                fullName;

            const createdAt =
                item?.createdAt ||
                item?.requestedAt ||
                item?.created_at ||
                "-";

            const requestedAt =
                item?.requestedAt ||
                item?.createdAt ||
                item?.created_at ||
                "-";

            const rejectionReason =
                item?.rejectionReason ||
                item?.reason ||
                item?.rejectReason ||
                "";

            return {
                ...item,
                id: item?._id || item?.id || index + 1,
                _id: item?._id || item?.id,
                name: fullName,
                avatar,
                avatarText: fullName
                    ?.split(" ")
                    ?.map((s) => s?.[0] || "")
                    ?.join("")
                    ?.slice(0, 2)
                    ?.toUpperCase(),
                followers,
                location: provinceName,
                province: provinceName,
                rejectedBy: rejectedBy,
                approvedBy: approvedBy,
                status,
                about: item?.about || "-",
                contentTypes: Array.isArray(item?.contentTypes) ? item.contentTypes : [],
                phoneNumber: locationContact?.phone || item?.phoneNumber || "",
                telegramPhone: locationContact?.telegramPhone || item?.telegramPhone || "",
                tiktok: socialLinks?.tiktok || item?.tiktok || "",
                facebook: socialLinks?.facebook || item?.facebook || "",
                instagram: socialLinks?.instagram || item?.instagram || "",
                youtube: socialLinks?.youtube || item?.youtube || "",
                otherLink:
                    socialLinks?.otherLink ||
                    socialLinks?.portfolioWebsite ||
                    item?.otherLink ||
                    "",
                requestBy: {
                    role: requestRole,
                    name: requestByName,
                },
                requestByName,
                createdAt,
                requestedAt,
                reason: rejectionReason,
                rejectionReason,
                currentRole: userObj?.role || userObj?.userType || "Normal",
                raw: item,
            };
        });
    }, [creatorRequests, userLogin]);

    const stats = useMemo(() => {
        const all = Number(summary?.totalRequests || 0);
        const active = Number(summary?.approved || 0);
        const pending = Number(summary?.pending || 0);
        const rejected = Number(summary?.rejected || 0);

        return [
            {
                label: "All",
                value: all,
                icon: <FileTextOutlined />,
                borderColor: "#2f86eb",
                iconBg: "#e9f4ff",
                iconColor: "#2f86eb",
                textColor: "#2f86eb",
                valueKey: "all",
            },
            {
                label: "Active",
                value: active,
                icon: <CheckCircleOutlined />,
                borderColor: "#52c41a",
                iconBg: "#eef8e8",
                iconColor: "#52c41a",
                textColor: "#52c41a",
                valueKey: "approved",
            },
            {
                label: "Pending",
                value: pending,
                icon: <ClockCircleOutlined />,
                borderColor: "#f59e0b",
                iconBg: "#fff7e8",
                iconColor: "#f59e0b",
                textColor: "#f59e0b",
                valueKey: "pending",
            },
            {
                label: "Rejected",
                value: rejected,
                icon: <CloseCircleOutlined />,
                borderColor: "#ff4d4f",
                iconBg: "#fff1f0",
                iconColor: "#ff4d4f",
                textColor: "#ff4d4f",
                valueKey: "rejected",
            },
        ];
    }, [storePagination]);

    const loadCreatorRequests = async ({
        page = currentPage,
        size = pageSize,
        keyword = debouncedSearch,
        status = statusFilter === undefined && statusFilter === '' && statusFilter === null ? '' : statusFilter,
    } = {}) => {
        try {
            const cleanKeyword =
                typeof keyword === "string" ? keyword.trim() : "";

            const doc = {
                page,
                size,
                status,
            };
            //  Only send search if not empty
            if (cleanKeyword) {
                doc.search = cleanKeyword;
            } else {
                doc.search = cleanKeyword
            }


            //  KEY FIX: do NOT send status when "all"
            if (status && status !== "all") {
                doc.status = status;
            }

            await fetchCreatorRequests({
                access_token,
                doc,
                force: true,
            });



        } catch (error) {
            message.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch creator requests"
            );
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);
    useEffect(() => {
        if (!access_token) return;

        loadCreatorRequests({
            page: currentPage,
            size: pageSize,
            keyword: debouncedSearch,
            status: statusFilter === undefined ? '' : statusFilter,
        });
    }, [access_token, currentPage, pageSize, debouncedSearch, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, viewMode]);


    useEffect(() => {
        setDisplayEmitContent(
            <div className="my-3 flex justify-between">
                <PageHeader
                    mainPageName="Home"
                    childName="App"
                    secondChildName="Request Creator"
                />
            </div>
        );
    }, [navigate, setDisplayEmitContent]);

    const tablePagination = {
        current: Number(storePagination?.page || currentPage),
        pageSize: Number(storePagination?.size || pageSize),
        total: Number(storePagination?.total || 0),
        onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
        },
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
    };

    const handleApproveRequest = async (values) => {
        try {
            const targetId = values?._id || values?.id;
            if (!targetId) return;

            await approveCreatorRequest({
                access_token,
                doc: {
                    _id: targetId,
                    body: {
                        note: values?.approveReason || "",
                    },
                },
            });

            Swal.fire({
                icon: "success",
                title: "Approved Successful!",
                text: "The information has been Check.",
                showConfirmButton: false,
                timer: 1500,
            });

            setOpenApprove(false);
            setOpenView(false);
            setSelected(null);

            loadCreatorRequests({
                page: currentPage,
                size: pageSize,
                keyword: search,
                status: statusFilter,
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Upload Failed!",
                text: "Something went wrong while add.",
                timer: 1500,
            });
        }
    };

    const handleRejectRequest = async (values) => {
        try {
            const targetId = values?._id || values?.id;
            if (!targetId) return;

            await rejectCreatorRequest({
                access_token,
                doc: {
                    _id: targetId,
                    body: {
                        note: values?.rejectReason || "",
                        rejectionReason: values?.rejectReason || "",
                    },
                },
            });

            Swal.fire({
                icon: "success",
                title: "Rejected Successful!",
                text: "The information has been Check.",
                showConfirmButton: false,
                timer: 1500,
            });

            setOpenReject(false);
            setOpenView(false);
            setSelected(null);

            loadCreatorRequests({
                page: currentPage,
                size: pageSize,
                keyword: search,
                status: statusFilter,
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Upload Failed!",
                text: "Something went wrong while add.",
                timer: 1500,
            });
        }
    };

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between py-3">
                    <h2 className="text-xl font-semibold text-gray-800"></h2>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        className="!rounded-xl !px-2"
                        onClick={() => setOpenCreate(true)}
                    >
                        Create Request
                    </Button>
                </div>

                <Row gutter={[24, 24]} className="pb-3">
                    {stats.map((item) => (
                        <Col xs={24} sm={12} xl={6} key={item.label}>

                            <div
                                className="cursor-pointer transition hover:-translate-y-0.5"
                            // onClick={() => setStatusFilter(item.valueKey)}
                            >
                                <StatCard {...item} />
                            </div>
                        </Col>
                    ))}
                </Row>

                <div className="mb-3">
                    <FilterBar
                        search={search}
                        setSearch={setSearch}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                    />
                </div>

                <TableHeader total={storePagination?.total} label="Total Amount">
                    <div className="relative min-h-[300px]">
                        {loading ? (
                            <div className="flex min-h-[300px] items-center justify-center">
                                <ImageLoading overlay={false} size={80} logoSize={40} />
                            </div>
                        ) : normalizedData?.length === 0 ? (
                            <div className="py-14">
                                <Empty description="No users found" />
                            </div>
                        ) : viewMode === "table" ? (
                            <RequestList
                                data={normalizedData}
                                access_token={access_token}
                                pagination={tablePagination}
                                onView={(item) => {
                                    setSelected(item);
                                    setOpenView(true);
                                }}
                                onApprove={(item) => {
                                    setSelected(item);
                                    setOpenApprove(true);
                                }}
                                onReject={(item) => {
                                    setSelected(item);
                                    setOpenReject(true);
                                }}
                            />
                        ) : (
                            <RequestGrid
                                access_token={access_token}
                                data={normalizedData}
                                pagination={tablePagination}
                                onView={(item) => {
                                    setSelected(item);
                                    setOpenView(true);
                                }}
                                onApprove={(item) => {
                                    setSelected(item);
                                    setOpenApprove(true);
                                }}
                                onReject={(item) => {
                                    setSelected(item);
                                    setOpenReject(true);
                                }}
                            />
                        )}
                    </div>
                </TableHeader>

                <CreateRequestModal
                    open={openCreate}
                    onCancel={() => setOpenCreate(false)}
                    createCreatorRequest={createCreatorRequest}
                    loadCreatorRequests={() =>
                        loadCreatorRequests({
                            page: currentPage,
                            size: pageSize,
                            keyword: search,
                            status: statusFilter,
                        })
                    }
                    access_token={access_token}
                />

                <ViewRequestModal
                    open={openView}
                    data={selected}
                    onCancel={() => setOpenView(false)}
                    onApprove={(item) => {
                        setSelected(item);
                        setOpenView(false);
                        setOpenApprove(true);
                    }}
                    onReject={(item) => {
                        setSelected(item);
                        setOpenView(false);
                        setOpenReject(true);
                    }}
                />

                <ApproveModal
                    open={openApprove}
                    data={selected}
                    onCancel={() => setOpenApprove(false)}
                    onSubmit={handleApproveRequest}
                />

                <RejectModal
                    open={openReject}
                    data={selected}
                    onCancel={() => setOpenReject(false)}
                    onSubmit={handleRejectRequest}
                />
            </div>
        </div>
    );
}