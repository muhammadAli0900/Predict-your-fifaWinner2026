'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import type { AppState, Screen, GroupStat } from '@/lib/types'
import { GKEYS, GROUPS, PAIRS, ROUND_N } from '@/lib/data'
import {
  groupStandings,
  allComplete,
  results,
  thirdsList,
  suggested,
  teamsOf,
  cleanUserPicks,
  better,
  rank,
} from '@/lib/bracketEngine'
import { supabase } from '@/lib/supabase'
import TopNav from '@/components/TopNav'
import WelcomeScreen from '@/components/WelcomeScreen'
import GroupStageScreen from '@/components/GroupStageScreen'
import ThirdsScreen from '@/components/ThirdsScreen'
import BracketScreen from '@/components/BracketScreen'
import ResultsScreen from '@/components/ResultsScreen'

const INITIAL: AppState = {
  screen: 'welcome',
  approach: null,
  name: '',
  nameInput: '',
  matchPicks: {},
  ranks: {},
  thirds: [],
  thirdsTouched: false,
  bracket: {},
  shared: false,
  copied: false,
  savedPredictionId: null,
}

export default function Home() {
  const [state, setStateRaw] = useState<AppState>(INITIAL)
  const [officialResults, setOfficialResults] = useState<Record<string, string>>({})
  const [groupStats, setGroupStats] = useState<Record<string, GroupStat>>({})
  const [predictionSaved, setPredictionSaved] = useState(false)

  // Official bracket results (bracket match IDs only)
  const officialBracketResults = useMemo(() => {
    const out: Record<string, string> = {}
    Object.entries(officialResults).forEach(([id, winner]) => {
      if (!id.match(/^[A-L]-\d+$/)) out[id] = winner
    })
    return out
  }, [officialResults])

  // Effective bracket = user picks + official results (official wins)
  const effectiveBracket = useMemo(
    () => ({ ...state.bracket, ...officialBracketResults }),
    [state.bracket, officialBracketResults]
  )

  // ── Persistence helpers ────────────────────────────────────────────────────

  const persist = useCallback((s: AppState) => {
    if (s.shared) return
    try {
      const k = {
        screen: s.screen,
        approach: s.approach,
        name: s.name,
        matchPicks: s.matchPicks,
        ranks: s.ranks,
        thirds: s.thirds,
        thirdsTouched: s.thirdsTouched,
        bracket: s.bracket,
      }
      localStorage.setItem('predict26', JSON.stringify(k))
    } catch {}
  }, [])

  const set = useCallback(
    (extra: Partial<AppState>) => {
      setStateRaw(prev => {
        const next = { ...prev, ...extra }
        persist(next)
        return next
      })
    },
    [persist]
  )

  // ── Startup: load from hash or localStorage ───────────────────────────────

  useEffect(() => {
    try {
      const h = window.location.hash || ''
      if (h.includes('s=')) {
        const enc = decodeURIComponent(h.split('s=')[1])
        const o = JSON.parse(decodeURIComponent(escape(atob(enc))))
        setStateRaw(prev => ({ ...prev, ...o, shared: true, screen: 'results' }))
        return
      }
      const raw = localStorage.getItem('predict26')
      if (raw) {
        const saved = JSON.parse(raw)
        setStateRaw(prev => ({ ...prev, ...saved }))
      }
    } catch {}
  }, [])

  // ── Official results: fetch + realtime ────────────────────────────────────

  useEffect(() => {
    async function fetchOfficialResults() {
      const { data } = await supabase
        .from('official_results')
        .select('match_id, winner')
      if (data) {
        const map: Record<string, string> = {}
        data.forEach((r: { match_id: string; winner: string }) => {
          map[r.match_id] = r.winner
        })
        setOfficialResults(map)
      }
    }

    async function fetchGroupStats() {
      const { data } = await supabase
        .from('group_stats')
        .select('*')
      if (data) {
        const map: Record<string, GroupStat> = {}
        data.forEach((s: GroupStat) => { map[s.team] = s })
        setGroupStats(map)
      }
    }

    fetchOfficialResults()
    fetchGroupStats()

    const channel = supabase
      .channel('official_results_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'official_results' },
        (payload) => {
          const row = payload.new as { match_id: string; winner: string } | null
          if (row) {
            setOfficialResults(prev => ({ ...prev, [row.match_id]: row.winner }))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Save prediction when reaching results screen ──────────────────────────

  useEffect(() => {
    const champ = effectiveBracket['F-0']
    if (state.screen === 'results' && !state.shared && !predictionSaved && champ) {
      savePrediction(state, effectiveBracket, champ)
      setPredictionSaved(true)
    }
  }, [state.screen, state.shared, predictionSaved, effectiveBracket])

  async function savePrediction(
    s: AppState,
    eb: Record<string, string>,
    champ: string
  ) {
    try {
      const res = results(s, officialResults)
      const groupWinners: Record<string, string> = {}
      const groupTop3: Record<string, string[]> = {}
      GKEYS.forEach(g => {
        groupWinners[g] = res[g][0]
        groupTop3[g] = res[g].slice(0, 3)
      })
      const fin = (() => {
        const t = teamsOf('F-0', eb, s, officialResults)
        return t.find(x => x && x !== champ) ?? null
      })()

      const { data } = await supabase
        .from('predictions')
        .insert({
          user_name: s.name || 'Friend',
          approach: s.approach,
          champion: champ,
          finalist: fin,
          bronze: eb['TP-0'] ?? null,
          group_winners: groupWinners,
          group_top3: groupTop3,
          bracket: eb,
          match_picks: s.matchPicks,
          ranks: s.ranks,
          thirds: s.thirds,
        })
        .select('id')
        .single()

      if (data) set({ savedPredictionId: data.id })
    } catch {}
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const isDone = allComplete(state, officialResults)
  const hasChamp = !!effectiveBracket['F-0']

  const accMap: Record<Screen, boolean> = {
    welcome: true,
    groups: !!state.approach,
    thirds: !!state.approach,
    bracket: !!state.approach,
    results: hasChamp,
  }

  const stepsDef: [string, Screen][] = [
    ['Home', 'welcome'],
    ['Group Stage', 'groups'],
    ['Wildcards', 'thirds'],
    ['Bracket', 'bracket'],
    ['Results', 'results'],
  ]

  const steps = stepsDef.map(([label, key], i) => ({
    n: i + 1,
    label,
    key,
    active: state.screen === key,
    accessible: accMap[key],
    onClick: accMap[key] ? () => goTo(key) : () => {},
  }))

  // ── Navigation ────────────────────────────────────────────────────────────

  function goTo(screen: Screen) {
    if (screen === 'thirds') {
      const th =
        state.thirdsTouched && state.thirds.length ? state.thirds : suggested(state, officialResults, groupStats)
      set({ screen, thirds: th, thirdsTouched: state.thirdsTouched })
      return
    }
    if (screen === 'bracket') {
      const cleaned = cleanUserPicks(state.bracket, officialBracketResults, state, officialResults)
      set({ screen, bracket: cleaned })
      return
    }
    set({ screen })
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  function choose(approach: 'match' | 'standings') {
    const nm = (state.nameInput || '').trim() || 'Friend'
    set({ approach, name: nm, screen: 'groups' })
  }

  function pickMatch(g: string, i: number, team: string) {
    if (officialResults[`${g}-${i}`]) return // locked by official result
    set({ matchPicks: { ...state.matchPicks, [`${g}-${i}`]: team } })
  }

  function toggleRank(g: string, t: string) {
    const cur = [...(state.ranks[g] || [])]
    const idx = cur.indexOf(t)
    if (idx >= 0) cur.splice(idx, 1)
    else if (cur.length < 4) cur.push(t)
    set({ ranks: { ...state.ranks, [g]: cur } })
  }

  function fillGroup(g: string) {
    if (state.approach === 'match') {
      const mp = { ...state.matchPicks }
      PAIRS.forEach((p, i) => {
        const id = `${g}-${i}`
        if (!officialResults[id]) {
          mp[id] = better(GROUPS[g][p[0]], GROUPS[g][p[1]])
        }
      })
      set({ matchPicks: mp })
    } else {
      const ts = [...GROUPS[g]].sort((a, b) => rank(a) - rank(b))
      set({ ranks: { ...state.ranks, [g]: ts } })
    }
  }

  function fillAll() {
    if (state.approach === 'match') {
      const mp: Record<string, string> = {}
      GKEYS.forEach(g =>
        PAIRS.forEach((p, i) => {
          const id = `${g}-${i}`
          const off = officialResults[id]
          mp[id] = (off && off !== 'DRAW') ? off : better(GROUPS[g][p[0]], GROUPS[g][p[1]])
        })
      )
      set({ matchPicks: mp })
    } else {
      const r: Record<string, string[]> = {}
      GKEYS.forEach(g => (r[g] = [...GROUPS[g]].sort((a, b) => rank(a) - rank(b))))
      set({ ranks: r })
    }
  }

  function toggleThird(t: string) {
    let a = [...state.thirds]
    const i = a.indexOf(t)
    if (i >= 0) a.splice(i, 1)
    else {
      if (a.length >= 8) return
      a.push(t)
    }
    set({ thirds: a, thirdsTouched: true })
  }

  function autoThirds() {
    set({ thirds: suggested(state, officialResults, groupStats), thirdsTouched: true })
  }

  function pickBracket(id: string, team: string) {
    if (!team) return
    let b = { ...state.bracket, [id]: team }
    b = cleanUserPicks(b, officialBracketResults, state, officialResults)
    set({ bracket: b })
  }

  function simulate() {
    let b = { ...state.bracket }
    const order: string[] = []
    ;['R32', 'R16', 'QF', 'SF', 'F'].forEach(key => {
      for (let k = 0; k < ROUND_N[key]; k++) order.push(`${key}-${k}`)
    })
    order.forEach(id => {
      if (effectiveBracket[id]) return // already decided (user or official)
      const t = teamsOf(id, { ...b, ...officialBracketResults }, state, officialResults)
      if (t[0] && t[1] && !b[id]) b[id] = better(t[0], t[1])
    })
    const tt = teamsOf('TP-0', { ...b, ...officialBracketResults }, state, officialResults)
    if (tt[0] && tt[1] && !b['TP-0']) b['TP-0'] = better(tt[0], tt[1])
    set({ bracket: b })
  }

  function share() {
    const s = state
    const k = {
      approach: s.approach,
      name: s.name,
      matchPicks: s.matchPicks,
      ranks: s.ranks,
      thirds: s.thirds,
      bracket: s.bracket,
    }
    try {
      const enc = btoa(unescape(encodeURIComponent(JSON.stringify(k))))
      const url = `${window.location.origin}${window.location.pathname}#s=${enc}`
      navigator.clipboard?.writeText(url).catch(() => {})
    } catch {}
    set({ copied: true })
    setTimeout(() => set({ copied: false }), 2200)
  }

  function restart() {
    try { localStorage.removeItem('predict26') } catch {}
    try { history.replaceState(null, '', window.location.pathname) } catch {}
    setStateRaw(INITIAL)
    setPredictionSaved(false)
  }

  // ── Thirds pool (derived) ──────────────────────────────────────────────────

  const thirdsPool = useMemo(() => thirdsList(state, officialResults), [state, officialResults])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#efe8d9' }}>
      <TopNav
        screen={state.screen}
        name={state.name}
        steps={steps}
        onRestart={restart}
      />

      {state.screen === 'welcome' && (
        <WelcomeScreen
          nameInput={state.nameInput}
          onNameChange={val => set({ nameInput: val })}
          onChooseMatch={() => choose('match')}
          onChooseStandings={() => choose('standings')}
        />
      )}

      {state.screen === 'groups' && (
        <GroupStageScreen
          state={state}
          officialResults={officialResults}
          allDone={isDone}
          onPickMatch={pickMatch}
          onToggleRank={toggleRank}
          onFillGroup={fillGroup}
          onFillAll={fillAll}
          onContinue={() => goTo('thirds')}
        />
      )}

      {state.screen === 'thirds' && (
        <ThirdsScreen
          thirdsPool={thirdsPool}
          selected={state.thirds}
          groupStats={groupStats}
          onToggle={toggleThird}
          onAutoThirds={autoThirds}
          onContinue={() => goTo('bracket')}
        />
      )}

      {state.screen === 'bracket' && (
        <BracketScreen
          state={state}
          officialResults={officialResults}
          effectiveBracket={effectiveBracket}
          onPick={pickBracket}
          onSimulate={simulate}
          onReset={() => set({ bracket: {} })}
          onSeeResults={() => set({ screen: 'results' })}
        />
      )}

      {state.screen === 'results' && (
        <ResultsScreen
          state={state}
          effectiveBracket={effectiveBracket}
          officialResults={officialResults}
          copied={state.copied}
          onShare={share}
          onEditBracket={() => goTo('bracket')}
          onRestart={restart}
        />
      )}
    </div>
  )
}
