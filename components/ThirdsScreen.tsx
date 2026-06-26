'use client'
import React from 'react'
import Flag from './Flag'
import { TEAM } from '@/lib/data'
import { rank } from '@/lib/bracketEngine'

interface ThirdEntry {
  team: string
  group: string
}

interface ThirdsScreenProps {
  thirdsPool: ThirdEntry[]
  selected: string[]
  onToggle: (team: string) => void
  onAutoThirds: () => void
  onContinue: () => void
}

export default function ThirdsScreen({
  thirdsPool,
  selected,
  onToggle,
  onAutoThirds,
  onContinue,
}: ThirdsScreenProps) {
  const count = selected.length
  const ok = count === 8

  return (
    <div
      className="p26-anim-up-fast"
      style={{ maxWidth: 1000, margin: '0 auto', padding: '30px 22px 90px' }}
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
        In the 48-team format, the 12 group winners and 12 runners-up qualify automatically — plus
        the <b>8 best third-place teams</b>. Pick the 8 you think sneak through. I&apos;ve
        pre-selected by FIFA ranking; adjust freely.
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
          marginTop: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <button
            onClick={onAutoThirds}
            style={{
              fontFamily: "'Ubuntu', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              color: '#6a6256',
              background: '#fff',
              border: '1px solid #e2d6bd',
              borderRadius: 10,
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            ⚡ Auto-pick top 8
          </button>
        </div>
        <button
          onClick={onContinue}
          style={{
            fontFamily: "'Ubuntu', sans-serif",
            fontWeight: 500,
            fontSize: 14,
            padding: '10px 20px',
            borderRadius: 10,
            cursor: 'pointer',
            background: ok ? '#c0892b' : '#5a7cc9',
            color: '#fff',
            border: 'none',
          }}
        >
          {ok ? 'Build the bracket →' : `Continue with ${count}/8 →`}
        </button>
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
          marginTop: 20,
        }}
      >
        {thirdsPool.map(({ team, group }) => {
          const on = selected.includes(team)
          const canAdd = !on && selected.length >= 8

          return (
            <div
              key={team}
              onClick={() => !canAdd && onToggle(team)}
              className="p26-row-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '13px 14px',
                borderRadius: 12,
                cursor: canAdd ? 'default' : 'pointer',
                background: on ? '#fff' : '#f4eee1',
                border: `2px solid ${on ? '#c0892b' : '#e6dcc6'}`,
                opacity: canAdd ? 0.5 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Flag name={team} height="1.4em" />
                <div style={{ lineHeight: 1.15 }}>
                  <div
                    style={{
                      fontFamily: "'Ubuntu', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: '#1b1d24',
                    }}
                  >
                    {team}
                  </div>
                  <div style={{ fontSize: 12, color: '#9a9082' }}>
                    3rd · Group {group} · FIFA #{rank(team)}
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  flex: '0 0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  background: on ? '#c0892b' : 'transparent',
                  color: '#fff',
                  border: on ? 'none' : '2px solid #d8ccb2',
                }}
              >
                {on ? '✓' : ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
