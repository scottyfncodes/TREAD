import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Place } from '../domain/types'
import type { GearItem, Preferences, Trip } from '../domain/trip'
import type { VehicleProfile } from '../domain/vehicle'
import { writeJson, readJson } from '../services/storage'
import {
  detachVehicle,
  KEYS,
  loadCustomGear,
  loadOwnedGear,
  loadPrefs,
  loadSavedPlaces,
  loadStart,
  loadTrips,
  loadVehicles,
  removeVehicle,
  saveTrips,
  saveVehicles,
  upsert,
} from '../services/persistence'
import { todayIso } from './dates'

/**
 * App state. Concerns are kept apart on purpose -- garage, starting
 * location, trips, gear and preferences each persist independently and
 * none of them imply any of the others. In particular there is no default
 * vehicle and no default starting location: both start empty.
 */
export interface Store {
  /* garage */
  vehicles: VehicleProfile[]
  preferredVehicleId: string | null
  /** The vehicle currently used for discovery; defaults to the preferred one. */
  activeVehicle: VehicleProfile | null
  selectVehicle: (id: string | null) => void
  saveVehicle: (v: VehicleProfile) => void
  deleteVehicle: (id: string) => void
  setPreferredVehicle: (id: string) => void

  /* location */
  start: Place | null
  setStart: (p: Place | null) => void
  savedPlaces: Place[]
  savePlace: (p: Place) => void
  removePlace: (id: string) => void

  /* trips */
  trips: Trip[]
  saveTrip: (t: Trip) => void
  removeTrip: (id: string) => void

  /* gear */
  ownedGear: string[]
  toggleGear: (id: string) => void
  customGear: GearItem[]
  addCustomGear: (g: GearItem) => void
  removeCustomGear: (id: string) => void

  /* preferences & session */
  prefs: Preferences
  setPrefs: (p: Preferences) => void
  date: string
  setDate: (d: string) => void
  onboarded: boolean
  finishOnboarding: () => void
  online: boolean
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<VehicleProfile[]>(() => loadVehicles())
  const [preferredVehicleId, setPreferredId] = useState<string | null>(() => {
    const stored = readJson<string | null>(KEYS.preferredVehicle, null)
    const list = loadVehicles()
    return list.some((v) => v.id === stored) ? stored : (list[0]?.id ?? null)
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [start, setStartState] = useState<Place | null>(() => loadStart())
  const [savedPlaces, setSavedPlaces] = useState<Place[]>(() => loadSavedPlaces())
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips())
  const [ownedGear, setOwnedGear] = useState<string[]>(() => loadOwnedGear())
  const [customGear, setCustomGear] = useState<GearItem[]>(() => loadCustomGear())
  const [prefs, setPrefsState] = useState<Preferences>(() => loadPrefs())
  const [date, setDate] = useState<string>(() => todayIso())
  const [onboarded, setOnboarded] = useState<boolean>(() => readJson<boolean>(KEYS.onboarded, false))
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine)

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  const activeVehicle = useMemo(
    () => vehicles.find((v) => v.id === (selectedId ?? preferredVehicleId)) ?? null,
    [vehicles, selectedId, preferredVehicleId],
  )

  const saveVehicle = useCallback((v: VehicleProfile) => {
    setVehicles((current) => {
      const next = upsert(current, { ...v, updatedAt: Date.now() })
      saveVehicles(next)
      return next
    })
    setPreferredId((current) => {
      if (current) return current
      writeJson(KEYS.preferredVehicle, v.id)
      return v.id
    })
  }, [])

  const deleteVehicle = useCallback(
    (id: string) => {
      const result = removeVehicle(vehicles, preferredVehicleId, id)
      setVehicles(result.vehicles)
      saveVehicles(result.vehicles)
      setPreferredId(result.preferredId)
      writeJson(KEYS.preferredVehicle, result.preferredId)
      setSelectedId((s) => (s === id ? null : s))
      setTrips((current) => {
        const next = detachVehicle(current, id)
        saveTrips(next)
        return next
      })
    },
    [vehicles, preferredVehicleId],
  )

  const setPreferredVehicle = useCallback((id: string) => {
    setPreferredId(id)
    writeJson(KEYS.preferredVehicle, id)
  }, [])

  const setStart = useCallback((p: Place | null) => {
    setStartState(p)
    writeJson(KEYS.start, p)
  }, [])

  const savePlace = useCallback((p: Place) => {
    setSavedPlaces((current) => {
      const next = upsert<Place>(current, { ...p, origin: 'saved' })
      writeJson(KEYS.savedPlaces, next)
      return next
    })
  }, [])

  const removePlace = useCallback((id: string) => {
    setSavedPlaces((current) => {
      const next = current.filter((p) => p.id !== id)
      writeJson(KEYS.savedPlaces, next)
      return next
    })
  }, [])

  const saveTrip = useCallback((t: Trip) => {
    setTrips((current) => {
      const next = upsert(current, { ...t, updatedAt: Date.now() })
      saveTrips(next)
      return next
    })
  }, [])

  const removeTrip = useCallback((id: string) => {
    setTrips((current) => {
      const next = current.filter((t) => t.id !== id)
      saveTrips(next)
      return next
    })
  }, [])

  const toggleGear = useCallback((id: string) => {
    setOwnedGear((current) => {
      const next = current.includes(id) ? current.filter((g) => g !== id) : [...current, id]
      writeJson(KEYS.gear, next)
      return next
    })
  }, [])

  const addCustomGear = useCallback((g: GearItem) => {
    setCustomGear((current) => {
      const next = upsert(current, g)
      writeJson(KEYS.customGear, next)
      return next
    })
    setOwnedGear((current) => {
      const next = current.includes(g.id) ? current : [...current, g.id]
      writeJson(KEYS.gear, next)
      return next
    })
  }, [])

  const removeCustomGear = useCallback((id: string) => {
    setCustomGear((current) => {
      const next = current.filter((g) => g.id !== id)
      writeJson(KEYS.customGear, next)
      return next
    })
  }, [])

  const setPrefs = useCallback((p: Preferences) => {
    setPrefsState(p)
    writeJson(KEYS.prefs, p)
  }, [])

  const finishOnboarding = useCallback(() => {
    setOnboarded(true)
    writeJson(KEYS.onboarded, true)
  }, [])

  const value = useMemo<Store>(
    () => ({
      vehicles,
      preferredVehicleId,
      activeVehicle,
      selectVehicle: setSelectedId,
      saveVehicle,
      deleteVehicle,
      setPreferredVehicle,
      start,
      setStart,
      savedPlaces,
      savePlace,
      removePlace,
      trips,
      saveTrip,
      removeTrip,
      ownedGear,
      toggleGear,
      customGear,
      addCustomGear,
      removeCustomGear,
      prefs,
      setPrefs,
      date,
      setDate,
      onboarded,
      finishOnboarding,
      online,
    }),
    [vehicles, preferredVehicleId, activeVehicle, saveVehicle, deleteVehicle, setPreferredVehicle, start, setStart, savedPlaces, savePlace, removePlace, trips, saveTrip, removeTrip, ownedGear, toggleGear, customGear, addCustomGear, removeCustomGear, prefs, setPrefs, date, onboarded, finishOnboarding, online],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
