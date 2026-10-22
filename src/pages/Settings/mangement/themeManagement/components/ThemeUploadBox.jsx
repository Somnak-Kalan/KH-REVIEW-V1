import React, {
    useEffect,
    useMemo,
} from 'react'


import {
    Upload,
} from 'antd'


import {
    CloseOutlined,
    UploadOutlined,
} from '@ant-design/icons'






const getPreviewUrl = (value) => {


    if (!value)

        return ''



    if (typeof value === 'string')

        return value



    if (
        value instanceof File ||
        value instanceof Blob
    ) {

        return URL.createObjectURL(value)

    }




    if (value?.url)

        return value.url




    if (value?.originFileObj)

        return URL.createObjectURL(
            value.originFileObj
        )



    return ''

}









const ThemeUploadBox = (props) => {


    const {


        value,


        onChange,


        disabled = false,


        height = 114,


    } = props







    const previewUrl = useMemo(() => {


        return getPreviewUrl(value)


    }, [value])









    useEffect(() => {


        return () => {


            if (
                previewUrl?.startsWith('blob:')
            ) {

                URL.revokeObjectURL(
                    previewUrl
                )

            }


        }


    }, [previewUrl])









    const handleBeforeUpload = (file) => {


        // send File object to Form

        onChange?.(file)



        // stop default upload

        return false


    }









    const handleRemove = (e) => {


        e.preventDefault()


        e.stopPropagation()



        onChange?.(null)


    }









    return (


        <Upload


            accept="image/*"


            maxCount={1}


            showUploadList={false}



            beforeUpload={handleBeforeUpload}



            disabled={disabled}



            className="
                block
                w-full
                [&_.ant-upload]:!block
                [&_.ant-upload]:!w-full
            "



        >


            <div


                className={`

                    w-full

                    rounded-[6px]

                    border

                    border-dashed

                    border-[#d9d9d9]

                    bg-white

                    cursor-pointer

                    relative

                    overflow-hidden

                    flex

                    items-center

                    justify-center

                    dark:bg-slate-800

                    dark:border-slate-700

                `}



                style={{

                    height

                }}


            >



                {

                    previewUrl

                        ?


                        <>


                            <img


                                src={previewUrl}


                                alt="theme"


                                className="
                                w-full
                                h-full
                                object-cover
                            "


                            />



                            {

                                !disabled &&


                                <button


                                    type="button"



                                    className="
                                    absolute
                                    top-[6px]
                                    right-[6px]
                                    w-5
                                    h-5
                                    rounded-full
                                    bg-black/40
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                    border-0
                                "



                                    onClick={handleRemove}


                                >


                                    <CloseOutlined

                                        className="text-[10px]"

                                    />


                                </button>


                            }


                        </>


                        :


                        <div


                            className="
                            flex
                            flex-col
                            items-center
                            justify-center
                            gap-2
                            text-[#2f3542]
                        "


                        >

                            <UploadOutlined />


                            <span>

                                Upload Image

                            </span>


                        </div>


                }



            </div>



        </Upload>


    )

}



export default ThemeUploadBox