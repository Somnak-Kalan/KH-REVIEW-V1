// import React, { useState } from 'react';
// import { DatePicker, Space, notification, Input, Radio, Switch } from 'antd';
// import { CalendarClock } from 'lucide-react';
// import 'antd/dist/reset.css'; // Import Ant Design's CSS.

// const { RangePicker } = DatePicker;

// export default function App() {
//     const [publishImmediately, setPublishImmediately] = useState(false);
//     const [scheduleForLater, setScheduleForLater] = useState(false);
//     const [runOption, setRunOption] = useState('indefinitely');
//     const [specificDays, setSpecificDays] = useState(null);
//     const [autoStart, setAutoStart] = useState(false);

//     const handleToggleImmediately = () => {
//         const newState = !publishImmediately;
//         setPublishImmediately(newState);
//         if (newState) {
//             setScheduleForLater(false);
//         }
//     };

//     const handleToggleScheduleLater = () => {
//         const newState = !scheduleForLater;
//         setScheduleForLater(newState);
//         if (newState) {
//             setPublishImmediately(false);
//         }
//     };

//     const handleRunOptionChange = (e) => {
//         setRunOption(e.target.value);
//     };

//     const handleSpecificDaysChange = (e) => {
//         setSpecificDays(e.target.value);
//     };

//     const handleAutoStartToggle = () => {
//         setAutoStart(!autoStart);
//     };

//     return (
//         <div className="">
//             {/* Banner Schedule Section */}
//             <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
//                 <div className="flex items-center mb-1">
//                     <CalendarClock className="w-5 h-5 text-gray-500 mr-2" />
//                     <h2 className="text-lg font-semibold text-gray-800">Advertisement Schedule</h2>
//                 </div>
//                 <div
//                     className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors duration-200 ${publishImmediately ? 'bg-gray-100' : 'bg-gray-50'
//                         }`}
//                     onClick={handleToggleImmediately}
//                 >
//                     <div>
//                         <h3 className="font-medium text-sm text-gray-800">{publishImmediately ? 'Schedule for Later' : 'Publish immediately'}</h3>
//                     </div>
//                     <Switch
//                         checked={publishImmediately}
//                         onChange={handleToggleImmediately}
//                     />
//                 </div>
//                 <div className="">
//                     {publishImmediately && (
//                         <div className="">
//                             {/* When to start */}
//                             <div>
//                                 <h4 className="text-sm font-medium text-gray-800 mb-1">When to start</h4>
//                                 <DatePicker
//                                     showTime={{ format: 'HH:mm' }}
//                                     format="MM/DD/YYYY HH:mm"
//                                     className="w-full"
//                                 />
//                             </div>
//                             <Form.Item label="Display Duration (seconds)" name="duration" rules={[{ required: true }]}>
//   <Input type="number" placeholder="Enter duration in seconds" />
// </Form.Item>

//                             {/* How long to run */}
//                             <div>
//                                 <h4 className="text-sm font-medium text-gray-800 mb-1 ">How long to run</h4>
//                                 <Radio.Group onChange={handleRunOptionChange} value={runOption} className="w-full">
//                                     <Space direction="vertical" className="w-full">
//                                         <div
//                                             className={`flex items-center justify-between p-1  rounded-md cursor-pointer border transition-colors duration-200 ${runOption === 'indefinitely' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
//                                                 }`}
//                                         >
//                                             <Radio value="indefinitely">
//                                                 <div>
//                                                     <span className="font-medium text-xs">Run indefinitely</span>
//                                                 </div>
//                                             </Radio>
//                                         </div>
//                                         <div
//                                             className={`flex items-center justify-between p-1 rounded-md cursor-pointer border transition-colors duration-200 ${runOption === 'specificDays' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
//                                                 }`}
//                                         >
//                                             <Radio value="specificDays">
//                                                 <div>
//                                                     <span className="font-medium text-xs">Specific days</span>
//                                                 </div>
//                                             </Radio>
//                                             {runOption === 'specificDays' && (
//                                                 <Input
//                                                     type="number"
//                                                     placeholder="e.g., 30"
//                                                     className=" w-[50%] py-0"
//                                                     value={specificDays}
//                                                     onChange={handleSpecificDaysChange}
//                                                 />
//                                             )}
//                                         </div>
//                                         <div
//                                             className={`flex items-center justify-between p-1 rounded-md cursor-pointer border transition-colors duration-200 ${runOption === 'setEndDate' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
//                                                 }`}
//                                         >
//                                             <Radio value="setEndDate">
//                                                 <div>
//                                                     <span className="font-medium text-xs">Set end date</span>
//                                                 </div>
//                                             </Radio>
//                                             {runOption === 'setEndDate' && (
//                                                 <DatePicker
//                                                     showTime={{ format: 'HH:mm' }}
//                                                     format="MM/DD/YYYY HH:mm"
//                                                     className="w-[50%] py-0"
//                                                 />
//                                             )}
//                                         </div>
//                                     </Space>
//                                 </Radio.Group>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Schedule for later section */}

