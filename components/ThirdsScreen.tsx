'use client'
import React from 'react'
import Flag from './Flag'
import { rank } from '@/lib/bracketEngine'
import type { GroupStat } from '@/lib/types'

interface ThirdEntry {
  team: string
  group: string
}

interface ThirdsScreenProps {
  thirdsPool: ThirdEntry[]
  selected: string[]
  groupStats: Record<string, GroupStat>
  onToggle: (team: string) => void
  onAutoThirds: () => void
  onContinue: () => void
}

function conductPenalty(stat: GroupStat): number {
  return stat.yellow_cards + stat.red_cards * 3
}

export default function ThirdsScreen({
  thirdsPool,
  selected,
  groupStats,
  onToggle,
  onAutoThirds,
  onContinue,
}: ThirdsScreenProps) {
  const count = selected.length
  const ok = count === 8
  const hasStats = Object.keys(groupStats).length > 0

  // Sort by FIFA tiebreaker criteria: Pts → GD → GF → Conduct → FIFA Rank
  const sorted = [...thirdsPool]
    .map(({ team, group }) => {
      const stat = groupStats[team]
      return {
        team,
        group,
        stat,
        pts:     stat ? stat.points    : 0,
        gd:      stat ? stat.goal_diff : 0,
        gf:      stat ? stat.goals_for : 0,
        conduct: stat ? conductPenalty(stat) : 0,
        fifaRank: rank(team),
      }
    })
    .sort(
      (a, b) =>
        (b.pts - a.pts) ||
        (b.gd - a.gd) ||
        (b.gf - a.gf) ||
        (a.conduct - b.conduct) ||
        (a.fifaRank - b.fifaRank)
    )

  const COL = '36px 26px 1fr 46px 52px 46px 40px 40px'
  const HEADERS = ['#', '', 'TEAM', 'PTS', 'GD', 'GF', 'YC', 'RC']

  return (
    <div
      className="p26-anim-up-fast"
      style={{ maxWidth: 820, margin: '0 auto', padding: '30px 22px 90px' }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 12,
          letterSpacing: '.2em',
          color: '#b08a3a',
          fontWeight: 700,
        }}
      >
        STEP 3 · WILDCARDS
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
        The best 8 third-place teams advance
      </div>
      <div
        style={{
          fontSize: 15,
          color: '#6a6256',
          marginTop: 6,
          maxWidth: 680,
          lineHeight: 1.55,
        }}
      >
        Ranked by FIFA criteria:{' '}
        <b>Points → Goal Diff → Goals Scored → Fair Play → FIFA Rank</b>.{' '}
        {hasStats
          ? 'Live stats pulled from match data.'
          : 'Stats will update as group matches finish.'}
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 22,
        }}
      >
        <div
          style={{
            fontFamily: "'Ubuntu', sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: '#1b1d24',
          }}
        >
          <span style={{ color: ok ? '#1f8a60' : '#c0892b' }}>{count}</span>
          <span style={{ color: '#a39a86', fontSize: 16 }}> / 8 selected</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onAutoThirds}
            style={{
              fontFamily: "'Ubuntu', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              color: '#fff',
              background: '#c0892b',
              border: 'none',
              borderRadius: 10,
              padding: '9px 16px',
              cursor: 'pointer',
            }}
          >
            ⚡ Auto-select best 8
          </button>
          <button
            onClick={onContinue}
            style={{
              fontFamily: "'Ubuntu', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              padding: '9px 18px',
              borderRadius: 10,
              cursor: 'pointer',
              background: ok ? '#1b1d24' : '#5a7cc9',
              color: '#fff',
              border: 'none',
            }}
          >
            {ok ? 'Build the bracket →' : `Continue with ${count}/8 →`}
          </button>
        </div>
      </div>

      {/* Stats table */}
      <div
        style={{
          marginTop: 18,
          background: '#fff',
          border: '1px solid #e4dac3',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(0,0,0,.05)',
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: COL,
            alignItems: 'center',
            padding: '10px 16px',
            background: '#f6f1e6',
            borderBottom: '2px solid #e4dac3',
          }}
        >
          {HEADERS.map((h, i) => (
            <div
              key={i}
              style={{
                fontFamily: "'Roboto Condensed', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.1em',
                color: '#b08a3a',
                textAlign: i >= 3 ? 'center' : 'left',
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Divider after top 8 */}
        {sorted.map(({ team, group, stat, pts, gd, gf, conduct, fifaRank }, idx) => {
          const on = selected.includes(team)
          const canAdd = !on && selected.length >= 8
          const isTop8 = idx < 8

          return (
            <React.Fragment key={team}>
              {idx === 8 && (
                <div
                  style={{
                    borderTop: '2px dashed #e4dac3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5px 16px',
                    background: '#faf7f2',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Roboto Condensed', sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '.12em',
                      color: '#c0392b',
                    }}
                  >
                    ELIMINATED — BELOW QUALIFICATION LINE
                  </span>
                </div>
              )}
              <div
                onClick={() => !canAdd && onToggle(team)}
                className="p26-row-hover"
                style={{
                  display: 'grid',
                  gridTemplateColumns: COL,
                  alignItems: 'center',
                  padding: '11px 16px',
                  cursor: canAdd ? 'default' : 'pointer',
                  background: on
                    ? '#fdf5e6'
                    : idx % 2 === 0
                    ? '#fff'
                    : '#faf7f2',
                  borderBottom: '1px solid #f0ebe0',
                  borderLeft: `3px solid ${on ? '#c0892b' : isTop8 ? '#1f8a60' : 'transparent'}`,
                  opacity: canAdd ? 0.5 : 1,
                  transition: 'background 0.1s',
                }}
              >
                {/* Rank / check */}
                <div
                  style={{
                    fontFamily: "'Roboto Condensed', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: on ? '#c0892b' : isTop8 ? '#1f8a60' : '#c0392b',
                  }}
                >
                  {on ? '✓' : idx + 1}
                </div>

                {/* Flag */}
                <div style={{ lineHeight: 0 }}>
                  <Flag name={team} height="1.15em" />
                </div>

                {/* Team + group */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Ubuntu', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: on ? '#a06420' : '#1b1d24',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {team}
                  </div>
                  <div style={{ fontSize: 11, color: '#b3a98f', marginTop: 1 }}>
                    Group {group}
                  </div>
                </div>

                {/* PTS */}
                <StatCell val={stat ? String(pts) : '-'} color="#1f8a60" />

                {/* GD */}
                <StatCell
                  val={stat ? `${gd >= 0 ? '+' : ''}${gd}` : '-'}
                  color={!stat ? '#d0c8b8' : gd > 0 ? '#2f6df0' : gd < 0 ? '#c0392b' : '#6a6256'}
                />

                {/* GF */}
                <StatCell val={stat ? String(gf) : '-'} color="#6a6256" />

                {/* YC */}
                <StatCell
                  val={stat ? String(stat.yellow_cards) : '-'}
                  color={stat && stat.yellow_cards > 0 ? '#b08a3a' : '#d0c8b8'}
                />

                {/* RC */}
                <StatCell
                  val={stat ? String(stat.red_cards) : '-'}
                  color={stat && stat.red_cards > 0 ? '#c0392b' : '#d0c8b8'}
                />
              </div>
            </React.Fragment>
          )
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: '#b3a98f', textAlign: 'center' }}>
        <span style={{ color: '#1f8a60', fontWeight: 700 }}>Green border</span> = top 8 qualify ·{' '}
        <span style={{ color: '#c0892b', fontWeight: 700 }}>Gold border</span> = your selection ·
        click any row to toggle
      </div>
    </div>
  )
}

function StatCell({ val, color }: { val: string; color: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        fontFamily: "'Roboto Condensed', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        color: val === '-' ? '#d0c8b8' : color,
      }}
    >
      {val}
    </div>
  )
}
