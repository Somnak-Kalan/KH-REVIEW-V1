import React from 'react';

const Status = (props) => {
    const { stats } = props
    return (
        <div className=''>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ">
                <div className="rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800 p-4 text-center">
                    <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {stats?.total || 0}
                    </div>
                    <div className="text-xs text-slate-500 font-semibold  dark:text-slate-400">Total user</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-800 p-4 text-center">
                    <div className="text-2xl font-semibold text-amber-500">{stats?.active || 0}</div>
                    <div className="text-xs text-slate-500 font-semibold  dark:text-slate-400">Active user</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-800 p-4 text-center">
                    <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {stats?.inactive || 0}
                    </div>
                    <div className="text-xs text-slate-500 font-semibold  dark:text-slate-400">Inactive user</div>
                </div>
            </div>
        </div>
    );
};

export default Status;