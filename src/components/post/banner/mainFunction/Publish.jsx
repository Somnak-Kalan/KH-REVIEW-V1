import React, { useState, useEffect } from 'react';
import { Switch, Tag, Tooltip, Button } from 'antd';
import { HomeOutlined, PlusOutlined } from '@ant-design/icons';
const HomeTopSwitch = (props) => {
    const {
        checkPermission,
        setOpen,
        onChange,
        PERMS,
        activeTab,
        tabStatus = {} // Example: { homeTop: 'live', homeInMoment: 'hidden', category: 'live' }
    } = props;
    const [isLive, setIsLive] = useState(true);
    // Only run when the tab changes (prevents switch snap-back)
    useEffect(() => {
        const currentStatus = tabStatus[activeTab];
        if (currentStatus === undefined) {
            setIsLive(true);
        } else {
            setIsLive(currentStatus === 'live');
        }

    }, [activeTab]);

    const handleToggle = (checked) => {
        setIsLive(checked);
        // Tell parent if it needs to store new status
        if (onChange) {
            onChange(checked ? 'live' : 'hidden', activeTab);
        }
    };

    const getTitle = () => {
        switch (activeTab) {
            case 'homeTop': return 'Home Top';
            case 'homeInMoment': return 'Home In Moment';
            case 'category': return 'Category';
            default: return '';
        }
    };
    return (
        <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px' }} className="py-2 px-2 my-2 bg-white">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HomeOutlined style={{ fontSize: '20px' }} />
                    <div>
                        <div style={{
                            fontWeight: 'bold',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            {getTitle()}
                            <Tag style={{ fontSize: '12px' }} color={isLive ? 'green' : 'red'}>
                                {isLive ? 'Live in App' : 'Hidden in App'}
                            </Tag>
                            <Switch checked={isLive} onChange={handleToggle} />
                        </div>
                        <div style={{ color: '#8c8c8c', fontSize: '12px' }} className="mt-1">
                            Main banner displayed at the top of the  {getTitle()}
                        </div>
                        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                            Maximum 5 banners allowed
                        </div>
                    </div>
                </div>

                {/* Right side */}
                {
                    isLive && (

                        <Tooltip
                            title={
                                checkPermission(PERMS.ASSIGNED_USER)
                                    ? 'Add'
                                    : 'You don’t have permission'
                            }
                        >
                            <Button
                                disabled={!checkPermission(PERMS.ASSIGNED_USER)}
                                type="primary"
                                style={{ background: '#1677ff' }}
                                className="cursor-pointer text-white"
                                onClick={() => setOpen(true)}
                            >
                                <PlusOutlined /> Add
                            </Button>
                        </Tooltip>
                    )
                }
            </div>
        </div>
    );
};

export default HomeTopSwitch;
