import React from "react";
import { Segmented } from "antd";
import { TableOutlined, AppstoreOutlined } from "@ant-design/icons";
import './SwitchViewMode.css'
const ComponentName = (props) => {
    const { viewMode = "table", setViewMode = () => { } } = props;

    return (
        <div>
            <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                    {
                        label: (
                            <div className="flex items-center gap-2 px-2">
                                <TableOutlined />
                                <span>Table</span>
                            </div>
                        ),
                        value: "table",
                    },
                    {
                        label: (
                            <div className="flex items-center gap-2 px-2">
                                <AppstoreOutlined />
                                <span>Grid</span>
                            </div>
                        ),
                        value: "grid",
                    },
                ]}
                className="creator-view-switch"
            />
        </div>
    );
};

export default ComponentName;