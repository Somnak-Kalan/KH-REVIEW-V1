import { useEffect, useState } from 'react'
import AdminUserServices from '../../../../../services/admin/User'

export const useAdminUsers = (access_token) => {
    const [data, setData] = useState(null)

    useEffect(() => {
        const run = async () => {
            const res = await AdminUserServices.fetchUser({ access_token })
            setData(res?.data ?? res)
        }
        if (access_token) run()
    }, [access_token])

    return data
}
