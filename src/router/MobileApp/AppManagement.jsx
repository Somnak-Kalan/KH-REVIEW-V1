import UserRoutes from './UserManagement/User'
import CreatorRequestRoutes from './UserManagement/CreatorRequest'

export default function AppManagementRoutes() {
    return [...UserRoutes(), ...CreatorRequestRoutes()]
}
