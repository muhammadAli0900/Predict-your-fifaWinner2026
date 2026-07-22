// Supabase Edge Function — sync FIFA World Cup 2026 results automatically
// Runs every 5 minutes via cron (configured in supabase/config.toml)
// Fetches finished matches from football-data.org → upserts into official_results

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Game data (mirrors lib/data.ts) ──────────────────────────────────────────

const GROUPS: Record<string, string[]> = {
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

const FIFA_RANK: Record<string, number> = {
  Spain: 1, Argentina: 2, France: 3, England: 4, Brazil: 5,
  Portugal: 6, Netherlands: 7, Belgium: 8, Germany: 9, Croatia: 10,
  Morocco: 11, Colombia: 13, 'United States': 14, Mexico: 15, Uruguay: 16,
  Switzerland: 17, Japan: 18, Senegal: 19, Iran: 20, Austria: 22,
  'South Korea': 23, Ecuador: 24, Turkey: 25, Australia: 26, Canada: 27,
  Norway: 29, Panama: 30, Egypt: 34, Algeria: 35, Scotland: 36,
  Qatar: 37, Paraguay: 39, Tunisia: 40, 'Ivory Coast': 41, Czechia: 42,
  Sweden: 44, 'DR Congo': 53, 'South Africa': 56, Uzbekistan: 57, Iraq: 58,
  'Saudi Arabia': 60, Jordan: 66, 'Cape Verde': 68, 'Bosnia & Herzegovina': 70,
  Ghana: 72, Curacao: 82, Haiti: 84, 'New Zealand': 89,
}

const PAIRS: [number, number][] = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]]

// R32 bracket skeleton — must stay in sync with the app
const R32: [string, string][] = [
  ['1H','T'],['2C','2F'],['1A','T'],['1B','2E'],
  ['1I','T'],['2G','2K'],['1C','T'],['1D','2A'],
  ['1L','T'],['2B','2D'],['1E','T'],['1F','2J'],
  ['1J','T'],['2H','2L'],['1K','T'],['1G','2I'],
]

const THIRD_SLOTS: [number, string[]][] = [
  [0,['H','C','F']], [2,['A','B','E']], [4,['I','G','K']], [6,['C','D','A']],
  [8,['L','B','D']], [10,['E','F','J']], [12,['J','H','L']], [14,['K','G','I']],
]

const GKEYS = ['A','B','C','D','E','F','G','H','I','J','K','L']
const ROUND_N: Record<string, number> = { R32:16, R16:8, QF:4, SF:2, F:1 }

// ── Team name normalisation ───────────────────────────────────────────────────
// football-data.org name → our internal name

const API_TO_OUR: Record<string, string> = {
  // South Korea
  'Korea Republic': 'South Korea',
  'Republic of Korea': 'South Korea',
  // Ivory Coast
  "Côte d'Ivoire": 'Ivory Coast',
  "Cote d'Ivoire": 'Ivory Coast',
  "Côte D'Ivoire": 'Ivory Coast',
  // Bosnia
  'Bosnia and Herzegovina': 'Bosnia & Herzegovina',
  'Bosnia-Herzegovina': 'Bosnia & Herzegovina',
  // DR Congo
  'Congo DR': 'DR Congo',
  'Congo, DR': 'DR Congo',
  'Democratic Republic of Congo': 'DR Congo',
  'DR Congo': 'DR Congo',
  // Curacao
  'Curaçao': 'Curacao',
  // Cape Verde
  'Cabo Verde': 'Cape Verde',
  // Czechia
  'Czech Republic': 'Czechia',
  // Turkey
  'Türkiye': 'Turkey',
  // Iran
  'IR Iran': 'Iran',
  'Islamic Republic of Iran': 'Iran',
  // USA
  'USA': 'United States',
  'United States of America': 'United States',
  // Saudi Arabia — matches directly but just in case
  'KSA': 'Saudi Arabia',
  // Scotland/England handled by exact match
}

// Build a reverse-lookup set of all our team names for fast validation
const ALL_OUR_TEAMS = new Set(Object.values(GROUPS).flat())

