import React from 'react'
import MobileView from './mobile/HomeMoment'

const BannerPreviewPanel = ({
    activeTab,
    previewData,
    descriptionEn,
    descriptionKh,
    fileENLarge,
    fileKHLarge,
    fileENSmall,
    fileKHSmall,
    language,
    handleChangeTitleEn,
    handleChangeTitleKh,
}) => {
    return (
        <MobileView
            handleChangeTitleEn={handleChangeTitleEn}
            handleChangeTitleKh={handleChangeTitleKh}
            activeTab={activeTab}
            previewData={previewData}
            descriptionEn={descriptionEn}
            descriptionKh={descriptionKh}
            fileENLarge={fileENLarge}
            language={language}
            fileKHLarge={fileKHLarge}
            fileENSmall={fileENSmall}
            fileKHSmall={fileKHSmall}
        />
    )
}

export default BannerPreviewPanel
                                                                                                                                                                                                                                                 