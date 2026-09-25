import type { ComponentType, SVGProps } from 'react'
import { StoreProvider } from './state/store'
import { useRoute, type Route } from './state/useRoute'
import { Home } from './screens/Home'
import { Explore } from './screens/Explore'
import { RegionScreen } from './screens/RegionScreen'
import { AdventureScreen } from './screens/AdventureScreen'
import { Trips } from './screens/Trips'
import { TripScreen } from './screens/TripScreen'
import { ReadyScreen } from './screens/ReadyScreen'
import { Garage } from './screens/Garage'
import { VehicleEditor } from './screens/VehicleEditor'
import { LocationScreen } from './screens/LocationScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { IconCompass, IconGarage, IconHome, IconRoute, IconUser } from './components/Icons'

interface Tab {
  path: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  match: Route['name'][]
}

export const TABS: Tab[] = [
  { path: '', label: 'Home', Icon: IconHome, match: ['home'] },
  { path: 'explore', label: 'Explore', Icon: IconCompass, match: ['explore', 'region', 'adventure'] },
  { path: 'trips', label: 'Trips', Icon: IconRoute, match: ['trips', 'trip', 'plan', 'ready'] },
  { path: 'garage', label: 'Garage', Icon: IconGarage, match: ['garage', 'vehicle'] },
  { path: 'profile', label: 'You', Icon: IconUser, match: ['profile', 'location'] },
]

export function Screens() {
  const [route, go, back] = useRoute()

  let screen
  switch (route.name) {
    case 'explore':
      screen = <Explore go={go} category={route.category} />
      break
    case 'region':
      screen = <RegionScreen id={route.id} go={go} back={back} />
      break
    case 'adventure':
      screen = <AdventureScreen key={route.id} id={route.id} go={go} back={back} />
      break
    case 'trips':
    case 'plan':
      screen = <Trips go={go} />
      break
    case 'trip':
      screen = <TripScreen id={route.id} go={go} back={back} />
      break
    case 'ready':
      screen = <ReadyScreen id={route.id} stop={route.stop} go={go} />
      break
    case 'garage':
      screen = <Garage go={go} />
      break
    case 'vehicle':
      screen = <VehicleEditor key={route.id ?? 'new'} id={route.id} go={go} back={back} />
      break
    case 'location':
      screen = <LocationScreen go={go} back={back} />
      break
    case 'profile':
      screen = <ProfileScreen go={go} />
      break
    default:
      screen = <Home go={go} />
  }

  return (
    <>
      <main className="shell">{screen}</main>
      <nav className="tabbar" aria-label="Main">
        {TABS.map(({ path, label, Icon, match }) => (
          <button key={label} type="button" className="tabbar__btn" aria-current={match.includes(route.name) ? 'page' : undefined} onClick={() => go(path)}>
            <Icon />
            {label}
          </button>
        ))}
      </nav>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Screens />
    </StoreProvider>
  )
}
