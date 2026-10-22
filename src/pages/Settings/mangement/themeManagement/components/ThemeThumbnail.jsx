import React, {
    useState,
} from 'react'


import ImgClickIcon from '../../../../../assets/other/ImgClick.svg'







const ThemeThumbnail = ({
    src
}) => {



    const [
        imageError,
        setImageError
    ] = useState(false)








    if (
        !src
        ||
        imageError
    ) {

        return (

            <div

                className="
                    w-[80px]
                    h-[60px]
                    rounded-md
                    border
                    border-dashed
                    border-gray-300
                    flex
                    items-center
                    justify-center
                    bg-gray-50
                "

            >

                <img

                    src={ImgClickIcon}

                    alt="empty"

                    className="
                        w-[24px]
                        h-[24px]
                        opacity-60
                    "

                />


            </div>

        )

    }








    return (

        <img


            src={src}


            alt="theme"


            onError={() => setImageError(true)}



            className="
                w-[80px]
                h-[60px]
                rounded-md
                object-cover
                border
                border-gray-200
            "


        />

    )


}





export default ThemeThumbnail