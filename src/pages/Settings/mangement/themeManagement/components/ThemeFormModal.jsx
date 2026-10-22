import React, {
    useEffect,
} from 'react'


import {
    Button,
    Form,
    Input,
    Modal,
} from 'antd'


import ThemeUploadBox
    from './ThemeUploadBox'





const requiredImage = (_, value) => {


    if (value)

        return Promise.resolve()



    return Promise.reject(

        new Error(
            'Please upload image'
        )

    )

}








const RequiredLabel = ({
    children
}) => {


    return (

        <span>

            {children}

            <span className="text-red-500">

                *

            </span>


        </span>

    )

}









const ThemeFormModal = (props) => {


    const {


        open,


        type = 'province',


        mode = 'add',


        targetName = '',


        initialValues = {},


        confirmLoading = false,


        access_token,


        onCancel,


        onSubmit,


    } = props








    const [form] = Form.useForm()







    useEffect(() => {


        if (!open)

            return



        form.setFieldsValue({

            themeName:

                initialValues.themeName || '',



            imageLight:

                initialValues.imageLight || '',



            imageDark:

                initialValues.imageDark || '',


        })



    }, [

        open,

        initialValues,

        form

    ])









    const isEdit =

        mode === 'edit'





    const isEvent =

        type === 'event'







    const title =



        isEvent


            ?


            (

                isEdit

                    ?

                    'Edit Event Theme'

                    :

                    'Add Event Theme'

            )


            :


            (

                `${isEdit

                    ?

                    'Edit'

                    :

                    'Add'

                } Theme to "${targetName}"`

            )









    const submitText =


        isEdit

            ?

            'Save Change'

            :

            'Add Theme'









    const handleFinish = (values) => {


        onSubmit?.({

            ...values,


            access_token,


        })


    }









    return (

        <Modal


            open={open}


            title={title}


            footer={null}


            width={

                isEvent

                    ?

                    560

                    :

                    540

            }


            onCancel={onCancel}


            destroyOnClose



        >



            <Form


                form={form}


                layout="vertical"


                onFinish={handleFinish}


                requiredMark={false}


            >






                {

                    isEvent

                    &&


                    <Form.Item


                        label={

                            <RequiredLabel>

                                Theme name

                            </RequiredLabel>

                        }



                        name="themeName"



                        rules={[

                            {

                                required: true,

                                message:

                                    'Please input theme name'

                            }

                        ]}



                    >


                        <Input

                            placeholder="e.g. khmer new year"

                        />


                    </Form.Item>


                }









                <Form.Item


                    label={

                        <RequiredLabel>

                            Image Light mode

                        </RequiredLabel>

                    }



                    name="imageLight"



                    rules={[

                        {

                            validator:

                                requiredImage

                        }

                    ]}


                >



                    <ThemeUploadBox />



                </Form.Item>









                <Form.Item


                    label={

                        <RequiredLabel>

                            Image Dark mode

                        </RequiredLabel>

                    }



                    name="imageDark"



                    rules={[

                        {

                            validator:

                                requiredImage

                        }

                    ]}


                >



                    <ThemeUploadBox />



                </Form.Item>









                <div

                    className="
                        flex
                        justify-end
                        gap-2
                        pt-2
                    "

                >



                    <Button

                        onClick={onCancel}

                    >

                        Cancel


                    </Button>






                    <Button


                        type="primary"


                        htmlType="submit"


                        loading={confirmLoading}


                    >

                        {submitText}


                    </Button>





                </div>





            </Form>





        </Modal>

    )


}





export default ThemeFormModal