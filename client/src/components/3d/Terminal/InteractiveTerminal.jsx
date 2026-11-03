import { useState, useRef, useEffect, useCallback } from 'react'

// ─────────────────────────────────────────
// CLUSTER Terminal commands
// Core: help, about, events, team, stats, clear
// Easter eggs: sudo, hack, matrix, ls, cd, cat, exit
// ─────────────────────────────────────────

const STATS = {
  members: 150,
  events: 20,
  projects: 10,
  partners: 5,
}

const UPCOMING_EVENTS = [
  { name: 'CLUSTER Hackathon Season 1', date: '2026-12-05', type: 'hackathon' },
  { name: 'Full-Stack Web Dev Bootcamp', date: '2026-11-20', type: 'workshop' },
  { name: 'AI & ML Weekly Study Circle', date: '2026-11-15', type: 'study' },
]

const TEAM_MEMBERS = [
  { name: 'President', role: 'Club Founder & President' },
  { name: 'Vice President', role: 'AI & Research Lead' },
  { name: 'Technical Secretary', role: 'Engineering & Dev Lead' },
  { name: 'Events Director', role: 'Events & Community' },
]

function processCommand(cmd) {
  const raw = cmd.trim().toLowerCase()
  const args = raw.split(/\s+/)
  const command = args[0]

  switch (command) {
    case 'help':
      return [
        { text: '', type: 'output' },
        { text: 'Available commands:', type: 'output dim' },
        { text: '  help        Show this help message', type: 'output' },
        { text: '  about       About CLUSTER Society', type: 'output' },
        { text: '  events      List upcoming events', type: 'output' },
        { text: '  team        List team officers', type: 'output' },
        { text: '  stats       Show society statistics', type: 'output' },
        { text: '  clear       Clear the terminal', type: 'output' },
        { text: '  matrix      Enter the matrix', type: 'output dim' },
        { text: '  hack        Execute build sequence', type: 'output dim' },
        { text: '  sudo        Try it ;)', type: 'output dim' },
        { text: '  ls          List files', type: 'output dim' },
        { text: '', type: 'output' },
      ]

    case 'about':
      return [
        { text: '', type: 'output' },
        { text: '╔══════════════════════════════════════════╗', type: 'output' },
        { text: '║     CLUSTER — STUDENT TECHNOLOGY SOCIETY ║', type: 'output' },
        { text: '║     BUILD • LEARN • COLLABORATE • CREATE ║', type: 'output' },
        { text: '╚══════════════════════════════════════════╝', type: 'output' },
        { text: '', type: 'output' },
        { text: 'A student technology society dedicated to building', type: 'output white' },
        { text: 'production-grade projects, learning together,', type: 'output white' },
        { text: 'and shaping the future of technology.', type: 'output white' },
        { text: '', type: 'output' },
        { text: '  Motto    : Build / Learn / Collaborate / Create', type: 'output' },
        { text: '  Focus    : AI/ML, Full-Stack, Web3, Systems & Cloud', type: 'output' },
        { text: '  Location : Greater Noida, UP', type: 'output' },
        { text: '', type: 'output' },
      ]

    case 'events':
      return [
        { text: '', type: 'output' },
        { text: '=== UPCOMING EVENTS ===', type: 'output' },
        { text: '', type: 'output' },
        ...UPCOMING_EVENTS.map((e) => ({
          text: `  [${e.type.toUpperCase()}]  ${e.name}  →  ${e.date}`,
          type: 'output',
        })),
        { text: '', type: 'output' },
        { text: `Type 'events --all' for the full calendar.`, type: 'output dim' },
        { text: '', type: 'output' },
      ]

    case 'team':
      return [
        { text: '', type: 'output' },
        { text: '=== EXECUTIVE BOARD ===', type: 'output' },
        { text: '', type: 'output' },
        ...TEAM_MEMBERS.map((m) => ({
          text: `  ${m.name.padEnd(25)} ${m.role}`,
          type: 'output',
        })),
        { text: '', type: 'output' },
      ]

    case 'stats':
      return [
        { text: '', type: 'output' },
        { text: '=== CLUSTER STATISTICS ===', type: 'output' },
        { text: '', type: 'output' },
        { text: `  Members         ${STATS.members}+`, type: 'output' },
        { text: `  Events Hosted   ${STATS.events}+`, type: 'output' },
        { text: `  Projects Built  ${STATS.projects}+`, type: 'output' },
        { text: `  Partners        ${STATS.partners}+`, type: 'output' },
        { text: '', type: 'output' },
        { text: '  [████████████████████] 100% Builder Energy', type: 'output' },
        { text: '', type: 'output' },
      ]

    case 'clear':
      return [{ text: '__CLEAR__', type: 'control' }]

    case 'matrix':
      return [
        { text: '', type: 'output' },
        { text: '01000011 01001100 01010101 01010011', type: 'output' },
        { text: '01010100 01000101 01010010 00100000', type: 'output' },
        { text: '01010011 01001111 01000011 01001001', type: 'output' },
        { text: '01000101 01010100 01011001 00001010', type: 'output' },
        { text: '', type: 'output' },
        { text: 'Wake up, builder. The Matrix has you...', type: 'output dim' },
        { text: `Decoded: "CLUSTER TECH SOCIETY"`, type: 'output' },
        { text: '', type: 'output' },
      ]

    case 'hack':
      return [
        { text: '', type: 'output' },
        { text: 'Initiating builder deployment sequence...', type: 'output' },
        { text: '', type: 'output' },
        { text: '> Initializing React client...     [DONE]', type: 'output' },
        { text: '> Compiling Tailwind styles...     [DONE]', type: 'output' },
        { text: '> Syncing clusterDataService...    [DONE]', type: 'output' },
        { text: '> Launching Hackathon S1...       [DONE]', type: 'output' },
        { text: '', type: 'output' },
        { text: 'Society systems nominal. Keep building!', type: 'output dim' },
        { text: '', type: 'output' },
      ]

    case 'sudo':
      return [
        { text: '', type: 'output' },
        { text: '[sudo] password for cluster:', type: 'output white' },
        { text: 'Nice try! Visit /admin/login for CMS access.', type: 'output error' },
        { text: '', type: 'output' },
      ]

    case 'ls':
      return [
        { text: '', type: 'output' },
        { text: 'about.md    events/    projects/    team.json    README.md', type: 'output' },
        { text: 'hackathons/ study-circles/ cms/        .cluster-secret', type: 'output' },
        { text: '', type: 'output' },
      ]

    case 'cd':
      return [
        { text: '', type: 'output' },
        { text: `bash: cd: ${args[1] || '~'}: Access granted. Welcome home!`, type: 'output' },
        { text: '', type: 'output' },
      ]

    case 'cat':
      if (args[1] === '.cluster-secret' || args[1] === '.nvidia-secret') {
        return [
          { text: '', type: 'output' },
          { text: '> The true power of CLUSTER is the builders and projects we build together.', type: 'output' },
          { text: '', type: 'output' },
        ]
      }
      return [
        { text: '', type: 'output' },
        { text: `cat: ${args[1] || 'file'}: No such file or directory`, type: 'output error' },
        { text: '', type: 'output' },
      ]

    case 'exit':
      return [
        { text: '', type: 'output' },
        { text: 'Closing session. Stay inspired!', type: 'output' },
        { text: '', type: 'output' },
      ]

    case '':
      return []

    default:
      return [
        { text: '', type: 'output' },
        { text: `cluster: command not found: ${command}`, type: 'output error' },
        { text: `Type 'help' to see available commands.`, type: 'output dim' },
        { text: '', type: 'output' },
      ]
  }
}