//         </div>
//     );
// }

import React, { useState } from 'react';
import {
    Form,
    DatePicker,
    Input,
    Radio,
    Switch,
    Space,
    Button,
    notification
} from 'antd';
import { CalendarClock } from 'lucide-react';
import 'antd/dist/reset.css';

const { RangePicker } = DatePicker;

export default function ScheduleForm() {
    const [form] = Form.useForm();
    const [publishImmediately, setPublishImmediately] = useState(false);
    const [runOption, setRunOption] = useState('indefinitely');

    const handlePublishToggle = (checked) => {
        setPublishImmediately(checked);
    };

    const handleRunOptionChange = (e) => {
        setRunOption(e.target.value);
    };

    const onFinish = (values) => {
        console.log('Form Values:', values)
        notification.success({ message: 'Schedule saved successfully!' })
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center mb-4">
                <CalendarClock className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Advertisement Schedule</h2>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    publishImmediately: false,
                    runOption: 'indefinitely',
                    duration: 5
                }}
            >
                {/* Publish Immediately Toggle */}
                <Form.Item
                    label="Publish Immediately"
                    name="publishImmediately"
                    valuePropName="checked"
                >
                    <Switch onChange={handlePublishToggle} />
                </Form.Item>


                {publishImmediately && (
                    <div className="p-2 border rounded-md bg-gray-50">
                        {/* Start Date */}
                        <Form.Item
                            label="When to start"
                            name="startDate"
                            rules={[{ required: true, message: 'Please select start date & time' }]}
                        >
                            <DatePicker
                                showTime={{ format: 'HH:mm' }}
                                format="MM/DD/YYYY HH:mm"
                                className="w-full"
                            />
                        </Form.Item>

                        {/* Display Duration */}
                        <Form.Item
                            label="Display Duration (seconds)"
                            name="duration"
                            rules={[{ required: true, message: 'Please enter duration' }]}
                        >
                            <Input type="number" placeholder="Enter duration in seconds" />
                        </Form.Item>

                        {/* How Long to Run */}
                        <Form.Item label="How long to run" name="runOption">
                            <Radio.Group onChange={handleRunOptionChange} value={runOption} className="w-full">
                                <Space direction="vertical" className="w-full">
                                    <div className={`p-1 rounded-md border ${runOption === 'indefinitely' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                                        <Radio value="indefinitely">
                                            <span className="font-medium text-xs">Run indefinitely</span>
                                        </Radio>
                                    </div>

                                    <div className={`p-1 rounded-md border flex items-center justify-between ${runOption === 'specificDays' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                                        <Radio value="specificDays">
                                            <span className="font-medium text-xs">Specific days</span>
                                        </Radio>
                                        {runOption === 'specificDays' && (
                                            <Form.Item name="specificDays" noStyle rules={[{ required: true, message: 'Enter number of days' }]}>
                                                <Input type="number" placeholder="e.g., 30" className="w-[50%]" />
                                            </Form.Item>
                                        )}
                                    </div>

                                    <div className={`p-1 rounded-md border flex items-center justify-between ${runOption === 'setEndDate' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                                        <Radio value="setEndDate">
                                            <span className="font-medium text-xs">Set end date</span>
                                        </Radio>
                                        {runOption === 'setEndDate' && (
                                            <Form.Item name="endDate" noStyle rules={[{ required: true, message: 'Please select end date & time' }]}>
                                                <DatePicker
                                                    showTime={{ format: 'HH:mm' }}
                                                    format="MM/DD/YYYY HH:mm"
                                                    className="w-[50%]"
                                                />
                                            </Form.Item>
                                        )}
                                    </div>
                                </Space>
                            </Radio.Group>
                        </Form.Item>
                    </div>
                )}

            </Form>
        </div>
    );
}
