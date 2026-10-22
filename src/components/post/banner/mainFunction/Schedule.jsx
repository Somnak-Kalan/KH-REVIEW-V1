import React, { useEffect, useState } from 'react';
import { DatePicker, Space, Input, Radio, Switch, Form } from 'antd';
import { CalendarClock } from 'lucide-react';
import dayjs from 'dayjs';
import 'antd/dist/reset.css';

const { RangePicker } = DatePicker;

export default function Schedule({ schedule, setSchedule, form }) {
    const [openSwitch, setOpenSwitch] = useState(false);

    const switchValue = Form.useWatch('switch', form);
    const isSwitchOn = !!switchValue;
    useEffect(() => {
        setOpenSwitch(isSwitchOn);
    }, [switchValue]);

    const handleScheduleChange = (key, value) => {
        setSchedule((prev) => ({ ...prev, [key]: value }));

        if (key === 'runOption') {
            if (value === 'publishImmediately') {
                form.setFieldsValue({
                    schedule: {
                        publishImmediately: true,
                        specificDays: null,
                        endDate: null,
                    },
                });
            } else if (value === 'specificDays') {
                form.setFieldsValue({
                    schedule: {
                        publishImmediately: false,
                        specificDays: schedule.specificDays || null,
                        endDate: null,
                    },
                });
            } else if (value === 'EndDate') {
                form.setFieldsValue({
                    schedule: {
                        publishImmediately: false,
                        specificDays: null,
                    },
                });
            }
        }

        if (key === 'specificDays') {
            form.setFieldsValue({
                schedule: {
                    ...(form.getFieldValue('schedule') || {}),
                    specificDays: value,
                },
            });
        }

        if (key === 'startDate' || key === 'endDate') {
            form.setFieldsValue({
                schedule: {
                    ...(form.getFieldValue('schedule') || {}),
                    [key]: value,
                },
            });
        }
    };

    return (
        <div className="mt-5">
            {/* Banner Schedule Section */}
            <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
                <div className="flex items-center mb-1">
                    <CalendarClock className="w-5 h-5 text-gray-500 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800">Banner Schedule</h2>
                </div>

                <Form
                    component="div"  //  FIX: prevent nested <form> inside parent <form>
                    layout="vertical"
                    autoComplete="off"
                    form={form}
                    initialValues={{
                        schedule: { publishImmediately: true },
                        radioCondition: 'publishImmediately',
                    }}
                >
                    {/* Switch: publish immediately vs schedule */}
                    <div
                        className="flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors duration-200 bg-gray-50"
                    >
                        <div className="m-0 p-0 ">
                            <h3 className="font-medium text-sm m-0 p-0 text-gray-800">
                                {openSwitch ? 'Schedule for Later' : 'Publish immediately'}
                            </h3>
                        </div>

                        <Form.Item
                            name="switch"               //  use correct name
                            valuePropName="checked"     //  tell Form to use `checked` as value
                            className="m-0 p-0"
                        >
                            <Switch
                                onChange={(checked) => {
                                    setOpenSwitch(checked); // keep your local state in sync
                                }}
                            />
                        </Form.Item>
                    </div>

                    {/* Hidden schedule object (for submit if needed) */}
                    <Form.Item className="m-0 p-0 hidden" name="schedule" />

                    {openSwitch && (
                        <div>

                            <Form.Item label="When to start" name="startDate">
                                <DatePicker
                                    showTime={{ format: 'hh:mm A', use12Hours: true }}
                                    format="MM/DD/YYYY hh:mm A"
                                    className="w-full"
                                    value={schedule?.startDate ? dayjs(schedule?.startDate) : null}
                                    onChange={(date) => handleScheduleChange('startDate', date)}
                                />
                            </Form.Item>

                            {/* How long to run */}
                            <Form.Item label="How long to run" name="radioCondition">
                                <Radio.Group
                                    onChange={(e) =>
                                        handleScheduleChange('runOption', e.target.value)
                                    }
                                    value={schedule.runOption}
                                    className="w-full"
                                >
                                    <Space direction="vertical" className="w-full">
                                        {/* Publish Immediately */}
                                        <div
                                            className={`flex items-center justify-between p-1 rounded-md cursor-pointer border transition-colors duration-200 ${schedule.runOption === 'publishImmediately'
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-200'
                                                }`}
                                        >
                                            <Radio className="w-full" value="publishImmediately">
                                                Publish Immediately
                                            </Radio>
                                        </div>

                                        {/* Specific Days */}
                                        <div
                                            className={`flex items-center justify-between p-1 rounded-md cursor-pointer border transition-colors duration-200 ${schedule.runOption === 'specificDays'
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-200'
                                                }`}
                                        >
                                            <Radio value="specificDays" className="w-full">
                                                Specific days
                                                {schedule.runOption === 'specificDays' && (
                                                    <Input
                                                        type="number"
                                                        placeholder="e.g., 30"
                                                        className="w-[50%] py-0 mx-2"
                                                        value={schedule.specificDays}
                                                        onChange={(e) =>
                                                            handleScheduleChange(
                                                                'specificDays',
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                )}
                                            </Radio>
                                        </div>

                                        {/*  Set End Date (FIXED) */}
                                        <div
                                            className={`flex items-center justify-between p-1 rounded-md cursor-pointer border transition-colors duration-200 ${schedule.runOption === 'EndDate'
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-200'
                                                }`}
                                        >
                                            <Radio value="EndDate" className="w-full flex">
                                                Set end date
                                                {schedule.runOption === 'EndDate' && (
                                                    <DatePicker
                                                        showTime={{ format: 'hh:mm A', use12Hours: true }}
                                                        format="MM/DD/YYYY hh:mm A"
                                                        className="py-0 mx-2"
                                                        value={schedule.endDate ? dayjs(schedule.endDate) : null}
                                                        onChange={(date) => handleScheduleChange('endDate', date)}
                                                    />
                                                )}
                                            </Radio>
                                        </div>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                        </div>
                    )}
                </Form>
            </div>
        </div>
    );
}
