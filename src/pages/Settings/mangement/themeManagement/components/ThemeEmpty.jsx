import React from 'react'


import {
    Button,
    Empty,
} from 'antd'


import {
    PlusOutlined,
} from '@ant-design/icons'






const ThemeEmpty = (props) => {


    const {


        description = 'There are not yet have posts.',


        buttonText = 'Add Theme',


        onClick,


        showButton = true,


    } = props







    return (

        <div

            className="
                min-h-[300px]
                flex
                items-center
                justify-center
            "

        >


            <Empty


                image={
                    Empty.PRESENTED_IMAGE_SIMPLE
                }


                description={description}


            >



                {


                    showButton &&


                    <Button


                        type="primary"


                        icon={<PlusOutlined />}


                        onClick={onClick}


                    >


                        {buttonText}


                    </Button>


                }



            </Empty>



        </div>

    )


}



export default ThemeEmpty