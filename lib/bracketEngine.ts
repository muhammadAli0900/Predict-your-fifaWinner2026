import { GROUPS, TEAM, PAIRS, R32, THIRD_SLOTS, GKEYS } from './data'
import type { AppState, GroupStat } from './types'

type StateSlice = Pick<AppState, 'approach' | 'matchPicks' | 'ranks' | 'thirds'>

export function rank(name: string): number {
  return TEAM[name]?.[2] ?? 999
}

export function better(a: string, b: string): string {
  return rank(a) <= rank(b) ? a : b
}

export function groupStandings(
  g: string,
  state: Pick<AppState, 'approach' | 'matchPicks' | 'ranks'>,
  officialResults: Record<string, string> = {}
): { order: string[]; complete: boolean; pts: Record<string, number> } {
  const teams = GROUPS[g]

  if (state.approach === 'match') {
    const pts: Record<string, number> = {}
    teams.forEach(t => (pts[t] = 0))
    let done = 0
    PAIRS.forEach((p, i) => {
      const w = officialResults[`${g}-${i}`] ?? state.matchPicks[`${g}-${i}`]
      if (w === 'DRAW') {
        pts[teams[p[0]]] += 1
        pts[teams[p[1]]] += 1
        done++
      } else if (w) {
        pts[w] = (pts[w] || 0) + 3
        done++
      }
    })
    const order = [...teams].sort((a, b) => (pts[b] - pts[a]) || rank(a) - rank(b))
    return { order, complete: done === 6, pts }
  }

  // standings mode
  const r = state.ranks[g] || []
  const rest = teams.filter(t => !r.includes(t))
  return { order: [...r, ...rest], complete: r.length >= 3, pts: {} }
}

export function allComplete(
  state: Pick<AppState, 'approach' | 'matchPicks' | 'ranks'>,
  officialResults: Record<string, string> = {}
): boolean {
  return GKEYS.every(g => groupStandings(g, state, officialResults).complete)
}

export function results(
  state: Pick<AppState, 'approach' | 'matchPicks' | 'ranks'>,
  officialResults: Record<string, string> = {}
): Record<string, string[]> {
  const o: Record<string, string[]> = {}
  GKEYS.forEach(g => (o[g] = groupStandings(g, state, officialResults).order))
  return o
}

export function thirdsList(
  state: Pick<AppState, 'approach' | 'matchPicks' | 'ranks'>,
  officialResults: Record<string, string> = {}
): Array<{ group: string; team: string }> {
  const res = results(state, officialResults)
  return GKEYS.map(g => ({ group: g, team: res[g][2] }))
}

// FIFA third-place conduct score: lower = better discipline
function conductPenalty(stat: GroupStat): number {
  // yellow=-1, second-yellow red=-3, direct red=-4, yellow+direct red=-5
  // We can't distinguish red types from a simple count, so use -3 per red as an average
  return stat.yellow_cards + stat.red_cards * 3
}

export function suggested(
  state: Pick<AppState, 'approach' | 'matchPicks' | 'ranks'>,
  officialResults: Record<string, string> = {},
  groupStats: Record<string, GroupStat> = {}
): string[] {
  return GKEYS
    .map(g => {
      const st = groupStandings(g, state, officialResults)
      const team = st.order[2]
      const stat = groupStats[team]
      return {
        team,
        // Use real API stats when available, fall back to predicted points
        pts:     stat ? stat.points    : (team ? (st.pts[team] ?? 0) : -1),
        gd:      stat ? stat.goal_diff : 0,
        gf:      stat ? stat.goals_for : 0,
        conduct: stat ? conductPenalty(stat) : 0,
        rank:    rank(team),
      }
    })
    .sort((a, b) =>
      (b.pts - a.pts) ||
      (b.gd - a.gd) ||
      (b.gf - a.gf) ||
      (a.conduct - b.conduct) ||   // lower penalty = better = sorted first
      (a.rank - b.rank)
    )
    .slice(0, 8)
    .map(x => x.team)
}

