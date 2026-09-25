/**
 * An offline list of towns and cities for picking a starting location by
 * name. It exists so the manual path works with no signal and no location
 * permission. City-centre coordinates, good enough for drive estimates, and
 * the UI labels those estimates as such.
 *
 * This is a lookup list only. Nothing in TREAD ever picks one of these on
 * the user's behalf.
 */
export interface KnownPlace {
  name: string
  admin: string
  lat: number
  lon: number
}

const RAW: Array<[string, string, number, number]> = [
  // Utah
  ['Salt Lake City', 'UT', 40.7608, -111.891], ['Provo', 'UT', 40.2338, -111.6585], ['Ogden', 'UT', 41.223, -111.9738],
  ['St. George', 'UT', 37.0965, -113.5684], ['Cedar City', 'UT', 37.6775, -113.0619], ['Moab', 'UT', 38.5733, -109.5498],
  ['Green River', 'UT', 38.9953, -110.1599], ['Price', 'UT', 39.5994, -110.8107], ['Richfield', 'UT', 38.7725, -112.0841],
  ['Hanksville', 'UT', 38.3733, -110.7132], ['Castle Dale', 'UT', 39.2122, -111.0196], ['Beaver', 'UT', 38.2767, -112.641],
  ['Marysvale', 'UT', 38.4497, -112.231], ['Torrey', 'UT', 38.2997, -111.42], ['Kanab', 'UT', 37.0475, -112.5263],
  ['Monticello', 'UT', 37.8714, -109.3429], ['Blanding', 'UT', 37.6242, -109.4785], ['Vernal', 'UT', 40.4555, -109.5287],
  ['Park City', 'UT', 40.6461, -111.498], ['Logan', 'UT', 41.737, -111.8338], ['Fillmore', 'UT', 38.9689, -112.3238],
  ['Salina', 'UT', 38.9578, -111.8599], ['Panguitch', 'UT', 37.8225, -112.4358], ['Escalante', 'UT', 37.7703, -111.6021],
  // Colorado
  ['Denver', 'CO', 39.7392, -104.9903], ['Colorado Springs', 'CO', 38.8339, -104.8214], ['Boulder', 'CO', 40.015, -105.2705],
  ['Fort Collins', 'CO', 40.5853, -105.0844], ['Grand Junction', 'CO', 39.0639, -108.5506], ['Durango', 'CO', 37.2753, -107.8801],
  ['Silverton', 'CO', 37.8119, -107.6645], ['Ouray', 'CO', 38.0228, -107.6714], ['Telluride', 'CO', 37.9375, -107.8123],
  ['Cortez', 'CO', 37.3489, -108.5859], ['Montrose', 'CO', 38.4783, -107.8762], ['Gunnison', 'CO', 38.5458, -106.9253],
  ['Glenwood Springs', 'CO', 39.5505, -107.3248], ['Pueblo', 'CO', 38.2544, -104.6091], ['Pagosa Springs', 'CO', 37.2694, -107.0098],
  // Southwest & West
  ['Phoenix', 'AZ', 33.4484, -112.074], ['Tucson', 'AZ', 32.2226, -110.9747], ['Flagstaff', 'AZ', 35.1983, -111.6513],
  ['Page', 'AZ', 36.9147, -111.4558], ['Sedona', 'AZ', 34.8697, -111.761], ['Albuquerque', 'NM', 35.0844, -106.6504],
  ['Santa Fe', 'NM', 35.687, -105.9378], ['Farmington', 'NM', 36.7281, -108.2187], ['Las Vegas', 'NV', 36.1699, -115.1398],
  ['Reno', 'NV', 39.5296, -119.8138], ['Boise', 'ID', 43.615, -116.2023], ['Idaho Falls', 'ID', 43.4917, -112.0339],
  ['Jackson', 'WY', 43.4799, -110.7624], ['Cheyenne', 'WY', 41.14, -104.8202], ['Casper', 'WY', 42.8666, -106.3131],
  ['Billings', 'MT', 45.7833, -108.5007], ['Bozeman', 'MT', 45.677, -111.0429], ['Missoula', 'MT', 46.8721, -113.994],
  ['Los Angeles', 'CA', 34.0522, -118.2437], ['San Diego', 'CA', 32.7157, -117.1611], ['San Francisco', 'CA', 37.7749, -122.4194],
  ['Sacramento', 'CA', 38.5816, -121.4944], ['Fresno', 'CA', 36.7378, -119.7871], ['Bishop', 'CA', 37.3635, -118.3951],
  ['Portland', 'OR', 45.5152, -122.6784], ['Bend', 'OR', 44.0582, -121.3153], ['Seattle', 'WA', 47.6062, -122.3321],
  ['Spokane', 'WA', 47.6588, -117.426],
  // Plains, South, Midwest
  ['Dallas', 'TX', 32.7767, -96.797], ['Fort Worth', 'TX', 32.7555, -97.3308], ['Houston', 'TX', 29.7604, -95.3698],
  ['Austin', 'TX', 30.2672, -97.7431], ['San Antonio', 'TX', 29.4241, -98.4936], ['El Paso', 'TX', 31.7619, -106.485],
  ['Amarillo', 'TX', 35.222, -101.8313], ['Lubbock', 'TX', 33.5779, -101.8552], ['Oklahoma City', 'OK', 35.4676, -97.5164],
  ['Tulsa', 'OK', 36.154, -95.9928], ['Wichita', 'KS', 37.6872, -97.3301], ['Kansas City', 'MO', 39.0997, -94.5786],
  ['St. Louis', 'MO', 38.627, -90.1994], ['Omaha', 'NE', 41.2565, -95.9345],
  ['Minneapolis', 'MN', 44.9778, -93.265], ['Chicago', 'IL', 41.8781, -87.6298], ['Milwaukee', 'WI', 43.0389, -87.9065],
  ['Detroit', 'MI', 42.3314, -83.0458], ['Indianapolis', 'IN', 39.7684, -86.1581], ['Columbus', 'OH', 39.9612, -82.9988],
  ['Cleveland', 'OH', 41.4993, -81.6944], ['Nashville', 'TN', 36.1627, -86.7816], ['Memphis', 'TN', 35.1495, -90.049],
  ['Atlanta', 'GA', 33.749, -84.388], ['New Orleans', 'LA', 29.9511, -90.0715], ['Little Rock', 'AR', 34.7465, -92.2896],
  ['Birmingham', 'AL', 33.5186, -86.8104], ['Charlotte', 'NC', 35.2271, -80.8431], ['Raleigh', 'NC', 35.7796, -78.6382],
  ['Asheville', 'NC', 35.5951, -82.5515], ['Miami', 'FL', 25.7617, -80.1918], ['Orlando', 'FL', 28.5383, -81.3792],
  ['Tampa', 'FL', 27.9506, -82.4572], ['Jacksonville', 'FL', 30.3322, -81.6557],
  // Northeast
  ['New York', 'NY', 40.7128, -74.006], ['Boston', 'MA', 42.3601, -71.0589], ['Philadelphia', 'PA', 39.9526, -75.1652],
  ['Pittsburgh', 'PA', 40.4406, -79.9959], ['Washington', 'DC', 38.9072, -77.0369], ['Baltimore', 'MD', 39.2904, -76.6122],
  ['Burlington', 'VT', 44.4759, -73.2121], ['Portland', 'ME', 43.6591, -70.2568],
]

export const KNOWN_PLACES: KnownPlace[] = RAW.map(([name, admin, lat, lon]) => ({ name, admin, lat, lon }))

/** Case-insensitive prefix/substring search, best matches first. */
export function searchKnownPlaces(query: string, limit = 8): KnownPlace[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const scored = KNOWN_PLACES.map((p) => {
    const full = `${p.name}, ${p.admin}`.toLowerCase()
    const name = p.name.toLowerCase()
    let score = -1
    if (name === q || full === q) score = 0
    else if (name.startsWith(q) || full.startsWith(q)) score = 1
    else if (full.includes(q)) score = 2
    return { p, score }
  })
    .filter((s) => s.score >= 0)
    .sort((a, b) => a.score - b.score || a.p.name.localeCompare(b.p.name))
  return scored.slice(0, limit).map((s) => s.p)
}
