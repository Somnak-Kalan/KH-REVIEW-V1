import httpCommon from 'utils/http-common'



const fetchModuleUsers = (payload) => {


    return new Promise((resolve, reject) => {


        httpCommon


            .get('/admin/module/users', {


                params: {


                    moduleId: payload.moduleId


                },


                headers: {


                    Authorization:
                        `Bearer ${payload.access_token}`


                }



            })


            .then(res => {


                resolve(res.data)


            })


            .catch(error => {


                reject(error)


            })



    })



}



const UserService = {

    fetchModuleUsers

}



export default UserService