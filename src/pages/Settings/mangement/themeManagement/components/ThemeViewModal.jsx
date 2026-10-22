import React from 'react'


import {
    Modal,
} from 'antd'





const ThemeViewModal = (props) => {


    const {


        open,


        type = 'province',


        targetName = '',


        imageLight = '',


        imageDark = '',


        onCancel,


    } = props









    const title =


        type === 'event'


            ?


            `View Event Theme${targetName

                ?

                ` "${targetName}"`

                :

                ''

            }`



            :



            `View Theme to "${targetName}"`









    return (

        <Modal


            open={open}


            title={title}


            footer={null}


            width={560}


            onCancel={onCancel}


            destroyOnClose



        >




            <div

                className="
                    flex
                    flex-col
                    gap-5
                "

            >




                <div>


                    <div

                        className="
                            font-semibold
                            mb-2
                        "

                    >

                        Image Light mode

                    </div>





                    {

                        imageLight

                            ?

                            <img


                                src={imageLight}


                                alt="light mode"


                                className="
                                w-full
                                h-[220px]
                                object-cover
                                rounded-md
                                border
                            "


                            />

                            :


                            <div

                                className="
                                h-[220px]
                                flex
                                items-center
                                justify-center
                                border
                                rounded-md
                                text-gray-400
                            "

                            >

                                No Image

                            </div>

                    }



                </div>









                <div>


                    <div

                        className="
                            font-semibold
                            mb-2
                        "

                    >

                        Image Dark mode

                    </div>






                    {

                        imageDark

                            ?

                            <img


                                src={imageDark}


                                alt="dark mode"


                                className="
                                w-full
                                h-[220px]
                                object-cover
                                rounded-md
                                border
                            "


                            />

                            :


                            <div

                                className="
                                h-[220px]
                                flex
                                items-center
                                justify-center
                                border
                                rounded-md
                                text-gray-400
                            "

                            >

                                No Image

                            </div>


                    }



                </div>




            </div>





        </Modal>

    )


}



export default ThemeViewModal