function normalise(apiName: string): string {
  if (!apiName) return ''
  // Exact match in our API_TO_OUR map
  if (API_TO_OUR[apiName]) return API_TO_OUR[apiName]
  // Direct match against our names (e.g. "Mexico", "France")
  if (ALL_OUR_TEAMS.has(apiName)) return apiName
  // Case-insensitive fallback scan
  const lower = apiName.toLowerCase()
  for (const ourName of ALL_OUR_TEAMS) {
    if (ourName.toLowerCase() === lower) return ourName
  }
  return apiName // give up — will be filtered below
}

// ── Bracket engine (pure subset) ─────────────────────────────────────────────

function rankOf(name: string): number {
  return FIFA_RANK[name] ?? 999
}

function computeGroupStandings(
  g: string,
  officialResults: Record<string, string>
): string[] {
  const teams = GROUPS[g]
  const wins: Record<string, number> = {}
  teams.forEach(t => (wins[t] = 0))
  PAIRS.forEach((_p, i) => {
    const w = officialResults[`${g}-${i}`]
    if (w && w !== 'DRAW') wins[w] = (wins[w] ?? 0) + 1
  })
  return [...teams].sort((a, b) => (wins[b] - wins[a]) || rankOf(a) - rankOf(b))
}

function assignThirds(
  standings: Record<string, string[]>,
  thirdsPool: string[]
): Record<number, string | null> {
  const items = thirdsPool.map(t => ({
    team: t,
    group: GKEYS.find(g => standings[g][2] === t) ?? '',
  }))
  const slots = THIRD_SLOTS.map(s => ({ idx: s[0], avoid: s[1], team: null as string | null }))
  const used = new Array(items.length).fill(false)

  const bt = (si: number): boolean => {
    if (si === slots.length) return true
    for (let k = 0; k < items.length; k++) {
      if (used[k]) continue
      if (slots[si].avoid.includes(items[k].group)) continue
      used[k] = true
      slots[si].team = items[k].team
      if (bt(si + 1)) return true
      used[k] = false
      slots[si].team = null
    }
    return false
  }

  if (!bt(0)) {
    let k = 0
    slots.forEach(s => {
      while (k < items.length && used[k]) k++
      s.team = items[k]?.team ?? null
      if (items[k]) used[k] = true
    })
  }

  const m: Record<number, string | null> = {}
  slots.forEach(s => (m[s.idx] = s.team))
  return m
}

function buildR32Participants(
  standings: Record<string, string[]>,
  thirdsAssignment: Record<number, string | null>
): [string | null, string | null][] {
  return R32.map((mt, i) =>
    mt.map(spec => {
      if (spec === 'T') return thirdsAssignment[i] ?? null
      const pos = spec[0] === '1' ? 0 : 1
      return standings[spec[1]]?.[pos] ?? null
    }) as [string | null, string | null]
  )
}

function teamsOf(
  id: string,
  officialResults: Record<string, string>,
  r32Participants: [string | null, string | null][]
): [string | null, string | null] {
  if (id.startsWith('R32-')) return r32Participants[+id.slice(4)] ?? [null, null]

  if (id.startsWith('TP-')) {
    const lose = (k: number): string | null => {
      const t = teamsOf(`SF-${k}`, officialResults, r32Participants)
      const w = officialResults[`SF-${k}`]
      if (!w || !t[0] || !t[1]) return null
      return t.find(x => x && x !== w) ?? null
    }
    return [lose(0), lose(1)]
  }

  let fp: [string, string]
  if (id.startsWith('R16-'))     { const k = +id.slice(4); fp = [`R32-${2*k}`, `R32-${2*k+1}`] }
  else if (id.startsWith('QF-')) { const k = +id.slice(3); fp = [`R16-${2*k}`, `R16-${2*k+1}`] }
  else if (id.startsWith('SF-')) { const k = +id.slice(3); fp = [`QF-${2*k}`,  `QF-${2*k+1}`]  }
  else                            fp = ['SF-0', 'SF-1']
  return [officialResults[fp[0]] ?? null, officialResults[fp[1]] ?? null]
}

