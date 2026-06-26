export interface GroupStat {
  team: string
  group_key: string
  matches_played: number
  points: number
  goals_for: number
  goals_against: number
  goal_diff: number
  yellow_cards: number
  red_cards: number
}

export type Screen = 'welcome' | 'groups' | 'thirds' | 'bracket' | 'results'
export type Approach = 'match' | 'standings' | null

export interface AppState {
  screen: Screen
  approach: Approach
  name: string
  nameInput: string
  matchPicks: Record<string, string>
  ranks: Record<string, string[]>
  thirds: string[]
  thirdsTouched: boolean
  bracket: Record<string, string>
  shared: boolean
  copied: boolean
  savedPredictionId: string | null
}

export interface Prediction {
  id: string
  user_name: string
  approach: string | null
  champion: string | null
  finalist: string | null
  bronze: string | null
  group_winners: Record<string, string>
  group_top3: Record<string, string[]>
  bracket: Record<string, string>
  match_picks: Record<string, string>
  ranks: Record<string, string[]>
  thirds: string[]
  submitted_at: string
}
