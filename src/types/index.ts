export interface Song {
  id: number
  title: string
  artist: string
  emotion: string
  year: string
  coverColor: string
  coverAccent: string
  coverImage: string  // replace with real path, e.g. "/covers/01.jpg"
  audioSrc: string    // replace with real path, e.g. "/audio/01.mp3"
  videoSrc?: string   // optional video (e.g. lyric video) that plays from needle-drop
  story: string
  lyrics: string
  favoriteStart: number  // timestamp in seconden waar jouw favoriete stuk begint
  favoriteEnd?: number   // timestamp in seconden waar het favoriete stuk eindigt
  artistMeaning?: string
  linerNote?: string
  triggerWarning?: string
  cursorHintColor?: string
  highlightedStanzas?: number[]
  highlightedLines?: string[]
  highlightedLinesByStanza?: Record<number, number[]>
}

export type RPM = 33 | 45

export type TurntablePhase =
  | 'idle'
  | 'selecting'
  | 'placing'
  | 'playing'
  | 'paused'

export interface RecordRoomState {
  activeRecord: Song | null
  phase: TurntablePhase
  rpm: RPM
  isSleeveOpen: boolean
}
