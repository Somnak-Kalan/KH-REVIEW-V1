import { create } from 'zustand'
import SuperAdminService from '../../services/admin/supperAdmin'


export const useSuperAdminStore = create((set) => ({

    superAdmins: [],

    loading: false,


    fetchSuperAdmins: async (payload) => {

        try {

            set({
                loading: true
            })


            const response =
                await SuperAdminService.getSuperAdmins(payload)


            set({

                superAdmins: response || []

            })


            return response


        } catch (error) {

            console.log(error)

        } finally {

            set({
                loading: false
            })

        }

    }


}))