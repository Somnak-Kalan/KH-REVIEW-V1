// ImagePreviewCard.jsx
import React from 'react';

const ImagePreviewCard = ({
    backgroundImage,
    title,
    subtitle,
    description,
    badgeText,
    icon,
    rotatedText,
    className,
    onClick,
}) => {
    return (
        <div
            className={`relative w-full h-48 rounded-xl overflow-hidden bg-cover bg-center cursor-pointer ${className}`}
            style={{ backgroundImage: `url(${backgroundImage})` }}
            onClick={onClick}
        >
            {/* Rotated Text (e.g., "Esquent") */}
            {rotatedText && (
                <span className="absolute top-1/2 -left-8 -translate-y-1/2 transform -rotate-90 text-white text-xs font-semibold opacity-75">
                    {rotatedText}
                </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center p-4">
                <div className="flex-1 flex flex-col justify-center text-white">
                    {title && (
                        <h2 className="text-4xl font-extrabold leading-tight tracking-wider uppercase drop-shadow-lg">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="text-2xl font-bold uppercase drop-shadow-lg mt-1">
                            {subtitle}
                        </p>
                    )}
                    {description && (
                        <div className="flex items-center text-sm mt-2">
                            {icon && <img src={icon} alt="icon" className="w-4 h-4 mr-1" />}
                            <span className="font-semibold drop-shadow-lg">{description}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Badge (e.g., "30% OFF") */}
            {badgeText && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full drop-shadow">
                    {badgeText}
                </span>
            )}
        </div>
    );
};

export default ImagePreviewCard;