import {
    create
}
    from 'zustand'

import Swal
    from 'sweetalert2'

import CategoryServices
    from '../../services/setup/Category'

import {
    normalizeCategoryIds,
    normalizeSubCategoryIds
}
    from '../helpers/category.normalize'

const useCategoryStore = create((set, get) => ({









    categories: [],



    category: null,



    subCategory: [],



    search: '',



    loading: false,



    error: null,













    // ===============================
    // CREATE CATEGORY
    // ===============================

    createCategory: async (payload) => {

        try {

            set({
                loading: true
            })



            const res =
                await CategoryServices.createCategory({

                    access_token:
                        payload.access_token,

                    doc:
                        payload.doc

                })



            set({
                loading: false
            })





            // reload category list

            await get().fetchCategory({

                access_token:
                    payload.access_token,

                doc: {

                    search:
                        ''

                }

            })



            return res



        } catch (error) {

            set({

                loading: false,

                error

            })



            throw error

        }

    },

    // ===============================
    // UPDATE CATEGORY
    // ===============================

    updateCategory: async (payload) => {

        try {

            set({
                loading: true
            })



            const res =
                await CategoryServices.updateCategory({

                    access_token:
                        payload.access_token,

                    doc:
                        payload.doc

                })



            set({
                loading: false
            })




            // reload category list

            await get().fetchCategory({

                access_token:
                    payload.access_token,

                doc: {

                    search:
                        ''

                }

            })



            return res



        } catch (error) {

            set({

                loading: false,

                error

            })






            throw error

        }

    },











    fetchCategory: async (payload) => {



        try {



            set({

                loading: true

            })





            const res =
                await CategoryServices.fetchCategory({

                    access_token:

                        payload.access_token,



                    doc: {

                        search:

                            payload?.doc?.search || ''

                    }

                })







            const list =



                res?.data ||
                res?.result ||
                res ||
                []









            set({



                categories:

                    Array.isArray(list)

                        ?

                        list

                        :

                        [],



                loading: false



            })





            return res





        } catch (error) {



            set({

                loading: false,

                error

            })



            throw error



        }



    },

    fetchCategoryById: async (payload) => {



        const res =
            await CategoryServices.fetchCategoryById({

                access_token:

                    payload.access_token,



                doc: {

                    _id:

                        payload._id

                }

            })

        const detail =
            res?.data ||
            res

        set({



            category: detail,



            subCategory:

                detail?.subCategories || []



        })





        return res



    },

















    // ===============================
    // REORDER CATEGORY
    // ===============================

    reorderCategory: async (payload) => {

        try {

            const ids =
                normalizeCategoryIds(

                    payload.data

                )



            const result =
                await CategoryServices.reorderCategory({

                    access_token:

                        payload.access_token,

                    categoryIds:

                        ids

                })



            await Swal.fire({

                icon: 'success',

                title: 'Success',

                text: 'Category order updated',

                timer: 1500,

                showConfirmButton: false

            })



            // reload category list

            await get().fetchCategory({

                access_token:

                    payload.access_token,

                doc: {

                    search:

                        ''

                }

            })



            return result



        } catch (error) {



            await Swal.fire({

                icon: 'error',

                title: 'Failed',

                text:

                    error.response?.data?.message ||
                    'Cannot update category order'

            })



            throw error

        }

    },









    // ===============================
    // REORDER SUB CATEGORY
    // ===============================



    reorderSubCategory: async (payload) => {



        try {





            const subCategoryIds =
                normalizeSubCategoryIds(

                    payload.data

                )









            console.log(

                'SEND SUB CATEGORY IDS:',

                subCategoryIds

            )











            const res =
                await CategoryServices.reorderSubCategory({

                    access_token:

                        payload.access_token,



                    subCategoryIds



                })













            await Swal.fire({

                icon: 'success',

                title: 'Success',

                text:

                    'Sub category order updated',

                timer: 1500,

                showConfirmButton: false

            })











            return res







        } catch (error) {





            Swal.fire({

                icon: 'error',

                title: 'Failed',

                text:

                    error.response?.data?.message ||
                    'Cannot update sub category order'



            })





            throw error





        }



    }













}))









export default useCategoryStore