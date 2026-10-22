import React from 'react'
import Logo from '../../../assets/logo/Newkhlogo.png' // adjust path
import './Loader.scss'
const Loader = () => {
    return (
        <div className="app-loading-overlay">
            <div className="app-loading-box">
                <div className="app-loading-logo-wrap">
                    <div className="app-loading-arc-around" />
                    <div className="app-loading-logo-ring">
                        <img src={Logo} alt="Logo" className="app-loading-logo w-1/2 " />
                    </div>
                </div>
                <p className="text-slate-800">Loading…</p>
            </div>
        </div>
    )
}

export default Loader
