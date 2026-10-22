import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    Button,
    Row,
    Col,
    Divider,
    Avatar
} from "antd";
import {
    PhoneOutlined,
    GlobalOutlined,
    UserAddOutlined

} from "@ant-design/icons";
import { FaTelegramPlane, FaTiktok, FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import Swal from 'sweetalert2'
const { TextArea } = Input;
import { useAppUserStore } from '../../../../Stores/MobilesApp/User/user.store'
import { useAddressOptStore } from '../../../../Stores/Address/Address'

export default function CreateRequestModal({ open, onCancel, loadCreatorRequests, access_token, createCreatorRequest }) {
    const [form] = Form.useForm();
    const { fetchAppUsers, users } = useAppUserStore()
    const { fetchProvinceOpts, provinces } = useAddressOptStore()
    const [userSearch, setUserSearch] = useState("");
    const [creatorAlreadyExisting, setCreatorExisting] = useState()
    const handleFinish = async (values) => {
        try {
            await createCreatorRequest({
                access_token,
                doc: {
                    body: {
                        userId: values?.user,
                        about: values?.about,
                        contentTypes: values?.contentTypes || [],
                        createdSource: "system",
                        socialLinks: {
                            facebook: values?.facebook || "",
                            instagram: values?.instagram || "",
                            youtube: values?.youtube || "",
                            tiktok: values?.tiktok || "",
                            otherLink: values?.otherLink || "",
                        },
                        locationContact: {
                            provinceId: values?.province,
                            phone: values?.phoneNumber || "",
                            telegramPhone: values?.telegramPhone || "",
                        }
                    },
                },
            });

            Swal.fire({
                icon: 'success',
                title: 'Upload Successful!',
                text: 'The information has been add successfully.',
                showConfirmButton: false,
                timer: 1500,
            })
            handleCancel();
            loadCreatorRequests();
            form.resetFields();
        } catch (error) {
            setCreatorExisting(error?.response?.data?.error?.message || '')
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed!',
                text: 'Something went wrong while add.',
                timer: 1500,
            })
        }

    };

    const handleCancel = () => {
        form.resetFields();
        onCancel?.();
    };
    useEffect(() => {
        if (!open || !access_token) return;

        const timer = setTimeout(() => {
            fetchAppUsers({
                access_token,
                doc: {
                    page: 1,
                    size: 10,
                    search: userSearch || "",
                },
                force: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [open, access_token, userSearch, fetchAppUsers]);

    const userOptions = useMemo(() => {
        const list = Array.isArray(users) ? users : [];

        return list
            .filter((item) => String(item?.status || "").toLowerCase() === "active")
            .map((item) => {
                const profile = item?.userProfile || {};
                const name = profile?.name || "Unknown User";
                const phone = profile?.phone || "";
                const profilePicture = profile?.profilePicture || "";
                const followers = Number(item?.followers || 0);

                return {
                    value: item?._id,
                    title: name,
                    label: (
                        <div className="flex items-center gap-3 py-1">
                            <Avatar
                                size={34}
                                src={profilePicture || undefined}
                                className="shrink-0"
                            >
                                {name?.charAt(0)?.toUpperCase()}
                            </Avatar>

                            <div className="min-w-0">
                                <div className="truncate text-[14px] font-medium text-gray-800">
                                    {name}
                                </div>
                                <div className="text-[12px] text-gray-400">
                                    {followers} followers
                                </div>
                            </div>
                        </div>
                    ),
                    searchLabel: [
                        name,
                        phone,
                        item?.status,
                        item?._id,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase(),
                };
            });
    }, [users]);


    useEffect(() => {
        if (!open) return;
        const loadProvinces = async () => {
            try {
                const res = await fetchProvinceOpts(access_token);
            } catch (error) {
                console.error("province fetch error:", error);
            }
        };

        loadProvinces();
    }, [open, fetchProvinceOpts]);


    const provinceOptions = useMemo(() => {
        const list = Array.isArray(provinces) ? provinces : [];

        return list.map((item) => ({
            value: item?.provinceId,
            title: item?.provinceEn || item?.provinceKh || "Unknown Province",
            label: (
                <div className="flex flex-col py-1 leading-tight">
                    <span className="text-[14px] font-medium text-gray-800">
                        {item?.provinceEn || "Unknown Province"}
                    </span>
                    <span className="text-[12px] text-gray-400">
                        {item?.provinceKh || ""}
                    </span>
                </div>
            ),
            searchLabel: [
                item?.provinceEn,
                item?.provinceKh,
                item?.provinceId,
                item?._id,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase(),
        }));
    }, [provinces]);
    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={null}
            centered
            width={760}
            destroyOnHidden
            title={null}
            closeIcon={<span className="text-[18px] text-gray-400 hover:text-gray-600">×</span>}
            styles={{
                body: { padding: 0 },
                content: { borderRadius: 10, overflow: "hidden" },
            }}
        >
            <div className="px-6 pt-5 pb-6">
                {/* Header */}
                <div className="mb-5">
                    <h2 className="m-0 text-[20px] font-semibold text-gray-800">
                        Create Creator Request
                    </h2>
                    <p className="mt-1 mb-0 text-[13px] text-gray-400">
                        Select a registered user and fill in the creator request details
                    </p>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    requiredMark={(label, { required }) => (
                        <span className="text-[13px] font-medium text-gray-700">
                            {required && <span className="mr-1 text-red-500">*</span>}
                            {label}
                        </span>
                    )}
                >
                    {/* User */}
                    <Form.Item
                        label="Select User"
                        name="user"
                        rules={[{ required: true, message: "Please select user" }]}
                        className="mb-4"
                    >
                        <Select
                            showSearch
                            placeholder="Search for users..."
                            className="h-[40px]"
                            options={userOptions}
                            optionLabelProp="title"
                            filterOption={false}
                            onSearch={(value) => setUserSearch(value)}
                            listHeight={300}
                        />

                    </Form.Item>
                    <span className="text-red-500">{creatorAlreadyExisting}</span>

                    {/* About */}
                    <Form.Item
                        label="About"
                        name="about"
                        rules={[{ required: true, message: "Please enter about" }]}
                        className="mb-4"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter information about why this user should become a content creator..."
                            className="!resize-none"
                        />
                    </Form.Item>

                    {/* Content Types */}
                    <Form.Item
                        label="Content Types"
                        name="contentTypes"
                        rules={[{ required: true, message: "Please select content types" }]}
                        className="mb-6"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select content types"
                            options={[
                                { value: "Travel & Adventure", label: "Travel & Adventure" },
                                { value: "Activities & Entertainment", label: "Activities & Entertainment" },
                                { value: "Food & Drinks", label: "Food & Drinks " },
                                { value: "Accommodation", label: "Accommodation" },
                                { value: "Services & Products", label: "Services & Products" },
                            ]}
                        />
                    </Form.Item>

                    {/* Location & Contact */}
                    <Divider orientation="center" className="!my-5 !text-gray-700 !text-[13px] !font-medium">
                        Location & Contact
                    </Divider>

                    <Form.Item
                        label="Creator location"
                        name="province"
                        rules={[{ required: true, message: "Please select province" }]}
                        className="mb-4"
                    >
                        <Select
                            showSearch
                            placeholder="Select province"
                            options={provinceOptions}
                            filterOption={(input, option) =>
                                option?.searchLabel?.includes(input.toLowerCase()) ||
                                String(option?.label || "").toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Phone Number"
                                name="phoneNumber"
                                rules={[{ required: true, message: "Please enter phone number" }]}
                                className="mb-4"
                            >
                                <Input
                                    prefix={<PhoneOutlined className="text-gray-400" />}
                                    placeholder="+855 XX XXX XXX"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Phone (Telegram)"
                                name="telegramPhone"
                                rules={[{ required: true, message: "Please enter Telegram phone" }]}
                                className="mb-4"
                            >
                                <Input
                                    prefix={<FaTelegramPlane className="text-gray-400" />}
                                    placeholder="+855 XX XXX XXX"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Social */}
                    <Divider orientation="center" className="!my-5 !text-gray-700 !text-[13px] !font-medium">
                        Social Media & Portfolio (Optional)
                    </Divider>

                    <Form.Item label="TikTok" name="tiktok" className="mb-4">
                        <Input
                            prefix={<FaTiktok className="text-gray-400" />}
                            placeholder="TikTok URL"
                        />
                    </Form.Item>

                    <Form.Item label="Facebook" name="facebook" className="mb-4">
                        <Input
                            prefix={<FaFacebookF className="text-gray-400" />}
                            placeholder="Facebook URL"
                        />
                    </Form.Item>

                    <Form.Item label="Instagram" name="instagram" className="mb-4">
                        <Input
                            prefix={<FaInstagram className="text-gray-400" />}
                            placeholder="Instagram URL"
                        />
                    </Form.Item>

                    <Form.Item label="YouTube" name="youtube" className="mb-4">
                        <Input
                            prefix={<FaYoutube className="text-gray-400" />}
                            placeholder="YouTube URL"
                        />
                    </Form.Item>

                    <Form.Item label="Other Link" name="otherLink" className="mb-6">
                        <Input
                            prefix={<GlobalOutlined className="text-gray-400" />}
                            placeholder="Portfolio/Website URL"
                        />
                    </Form.Item>

                    {/* Footer buttons */}
                    <div className="flex justify-end gap-3 pt-1">
                        <Button onClick={handleCancel} className="min-w-[88px]">
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<UserAddOutlined />}
                            className="min-w-[140px]"
                        >
                            Create Request
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}