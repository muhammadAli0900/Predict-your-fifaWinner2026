'use client'
import React from 'react'

interface WelcomeScreenProps {
  nameInput: string
  onNameChange: (val: string) => void
  onChooseMatch: () => void
  onChooseStandings: () => void
}

export default function WelcomeScreen({
  nameInput,
  onNameChange,
  onChooseMatch,
  onChooseStandings,
}: WelcomeScreenProps) {
  return (
    <div
      className="p26-anim-up"
      style={{
        maxWidth: 980,
        margin: '0 auto',
        padding: '60px 24px 90px',
        textAlign: 'center',
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          fontFamily: "'Roboto Condensed', sans-serif",
          fontSize: 12,
          letterSpacing: '.32em',
          color: '#b08a3a',
          fontWeight: 700,
        }}
      >
        WORLD CUP 2026 · CANADA · MEXICO · USA
      </div>

      {/* Hero wordmark */}
      <div
        style={{
          fontFamily: "'Ubuntu', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(48px, 10vw, 84px)',
          lineHeight: 0.92,
          marginTop: 16,
          letterSpacing: '-.02em',
          color: '#1b1d24',
        }}
      >
        PREDICT <span style={{ color: '#c0892b' }}>26</span>
      </div>

      {/* Subtitle */}
      <div style={{ fontSize: 20, color: '#6a6256', marginTop: 14 }}>
        Call every match. Build your bracket. Crown your champion.
      </div>

      {/* Name input */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#fff',
          border: '1px solid #e2d8c2',
          borderRadius: 14,
          padding: '7px 7px 7px 8px',
          marginTop: 32,
          boxShadow: '0 8px 24px rgba(0,0,0,.06)',
        }}
      >
        <span style={{ fontSize: 18, paddingLeft: 8 }}>👤</span>
        <input
          value={nameInput}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Enter your name"
          name="prediction-name"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          data-form-type="other"
          style={{
            border: 'none',
            outline: 'none',
            fontFamily: "'Ubuntu', sans-serif",
            fontWeight: 500,
            fontSize: 16,
            color: '#1b1d24',
            background: 'transparent',
            width: 200,
          }}
        />
      </div>

      <div style={{ fontSize: 13, color: '#a39a86', marginTop: 10 }}>
        Pick how you want to predict the group stage — both paths lead to the same knockout bracket.
      </div>

      {/* Pathway cards */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          justifyContent: 'center',
          marginTop: 30,
          flexWrap: 'wrap',
        }}
      >
        {/* Match Predictor */}
        <div
          onClick={onChooseMatch}
          className="p26-card-hover"
          style={{
            flex: 1,
            minWidth: 280,
            maxWidth: 360,
            background: '#fff',
            border: '1px solid #e6dcc6',
            borderRadius: 18,
            padding: 28,
            textAlign: 'left',
            boxShadow: '0 10px 30px rgba(0,0,0,.05)',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#1f9e6e22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            ⚽
          </div>
          <div
            style={{
              fontFamily: "'Ubuntu', sans-serif",
              fontWeight: 700,
              fontSize: 23,
              marginTop: 16,
              color: '#1b1d24',
            }}
          >
            Match Predictor
          </div>
          <div style={{ fontSize: 15, color: '#6a6c74', marginTop: 8, lineHeight: 1.55 }}>
            Go game-by-game. Tap winners across all 72 group matches and watch the tables build
            themselves.
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              marginTop: 18,
              fontFamily: "'Ubuntu', sans-serif",
              fontWeight: 500,
              color: '#0f7f63',
            }}
          >
            Pick this path <span>→</span>
          </div>
        </div>

        {/* Group Standings */}
        <div
          onClick={onChooseStandings}
          className="p26-card-hover"
          style={{
            flex: 1,
            minWidth: 280,
            maxWidth: 360,
            background: '#fff',
            border: '1px solid #e6dcc6',
            borderRadius: 18,
            padding: 28,
            textAlign: 'left',
            boxShadow: '0 10px 30px rgba(0,0,0,.05)',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#2f6df022',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            📊
          </div>
          <div
            style={{
              fontFamily: "'Ubuntu', sans-serif",
              fontWeight: 700,
              fontSize: 23,
              marginTop: 16,
              color: '#1b1d24',
            }}
          >
            Group Standings
          </div>
          <div style={{ fontSize: 15, color: '#6a6c74', marginTop: 8, lineHeight: 1.55 }}>
            Skip the details. Just rank each group 1st · 2nd · 3rd and jump straight to the
            knockouts.
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              marginTop: 18,
              fontFamily: "'Ubuntu', sans-serif",
              fontWeight: 500,
              color: '#2f6df0',
            }}
          >
            Pick this path <span>→</span>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div
        style={{
          display: 'flex',
          gap: 26,
          justifyContent: 'center',
          marginTop: 46,
          flexWrap: 'wrap',
          color: '#8a8170',
          fontSize: 14,
        }}
      >
        {[
          ['48', 'teams'],
          ['12', 'groups'],
          ['32', '-team knockout'],
          ['1', 'champion'],
        ].map(([num, label]) => (
          <span key={num + label}>
            <b style={{ color: '#1b1d24', fontFamily: "'Ubuntu', sans-serif" }}>{num}</b>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
