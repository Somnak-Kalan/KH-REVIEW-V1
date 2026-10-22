import BannerRoutes from './Banner/Banner'
import AdvertisementRoutes from './Advertisement/Advertisement'
export default function ManagePostRoutes() {
    return [...BannerRoutes(), ...AdvertisementRoutes()]
}
