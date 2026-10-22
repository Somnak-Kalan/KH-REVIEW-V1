import { create } from 'zustand'

import PermissionService
    from '../../services/options/admin/permission'

import ModuleOptService
    from '../../services/options/admin/module'



export const usePermissionStore = create((set) => ({



    modules: [],

    permissions: [],

    users: [],


    loading: false,





    // =====================
    // MODULE
    // =====================

    fetchModules: async (payload) => {


        try {


            const res =
                await ModuleOptService.fetchModule(payload)



            set({

                modules: res || []

            })



            return res



        } catch (error) {

            console.log(error)

        }


    },







    // =====================
    // ALL PERMISSION
    // =====================

    fetchPermissions: async (payload) => {


        try {


            const res =
                await PermissionService.fetchPermission(payload)



            set({

                permissions: res || []

            })



            return res



        } catch (error) {

            console.log(error)

        }


    },








    // =====================
    // USERS BY MODULE
    // =====================

    fetchModuleUsers: async (payload) => {


        try {


            const res =
                await PermissionService.fetchModuleUsers(payload)



            set({

                users: res || []

            })



            return res



        } catch (error) {

            console.log(error)

        }


    }





}))