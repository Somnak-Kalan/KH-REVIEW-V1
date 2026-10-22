import React from 'react'
import Logo from '../../assets/logo/Newkhlogo.png'

const ImageLoading = (props) => {
    const {
        // overall size of spinner box
        size = 56, // default like w-14 h-14
        // logo size inside
        logoSize = 32, // default like w-8 h-8
        // show overlay background or not
        overlay = true,
        // custom wrapper class
        className = '',
        // custom logo wrapper class
        logoWrapClassName = '',
        // custom img class
        logoClassName = '',
    } = props

    return (
        <div
            className={
                overlay
                    ? `absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 ${className}`
                    : `flex items-center justify-center ${className}`
            }
        >
            <div
                className="relative"
                style={{ width: size, height: size }}
            >
                <div className="absolute inset-0 rounded-full border-4 border-slate-300 dark:border-slate-700" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />

                {/*  logo center (no mt-3 ml-3 needed) */}
                <div
                    className={`absolute inset-0 flex items-center justify-center ${logoWrapClassName}`}
                >
                    <div
                        className="rounded-full"
                        style={{ width: logoSize, height: logoSize }}
                    >
                        <img
                            src={Logo}
                            alt="Logo"
                            className={`w-full h-full object-contain ${logoClassName}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImageLoading
