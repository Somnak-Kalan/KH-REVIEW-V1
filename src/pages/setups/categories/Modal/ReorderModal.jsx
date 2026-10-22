import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'


import {
    Modal,
    Table,
    Button,
    Avatar,
} from 'antd'


import {
    HolderOutlined,
} from '@ant-design/icons'





const DragContext =
    createContext(null)








const moveArrayItem = (

    array,

    fromIndex,

    toIndex

) => {



    if (

        fromIndex === toIndex ||

        fromIndex < 0 ||

        toIndex < 0

    ) {

        return array

    }




    const result = [

        ...array

    ]




    const [

        item

    ] = result.splice(

        fromIndex,

        1

    )




    result.splice(

        toIndex,

        0,

        item

    )



    return result



}









const DragHandle = () => {


    return (

        <HolderOutlined

            style={{

                cursor: 'grab',

                color: '#999',

                fontSize: 16

            }}

        />

    )


}









const DraggableRow = (

    props

) => {


    const context =

        useContext(

            DragContext

        )




    const rowId =

        String(

            props['data-row-key']

        )




    const isDragging =

        context?.draggedId === rowId




    const isOver =

        context?.dragOverId === rowId




    return (

        <tr


            {...props}



            draggable



            onDragStart={

                e =>

                    context?.onDragStart(

                        e,

                        rowId

                    )

            }



            onDragOver={

                e =>

                    context?.onDragOver(

                        e,

                        rowId

                    )

            }



            onDrop={

                e =>

                    context?.onDrop(

                        e,

                        rowId

                    )

            }



            onDragEnd={

                context?.onDragEnd

            }



            style={{


                ...props.style,


                cursor: 'grab',


                opacity:

                    isDragging

                        ?

                        0.4

                        :

                        1,



                background:

                    isOver

                        ?

                        '#e6f4ff'

                        :

                        undefined



            }}


        />

    )


}









const ReorderModal = ({

    open,

    setOpen,

    title = 'Reorder Category',

    data = [],

    onSave,

}) => {





    const [

        list,

        setList

    ] = useState([])






    const draggedId =

        useRef(null)







    const [

        dragging,

        setDragging

    ] = useState(null)







    const [

        dragOver,

        setDragOver

    ] = useState(null)







    const [

        saving,

        setSaving

    ] = useState(false)








    useEffect(() => {


        if (open) {


            setList(

                data.map(

                    item => ({

                        ...item

                    })

                )

            )


        }


    }, [

        open,

        data

    ])









    const handleDragStart = (

        event,

        id

    ) => {



        draggedId.current = id



        setDragging(id)



        event.dataTransfer.effectAllowed = 'move'



        event.dataTransfer.setData(

            'text/plain',

            id

        )



    }









    const handleDragOver = (

        event,

        targetId

    ) => {


        event.preventDefault()



        const sourceId =

            draggedId.current




        if (

            !sourceId ||

            sourceId === targetId

        ) {

            return

        }






        setDragOver(targetId)






        setList(current => {


            const from =

                current.findIndex(

                    item =>

                        String(item._id)

                        ===

                        String(sourceId)

                )





            const to =

                current.findIndex(

                    item =>

                        String(item._id)

                        ===

                        String(targetId)

                )





            return moveArrayItem(

                current,

                from,

                to

            )



        })



    }









    const handleDrop = (e) => {


        e.preventDefault()



        draggedId.current = null


        setDragging(null)


        setDragOver(null)


    }









    const handleDragEnd = () => {


        draggedId.current = null


        setDragging(null)


        setDragOver(null)


    }








    const handleSave = async () => {


        if (!list.length)
            return



        try {


            setSaving(true)



            console.log(
                'FINAL SAVE LIST:',
                list
            )



            await onSave(list)



            setOpen(false)



        } catch (error) {


            console.error(
                'SAVE ERROR:',
                error
            )



        } finally {


            setSaving(false)


        }


    }









    const getImages = (record) => {


        if (record?.images) {


            return [

                record.images.find(

                    img =>

                        img?.includes(

                            'original'

                        )

                )

            ]

        }



        return [

            record?.icon2d,

            record?.icon3d

        ]

            .filter(Boolean)



    }









    const columns = [



        {

            title: 'No',

            width: 60,

            align: 'center',

            render: (_, __, index) =>

                index + 1

        },




        {

            title: '',

            width: 40,

            align: 'center',

            render: () => <DragHandle />

        },





        {

            title: 'Image',

            width: 80,

            align: 'center',


            render: (_, record) => (


                <div className="flex gap-1">


                    {

                        getImages(record)

                            .slice(0, 2)

                            .map(

                                (img, index) => (


                                    <Avatar

                                        key={index}

                                        shape="square"

                                        size={35}

                                        src={img}

                                    />

                                )

                            )


                    }


                </div>

            )


        },






        {

            title: 'Category',


            render: (_, record) => (


                <div>


                    <div className="text-blue-800 font-semibold">

                        {
                            record?.nameEn || '-'
                        }

                    </div>



                    <div className="text-xs text-gray-500">

                        {
                            record?.nameKh || ''
                        }

                    </div>



                </div>


            )


        }



    ]









    const contextValue =

        useMemo(

            () => ({


                draggedId: dragging,


                dragOverId: dragOver,


                onDragStart: handleDragStart,


                onDragOver: handleDragOver,


                onDrop: handleDrop,


                onDragEnd: handleDragEnd



            }),


            [

                dragging,

                dragOver

            ]

        )









    return (


        <Modal


            open={open}


            title={title}


            width={700}



            onCancel={() => {


                if (!saving)

                    setOpen(false)


            }}



            footer={


                <div className="flex justify-end gap-2">


                    <Button

                        disabled={saving}

                        onClick={() => setOpen(false)}

                    >

                        Cancel

                    </Button>



                    <Button


                        type="primary"


                        loading={saving}


                        onClick={handleSave}


                    >

                        Save Order

                    </Button>



                </div>


            }



        >




            <DragContext.Provider

                value={contextValue}

            >


                <Table


                    rowKey="_id"


                    columns={columns}


                    dataSource={list}


                    pagination={false}


                    size="small"



                    components={{

                        body: {

                            row: DraggableRow

                        }

                    }}


                />



            </DragContext.Provider>



        </Modal>


    )

}



export default ReorderModal