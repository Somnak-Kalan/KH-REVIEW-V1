import React, {
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import {
    useLocation,
    useNavigate,
    useOutletContext,
    useParams,
} from 'react-router-dom'
import {
    Button,
    Input,
    Tabs,
} from 'antd'
import {
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import {
    AuthContext,
} from '../../../../contexts/AuthContext'


import PageHeader from '../../../../components/Action/PageHeader'


import {
    useThemeStore,
} from '../../../../Stores/settings/theme/theme.store'


import ProvinceTheme from './provinceTheme/ProvinceTheme'


import EventTheme from './eventTheme/EventTheme'


import './themeManagement.scss'





const TAB_STORAGE_KEY = 'theme-management-active-tab'


const VALID_TABS = [

    'province',

    'event',

]







const getCachedTab = () => {


    if (
        typeof window === 'undefined'
    ) {

        return 'province'

    }



    const cachedTab =

        window.localStorage.getItem(
            TAB_STORAGE_KEY
        )



    return VALID_TABS.includes(cachedTab)

        ? cachedTab

        : 'province'

}








const ThemeManagement = () => {


    const {
        access_token
    } = useContext(AuthContext)





    const location = useLocation()


    const navigate = useNavigate()



    const {
        tab
    } = useParams()





    const {
        setDisplayEmitContent
    } = useOutletContext() || {}







    const provinceThemeRef = useRef(null)







    const [

        searchValue,

        setSearchValue

    ] = useState('')








    const [

        activeTab,

        setActiveTab

    ] = useState(() => {


        if (
            VALID_TABS.includes(tab)
        ) {

            return tab

        }


        return getCachedTab()

    })










    const {

        provinceThemes,

        eventThemes,

        loadingProvince,

        loadingEvent,

        fetchProvinceThemes,

        fetchEventThemes,


    } = useThemeStore()











    // ==============================
    // Load Theme Data
    // ==============================


    useEffect(() => {


        if (!access_token) return



        fetchProvinceThemes(

            access_token

        )



        fetchEventThemes(

            access_token

        )



    }, [

        access_token,

    ])









    // ==============================
    // Header
    // ==============================


    useEffect(() => {


        if (!setDisplayEmitContent)
            return



        setDisplayEmitContent(


            <div className="rounded-[8px] py-3">


                <PageHeader

                    mainPageName="Theme Management"

                />


            </div>


        )


    }, [

        setDisplayEmitContent

    ])










    // ==============================
    // Sync URL Tab
    // ==============================


    useEffect(() => {



        if (
            VALID_TABS.includes(tab)
        ) {


            setActiveTab(tab)


            window.localStorage.setItem(

                TAB_STORAGE_KEY,

                tab

            )


            return

        }







        const cachedTab = getCachedTab()



        if (
            location.pathname === '/theme'
        ) {


            navigate(

                `/theme/${cachedTab}`,

                {
                    replace: true
                }

            )


        }



    }, [

        tab,

        location.pathname,

        navigate

    ])










    const handleChangeTab = (key) => {


        setActiveTab(key)



        window.localStorage.setItem(

            TAB_STORAGE_KEY,

            key

        )



        navigate(

            `/theme/${key}`

        )


    }









    const tabItems = [


        {


            key: 'province',


            label: 'Province Theme',


            children: (


                <ProvinceTheme


                    ref={provinceThemeRef}


                    provinces={provinceThemes}


                    loading={loadingProvince}


                    searchValue={searchValue}


                />


            )


        },






        {


            key: 'event',


            label: 'Event Theme',


            children: (


                <EventTheme


                    themes={eventThemes}


                    loading={loadingEvent}


                    searchValue={searchValue}


                />


            )


        }


    ]











    return (

        <div

            className="
                pb-6
                min-h-screen
                bg-[#f5f5f5]
                text-slate-900
                dark:bg-[#0b1220]
                dark:text-slate-200
            "

        >


            <div

                className="
                    theme-toolbar
                    flex
                    items-center
                    justify-between
                    rounded-md
                    px-4
                    py-[10px]
                    mb-3
                    !bg-white
                    dark:!bg-[#0f172a]
                "

            >



                <Input


                    allowClear


                    className="
                        theme-search
                        w-[380px]
                    "


                    placeholder={

                        activeTab === 'province'

                            ? 'search province'

                            : 'search theme'

                    }


                    prefix={

                        <SearchOutlined

                            className="text-blue-500"

                        />

                    }


                    value={searchValue}


                    onChange={

                        e =>
                            setSearchValue(
                                e.target.value
                            )

                    }


                />





                {
                    activeTab === 'province'

                        ?

                        <Button

                            type="primary"

                            icon={<PlusOutlined />}


                            onClick={() =>


                                provinceThemeRef.current
                                    ?.openAddAllProvince()

                            }

                        >

                            Add All Province


                        </Button>


                        :

                        null

                }



            </div>









            <div

                className="
                    theme-card
                    rounded-lg
                    min-h-[calc(100vh-170px)]
                    px-[18px]
                    pb-[18px]
                    !bg-white
                    dark:!bg-[#0f172a]
                "

            >


                <Tabs


                    activeKey={activeTab}


                    items={tabItems}


                    onChange={handleChangeTab}


                />



            </div>


        </div>


    )


}



export default ThemeManagement