// ── football-data.org stage → our round key ───────────────────────────────────

function stageToRound(stage: string): 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | 'TP' | 'F' | null {
  switch (stage) {
    case 'GROUP_STAGE':   return 'GROUP'
    case 'LAST_32':       return 'R32'
    case 'LAST_16':       return 'R16'
    case 'QUARTER_FINALS':return 'QF'
    case 'SEMI_FINALS':   return 'SF'
    case 'THIRD_PLACE':   return 'TP'
    case 'FINAL':         return 'F'
    default:              return null
  }
}

// ── Group letter from API group string ────────────────────────────────────────

function groupLetter(apiGroup: string): string | null {
  // "GROUP_A" → "A"
  const m = apiGroup?.match(/GROUP_([A-L])/)
  return m ? m[1] : null
}

// ── Find pair index for two teams inside a group ──────────────────────────────

function findPairIndex(groupTeams: string[], t1: string, t2: string): number {
  const i1 = groupTeams.indexOf(t1)
  const i2 = groupTeams.indexOf(t2)
  if (i1 < 0 || i2 < 0) return -1
  return PAIRS.findIndex(([a, b]) => (a === i1 && b === i2) || (a === i2 && b === i1))
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (_req: Request) => {
  const logs: string[] = []
  const log = (msg: string) => { console.log(msg); logs.push(msg) }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )
    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY')!

    // 1. Fetch all finished WC 2026 matches ───────────────────────────────────
    const apiResp = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED&season=2026',
      { headers: { 'X-Auth-Token': apiKey } }
    )
    if (!apiResp.ok) {
      const txt = await apiResp.text()
      return json({ error: `football-data.org ${apiResp.status}: ${txt}` }, 502)
    }
    const apiData = await apiResp.json()
    const matches: Record<string, unknown>[] = apiData.matches ?? []
    log(`Fetched ${matches.length} finished matches from football-data.org`)

    // 2. Fetch current official_results from Supabase ─────────────────────────
    const { data: existing, error: fetchErr } = await supabase
      .from('official_results')
      .select('match_id, winner')
    if (fetchErr) throw fetchErr

    const officialResults: Record<string, string> = {}
    ;(existing ?? []).forEach((r: { match_id: string; winner: string }) => {
      officialResults[r.match_id] = r.winner
    })
    log(`Loaded ${Object.keys(officialResults).length} existing official results`)

    // 3. Compute bracket state from existing results ───────────────────────────
    const standings: Record<string, string[]> = {}
    GKEYS.forEach(g => (standings[g] = computeGroupStandings(g, officialResults)))

    const thirdsPool = GKEYS
      .map(g => standings[g][2])
      .filter(Boolean)
      .sort((a, b) => rankOf(a) - rankOf(b))
      .slice(0, 8)

    const thirdsAssignment =
      thirdsPool.length === 8 ? assignThirds(standings, thirdsPool) : ({} as Record<number, string | null>)

    const r32Participants = buildR32Participants(standings, thirdsAssignment)

    // 4. Map each finished match to a match_id ────────────────────────────────
    const upserts: { match_id: string; winner: string; match_label: string }[] = []
    let skipped = 0

    for (const match of matches) {
      const score = match.score as Record<string, unknown> | null
      const winnerSide = score?.winner as string | null

      const homeRaw  = (match.homeTeam as Record<string, string>)?.name ?? ''
      const awayRaw  = (match.awayTeam as Record<string, string>)?.name ?? ''
      const homeTeam = normalise(homeRaw)
      const awayTeam = normalise(awayRaw)

      if (!ALL_OUR_TEAMS.has(homeTeam) || !ALL_OUR_TEAMS.has(awayTeam)) {
        log(`  ⚠ Unknown team: "${homeRaw}" or "${awayRaw}" — skipping`)
        skipped++
        continue
      }

      const stage = match.stage as string
      const round = stageToRound(stage)
      if (!round) {
        log(`  ⚠ Unknown stage "${stage}" — skipping`)
        skipped++
        continue
      }

      // Draws are valid in the group stage (written as winner='DRAW' to lock the match).
      // Knockout draws don't occur in final results — the API reports a winner after penalties.
      if (!winnerSide || (winnerSide === 'DRAW' && round !== 'GROUP')) { skipped++; continue }

      const winner = winnerSide === 'DRAW' ? 'DRAW'
        : winnerSide === 'HOME_TEAM' ? homeTeam
        : awayTeam

      let matchId: string | null = null
      let matchLabel = ''

      // ── GROUP STAGE ─────────────────────────────────────────────────────────
      if (round === 'GROUP') {
        const apiGroup = match.group as string
        const letter = groupLetter(apiGroup)
        if (!letter) {
          log(`  ⚠ Cannot parse group "${apiGroup}" — skipping`)
          skipped++
          continue
        }
        const pi = findPairIndex(GROUPS[letter], homeTeam, awayTeam)
        if (pi < 0) {
          log(`  ⚠ Pair not found in Group ${letter}: ${homeTeam} vs ${awayTeam}`)
          skipped++
          continue
        }
        matchId = `${letter}-${pi}`
        matchLabel = `Group ${letter} MD${match.matchday ?? '?'} — ${homeTeam} v ${awayTeam}`

      // ── THIRD-PLACE PLAYOFF ──────────────────────────────────────────────────
      } else if (round === 'TP') {
        matchId = 'TP-0'
        matchLabel = `3rd-place playoff — ${homeTeam} v ${awayTeam}`

      // ── FINAL ───────────────────────────────────────────────────────────────
      } else if (round === 'F') {
        matchId = 'F-0'
        matchLabel = `Final — ${homeTeam} v ${awayTeam}`

      // ── KNOCKOUT ROUNDS (R32, R16, QF, SF) ──────────────────────────────────
      } else {
        const n = ROUND_N[round]

        // Try to find an exact slot where both teams match
        for (let k = 0; k < n; k++) {
          const id = `${round}-${k}`
          const [t0, t1] = teamsOf(id, officialResults, r32Participants)
          const s = new Set([t0, t1])
          if (s.has(homeTeam) && s.has(awayTeam)) {
            matchId = id
            matchLabel = `${round} match ${k + 1} — ${homeTeam} v ${awayTeam}`
            break
          }
        }

        // Fallback: match by a single team (handles wildcard T slots where we
        // could not pre-compute the third-place team correctly)
        if (!matchId) {
          for (let k = 0; k < n; k++) {
            const id = `${round}-${k}`
            const [t0, t1] = teamsOf(id, officialResults, r32Participants)
            if (t0 === homeTeam || t0 === awayTeam ||
                t1 === homeTeam || t1 === awayTeam) {
              matchId = id
              matchLabel = `${round} match ${k + 1} (fallback) — ${homeTeam} v ${awayTeam}`
              log(`  ℹ Used single-team fallback for ${id}`)
              break
            }
          }
        }

        if (!matchId) {
          log(`  ⚠ Could not map ${round} match: ${homeTeam} vs ${awayTeam}`)
          skipped++
          continue
        }
      }

      upserts.push({ match_id: matchId, winner, match_label: matchLabel })
      log(`  ✓ ${matchId} → ${winner}`)
    }

    // 5. Upsert into Supabase ─────────────────────────────────────────────────
    if (upserts.length > 0) {
      const { error: upsertErr } = await supabase
        .from('official_results')
        .upsert(
          upserts.map(u => ({ ...u, updated_at: new Date().toISOString() })),
          { onConflict: 'match_id' }
        )
      if (upsertErr) throw upsertErr
    }

    const summary = {
      ok: true,
      total_from_api: matches.length,
      mapped: upserts.length,
      skipped,
      results: upserts.map(u => `${u.match_id}=${u.winner}`),
    }
    log(`Done: ${upserts.length} upserted, ${skipped} skipped`)
    return json(summary)

  } catch (err) {
    console.error(err)
    return json({ ok: false, error: String(err) }, 500)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
