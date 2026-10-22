import React from 'react';
import { Button } from 'antd';

const Advertisement = (props) => {
    const { open, setOpen } = props
    return (
        <div className="flex items-center justify-between py-2 px-2  bg-white rounded shadow-sm">
            <span className="text-gray-700 text-base">Advertisement</span>
            <Button onClick={() => { setOpen(true) }} type="primary" icon={<span className="mr-1">+</span>}>
                Add
            </Button>
        </div>
    );
};

export default Advertisement;