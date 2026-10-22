import ActivityRoutes from './setups/Activity'
import AlbumRoutes from './setups/Album'
import AreaRoutes from './setups/Area'
import KeyWords from './setups/Keyword'
import Vibe from './setups/Vibe'
export default function SettingRoutes() {
  return [...ActivityRoutes(), ...AlbumRoutes(), ...AreaRoutes(), ...KeyWords(), ...Vibe()]
}
