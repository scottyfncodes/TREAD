// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import App from '../App'

const geolocation = { getCurrentPosition: vi.fn(), watchPosition: vi.fn(), clearWatch: vi.fn() }

beforeEach(() => {
  localStorage.clear()
  window.location.hash = ''
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  Object.defineProperty(navigator, 'geolocation', { value: geolocation, configurable: true })
  geolocation.getCurrentPosition.mockClear()
  geolocation.watchPosition.mockClear()
  // No network in tests: weather and place search fail, which the UI must handle.
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

async function go(hash: string) {
  await act(async () => {
    window.location.hash = hash
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

/** Click, then let async navigation (hashchange, history.back) land. */
async function tap(el: HTMLElement) {
  await act(async () => {
    fireEvent.click(el)
    await new Promise((r) => setTimeout(r, 20))
  })
}

function tab(name: string) {
  return within(screen.getByRole('navigation', { name: 'Main' })).getByRole('button', { name })
}

describe('new user', () => {
  it('is welcomed with a vehicle-first question and no assumed vehicle or location', () => {
    render(<App />)
    expect(screen.getByText('What can you do with the vehicle you have?')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Add my vehicle' })).toBeTruthy()
    expect(screen.queryByText(/With your/)).toBeNull()
  })

  it('never asks the device for its location on load', () => {
    render(<App />)
    expect(geolocation.getCurrentPosition).not.toHaveBeenCalled()
    expect(geolocation.watchPosition).not.toHaveBeenCalled()
  })

  it('can skip onboarding and browse, with the start shown as not set', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Just browse for now' }))
    expect(screen.getByText('Not set')).toBeTruthy()
    expect(screen.getByText('Add a vehicle')).toBeTruthy()
  })
})

describe('vehicle creation through the form', () => {
  it('Year -> Make -> Model is enough; the catalogue fills body type and drivetrain', async () => {
    render(<App />)
    await tap(screen.getByRole('button', { name: 'Add my vehicle' }))
    const save = screen.getAllByRole('button', { name: 'Save vehicle' })[0] as HTMLButtonElement
    expect(save.disabled).toBe(true)

    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2024' } })
    fireEvent.change(screen.getByLabelText('Make'), { target: { value: 'Subaru' } })
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Outback' } })
    expect((screen.getByLabelText('Vehicle type') as HTMLSelectElement).value).toBe('wagon')
    expect(screen.getByRole('button', { name: 'AWD' }).getAttribute('aria-pressed')).toBe('true')

    expect(save.disabled).toBe(false)
    await act(async () => fireEvent.click(save))
    expect(screen.getByText('With your 2024 Subaru Outback')).toBeTruthy()
    expect(screen.getByText('AWD')).toBeTruthy()
  })

  it('supports several vehicles and switching between them in the garage', async () => {
    render(<App />)
    for (const [make, model] of [['Subaru', 'Outback'], ['Tesla', 'Model Y']]) {
      await go('#/vehicle/new')
      fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2025' } })
      fireEvent.change(screen.getByLabelText('Make'), { target: { value: make } })
      fireEvent.change(screen.getByLabelText('Model'), { target: { value: model } })
      await act(async () => fireEvent.click(screen.getAllByRole('button', { name: 'Save vehicle' })[0]))
    }
    await go('#/garage')
    expect(screen.getByText('2025 Subaru Outback')).toBeTruthy()
    expect(screen.getByText('2025 Tesla Model Y')).toBeTruthy()
    // The first vehicle added is preferred.
    expect(screen.getAllByRole('button', { name: 'Preferred vehicle' })).toHaveLength(1)
    const useButtons = screen.getAllByRole('button', { name: 'Use this one' })
    await act(async () => fireEvent.click(useButtons[0]))
    expect(screen.getByText('With your 2025 Tesla Model Y')).toBeTruthy()
  })

  it('deletes a vehicle after confirmation', async () => {
    render(<App />)
    await go('#/vehicle/new')
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2022' } })
    fireEvent.change(screen.getByLabelText('Make'), { target: { value: 'Ford' } })
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Bronco' } })
    await act(async () => fireEvent.click(screen.getAllByRole('button', { name: 'Save vehicle' })[0]))
    await go('#/garage')
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Edit' })))
    fireEvent.click(screen.getByRole('button', { name: 'Delete vehicle' }))
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Delete for good' })))
    expect(screen.getByText('No vehicles yet')).toBeTruthy()
  })
})

describe('mobile navigation', () => {
  it('the tab bar reaches every section and marks the current one', async () => {
    render(<App />)
    await act(async () => fireEvent.click(tab('Explore')))
    expect(screen.getByRole('heading', { name: 'Explore' })).toBeTruthy()
    expect(tab('Explore').getAttribute('aria-current')).toBe('page')

    await act(async () => fireEvent.click(tab('Trips')))
    expect(screen.getByRole('heading', { name: 'Trips' })).toBeTruthy()

    await act(async () => fireEvent.click(tab('Garage')))
    expect(screen.getByRole('heading', { name: 'My garage' })).toBeTruthy()

    await act(async () => fireEvent.click(tab('You')))
    expect(screen.getByRole('heading', { name: 'You' })).toBeTruthy()

    await act(async () => fireEvent.click(tab('Home')))
    expect(tab('Home').getAttribute('aria-current')).toBe('page')
  })
})

describe('empty states', () => {
  it('garage and trips explain what to do next', async () => {
    render(<App />)
    await go('#/garage')
    expect(screen.getByText('No vehicles yet')).toBeTruthy()
    await go('#/trips')
    expect(screen.getByText('No trips yet')).toBeTruthy()
  })
  it('unknown ids get a friendly not-found', async () => {
    render(<App />)
    await go('#/adventure/not_a_route')
    expect(screen.getByText('Adventure not found')).toBeTruthy()
  })
})

describe('starting location', () => {
  it('can be entered manually, changed and cleared', async () => {
    render(<App />)
    await go('#/location')
    expect(screen.getByText(/Not set\. Adventures still work/)).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText(/Dallas/), { target: { value: 'Dallas' } })
    await tap(screen.getByRole('button', { name: /Dallas, TX/ }))
    await go('#/location')
    expect(screen.getByRole('heading', { name: 'Dallas, TX' })).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText(/Dallas/), { target: { value: 'Moab' } })
    await tap(screen.getByRole('button', { name: /Moab, UT/ }))
    await go('#/location')
    expect(screen.getByRole('heading', { name: 'Moab, UT' })).toBeTruthy()

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Clear' })))
    expect(screen.getByText(/Not set\. Adventures still work/)).toBeTruthy()
    expect(geolocation.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('uses device location only when the button is pressed', async () => {
    geolocation.getCurrentPosition.mockImplementation((ok: PositionCallback) => ok({ coords: { latitude: 38.57, longitude: -109.55 } } as GeolocationPosition))
    render(<App />)
    await go('#/location')
    expect(geolocation.getCurrentPosition).not.toHaveBeenCalled()
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Use my current location/ })))
    expect(geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
  })
})

describe('discovery and trips through the UI', () => {
  it("shows Hell's Revenge in Explore and its vehicle panel", async () => {
    render(<App />)
    await go('#/explore/offroad')
    expect(screen.getByText("Hell's Revenge")).toBeTruthy()
    await go('#/adventure/hells_revenge')
    expect(screen.getByRole('region', { name: 'Vehicle considerations' })).toBeTruthy()
    expect(screen.getByText(/Add a vehicle to see how yours compares/)).toBeTruthy()
  })

  it('creates a trip from an adventure and opens Ready to Go', async () => {
    render(<App />)
    await go('#/adventure/wedge_overlook')
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Start a trip with this' })))
    expect(screen.getByRole('button', { name: /Ready to go\?/ })).toBeTruthy()
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Ready to go\?/ })))
    expect(screen.getByRole('region', { name: 'Ready to go summary' })).toBeTruthy()
    expect(screen.getByText(/: WEDGE OVERLOOK$/)).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('tread.v1.trips') ?? '[]')).toHaveLength(1)
  })
})