const PROMPT = 'cluster@society:~$ '
const TYPING_SPEED = 25

const INITIAL_OUTPUT = [
  { text: '╔══════════════════════════════════════════════════════════════╗', type: 'output' },
  { text: '║   cluster@society — Interactive Developer Terminal          ║', type: 'output' },
  { text: '╚══════════════════════════════════════════════════════════════╝', type: 'output' },
  { text: '', type: 'output' },
  { text: 'Welcome to the CLUSTER Developer Shell.', type: 'output white' },
  { text: "Type 'help' to see available commands.", type: 'output dim' },
  { text: '', type: 'output' },
]

export default function InteractiveTerminal() {
  const [lines, setLines] = useState(INITIAL_OUTPUT)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const [isTyping, setIsTyping] = useState(false)

  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const typingRef = useRef(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [lines, scrollToBottom])

  // Focus input on click anywhere in terminal
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Typewriter effect for output
  const appendLines = useCallback(
    (newLines) => {
      if (newLines.length === 0) return

      // Check for control commands
      if (newLines[0].text === '__CLEAR__') {
        setLines([])
        return
      }

      setIsTyping(true)
      let lineIdx = 0

      const typeNextLine = () => {
        if (lineIdx < newLines.length) {
          const line = newLines[lineIdx]
          setLines((prev) => [...prev, line])
          lineIdx++
          typingRef.current = setTimeout(typeNextLine, TYPING_SPEED)
        } else {
          setIsTyping(false)
        }
      }

      typeNextLine()
    },
    []
  )

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingRef.current) clearTimeout(typingRef.current)
    }
  }, [])

  // Handle command submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (isTyping) return

    const trimmed = input.trim()

    // Add prompt line to output
    setLines((prev) => [
      ...prev,
      { text: `${PROMPT}${input}`, type: 'input' },
    ])

    // Update history
    if (trimmed) {
      setHistory((prev) => [...prev, trimmed])
      setHistIdx(-1)
    }

    // Process and display output
    const output = processCommand(trimmed)
    appendLines(output)
    setInput('')
  }

  // History navigation (Up / Down arrows)
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const nextIdx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(nextIdx)
      setInput(history[nextIdx] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx === -1) return
      const nextIdx = histIdx + 1
      if (nextIdx >= history.length) {
        setHistIdx(-1)
        setInput('')
      } else {
        setHistIdx(nextIdx)
        setInput(history[nextIdx] || '')
      }
    }
  }

  return (
    <div
      onClick={handleTerminalClick}
      className="bg-obsidian-950 rounded-xl p-4 font-mono text-xs text-gray-300 h-96 flex flex-col cursor-text select-text overflow-hidden border border-white/5"
      role="region"
      aria-label="Interactive CLI Terminal"
    >
      {/* Terminal Output */}
      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono leading-relaxed"
      >
        {lines.map((line, idx) => {
          let colorClass = 'text-gray-300'
          if (line.type === 'input') colorClass = 'text-cluster-green font-semibold'
          if (line.type === 'output white') colorClass = 'text-white font-medium'
          if (line.type === 'output dim') colorClass = 'text-gray-500'
          if (line.type === 'output error') colorClass = 'text-red-400'

          return (
            <div key={idx} className={`${colorClass} whitespace-pre-wrap break-all`}>
              {line.text}
            </div>
          )
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="text-cluster-green text-xs animate-pulse">▍</div>
        )}
      </div>

      {/* Input Line */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 pt-2 border-t border-white/10 mt-2">
        <span className="text-cluster-green font-bold shrink-0">{PROMPT}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none disabled:opacity-50"
          placeholder={isTyping ? '' : "type 'help'..."}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </form>
    </div>
  )
}
