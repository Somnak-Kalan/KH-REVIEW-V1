import GeneralRoutes from './General/General'
import ThemeManagementRoutes from './Theme/ThemeManagement'
export default function ManagementRoutes() {
    return [...GeneralRoutes(), ...ThemeManagementRoutes()]
}
