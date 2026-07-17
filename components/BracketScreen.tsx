'use client'
import React from 'react'
import Flag from './Flag'
import { ROUND_N, VENUES } from '@/lib/data'
import type { MatchVenue } from '@/lib/data'
import { teamsOf, better, rank } from '@/lib/bracketEngine'
import type { AppState } from '@/lib/types'

const H = 1600

const ROUNDS: { key: string; label: string }[] = [
  { key: 'R32', label: 'Round of 32' },
  { key: 'R16', label: 'Round of 16' },
  { key: 'QF', label: 'Quarterfinals' },
  { key: 'SF', label: 'Semifinals' },
  { key: 'F', label: 'Final' },
]

interface BracketScreenProps {
  state: AppState
  officialResults: Record<string, string>
  effectiveBracket: Record<string, string>
  onPick: (id: string, team: string) => void
  onSimulate: () => void
  onReset: () => void
  onSeeResults: () => void
}

export default function BracketScreen({
  state,
  officialResults,
  effectiveBracket,
  onPick,
  onSimulate,
  onReset,
  onSeeResults,
}: BracketScreenProps) {
  const champ = effectiveBracket['F-0'] ?? null
  const canSeeResults = !!champ

  return (
    <div
      className="p26-anim-up-fast"
      style={{ maxWidth: 1340, margin: '0 auto', padding: '30px 22px 70px' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: 12,
              letterSpacing: '.2em',
              color: '#b08a3a',
              fontWeight: 700,
            }}
          >
            STEP 4 · KNOCKOUT BRACKET
          </div>
          <div
            style={{
              fontFamily: "'Ubuntu', sans-serif",
              fontWeight: 700,
              fontSize: 32,
              marginTop: 6,
              color: '#1b1d24',
            }}
          >
            Pick your way to the trophy
          </div>
          <div style={{ fontSize: 15, color: '#6a6256', marginTop: 4 }}>
            Tap a team to send them through. Winners advance rightward, round by round.{' '}
            <span style={{ color: '#b08a3a' }}>Scroll sideways to follow the path →</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={onSimulate}
            style={{
              fontFamily: "'Ubuntu', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              color: '#6a6256',
              background: '#fff',
              border: '1px solid #e2d6bd',
              borderRadius: 10,
              padding: '9px 14px',
              cursor: 'pointer',
            }}
          >
            ⚡ Simulate rest
          </button>
          <button
            onClick={onReset}
            style={{
              fontFamily: "'Ubuntu', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              color: '#a85b4a',
              background: '#fff',
              border: '1px solid #ecd3cc',
              borderRadius: 10,
              padding: '9px 14px',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
          <button
            onClick={onSeeResults}
            disabled={!canSeeResults}
            style={{
              fontFamily: "'Ubuntu', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              padding: '9px 18px',
              borderRadius: 10,
              cursor: canSeeResults ? 'pointer' : 'not-allowed',
              background: canSeeResults ? '#1b1d24' : '#e6dcc6',
              color: canSeeResults ? '#fff' : '#b3a98f',
              border: 'none',
            }}
          >
            See results →
          </button>
        </div>
      </div>

      {/* Bracket scroll container */}
      <div
        className="p26-scroll"
        style={{
          overflowX: 'auto',
          marginTop: 22,
          padding: '18px 10px 24px',
          background: '#f6f1e6',
          border: '1px solid #e4dac3',
          borderRadius: 18,
        }}
      >
        {/* Round labels */}
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 1600, padding: '0 6px 8px' }}>
          {buildHeads(state, effectiveBracket, champ).map((hd, i) => (
            <div key={i} style={hd.style}>
              {hd.label && (
                <span
                  style={{
                    fontFamily: "'Roboto Condensed', sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '.14em',
                    color: '#b08a3a',
                  }}
                >
                  {hd.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Columns + gutters */}
        <div style={{ display: 'flex', alignItems: 'stretch', minWidth: 1600, padding: '0 6px' }}>
          {buildColumns(state, effectiveBracket, officialResults, champ, onPick).map((col, i) => (
            <div key={i} style={col.colStyle}>
              {col.type === 'round' &&
                col.matches!.map(m => (
                  <div key={m.id} style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      {!m.id.startsWith('R32-') && (
                        <div style={{ position: 'absolute', left: -28, top: '50%', width: 28, height: 2, background: '#d8c79e', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      )}
                      {m.venue && (
                        <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 4 }}>
                          <VenueTag date={m.venue.date} stadium={m.venue.stadium} city={m.venue.city} country={m.venue.country} />
                        </div>
                      )}
                      <div style={m.cardStyle}>
                        <BracketTeamRow
                          team={m.top.team}
                          picked={m.top.picked}
                          decided={m.top.decided}
                          empty={m.top.empty}
                          locked={m.top.locked}
                          onClick={m.top.onClick}
                        />
                        <div style={{ height: 1, background: '#ece2cf' }} />
                        <BracketTeamRow
                          team={m.bot.team}
                          picked={m.bot.picked}
                          decided={m.bot.decided}
                          empty={m.bot.empty}
                          locked={m.bot.locked}
                          onClick={m.bot.onClick}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              {col.type === 'gutter' &&
                col.cells!.map((cell, ci) => <div key={ci} style={cell.style} />)}
              {col.type === 'champ' && (
                <div style={{ position: 'relative' }}>
                  {VENUES['F-0'] && (
                    <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 8 }}>
                      <VenueTag
                        date={VENUES['F-0'].date}
                        stadium={VENUES['F-0'].stadium}
                        city={VENUES['F-0'].city}
                        country={VENUES['F-0'].country}
                      />
                    </div>
                  )}
                  <div style={champBoxStyle}>
                    <div
                      style={{
                        fontFamily: "'Roboto Condensed', sans-serif",
                        fontSize: 11,
                        letterSpacing: '.2em',
                        color: '#e8c25f',
                      }}
                    >
                      CHAMPION
                    </div>
                    <div className="p26-anim-pop" style={{ fontSize: 40, marginTop: 8 }}>
                      🏆
                    </div>
                    <div style={{ fontSize: 30, marginTop: 6 }}>
                      {champ ? <Flag name={champ} height="1.4em" /> : <span style={{ opacity: 0.4 }}>🏳️</span>}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Ubuntu', sans-serif",
                        fontWeight: 700,
                        fontSize: 18,
                        marginTop: 4,
                        color: '#fff',
                      }}
                    >
                      {champ ?? 'TBD'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Third-place playoff */}
      <ThirdPlacePlayoff
        state={state}
        effectiveBracket={effectiveBracket}
        officialResults={officialResults}
        onPick={onPick}
      />
    </div>
  )
}

function BracketTeamRow({
  team,
  picked,
  decided,
  empty,
  locked,
  onClick,
}: {
  team: string | null
  picked: boolean
  decided: boolean
  empty: boolean
  locked: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={!empty && !locked ? onClick : undefined}
      className={!empty && !locked ? 'p26-row-hover' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '8px 10px',
        cursor: empty || locked ? 'default' : 'pointer',
        background: picked ? '#c0892b' : '#fff',
        color: picked ? '#fff' : empty ? '#bcb29d' : '#26282f',
        fontFamily: "'Ubuntu', sans-serif",
        fontWeight: 500,
        fontSize: 13,
        opacity: decided && !picked ? 0.5 : 1,
        minHeight: 16,
      }}
    >
      {team ? <Flag name={team} height="0.9em" /> : <span style={{ color: '#cfc4ab' }}>·</span>}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {team ?? '—'}
      </span>
      {locked && picked && <span style={{ fontSize: 9, opacity: 0.7 }}>🔒</span>}
    </div>
  )
}

function ThirdPlacePlayoff({
  state,
  effectiveBracket,
  officialResults,
  onPick,
}: {
  state: AppState
  effectiveBracket: Record<string, string>
  officialResults: Record<string, string>
  onPick: (id: string, team: string) => void
}) {
  const teams = teamsOf('TP-0', effectiveBracket, state, officialResults)
  const tpWinner = effectiveBracket['TP-0'] ?? null
  const tpLocked = !!officialResults['TP-0']

  const side = (team: string | null) => {
    const picked = tpWinner === team
    const decided = !!tpWinner
    return { team, picked, decided, empty: !team, locked: tpLocked }
  }

  const tpVenue = VENUES['TP-0']

  return (
    <div style={{ maxWidth: 440, margin: '24px auto 0' }}>
      <div
        style={{
          textAlign: 'center',
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 12,
          letterSpacing: '.18em',
          color: '#a9733c',
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        🥉 THIRD-PLACE PLAYOFF
      </div>
      {tpVenue && (
        <div style={{ marginBottom: 6 }}>
          <VenueTag date={tpVenue.date} stadium={tpVenue.stadium} city={tpVenue.city} country={tpVenue.country} />
        </div>
      )}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2cf9e',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 6px 18px rgba(0,0,0,.06)',
        }}
      >
        {[teams[0], teams[1]].map((team, i) => {
          const s = side(team)
          return (
            <React.Fragment key={i}>
              {i === 1 && <div style={{ height: 1, background: '#ece2cf' }} />}
              <BracketTeamRow
                team={s.team}
                picked={s.picked}
                decided={s.decided}
                empty={s.empty}
                locked={s.locked}
                onClick={() => team && onPick('TP-0', team)}
              />
            </React.Fragment>
          )
        })}
      </div>
      <div
        style={{ textAlign: 'center', fontSize: 13, color: '#a3946c', marginTop: 8 }}
      >
        The two beaten semifinalists meet for the bronze medal.
      </div>
    </div>
  )
}

function VenueTag({ date, stadium, city, country }: { date: string; stadium: string; city: string; country: string }) {
  const flag = country === 'USA' ? '🇺🇸' : country === 'Mexico' ? '🇲🇽' : '🇨🇦'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        background: '#f0ebe0',
        border: '1px solid #e4d9be',
        borderRadius: 6,
        fontSize: 10,
        color: '#7a7062',
        lineHeight: 1.25,
        overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: 11, flex: '0 0 auto' }}>{flag}</span>
      <span style={{ fontWeight: 700, color: '#c0892b', flex: '0 0 auto' }}>{date}</span>
      <span style={{ flex: '0 0 auto', color: '#b3a98f' }}>·</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{stadium}</span>
      <span style={{ flex: '0 0 auto', color: '#b3a98f' }}>·</span>
      <span style={{ flex: '0 0 auto', whiteSpace: 'nowrap' }}>{city}</span>
    </div>
  )
}

const champBoxStyle: React.CSSProperties = {
  background: '#1b1d24',
  borderRadius: 14,
  padding: '22px 14px',
  textAlign: 'center',
  color: '#fff',
  boxShadow: '0 10px 30px rgba(0,0,0,.18)',
}

// ── Column builders ──────────────────────────────────────────────────────────

type ColHead = { label: string; style: React.CSSProperties }

function buildHeads(
  state: AppState,
  effectiveBracket: Record<string, string>,
  champ: string | null
): ColHead[] {
  const heads: ColHead[] = []
  const colW = (w: number): React.CSSProperties => ({
    width: w,
    flex: '0 0 auto',
    textAlign: 'center',
  })

  ROUNDS.forEach((r, ri) => {
    heads.push({ label: r.label, style: colW(186) })
    if (ri < ROUNDS.length - 1) heads.push({ label: '', style: colW(28) })
  })
  heads.push({ label: '', style: colW(30) })
  heads.push({ label: 'Champion', style: colW(196) })
  return heads
}

type MatchSide = {
  team: string | null
  picked: boolean
  decided: boolean
  empty: boolean
  locked: boolean
  onClick: () => void
}

type BracketMatch = {
  id: string
  cardStyle: React.CSSProperties
  top: MatchSide
  bot: MatchSide
  venue?: MatchVenue
}

type Column =
  | { type: 'round'; colStyle: React.CSSProperties; matches: BracketMatch[] }
  | { type: 'gutter'; colStyle: React.CSSProperties; cells: { style: React.CSSProperties }[] }
  | { type: 'champ'; colStyle: React.CSSProperties }

function buildColumns(
  state: AppState,
  effectiveBracket: Record<string, string>,
  officialResults: Record<string, string>,
  champ: string | null,
  onPick: (id: string, team: string) => void
): Column[] {
  const cols: Column[] = []

  ROUNDS.forEach((r, ri) => {
    const n = ROUND_N[r.key]
    const matches: BracketMatch[] = []

    for (let k = 0; k < n; k++) {
      const id = `${r.key}-${k}`
      const t = teamsOf(id, effectiveBracket, state, officialResults)
      const w = effectiveBracket[id] ?? null
      const locked = !!officialResults[id]

      const mkSide = (team: string | null): MatchSide => ({
        team,
        picked: w === team && !!team,
        decided: !!w,
        empty: !team,
        locked,
        onClick: () => { if (team && !locked) onPick(id, team) },
      })

      matches.push({
        id,
        cardStyle: {
          background: '#fff',
          border: '1px solid #e4dac3',
          borderRadius: 9,
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0,0,0,.04)',
        },
        top: mkSide(t[0]),
        bot: mkSide(t[1]),
        venue: VENUES[id],
      })
    }

    cols.push({
      type: 'round',
      colStyle: {
        height: H,
        width: 186,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        flex: '0 0 auto',
      },
      matches,
    })

    if (ri < ROUNDS.length - 1) {
      const cnt = n / 2
      const ch = H / n  // one source-round slot height — centers brackets on card midpoints
      const cells = Array.from({ length: cnt }, () => ({
        style: {
          height: ch,
          width: 28,
          borderTop: '2px solid #d8c79e',
          borderRight: '2px solid #d8c79e',
          borderBottom: '2px solid #d8c79e',
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
        } as React.CSSProperties,
      }))
      cols.push({
        type: 'gutter',
        colStyle: {
          height: H,
          width: 28,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          flex: '0 0 auto',
        },
        cells,
      })
    }
  })

  // Final → champ stub
  cols.push({
    type: 'gutter',
    colStyle: {
      height: H,
      width: 30,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      flex: '0 0 auto',
    },
    cells: [{ style: { height: 2, width: 30, borderTop: '2px solid #d8c79e' } }],
  })

  cols.push({
    type: 'champ',
    colStyle: {
      height: H,
      width: 196,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      flex: '0 0 auto',
    },
  })

  return cols
}