export function assignThirds(state: StateSlice, officialResults: Record<string, string> = {}): Record<number, string | null> {
  const res = results(state, officialResults)

  // Merge user-selected with auto-suggested to always aim for 8
  const userSel = state.thirds && state.thirds.length > 0 ? state.thirds : []
  const auto = suggested(state, officialResults)
  const merged = [...userSel, ...auto].filter((t, i, arr) => arr.indexOf(t) === i).slice(0, 8)
  const sel = merged.length > 0 ? merged : auto

  const items = sel.map(t => ({
    team: t,
    group: GKEYS.find(g => res[g][2] === t) || '',
  }))
  // Use allow lists: third-place team must be from one of the allowed groups for that slot
  const slots = THIRD_SLOTS.map(s => ({ idx: s[0], allow: s[1], team: null as string | null }))
  const used = new Array(items.length).fill(false)

  const bt = (si: number): boolean => {
    if (si === slots.length) return true
    for (let k = 0; k < items.length; k++) {
      if (used[k]) continue
      if (!slots[si].allow.includes(items[k].group)) continue
      used[k] = true
      slots[si].team = items[k].team
      if (bt(si + 1)) return true
      used[k] = false
      slots[si].team = null
    }
    return false
  }

  if (!bt(0)) {
    // Fallback: assign in order, ignoring allow constraints
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

export function r32Teams(state: StateSlice, officialResults: Record<string, string> = {}): [string | null, string | null][] {
  const res = results(state, officialResults)
  const tm = assignThirds(state, officialResults)
  return R32.map((mt, i) =>
    mt.map(spec => {
      if (spec === 'T') return tm[i] ?? null
      const pos = spec[0] === '1' ? 0 : 1
      return res[spec[1]]?.[pos] ?? null
    }) as [string | null, string | null]
  )
}

export function teamsOf(
  id: string,
  bracket: Record<string, string>,
  state: StateSlice,
  officialResults: Record<string, string> = {}
): [string | null, string | null] {
  if (id.startsWith('R32-')) return r32Teams(state, officialResults)[+id.slice(4)]

  if (id.startsWith('TP-')) {
    const lose = (k: number): string | null => {
      const t = teamsOf(`SF-${k}`, bracket, state, officialResults)
      const w = bracket[`SF-${k}`]
      if (!w || !t[0] || !t[1]) return null
      return t.find(x => x && x !== w) ?? null
    }
    return [lose(0), lose(1)]
  }

  let fp: [string, string]
  if (id.startsWith('R16-')) {
    const k = +id.slice(4)
    fp = [`R32-${2 * k}`, `R32-${2 * k + 1}`]
  } else if (id.startsWith('QF-')) {
    const k = +id.slice(3)
    fp = [`R16-${2 * k}`, `R16-${2 * k + 1}`]
  } else if (id.startsWith('SF-')) {
    const k = +id.slice(3)
    fp = [`QF-${2 * k}`, `QF-${2 * k + 1}`]
  } else {
    fp = ['SF-0', 'SF-1']
  }
  return [bracket[fp[0]] ?? null, bracket[fp[1]] ?? null]
}

// Cleans user bracket picks that are now invalid due to changed upstream selections.
// officialPicks are never removed.
export function cleanUserPicks(
  userBracket: Record<string, string>,
  officialPicks: Record<string, string>,
  state: StateSlice,
  officialResults: Record<string, string> = {}
): Record<string, string> {
  const effectiveBracket = { ...userBracket, ...officialPicks }
  const cleaned = { ...userBracket }

  for (let p = 0; p < 6; p++) {
    Object.keys(cleaned).forEach(k => {
      if (officialPicks[k]) return
      const t = teamsOf(k, effectiveBracket, state, officialResults)
      if (!t || !t.includes(cleaned[k])) delete cleaned[k]
    })
  }
  return cleaned
}

// Legacy clean used when official results are already merged into bracket
export function clean(
  bracket: Record<string, string>,
  state: StateSlice,
  officialResults: Record<string, string> = {}
): Record<string, string> {
  const b = { ...bracket }
  for (let p = 0; p < 6; p++) {
    Object.keys(b).forEach(k => {
      const t = teamsOf(k, b, state, officialResults)
      if (!t || !t.includes(b[k])) delete b[k]
    })
  }
  return b
}

export function champion(bracket: Record<string, string>): string | null {
  return bracket['F-0'] ?? null
}

export function finalist(bracket: Record<string, string>): string | null {
  const c = champion(bracket)
  if (!c) return null
  // we need teams of F-0 — caller must pass effective bracket
  return null
}

export function finalistFrom(
  bracket: Record<string, string>,
  state: StateSlice,
  officialResults: Record<string, string> = {}
): string | null {
  const c = bracket['F-0']
  if (!c) return null
  const t = teamsOf('F-0', bracket, state, officialResults)
  return t.find(x => x && x !== c) ?? null
}

export function bronze(bracket: Record<string, string>): string | null {
  return bracket['TP-0'] ?? null
}
