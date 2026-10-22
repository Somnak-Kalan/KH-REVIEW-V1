import AllReviewRoutes from './Review/All'
import ReviewTemplateRoutes from './Review/Template'
export default function SettingRoutes() {
  return [...AllReviewRoutes(), ...ReviewTemplateRoutes()]
}
