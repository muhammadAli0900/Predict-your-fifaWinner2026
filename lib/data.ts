export const GROUPS: Record<string, string[]> = {
  A: ['Mexico', 'South Africa', 'South Korea', 'Czechia'],
  B: ['Canada', 'Bosnia & Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['United States', 'Paraguay', 'Australia', 'Turkey'],
  E: ['Germany', 'Curacao', 'Ivory Coast', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'DR Congo', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
}

// [emoji, 3-letter code, FIFA rank]
export const TEAM: Record<string, [string, string, number]> = {
  'Mexico':               ['🇲🇽', 'MEX', 15],
  'South Africa':         ['🇿🇦', 'RSA', 56],
  'South Korea':          ['🇰🇷', 'KOR', 23],
  'Czechia':              ['🇨🇿', 'CZE', 42],
  'Canada':               ['🇨🇦', 'CAN', 27],
  'Bosnia & Herzegovina': ['🇧🇦', 'BIH', 70],
  'Qatar':                ['🇶🇦', 'QAT', 37],
  'Switzerland':          ['🇨🇭', 'SUI', 17],
  'Brazil':               ['🇧🇷', 'BRA',  5],
  'Morocco':              ['🇲🇦', 'MAR', 11],
  'Haiti':                ['🇭🇹', 'HAI', 84],
  'Scotland':             ['🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'SCO', 36],
  'United States':        ['🇺🇸', 'USA', 14],
  'Paraguay':             ['🇵🇾', 'PAR', 39],
  'Australia':            ['🇦🇺', 'AUS', 26],
  'Turkey':               ['🇹🇷', 'TUR', 25],
  'Germany':              ['🇩🇪', 'GER',  9],
  'Curacao':              ['🇨🇼', 'CUW', 82],
  'Ivory Coast':          ['🇨🇮', 'CIV', 41],
  'Ecuador':              ['🇪🇨', 'ECU', 24],
  'Netherlands':          ['🇳🇱', 'NED',  7],
  'Japan':                ['🇯🇵', 'JPN', 18],
  'Sweden':               ['🇸🇪', 'SWE', 44],
  'Tunisia':              ['🇹🇳', 'TUN', 40],
  'Belgium':              ['🇧🇪', 'BEL',  8],
  'Egypt':                ['🇪🇬', 'EGY', 34],
  'Iran':                 ['🇮🇷', 'IRN', 20],
  'New Zealand':          ['🇳🇿', 'NZL', 89],
  'Spain':                ['🇪🇸', 'ESP',  1],
  'Cape Verde':           ['🇨🇻', 'CPV', 68],
  'Saudi Arabia':         ['🇸🇦', 'KSA', 60],
  'Uruguay':              ['🇺🇾', 'URU', 16],
  'France':               ['🇫🇷', 'FRA',  3],
  'Senegal':              ['🇸🇳', 'SEN', 19],
  'Iraq':                 ['🇮🇶', 'IRQ', 58],
  'Norway':               ['🇳🇴', 'NOR', 29],
  'Argentina':            ['🇦🇷', 'ARG',  2],
  'Algeria':              ['🇩🇿', 'ALG', 35],
  'Austria':              ['🇦🇹', 'AUT', 22],
  'Jordan':               ['🇯🇴', 'JOR', 66],
  'Portugal':             ['🇵🇹', 'POR',  6],
  'DR Congo':             ['🇨🇩', 'COD', 53],
  'Uzbekistan':           ['🇺🇿', 'UZB', 57],
  'Colombia':             ['🇨🇴', 'COL', 13],
  'England':              ['🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG',  4],
  'Croatia':              ['🇭🇷', 'CRO', 10],
  'Ghana':                ['🇬🇭', 'GHA', 72],
  'Panama':               ['🇵🇦', 'PAN', 30],
}

// Uppercase ISO-2 codes for country-flag-icons
export const CODE2: Record<string, string> = {
  'Mexico':               'MX',
  'South Africa':         'ZA',
  'South Korea':          'KR',
  'Czechia':              'CZ',
  'Canada':               'CA',
  'Bosnia & Herzegovina': 'BA',
  'Qatar':                'QA',
  'Switzerland':          'CH',
  'Brazil':               'BR',
  'Morocco':              'MA',
  'Haiti':                'HT',
  'Scotland':             'GB-SCT',
  'United States':        'US',
  'Paraguay':             'PY',
  'Australia':            'AU',
  'Turkey':               'TR',
  'Germany':              'DE',
  'Curacao':              'CW',
  'Ivory Coast':          'CI',
  'Ecuador':              'EC',
  'Netherlands':          'NL',
  'Japan':                'JP',
  'Sweden':               'SE',
  'Tunisia':              'TN',
  'Belgium':              'BE',
  'Egypt':                'EG',
  'Iran':                 'IR',
  'New Zealand':          'NZ',
  'Spain':                'ES',
  'Cape Verde':           'CV',
  'Saudi Arabia':         'SA',
  'Uruguay':              'UY',
  'France':               'FR',
  'Senegal':              'SN',
  'Iraq':                 'IQ',
  'Norway':               'NO',
  'Argentina':            'AR',
  'Algeria':              'DZ',
  'Austria':              'AT',
  'Jordan':               'JO',
  'Portugal':             'PT',
  'DR Congo':             'CD',
  'Uzbekistan':           'UZ',
  'Colombia':             'CO',
  'England':              'GB-ENG',
  'Croatia':              'HR',
  'Ghana':                'GH',
  'Panama':               'PA',
}

// Round-robin match pairs within each group (indices into the 4-team array)
export const PAIRS: [number, number][] = [
  [0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2],
]

// R32 bracket — confirmed FIFA 2026 official matches (Match 73-88)
export const R32: [string, string][] = [
  ['2A', '2B'], // R32-0:  Jun 28 — South Africa vs Canada
  ['1E', 'T'],  // R32-1:  Jun 29 — Germany vs [3rd A/B/C/D/F]
  ['1F', '2C'], // R32-2:  Jun 29 — Netherlands vs Morocco
  ['1C', '2F'], // R32-3:  Jun 29 — Brazil vs Japan
  ['1I', 'T'],  // R32-4:  Jun 30 — France vs [3rd C/D/F/G/H]
  ['2E', '2I'], // R32-5:  Jun 30 — Ivory Coast vs Norway
  ['1A', 'T'],  // R32-6:  Jun 30 — Mexico vs [3rd C/E/F/H/I]
  ['1L', 'T'],  // R32-7:  Jul 1  — England vs [3rd H]
  ['1G', 'T'],  // R32-8:  Jul 1  — Egypt vs [3rd A/E/H/I/J]
  ['1D', 'T'],  // R32-9:  Jul 1  — United States vs [3rd B/E/F/I/J]
  ['1H', '2J'], // R32-10: Jul 2  — Spain vs Austria
  ['1B', 'T'],  // R32-11: Jul 2  — Switzerland vs [3rd E/F/G/I/J]
  ['2K', '2L'], // R32-12: Jul 2  — Portugal vs Ghana
  ['2D', '2G'], // R32-13: Jul 3  — Australia vs Iran
  ['1J', '2H'], // R32-14: Jul 3  — Argentina vs Uruguay
  ['1K', 'T'],  // R32-15: Jul 3  — Colombia vs [3rd L]
]

// Third-place wildcard slots [R32 slot index, allowed groups] — confirmed FIFA 2026 combination table
export const THIRD_SLOTS: [number, string[]][] = [
  [1,  ['A', 'B', 'C', 'D', 'F']],   // R32-1:  Germany vs [3rd A/B/C/D/F]
  [4,  ['C', 'D', 'F', 'G', 'H']],   // R32-4:  France vs [3rd C/D/F/G/H]
  [6,  ['C', 'E', 'F', 'H', 'I']],   // R32-6:  Mexico vs [3rd C/E/F/H/I]
  [7,  ['H']],                         // R32-7:  England vs [3rd H]
  [8,  ['A', 'E', 'H', 'I', 'J']],   // R32-8:  Egypt vs [3rd A/E/H/I/J]
  [9,  ['B', 'E', 'F', 'I', 'J']],   // R32-9:  United States vs [3rd B/E/F/I/J]
  [11, ['E', 'F', 'G', 'I', 'J']],   // R32-11: Switzerland vs [3rd E/F/G/I/J]
  [15, ['L']],                         // R32-15: Colombia vs [3rd L]
]

export interface MatchVenue {
  date: string
  stadium: string
  city: string
  country: string
}

export const VENUES: Record<string, MatchVenue> = {
  'R32-0':  { date: 'Jun 28', stadium: 'SoFi Stadium',              city: 'Los Angeles',       country: 'USA'    },
  'R32-1':  { date: 'Jun 29', stadium: 'Gillette Stadium',           city: 'Boston',            country: 'USA'    },
  'R32-2':  { date: 'Jun 29', stadium: 'Estadio BBVA',               city: 'Monterrey',         country: 'Mexico' },
  'R32-3':  { date: 'Jun 29', stadium: 'NRG Stadium',                city: 'Houston',           country: 'USA'    },
  'R32-4':  { date: 'Jun 30', stadium: 'MetLife Stadium',            city: 'East Rutherford',   country: 'USA'    },
  'R32-5':  { date: 'Jun 30', stadium: 'AT&T Stadium',               city: 'Arlington',         country: 'USA'    },
  'R32-6':  { date: 'Jun 30', stadium: 'Estadio Azteca',             city: 'Mexico City',       country: 'Mexico' },
  'R32-7':  { date: 'Jul 1',  stadium: 'Mercedes-Benz Stadium',      city: 'Atlanta',           country: 'USA'    },
  'R32-8':  { date: 'Jul 1',  stadium: 'Lumen Field',                city: 'Seattle',           country: 'USA'    },
  'R32-9':  { date: 'Jul 1',  stadium: "Levi's Stadium",             city: 'Santa Clara',       country: 'USA'    },
  'R32-10': { date: 'Jul 2',  stadium: 'SoFi Stadium',               city: 'Los Angeles',       country: 'USA'    },
  'R32-11': { date: 'Jul 2',  stadium: 'BC Place',                   city: 'Vancouver',         country: 'Canada' },
  'R32-12': { date: 'Jul 2',  stadium: 'BMO Field',                  city: 'Toronto',           country: 'Canada' },
  'R32-13': { date: 'Jul 3',  stadium: 'AT&T Stadium',               city: 'Arlington',         country: 'USA'    },
  'R32-14': { date: 'Jul 3',  stadium: 'Hard Rock Stadium',          city: 'Miami',             country: 'USA'    },
  'R32-15': { date: 'Jul 3',  stadium: 'Arrowhead Stadium',          city: 'Kansas City',       country: 'USA'    },
  'R16-0':  { date: 'Jul 4',  stadium: 'Lincoln Financial Field',    city: 'Philadelphia',      country: 'USA'    },
  'R16-1':  { date: 'Jul 4',  stadium: 'NRG Stadium',                city: 'Houston',           country: 'USA'    },
  'R16-2':  { date: 'Jul 5',  stadium: 'MetLife Stadium',            city: 'East Rutherford',   country: 'USA'    },
  'R16-3':  { date: 'Jul 6',  stadium: 'AT&T Stadium',               city: 'Dallas',            country: 'USA'    },
  'R16-4':  { date: 'Jul 6',  stadium: 'Lumen Field',                city: 'Seattle',           country: 'USA'    },
  'R16-5':  { date: 'Jul 5',  stadium: 'Estadio Azteca',             city: 'Mexico City',       country: 'Mexico' },
  'R16-6':  { date: 'Jul 7',  stadium: 'Mercedes-Benz Stadium',      city: 'Atlanta',           country: 'USA'    },
  'R16-7':  { date: 'Jul 7',  stadium: 'BC Place',                   city: 'Vancouver',         country: 'Canada' },
  'QF-0':   { date: 'Jul 9',  stadium: 'Gillette Stadium',           city: 'Boston',            country: 'USA'    },
  'QF-1':   { date: 'Jul 10', stadium: 'SoFi Stadium',               city: 'Los Angeles',       country: 'USA'    },
  'QF-2':   { date: 'Jul 11', stadium: 'Hard Rock Stadium',          city: 'Miami',             country: 'USA'    },
  'QF-3':   { date: 'Jul 11', stadium: 'Arrowhead Stadium',          city: 'Kansas City',       country: 'USA'    },
  'SF-0':   { date: 'Jul 14', stadium: 'AT&T Stadium',               city: 'Dallas',            country: 'USA'    },
  'SF-1':   { date: 'Jul 15', stadium: 'Mercedes-Benz Stadium',      city: 'Atlanta',           country: 'USA'    },
  'TP-0':   { date: 'Jul 18', stadium: 'Hard Rock Stadium',          city: 'Miami',             country: 'USA'    },
  'F-0':    { date: 'Jul 19', stadium: 'MetLife Stadium',            city: 'East Rutherford',   country: 'USA'    },
}

export const ROUND_N: Record<string, number> = {
  R32: 16, R16: 8, QF: 4, SF: 2, F: 1,
}

export const GKEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

// Actual team names for each R32 slot — bypasses group-stage prediction derivation
export const R32_ACTUAL_PAIRS: [string, string][] = [
  ['South Africa', 'Canada'],                   // R32-0:  Canada won 1-0
  ['Germany', 'Paraguay'],                      // R32-1:  Paraguay won 4-3 PKs
  ['Netherlands', 'Morocco'],                   // R32-2:  Morocco won 3-2 PKs
  ['Brazil', 'Japan'],                          // R32-3:  Brazil won
  ['France', 'Sweden'],                         // R32-4:  France won
  ['Ivory Coast', 'Norway'],                    // R32-5:  Norway won
  ['Mexico', 'Ecuador'],                        // R32-6:  Mexico won 2-0
  ['England', 'DR Congo'],                      // R32-7:  England won 2-1
  ['Belgium', 'Senegal'],                       // R32-8:  Belgium won 3-2 ET
  ['United States', 'Bosnia & Herzegovina'],    // R32-9:  USA won 2-0
  ['Spain', 'Austria'],                         // R32-10: Spain won
  ['Switzerland', 'Algeria'],                   // R32-11: Switzerland won 2-0
  ['Portugal', 'Croatia'],                      // R32-12: Portugal won 2-1
  ['Egypt', 'Australia'],                       // R32-13: Egypt won 4-2 PKs
  ['Argentina', 'Uruguay'],                     // R32-14: Argentina won
  ['Colombia', 'Ghana'],                        // R32-15: Colombia won 1-0
]

// Actual FIFA 2026 bracket: which two R32 slots feed each R16 slot
export const R16_PAIRS: [number, number][] = [
  [0, 2],   // R16-0: Canada vs Morocco → Morocco won
  [1, 4],   // R16-1: Paraguay vs France → France won
  [10, 12], // R16-2: Spain vs Portugal → Spain won
  [8, 9],   // R16-3: Belgium vs USA → Belgium won 4-1
  [3, 5],   // R16-4: Brazil vs Norway → Norway won
  [6, 7],   // R16-5: Mexico vs England → England won
  [13, 14], // R16-6: Egypt vs Argentina → Argentina won
  [11, 15], // R16-7: Switzerland vs Colombia → Switzerland won
]

// All locked results through the semifinals
export const OFFICIAL_RESULTS: Record<string, string> = {
  'R32-0': 'Canada',
  'R32-1': 'Paraguay',
  'R32-2': 'Morocco',
  'R32-3': 'Brazil',
  'R32-4': 'France',
  'R32-5': 'Norway',
  'R32-6': 'Mexico',
  'R32-7': 'England',
  'R32-8': 'Belgium',      // Belgium beat Senegal 3-2 ET
  'R32-9': 'United States',
  'R32-10': 'Spain',
  'R32-11': 'Switzerland',
  'R32-12': 'Portugal',
  'R32-13': 'Egypt',        // Egypt beat Australia 4-2 PKs
  'R32-14': 'Argentina',
  'R32-15': 'Colombia',
  'R16-0': 'Morocco',
  'R16-1': 'France',
  'R16-2': 'Spain',
  'R16-3': 'Belgium',
  'R16-4': 'Norway',        // Norway beat Brazil
  'R16-5': 'England',       // England beat Mexico
  'R16-6': 'Argentina',
  'R16-7': 'Switzerland',
  'QF-0': 'France',
  'QF-1': 'Spain',
  'QF-2': 'England',
  'QF-3': 'Argentina',
  'SF-0': 'Spain',
  'SF-1': 'Argentina',
}
