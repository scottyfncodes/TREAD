import type { RegionPack } from '../../../domain/adventure'

/**
 * San Juan Mountains, Colorado.
 *
 * Researched, sourced data -- UNKNOWN where nothing credible was found --
 * held as an ordinary region pack. Every route starts at a gateway town
 * rather than any one home base, and the wording assumes no particular
 * vehicle. Edit this file directly.
 */
export const SAN_JUANS: RegionPack = {
  region: {
  "id": "co_san_juans",
  "name": "San Juan Mountains",
  "state": "CO",
  "stateName": "Colorado",
  "summary": "High passes, ghost towns and alpine lakes in southwest Colorado. Routes start from gateway towns; the roads over the passes range from paved highway to BLM-designated high-clearance 4WD.",
  "center": {
    "lat": 37.75,
    "lon": -107.75
  },
  "zoom": 9,
  "landManagers": [
    "San Juan National Forest",
    "BLM",
    "National Park Service"
  ],
  "gatewayIds": [
    "silverton",
    "durango"
  ],
  "conditionsUrl": "https://www.fs.usda.gov/r02/sanjuan/alerts",
  "conditionsLabel": "San Juan NF alerts & closures",
  "notes": [
    "US 550 crosses three high passes; CDOT closes it for avalanche control and crashes -- check COtrip.",
    "Check Colorado fire restrictions before camping."
  ],
  "sources": [
    "sjnf",
    "cotrip"
  ],
  "lastChecked": "2026-09-18"
},
  gateways: [
  {
    "id": "silverton",
    "name": "Silverton",
    "state": "CO",
    "lat": 37.8119,
    "lon": -107.6645,
    "services": [],
    "sources": [
      "codot_byways"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "durango",
    "name": "Durango",
    "state": "CO",
    "lat": 37.2753,
    "lon": -107.8801,
    "services": [],
    "sources": [
      "codot_byways"
    ],
    "lastChecked": "2026-09-18"
  }
],
  adventures: [
  {
    "id": "ice_lake_basin",
    "name": "Ice Lake Basin",
    "tagline": "Turquoise lakes above treeline, on an ordinary gravel road",
    "kind": "hike",
    "regionId": "co_san_juans",
    "categories": [
      "hiking",
      "mountains",
      "lakes",
      "day_trip",
      "camping"
    ],
    "anchor": {
      "lat": 37.8078,
      "lon": -107.7717,
      "label": "Ice Lake trailhead, South Mineral"
    },
    "gatewayId": "silverton",
    "access": [
      {
        "via": "US 550 north 2 mi from Silverton, then FR 585 (South Mineral Rd)",
        "miles": 6.4,
        "roadClass": "graded_dirt",
        "vehicle": "any_vehicle",
        "notes": "Flat gravel road, 4.4 mi to the campground and trailhead lot. No 4WD needed to get here.",
        "sources": [
          "sjnf",
          "sjma"
        ],
        "lastChecked": "2026-09-18"
      }
    ],
    "route": null,
    "difficulty": null,
    "requirements": {
      "access": "any_vehicle",
      "strength": "required",
      "basis": "official",
      "maxWidthIn": null,
      "ohvAllowed": null,
      "ohvOnly": false,
      "recommendedEquipment": [],
      "notForStock": false,
      "notes": "Approach is paved or graded; any street-legal vehicle in normal conditions.",
      "conditional": [],
      "sources": [
        "sjma",
        "sjnf"
      ],
      "lastChecked": "2026-09-18"
    },
    "fees": [],
    "permits": null,
    "landManager": "San Juan National Forest",
    "hikeIds": [
      "ice_lake_basin"
    ],
    "stopIds": [
      "silverton",
      "molas_pass_overlook"
    ],
    "campIds": [
      "south_mineral_cg",
      "south_mineral_dispersed"
    ],
    "foodIds": [
      "steamworks",
      "carver",
      "animas_brewing"
    ],
    "why": "One of the highest-payoff hiking days in the San Juans. You climb 2,400-odd feet out of spruce into a basin of turquoise lakes at 12,000 ft, and the road in is ordinary gravel -- no special vehicle needed to reach the trailhead.",
    "highlights": [
      "Lower and upper basins, plus Island Lake if the legs are willing",
      "Wildflower display that is genuinely nationally known, often peaking mid-to-late July",
      "Trailhead at 9,800 ft means the altitude work starts immediately"
    ],
    "hazards": [
      "Above treeline for hours -- be off the high ground before afternoon storms build",
      "Parking fills early on summer weekends",
      "Silverton has no brewpub since Avalanche closed; the beer is on the Durango end"
    ],
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "Snow-free window is roughly July through September in a typical year.",
      "confidence": "reported",
      "sources": [
        "sjma",
        "sjnf"
      ],
      "lastChecked": "2026-09-18"
    },
    "conditionsUrl": "https://www.fs.usda.gov/r02/sanjuan/alerts",
    "sources": [
      "sjnf",
      "sjma"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "alpine_loop_engineer_pass",
    "name": "Alpine Loop: Animas Forks & Engineer Pass",
    "tagline": "Ghost town, then a 12,800 ft pass that needs real 4WD",
    "kind": "ohv_route",
    "regionId": "co_san_juans",
    "categories": [
      "offroad",
      "history",
      "mountains",
      "scenic_drive",
      "vehicle_destinations",
      "day_trip"
    ],
    "anchor": {
      "lat": 37.9722,
      "lon": -107.5333,
      "label": "Engineer Pass summit"
    },
    "gatewayId": "silverton",
    "access": [
      {
        "via": "CR 2 north from Silverton up the Animas to Animas Forks",
        "miles": 12,
        "roadClass": "graded_dirt",
        "vehicle": "any_vehicle",
        "notes": "Reported passable in summer by two-wheel drive as far as Animas Forks. Shelf sections and mining traffic.",
        "sources": [
          "blm_animas_forks",
          "sanjuancountyco"
        ],
        "lastChecked": "2026-09-18"
      },
      {
        "via": "Animas Forks up to Engineer Pass (12,800 ft)",
        "miles": null,
        "roadClass": "technical_4wd",
        "vehicle": "four_wd_low_range",
        "notes": "BLM states the two 12,000 ft passes require high-clearance 4WD. Leg length not verified -- the app is not going to make one up.",
        "sources": [
          "blm_alpine_loop"
        ],
        "lastChecked": "2026-09-18"
      }
    ],
    "route": {
      "miles": null,
      "milesNote": "Leg lengths are shown under access; unverified legs are UNKNOWN.",
      "shape": "out_and_back",
      "hours": null,
      "terrain": [],
      "obstacles": [],
      "sources": [
        "blm_alpine_loop",
        "blm_animas_forks"
      ],
      "lastChecked": "2026-09-18"
    },
    "difficulty": null,
    "requirements": {
      "access": "four_wd_low_range",
      "strength": "required",
      "basis": "official",
      "maxWidthIn": null,
      "ohvAllowed": null,
      "ohvOnly": false,
      "recommendedEquipment": [
        "recovery_kit",
        "full_size_spare"
      ],
      "notForStock": false,
      "notes": "BLM states the two 12,000 ft passes require high-clearance 4WD; low range and recovery gear are the stated expectation.",
      "conditional": [],
      "sources": [
        "blm_alpine_loop"
      ],
      "lastChecked": "2026-09-18"
    },
    "fees": [],
    "permits": null,
    "landManager": "BLM (Alpine Loop Back Country Byway)",
    "hikeIds": [],
    "stopIds": [
      "silverton",
      "animas_forks",
      "engineer_pass_summit",
      "red_mountain_district"
    ],
    "campIds": [
      "south_mineral_dispersed"
    ],
    "foodIds": [
      "steamworks",
      "animas_brewing"
    ],
    "why": "About two-thirds of the Alpine Loop is graded gravel most vehicles can manage. The last third, to Engineer Pass at 12,800 ft, is where the BLM’s high-clearance 4WD requirement applies -- with a ghost town on the way up.",
    "highlights": [
      "Animas Forks: seven BLM-stabilised buildings at about 11,200 ft",
      "Engineer Pass at 12,800 ft, with Cinnamon Pass at 12,640 ft as the extension toward Lake City",
      "Red Mountain mining district on the drive if you continue north"
    ],
    "hazards": [
      "Low range and recovery gear are the stated requirement, not a suggestion",
      "Engineer Pass has been closed for the first two weeks of June in recent years",
      "No cell service for most of this; the navigation hand-off gets you to the road, not through it"
    ],
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "Typically late May through September depending on snowpack; Engineer has been closed the first two weeks of June. No fixed opening date exists.",
      "confidence": "documented",
      "sources": [
        "blm_alpine_loop"
      ],
      "lastChecked": "2026-09-18"
    },
    "conditionsUrl": "https://www.blm.gov/visit/alpine-loop",
    "sources": [
      "blm_alpine_loop",
      "blm_animas_forks"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "engineer_mountain",
    "name": "Engineer Mountain",
    "tagline": "A classic with a real summit decision at the top",
    "kind": "hike",
    "regionId": "co_san_juans",
    "categories": [
      "hiking",
      "mountains",
      "day_trip"
    ],
    "anchor": {
      "lat": 37.7042,
      "lon": -107.7764,
      "label": "Engineer Mountain trailhead, Coal Bank Pass"
    },
    "gatewayId": "durango",
    "access": [
      {
        "via": "US 550 north to Coal Bank Pass",
        "miles": 35,
        "roadClass": "paved_mountain",
        "vehicle": "any_vehicle",
        "notes": "Trailhead spur is a short dirt road just north of the pass, near mile marker 56.9.",
        "sources": [
          "durango_herald",
          "durango_trails"
        ],
        "lastChecked": "2026-09-18"
      }
    ],
    "route": null,
    "difficulty": null,
    "requirements": {
      "access": "any_vehicle",
      "strength": "required",
      "basis": "community",
      "maxWidthIn": null,
      "ohvAllowed": null,
      "ohvOnly": false,
      "recommendedEquipment": [],
      "notForStock": false,
      "notes": "Approach is paved or graded; any street-legal vehicle in normal conditions.",
      "conditional": [],
      "sources": [
        "durango_herald",
        "durango_trails"
      ],
      "lastChecked": "2026-09-18"
    },
    "fees": [],
    "permits": null,
    "landManager": "San Juan National Forest",
    "hikeIds": [
      "engineer_mountain"
    ],
    "stopIds": [
      "molas_pass_overlook"
    ],
    "campIds": [
      "sig_creek_cg",
      "haviland_lake_cg"
    ],
    "foodIds": [
      "carver",
      "steamworks",
      "animas_brewing"
    ],
    "why": "A paved approach to a trailhead that puts you on a flowered plateau under a genuinely handsome peak. You can turn around at the plateau with the day already won, or take the off-trail summit route.",
    "highlights": [
      "Trail to the plateau is straightforward; the summit is a separate decision",
      "Old-growth timber low, wildflower meadows high",
      "Short paved approach means a late start still works"
    ],
    "hazards": [
      "The summit route leaves the trail and has about 50 ft of real exposure at the crux",
      "Fully exposed plateau -- weather is the whole game up there"
    ],
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "High summer into early fall.",
      "confidence": "reported",
      "sources": [
        "durango_trails"
      ],
      "lastChecked": "2026-09-18"
    },
    "conditionsUrl": "https://www.fs.usda.gov/r02/sanjuan/alerts",
    "sources": [
      "durango_trails",
      "durango_herald"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "crater_lake_west_needles",
    "name": "Crater Lake, West Needles",
    "tagline": "Eleven miles, gentle grade, enormous country",
    "kind": "hike",
    "regionId": "co_san_juans",
    "categories": [
      "hiking",
      "lakes",
      "mountains",
      "day_trip"
    ],
    "anchor": {
      "lat": 37.7378,
      "lon": -107.7053,
      "label": "Andrews Lake trailhead"
    },
    "gatewayId": "silverton",
    "access": [
      {
        "via": "US 550 south from Silverton over Molas Pass to the Andrews Lake turn-off",
        "miles": null,
        "roadClass": "paved_mountain",
        "vehicle": "any_vehicle",
        "notes": "Paved spur to the lake, just south of Molas Pass. Distance from Silverton not verified here.",
        "sources": [
          "durango_trails",
          "sjnf"
        ],
        "lastChecked": "2026-09-18"
      }
    ],
    "route": null,
    "difficulty": null,
    "requirements": {
      "access": "any_vehicle",
      "strength": "required",
      "basis": "official",
      "maxWidthIn": null,
      "ohvAllowed": null,
      "ohvOnly": false,
      "recommendedEquipment": [],
      "notForStock": false,
      "notes": "Approach is paved or graded; any street-legal vehicle in normal conditions.",
      "conditional": [],
      "sources": [
        "durango_trails",
        "sjnf"
      ],
      "lastChecked": "2026-09-18"
    },
    "fees": [],
    "permits": null,
    "landManager": "San Juan National Forest",
    "hikeIds": [
      "crater_lake"
    ],
    "stopIds": [
      "andrews_lake",
      "molas_pass_overlook",
      "silverton"
    ],
    "campIds": [
      "little_molas_dispersed",
      "south_mineral_cg"
    ],
    "foodIds": [
      "steamworks",
      "animas_brewing"
    ],
    "why": "The only trail into the West Needle Mountains section of the Weminuche. Eleven miles round trip but only about 870 ft of net gain -- a distance day rather than a climbing day, from a paved trailhead any vehicle can reach.",
    "highlights": [
      "Twilight Peak and the Needles across the basin",
      "Paved trailhead at 10,770 ft -- no approach road problem at all",
      "Molas Pass overlook is on the way and costs you fifteen minutes"
    ],
    "hazards": [
      "Rolling terrain: the return is not downhill, and the mileage catches people out",
      "Wilderness area -- no bikes, no motors, and the rules are enforced"
    ],
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "Trailhead sits at 10,770 ft; typically clear by early July.",
      "confidence": "reported",
      "sources": [
        "durango_trails"
      ],
      "lastChecked": "2026-09-18"
    },
    "conditionsUrl": "https://www.fs.usda.gov/r02/sanjuan/alerts",
    "sources": [
      "sjnf",
      "durango_trails"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "highland_mary_lakes",
    "name": "Highland Mary Lakes",
    "tagline": "Cunningham Gulch, then a staircase of tundra lakes",
    "kind": "hike",
    "regionId": "co_san_juans",
    "categories": [
      "hiking",
      "lakes",
      "offroad",
      "history",
      "mountains"
    ],
    "anchor": {
      "lat": 37.75,
      "lon": -107.5967,
      "label": "Highland Mary trailhead, Cunningham Gulch"
    },
    "gatewayId": "silverton",
    "access": [
      {
        "via": "CR 2 to Howardsville, then CR 4 up Cunningham Gulch",
        "miles": 4.7,
        "roadClass": "graded_dirt",
        "vehicle": "any_vehicle",
        "notes": "Good dirt for about 3.7 mi up the gulch to the mine ruins.",
        "sources": [
          "durango_trails",
          "sanjuancountyco"
        ],
        "lastChecked": "2026-09-18"
      },
      {
        "via": "Final pitch to the upper trailhead",
        "miles": 0.7,
        "roadClass": "high_clearance",
        "vehicle": "four_wd",
        "notes": "Steeper and looser from roughly the 4-mile point. Parking at the 2WD area instead adds about 1.4 mi round trip on foot -- a fair trade if conditions look bad.",
        "sources": [
          "durango_trails"
        ],
        "lastChecked": "2026-09-18"
      }
    ],
    "route": null,
    "difficulty": null,
    "requirements": {
      "access": "four_wd",
      "strength": "recommended",
      "basis": "community",
      "maxWidthIn": null,
      "ohvAllowed": null,
      "ohvOnly": false,
      "recommendedEquipment": [
        "recovery_kit",
        "full_size_spare"
      ],
      "notForStock": false,
      "notes": "Only the final 0.7 mi to the upper trailhead needs 4WD. Parking at the lower 2WD area adds about 1.4 mi round trip on foot.",
      "conditional": [],
      "sources": [
        "durango_trails"
      ],
      "lastChecked": "2026-09-18"
    },
    "fees": [],
    "permits": null,
    "landManager": "San Juan National Forest",
    "hikeIds": [
      "highland_mary_lakes"
    ],
    "stopIds": [
      "silverton",
      "animas_forks"
    ],
    "campIds": [
      "south_mineral_cg",
      "south_mineral_dispersed"
    ],
    "foodIds": [
      "steamworks",
      "carver"
    ],
    "why": "The 4WD section is short and optional, and the reward is a chain of lakes on open tundra with the Continental Divide as the turnaround. A 4WD vehicle saves you about 1.4 miles of walking; a car parks lower and walks it.",
    "highlights": [
      "Lakes at roughly 12,000 ft on the Divide",
      "Loop variant over the Continental Divide Trail adds distance and gain",
      "Cunningham Gulch itself is a working mining landscape"
    ],
    "hazards": [
      "Frequent stream crossings; high water early season",
      "Open tundra with no shelter once you are at the lakes",
      "Route-finding on the CDT loop is genuinely non-trivial in cloud"
    ],
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "Mid-summer into September; early season means snow, mud and pushy crossings.",
      "confidence": "reported",
      "sources": [
        "durango_trails"
      ],
      "lastChecked": "2026-09-18"
    },
    "conditionsUrl": "https://www.fs.usda.gov/r02/sanjuan/alerts",
    "sources": [
      "durango_trails"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "kennebec_pass",
    "name": "Kennebec Pass via La Plata Canyon",
    "tagline": "Canyon road to 11,600 ft and the Colorado Trail",
    "kind": "ohv_route",
    "regionId": "co_san_juans",
    "categories": [
      "offroad",
      "hiking",
      "history",
      "mountains",
      "day_trip"
    ],
    "anchor": {
      "lat": 37.4194,
      "lon": -108.0181,
      "label": "Kennebec Pass trailhead"
    },
    "gatewayId": "durango",
    "access": [
      {
        "via": "US 160 west to the La Plata Canyon turn-off",
        "miles": 15,
        "roadClass": "paved_highway",
        "vehicle": "any_vehicle",
        "sources": [
          "durango_herald",
          "sjnf"
        ],
        "lastChecked": "2026-09-18"
      },
      {
        "via": "CR 124 / FR 571 up La Plata Canyon",
        "miles": 12.1,
        "roadClass": "rough_dirt",
        "vehicle": "high_clearance",
        "notes": "Dirt canyon road past the old mining camps. At 12.1 mi the road splits at a posted \"4WD Only\" sign.",
        "sources": [
          "durango_herald",
          "sjnf"
        ],
        "lastChecked": "2026-09-18"
      },
      {
        "via": "FR 571 above the split to the trailhead at 11,600 ft",
        "miles": 2.1,
        "roadClass": "technical_4wd",
        "vehicle": "four_wd",
        "notes": "Rutted, rocky, narrowing, with steep drop-offs near the top. Roughly the last two miles are the 4WD part; the lot is 14.2 mi from US 160.",
        "sources": [
          "durango_herald"
        ],
        "lastChecked": "2026-09-18"
      }
    ],
    "route": {
      "miles": null,
      "milesNote": "Leg lengths are shown under access; unverified legs are UNKNOWN.",
      "shape": "out_and_back",
      "hours": null,
      "terrain": [],
      "obstacles": [],
      "sources": [
        "durango_herald",
        "sjnf"
      ],
      "lastChecked": "2026-09-18"
    },
    "difficulty": null,
    "requirements": {
      "access": "four_wd",
      "strength": "required",
      "basis": "community",
      "maxWidthIn": null,
      "ohvAllowed": null,
      "ohvOnly": false,
      "recommendedEquipment": [
        "recovery_kit",
        "full_size_spare"
      ],
      "notForStock": false,
      "notes": "The final stretch needs 4WD; earlier sections are passable by less capable vehicles.",
      "conditional": [],
      "sources": [
        "durango_herald"
      ],
      "lastChecked": "2026-09-18"
    },
    "fees": [],
    "permits": null,
    "landManager": "San Juan National Forest",
    "hikeIds": [
      "colorado_trail_kennebec"
    ],
    "stopIds": [
      "la_plata_mining"
    ],
    "campIds": [
      "la_plata_dispersed"
    ],
    "foodIds": [
      "carver",
      "ska",
      "mancos_brewing"
    ],
    "why": "A canyon full of mining history, then about two miles that need 4WD, and you step out onto the Colorado Trail at 11,600 ft. High-clearance vehicles can reach the \"4WD Only\" sign; the last stretch is the part that needs 4WD.",
    "highlights": [
      "Mining remains the length of the canyon",
      "Colorado Trail access straight out of the parking area",
      "Short enough that a late start still leaves margin"
    ],
    "hazards": [
      "Steep drop-offs on the upper road; this is the part that wants a driver who is paying attention",
      "You arrive at 11,600 ft with zero acclimatisation runway",
      "Mixed private and public land in the canyon -- posted parcels are real"
    ],
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "Gated by snow on the upper road more than by the trail.",
      "confidence": "reported",
      "sources": [
        "durango_herald",
        "sjnf"
      ],
      "lastChecked": "2026-09-18"
    },
    "conditionsUrl": "https://www.fs.usda.gov/r02/sanjuan/alerts",
    "sources": [
      "durango_herald",
      "sjnf"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "ophir_pass",
    "name": "Ophir Pass crossing",
    "tagline": "A shelf road at 11,800 ft, and the exposure is the point",
    "kind": "ohv_route",
    "regionId": "co_san_juans",
    "categories": [
      "offroad",
      "scenic_drive",
      "mountains",
      "vehicle_destinations"
    ],
    "anchor": {
      "lat": 37.8514,
      "lon": -107.7897,
      "label": "Ophir Pass summit"
    },
    "gatewayId": "silverton",
    "access": [
      {
        "via": "US 550 north of Silverton to the Ophir Pass road",
        "miles": null,
        "roadClass": "paved_mountain",
        "vehicle": "any_vehicle",
        "notes": "Turn-off distance from Silverton not verified here.",
        "sources": [
          "cotrip"
        ],
        "lastChecked": "2026-09-18"
      },
      {
        "via": "Ophir Pass road west over the summit toward Ophir",
        "miles": 10.1,
        "roadClass": "high_clearance",
        "vehicle": "four_wd",
        "notes": "Point-to-point, about 1,800 ft of gain. Loose rock, steep grades, and a narrow shelf section on the Ophir side. Much of it is approachable for a competent high-clearance 4WD.",
        "sources": [
          "alltrails"
        ],
        "lastChecked": "2026-09-18"
      }
    ],
    "route": {
      "miles": 10.1,
      "milesNote": "About 10.1 miles point-to-point per community data.",
      "shape": "point_to_point",
      "hours": null,
      "terrain": [],
      "obstacles": [],
      "sources": [
        "alltrails"
      ],
      "lastChecked": "2026-09-18"
    },
    "difficulty": null,
    "requirements": {
      "access": "four_wd",
      "strength": "required",
      "basis": "community",
      "maxWidthIn": null,
      "ohvAllowed": null,
      "ohvOnly": false,
      "recommendedEquipment": [
        "recovery_kit",
        "full_size_spare"
      ],
      "notForStock": false,
      "notes": "The final stretch needs 4WD; earlier sections are passable by less capable vehicles.",
      "conditional": [],
      "sources": [
        "alltrails"
      ],
      "lastChecked": "2026-09-18"
    },
    "fees": [],
    "permits": null,
    "landManager": "San Juan National Forest",
    "hikeIds": [],
    "stopIds": [
      "ophir_pass_summit",
      "silverton",
      "red_mountain_district"
    ],
    "campIds": [
      "south_mineral_dispersed"
    ],
    "foodIds": [
      "steamworks",
      "carver"
    ],
    "why": "One of the more approachable high crossings in the range, where the drop-offs do the talking rather than the rock. It is a driving day, not a hiking day.",
    "highlights": [
      "Summit at roughly 11,800 ft with the Upper Ophir valley below",
      "Connects toward Telluride if you want to make a very long loop of it",
      "Alpine tundra and seasonal wildflowers along the top"
    ],
    "hazards": [
      "Narrow shelf on the Ophir side with real exposure and limited passing places",
      "Snow lingers on the west side well into July",
      "Early autumn storms can shut it by late September"
    ],
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "Typically summitable from mid-June; not maintained for passenger vehicles once snow starts in September.",
      "confidence": "reported",
      "sources": [
        "alltrails",
        "cotrip"
      ],
      "lastChecked": "2026-09-18"
    },
    "conditionsUrl": "https://www.fs.usda.gov/r02/sanjuan/alerts",
    "sources": [
      "alltrails",
      "cotrip"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "mesa_verde_chapin_mesa",
    "name": "Mesa Verde: Chapin Mesa",
    "tagline": "World Heritage cliff dwellings, up a long, slow park road",
    "kind": "destination",
    "regionId": "co_san_juans",
    "categories": [
      "parks",
      "history",
      "hiking",
      "scenic_drive",
      "day_trip",
      "road_trip"
    ],
    "anchor": {
      "lat": 37.1836,
      "lon": -108.4879,
      "label": "Chapin Mesa, Mesa Verde NP"
    },
    "gatewayId": "durango",
    "access": [
      {
        "via": "US 160 west to the park entrance",
        "miles": 35,
        "roadClass": "paved_highway",
        "vehicle": "any_vehicle",
        "sources": [
          "nps_meve"
        ],
        "lastChecked": "2026-09-18"
      },
      {
        "via": "Park entrance road to Chapin Mesa",
        "miles": {
          "min": 20,
          "max": 22
        },
        "roadClass": "paved_mountain",
        "vehicle": "any_vehicle",
        "minutesOverride": {
          "min": 40,
          "max": 45
        },
        "notes": "Twenty-odd twisting miles that take 40-45 minutes. This leg is the single most under-estimated part of a Mesa Verde day.",
        "sources": [
          "nps_meve"
        ],
        "lastChecked": "2026-09-18"
      }
    ],
    "route": null,
    "difficulty": null,
    "requirements": {
      "access": "any_vehicle",
      "strength": "required",
      "basis": "official",
      "maxWidthIn": null,
      "ohvAllowed": null,
      "ohvOnly": false,
      "recommendedEquipment": [],
      "notForStock": false,
      "notes": "Approach is paved or graded; any street-legal vehicle in normal conditions.",
      "conditional": [],
      "sources": [
        "nps_meve"
      ],
      "lastChecked": "2026-09-18"
    },
    "fees": [
      {
        "label": "Mesa Verde National Park entrance",
        "amount": "Entrance fee applies; ranger-led dwelling tours need tickets -- confirm with NPS.",
        "sources": [
          "nps_meve_fees"
        ],
        "lastChecked": "2026-09-18"
      }
    ],
    "permits": null,
    "landManager": "National Park Service (Mesa Verde)",
    "hikeIds": [
      "petroglyph_point"
    ],
    "stopIds": [
      "mesa_verde_chapin"
    ],
    "campIds": [],
    "foodIds": [
      "mancos_brewing",
      "carver"
    ],
    "why": "Cliff dwellings and a short, genuinely interesting trail to rock art. The paved park road makes this a full day whether you want it to be or not -- and any street-legal vehicle can do it.",
    "highlights": [
      "Chapin Mesa museum, cliff dwelling overlooks and mesa-top loops",
      "Petroglyph Point trail: 2.4 miles, with a trailhead register",
      "Mancos Brewing on the return leg"
    ],
    "hazards": [
      "Ranger-led dwelling tours need tickets and sell out -- sort that before you drive",
      "Dogs are not allowed on park trails",
      "Entrance fee applies; confirm the current amount with NPS"
    ],
    "season": {
      "months": [
        4,
        5,
        6,
        7,
        8,
        9,
        10
      ],
      "note": "Road and facility seasons vary through the year -- confirm with the park before driving out.",
      "confidence": "reported",
      "sources": [
        "nps_meve"
      ],
      "lastChecked": "2026-09-18"
    },
    "conditionsUrl": "https://www.nps.gov/meve/index.htm",
    "sources": [
      "nps_meve",
      "nps_meve_fees"
    ],
    "lastChecked": "2026-09-18"
  }
],
  networks: [],
  hikes: [
  {
    "id": "ice_lake_basin",
    "name": "Ice Lake Basin",
    "trailNumber": "Trail #505",
    "shape": "out_and_back",
    "miles": {
      "min": 7.4,
      "max": 8.5
    },
    "gainFt": {
      "min": 2400,
      "max": 2900
    },
    "trailheadFt": 9800,
    "highPointFt": 12400,
    "ratedDifficulty": null,
    "hazards": [
      "Sustained climb from 9,800 ft to above 12,000 ft",
      "Afternoon thunderstorms above treeline are routine in July and August",
      "Snow lingers in the upper basin into early summer"
    ],
    "wilderness": null,
    "dogs": "unknown",
    "permits": "No permit required as of last check. A permit system has been publicly discussed for this basin -- confirm with San Juan NF before you go.",
    "parking": {
      "spaces": null,
      "notes": "Lot at the end of South Mineral Road (FR 585) by South Mineral Campground. Widely reported to fill early on summer weekends.",
      "fee": null,
      "finalApproach": "any_vehicle",
      "sources": [
        "sjnf",
        "sjma"
      ],
      "lastChecked": "2026-09-18"
    },
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "Typically mostly snow-free July through September; wildflowers often peak mid-to-late July.",
      "confidence": "reported",
      "sources": [
        "sjma",
        "sjnf"
      ],
      "lastChecked": "2026-09-18"
    },
    "lat": 37.8078,
    "lon": -107.7717,
    "sources": [
      "sjnf",
      "sjma",
      "alltrails"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "engineer_mountain",
    "name": "Engineer Mountain Trail",
    "trailNumber": "Trail #508",
    "shape": "partly_off_trail",
    "miles": {
      "min": 6,
      "max": 8.5
    },
    "gainFt": 2378,
    "trailheadFt": 9067,
    "highPointFt": 11799,
    "ratedDifficulty": null,
    "hazards": [
      "The summit push leaves the trail; roughly 50 ft of genuinely exposed scrambling at the crux",
      "The meadow and plateau are fully above treeline -- no shelter from storms"
    ],
    "wilderness": null,
    "dogs": "unknown",
    "permits": null,
    "parking": {
      "spaces": null,
      "notes": "Short dirt spur west off US 550 about 0.1 mi north of Coal Bank Pass (near mile marker 56.9).",
      "fee": null,
      "finalApproach": "any_vehicle",
      "sources": [
        "durango_trails",
        "durango_herald"
      ],
      "lastChecked": "2026-09-18"
    },
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "High summer into early fall. The plateau holds snow well past the highway opening.",
      "confidence": "reported",
      "sources": [
        "durango_trails"
      ],
      "lastChecked": "2026-09-18"
    },
    "lat": 37.7042,
    "lon": -107.7764,
    "sources": [
      "durango_trails",
      "durango_herald",
      "alltrails"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "crater_lake",
    "name": "Crater Lake (from Andrews Lake)",
    "trailNumber": "Trail #623",
    "shape": "out_and_back",
    "miles": 11,
    "gainFt": 870,
    "trailheadFt": 10770,
    "highPointFt": 11640,
    "ratedDifficulty": null,
    "hazards": [
      "Long day at altitude even though the net gain is modest -- the first two miles do most of the climbing",
      "Rolling terrain means the return is not all downhill"
    ],
    "wilderness": "Weminuche Wilderness (West Needle Mountains)",
    "dogs": "unknown",
    "permits": null,
    "parking": {
      "spaces": null,
      "notes": "Paved Andrews Lake day-use area off US 550 just south of Molas Pass.",
      "fee": null,
      "finalApproach": "any_vehicle",
      "sources": [
        "sjnf",
        "durango_trails"
      ],
      "lastChecked": "2026-09-18"
    },
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "Trailhead is at 10,770 ft; snow typically clears by early July.",
      "confidence": "reported",
      "sources": [
        "durango_trails"
      ],
      "lastChecked": "2026-09-18"
    },
    "lat": 37.7378,
    "lon": -107.7053,
    "sources": [
      "sjnf",
      "durango_trails",
      "hikingproject"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "highland_mary_lakes",
    "name": "Highland Mary Lakes",
    "trailNumber": "Trail #606",
    "shape": "out_and_back",
    "miles": {
      "min": 6,
      "max": 7.7
    },
    "gainFt": {
      "min": 1530,
      "max": 1790
    },
    "trailheadFt": 10700,
    "highPointFt": 12100,
    "ratedDifficulty": null,
    "hazards": [
      "Steep grades and frequent stream crossings",
      "Open tundra above the lakes -- fast-moving weather with nowhere to hide",
      "Route-finding on the Continental Divide loop variant"
    ],
    "wilderness": "Weminuche Wilderness",
    "dogs": "unknown",
    "permits": null,
    "parking": {
      "spaces": null,
      "notes": "Cunningham Gulch (CR 4) is good dirt for about 3.7 mi; the final stretch to the official trailhead is a 4WD road. Parking low adds roughly 1.4 mi round trip on foot.",
      "fee": null,
      "finalApproach": "four_wd",
      "sources": [
        "durango_trails",
        "sanjuancountyco"
      ],
      "lastChecked": "2026-09-18"
    },
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "Mid-summer into September. Early season means snow, mud and high water at the crossings.",
      "confidence": "reported",
      "sources": [
        "durango_trails"
      ],
      "lastChecked": "2026-09-18"
    },
    "lat": 37.75,
    "lon": -107.5967,
    "sources": [
      "durango_trails",
      "alltrails"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "colorado_trail_kennebec",
    "name": "Colorado Trail from Kennebec Pass",
    "shape": "out_and_back",
    "miles": {
      "min": 3,
      "max": 8
    },
    "gainFt": {
      "min": 500,
      "max": 1400
    },
    "trailheadFt": 11600,
    "highPointFt": 12000,
    "ratedDifficulty": null,
    "hazards": [
      "Starts at 11,600 ft -- no acclimatisation runway at all",
      "Entirely above or near treeline; storms arrive fast",
      "Getting back down the 4WD road matters as much as the hike"
    ],
    "wilderness": null,
    "dogs": "unknown",
    "permits": null,
    "parking": {
      "spaces": null,
      "notes": "Trailhead lot at roughly 11,600 ft, about 14 mi up La Plata Canyon. The final ~2 mi is the 4WD section.",
      "fee": null,
      "finalApproach": "four_wd",
      "sources": [
        "sjnf",
        "durango_herald"
      ],
      "lastChecked": "2026-09-18"
    },
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "Gated by snow on the upper La Plata Canyon road more than by the trail.",
      "confidence": "reported",
      "sources": [
        "durango_herald"
      ],
      "lastChecked": "2026-09-18"
    },
    "lat": 37.4194,
    "lon": -108.0181,
    "sources": [
      "sjnf",
      "durango_herald"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "petroglyph_point",
    "name": "Petroglyph Point Trail (Mesa Verde)",
    "shape": "loop",
    "miles": 2.4,
    "gainFt": null,
    "trailheadFt": 6900,
    "highPointFt": null,
    "ratedDifficulty": null,
    "hazards": [
      "Short sections of rock steps and a squeeze between boulders",
      "Must register at the trailhead; the park closes the trail at times"
    ],
    "wilderness": null,
    "dogs": "prohibited",
    "permits": "Trail register required at the trailhead. Park entrance fee applies -- check current fees with NPS.",
    "parking": {
      "spaces": null,
      "notes": "Chapin Mesa museum area parking.",
      "fee": "Park entrance fee applies -- amount not verified here, see NPS fees page.",
      "finalApproach": "any_vehicle",
      "sources": [
        "nps_meve",
        "nps_meve_fees"
      ],
      "lastChecked": "2026-09-18"
    },
    "season": {
      "months": [
        4,
        5,
        6,
        7,
        8,
        9,
        10
      ],
      "note": "Park road and facility seasons vary; confirm with the park before driving out.",
      "confidence": "reported",
      "sources": [
        "nps_meve"
      ],
      "lastChecked": "2026-09-18"
    },
    "lat": 37.1836,
    "lon": -108.4879,
    "sources": [
      "nps_meve"
    ],
    "lastChecked": "2026-09-18"
  }
],
  camps: [
  {
    "id": "south_mineral_cg",
    "name": "South Mineral Campground",
    "kind": "developed",
    "sites": 26,
    "reservations": "first_come",
    "reservationUrl": null,
    "elevationFt": 9800,
    "access": "any_vehicle",
    "water": null,
    "season": {
      "months": [
        6,
        7,
        8,
        9
      ],
      "note": "Season reported as late May through September. Confirm exact open/close on Recreation.gov.",
      "confidence": "reported",
      "sources": [
        "sjnf",
        "recgov"
      ],
      "lastChecked": "2026-09-18"
    },
    "restrictions": [
      "All sites first-come, first-served -- no reservations taken",
      "One of the busiest campgrounds in the forest; arriving late on a summer weekend is a gamble"
    ],
    "lat": 37.8072,
    "lon": -107.7703,
    "sources": [
      "sjnf",
      "recgov"
    ],
    "lastChecked": "2026-09-18",
    "fee": "$20/night",
    "vehicleFitNotes": "Reached by graded gravel (FR 585); sites are vehicle-accessible, which suits a rooftop tent. Levelness varies site to site -- not verified.",
    "regionId": "co_san_juans"
  },
  {
    "id": "haviland_lake_cg",
    "name": "Haviland Lake Campground",
    "kind": "developed",
    "sites": null,
    "reservations": "reservable",
    "reservationUrl": "https://www.recreation.gov/",
    "elevationFt": 8000,
    "access": "any_vehicle",
    "water": "On the lake. Potable water availability not verified.",
    "season": {
      "months": [
        5,
        6,
        7,
        8,
        9
      ],
      "note": "Reservable up to six months ahead, minimum four days in advance. Confirm season on Recreation.gov.",
      "confidence": "reported",
      "sources": [
        "sjnf",
        "recgov"
      ],
      "lastChecked": "2026-09-18"
    },
    "restrictions": [],
    "lat": 37.4544,
    "lon": -107.8028,
    "sources": [
      "sjnf",
      "recgov"
    ],
    "lastChecked": "2026-09-18",
    "fee": "$32/night",
    "vehicleFitNotes": "Paved-highway access 18 mi north of Durango; the easiest vehicle-camping night on this list.",
    "regionId": "co_san_juans"
  },
  {
    "id": "sig_creek_cg",
    "name": "Sig Creek Campground",
    "kind": "developed",
    "sites": null,
    "reservations": "unknown",
    "reservationUrl": null,
    "elevationFt": 9000,
    "access": "any_vehicle",
    "water": null,
    "season": {
      "months": [
        6,
        7,
        8,
        9
      ],
      "note": "Season not verified here -- check with San Juan NF.",
      "confidence": "unknown",
      "sources": [
        "sjnf"
      ],
      "lastChecked": "2026-09-18"
    },
    "restrictions": [],
    "lat": 37.6072,
    "lon": -107.8536,
    "sources": [
      "sjnf"
    ],
    "lastChecked": "2026-09-18",
    "fee": "$18/night",
    "vehicleFitNotes": "Small, quiet, off the Hermosa Park road. Suits a truck-top setup that does not need hookups.",
    "regionId": "co_san_juans"
  },
  {
    "id": "south_mineral_dispersed",
    "name": "South Mineral Road dispersed corridor (FR 585)",
    "kind": "dispersed",
    "sites": null,
    "reservations": "none_required",
    "reservationUrl": null,
    "elevationFt": 9600,
    "access": "any_vehicle",
    "water": "South Mineral Creek runs alongside. Treat everything.",
    "season": {
      "months": [
        6,
        7,
        8,
        9
      ],
      "note": "Follows the same snow window as the campground at the end of the road.",
      "confidence": "reported",
      "sources": [
        "sjnf"
      ],
      "lastChecked": "2026-09-18"
    },
    "restrictions": [
      "Dispersed camping rules, stay limits and designated-site requirements change -- read the signs at the road junction, they are the authority",
      "Fire restrictions change through the season; check before you strike a match"
    ],
    "lat": 37.8095,
    "lon": -107.7361,
    "sources": [
      "sjnf",
      "fire_restrictions"
    ],
    "lastChecked": "2026-09-18",
    "fee": "$0/night",
    "vehicleFitNotes": "Graded gravel road with established pullouts; a vehicle with a rooftop tent is well within what the road asks for.",
    "regionId": "co_san_juans"
  },
  {
    "id": "la_plata_dispersed",
    "name": "La Plata Canyon dispersed corridor (CR 124 / FR 571)",
    "kind": "dispersed",
    "sites": null,
    "reservations": "none_required",
    "reservationUrl": null,
    "elevationFt": 9000,
    "access": "high_clearance",
    "water": "La Plata River. Historic mining district upstream -- treat, and think about it.",
    "season": {
      "months": [
        6,
        7,
        8,
        9,
        10
      ],
      "note": "Lower canyon opens earlier than the upper road to Kennebec Pass.",
      "confidence": "reported",
      "sources": [
        "sjnf",
        "laplata_county"
      ],
      "lastChecked": "2026-09-18"
    },
    "restrictions": [
      "Mixed private and public land in the canyon -- private parcels are real and posted",
      "Read the signs at the pullout; designated-dispersed rules apply in places"
    ],
    "lat": 37.3862,
    "lon": -108.0503,
    "sources": [
      "sjnf",
      "laplata_county"
    ],
    "lastChecked": "2026-09-18",
    "fee": "$0/night",
    "vehicleFitNotes": "Pullouts along the canyon below the 4WD-only split. The closer to Kennebec you push, the more the road matters.",
    "regionId": "co_san_juans"
  },
  {
    "id": "little_molas_dispersed",
    "name": "Little Molas Lake area (near Molas Pass)",
    "kind": "dispersed",
    "sites": null,
    "reservations": "unknown",
    "reservationUrl": null,
    "elevationFt": 10900,
    "access": "any_vehicle",
    "water": null,
    "season": {
      "months": [
        7,
        8,
        9
      ],
      "note": "Short high-country season. Camping rules here have changed over the years -- verify current status with San Juan NF.",
      "confidence": "unknown",
      "sources": [
        "sjnf"
      ],
      "lastChecked": "2026-09-18"
    },
    "restrictions": [
      "Camping status and stay limits near Molas Pass have been adjusted in recent years -- do not assume, check"
    ],
    "lat": 37.7444,
    "lon": -107.7203,
    "sources": [
      "sjnf"
    ],
    "lastChecked": "2026-09-18",
    "fee": null,
    "vehicleFitNotes": "High, open and exposed at about 10,900 ft -- superb stars, genuinely cold nights, and wind is the variable that ruins it.",
    "regionId": "co_san_juans"
  }
],
  food: [
  {
    "id": "ska",
    "name": "Ska Brewing World Headquarters",
    "kind": "brewery",
    "town": "Durango",
    "address": "225 Girard St, Durango, CO 81303",
    "url": "https://skabrewing.com/",
    "phone": null,
    "hoursNote": "Reported Tue-Sat, around 11am-8pm (checked 2026-09-18). Confirm before you count on it.",
    "closed": null,
    "lat": 37.2402,
    "lon": -107.8722,
    "sources": [
      "ska"
    ],
    "lastChecked": "2026-09-18",
    "regionId": "co_san_juans"
  },
  {
    "id": "steamworks",
    "name": "Steamworks Brewing Company",
    "kind": "brewpub",
    "town": "Durango",
    "address": "801 E 2nd Ave, Durango, CO 81301",
    "url": "https://steamworksbrewing.com/",
    "phone": null,
    "hoursNote": "Reported open daily from 11am, late on Friday and Saturday (checked 2026-09-18). Confirm before you count on it.",
    "closed": null,
    "lat": 37.2775,
    "lon": -107.8781,
    "sources": [
      "steamworks"
    ],
    "lastChecked": "2026-09-18",
    "regionId": "co_san_juans"
  },
  {
    "id": "carver",
    "name": "Carver Brewing Co.",
    "kind": "brewpub",
    "town": "Durango",
    "address": "1022 Main Ave, Durango, CO 81301",
    "url": "https://carverbrewing.com/",
    "phone": null,
    "hoursNote": "Hours not verified. Carver also does breakfast -- useful on the way out, not just back.",
    "closed": null,
    "lat": 37.274,
    "lon": -107.8805,
    "sources": [
      "carver"
    ],
    "lastChecked": "2026-09-18",
    "regionId": "co_san_juans"
  },
  {
    "id": "animas_brewing",
    "name": "Animas Brewing Company",
    "kind": "brewpub",
    "town": "Durango",
    "address": "1560 E 2nd Ave, Durango, CO 81301",
    "url": "https://www.animasbrewing.com/",
    "phone": null,
    "hoursNote": "Reported 11am-9pm Tue/Wed/Thu/Sun, to 10pm Fri/Sat (checked 2026-09-18). Confirm before you count on it.",
    "closed": null,
    "lat": 37.2841,
    "lon": -107.876,
    "sources": [
      "animas_brewing"
    ],
    "lastChecked": "2026-09-18",
    "regionId": "co_san_juans"
  },
  {
    "id": "mancos_brewing",
    "name": "Mancos Brewing Company",
    "kind": "brewery",
    "town": "Mancos",
    "address": "484 E Frontage Rd, Mancos, CO 81328",
    "url": "https://mancosbrewingcompany.com/",
    "phone": "970-533-9761",
    "hoursNote": "Hours not verified. Call ahead.",
    "closed": null,
    "lat": 37.348,
    "lon": -108.276,
    "sources": [
      "mancos_brewing"
    ],
    "lastChecked": "2026-09-18",
    "regionId": "co_san_juans"
  },
  {
    "id": "avalanche_silverton",
    "name": "Avalanche Brewing Company",
    "kind": "brewpub",
    "town": "Silverton",
    "address": "1151 Greene St, Silverton, CO 81433",
    "url": null,
    "phone": null,
    "hoursNote": null,
    "closed": "Reported permanently closed on 2025-03-30.",
    "lat": 37.8119,
    "lon": -107.6645,
    "sources": [
      "wikipedia"
    ],
    "lastChecked": "2026-09-18",
    "regionId": "co_san_juans"
  }
],
  stops: [
  {
    "id": "animas_forks",
    "name": "Animas Forks ghost town",
    "kind": "ghost_town",
    "dwellMinutes": 45,
    "blurb": "One of the highest mining camps in North America, founded 1875 and empty by the 1920s. Seven buildings have been stabilised by the BLM and the San Juan County Historical Society -- new roofs, windows, doors and drainage, so what you walk through is standing on purpose.",
    "lat": 37.9294,
    "lon": -107.5717,
    "elevationFt": {
      "min": 11185,
      "max": 11200
    },
    "sources": [
      "blm_animas_forks",
      "wikipedia"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "engineer_pass_summit",
    "name": "Engineer Pass summit",
    "kind": "overlook",
    "dwellMinutes": 20,
    "blurb": "A 12,800 ft saddle on the Alpine Loop with the whole northern San Juan range laid out. This is the half of the loop that actually demands a 4WD vehicle.",
    "lat": 37.9722,
    "lon": -107.5333,
    "elevationFt": 12800,
    "sources": [
      "blm_alpine_loop"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "ophir_pass_summit",
    "name": "Ophir Pass summit",
    "kind": "overlook",
    "dwellMinutes": 20,
    "blurb": "About 11,800 ft on a shelf road above the Upper Ophir valley. Loose rock, steep grades and a narrow shelf on the Ophir side -- the exposure, not the traction, is the story.",
    "lat": 37.8514,
    "lon": -107.7897,
    "elevationFt": 11800,
    "sources": [
      "alltrails"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "molas_pass_overlook",
    "name": "Molas Pass overlook",
    "kind": "scenic",
    "dwellMinutes": 15,
    "blurb": "Paved pullout at 10,910 ft on US 550 looking into the Grenadier Range and down the Animas gorge. The best scenery-to-effort ratio in the county.",
    "lat": 37.7461,
    "lon": -107.7111,
    "elevationFt": 10910,
    "sources": [
      "codot_byways"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "silverton",
    "name": "Silverton",
    "kind": "town",
    "dwellMinutes": 45,
    "blurb": "A 9,300 ft mining town at the head of the Animas, and the hinge every San Juan route turns on. Note: Avalanche Brewing, the long-standing brewpub here, is reported permanently closed -- do not plan the beer stop around it.",
    "lat": 37.8119,
    "lon": -107.6645,
    "elevationFt": 9318,
    "sources": [
      "sanjuancountyco",
      "wikipedia"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "red_mountain_district",
    "name": "Red Mountain mining district",
    "kind": "mine",
    "dwellMinutes": 30,
    "blurb": "The oxidised red slopes and surviving headframes between Silverton and Ouray on US 550 -- among the most photographed industrial ruins in Colorado, visible from the highway.",
    "lat": 37.8969,
    "lon": -107.7117,
    "elevationFt": 11018,
    "sources": [
      "codot_byways",
      "wikipedia"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "mesa_verde_chapin",
    "name": "Mesa Verde -- Chapin Mesa",
    "kind": "historic",
    "dwellMinutes": 180,
    "blurb": "Cliff dwellings, the museum and the mesa-top loops. The drive in from the entrance is long and slow by design -- budget for it.",
    "lat": 37.1836,
    "lon": -108.4879,
    "elevationFt": 6900,
    "sources": [
      "nps_meve"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "andrews_lake",
    "name": "Andrews Lake",
    "kind": "water",
    "dwellMinutes": 20,
    "blurb": "Paved day-use area at 10,770 ft just south of Molas Pass. Trailhead for Crater Lake and a fine place to do nothing.",
    "lat": 37.7378,
    "lon": -107.7053,
    "elevationFt": 10770,
    "sources": [
      "sjnf"
    ],
    "lastChecked": "2026-09-18"
  },
  {
    "id": "la_plata_mining",
    "name": "La Plata Canyon mining remains",
    "kind": "mine",
    "dwellMinutes": 30,
    "blurb": "Scattered mill and mine remains up the canyon toward Kennebec. Mixed private and public ground -- look from the road, the posting is real.",
    "lat": 37.3862,
    "lon": -108.0503,
    "elevationFt": 9000,
    "sources": [
      "sjnf",
      "laplata_county"
    ],
    "lastChecked": "2026-09-18"
  }
],
}
