================================================================================
        SPPS — INDUSTRIAL SKEUOMORPHISM UI DESIGN SYSTEM
        Tailored for: React + TypeScript + Tailwind CSS + FastAPI + MongoDB
================================================================================

DESIGN BRIEF
--------------------------------------------------------------------------------
System: Student Performance Prediction System (AI-powered EdTech)
Theme:  Industrial Control Panel meets Medical Monitoring Equipment
Vibe:   "An ICU patient monitoring system crossed with a 1980s Braun synthesizer"
        — serious, precise, data-dense, trustworthy, and tactile.

WHY THIS FITS SPPS:
  • The "control panel" metaphor maps perfectly to a dashboard that monitors
    student health metrics — attendance is a vital sign, risk score is an alarm.
  • Industrial precision signals academic authority and trustworthiness.
  • The safety-orange accent (#ff4757) becomes SPPS's "risk alert" color — it
    literally means danger in the real world, reinforcing the risk flagging UX.
  • Physical depth and weight make the AI predictions feel grounded and reliable,
    not like a black box. The SHAP factors rendered as physical "gauges" are
    immediately more legible than a flat progress bar.


1. DESIGN TOKENS — index.css
--------------------------------------------------------------------------------
Replace your current index.css @layer base with this:

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ── Chassis (Base Surface) ──────────────────────── */
    --chassis:        #e0e5ec;
    --panel:          #eaecf0;
    --muted:          #d1d9e6;
    --surface-dark:   #2d3436;
    --surface-darker: #1e2527;

    /* ── Text ────────────────────────────────────────── */
    --text-primary:   #2d3436;
    --text-secondary: #4a5568;
    --text-muted:     #636e72;
    --text-light:     #e0e5ec;

    /* ── Accent (Safety Orange / Risk Red) ───────────── */
    --accent:         #ff4757;
    --accent-hover:   #e8394a;
    --accent-glow:    rgba(255, 71, 87, 0.5);

    /* ── Status Colors ───────────────────────────────── */
    --status-high:    #ff4757;
    --status-medium:  #ffa502;
    --status-low:     #2ed573;
    --status-info:    #1e90ff;
    --glow-high:      rgba(255, 71, 87,  0.6);
    --glow-medium:    rgba(255, 165,  2, 0.6);
    --glow-low:       rgba(46,  213, 115, 0.6);

    /* ── Neumorphic Shadow System ────────────────────── */
    --shadow-card:     8px  8px 16px #babecc, -8px -8px 16px #ffffff;
    --shadow-float:   12px 12px 24px #babecc, -12px -12px 24px #ffffff,
                      inset 1px 1px 0 rgba(255,255,255,0.5);
    --shadow-press:   inset  6px  6px 12px #babecc,
                      inset -6px -6px 12px #ffffff;
    --shadow-recess:  inset  4px  4px  8px #babecc,
                      inset -4px -4px  8px #ffffff;
    --shadow-sharp:    4px  4px  8px rgba(0,0,0,0.15),
                      -1px -1px  1px rgba(255,255,255,0.8);

    /* ── Risk Glow Shadows ───────────────────────────── */
    --glow-red:    0 0 12px 3px rgba(255, 71,  87, 0.55);
    --glow-amber:  0 0 12px 3px rgba(255,165,   2, 0.55);
    --glow-green:  0 0 12px 3px rgba( 46,213, 115, 0.55);

    /* ── Typography ──────────────────────────────────── */
    --font-sans:  'IBM Plex Sans', system-ui, sans-serif;
    --font-mono:  'IBM Plex Mono', monospace;

    /* ── Spacing ─────────────────────────────────────── */
    --sidebar-w:  252px;
    --topbar-h:   60px;
  }

  * { box-sizing: border-box; }

  body {
    font-family: var(--font-sans);
    background-color: var(--chassis);
    color: var(--text-primary);
    /* Noise texture over entire background */
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    -webkit-font-smoothing: antialiased;
  }
}

@layer components {

  /* ── Cards ─────────────────────────────────────────── */
  .card {
    background: var(--chassis);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    position: relative;
    overflow: hidden;
  }
  /* Corner screws — the industrial signature detail */
  .card::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 14px 14px,     rgba(0,0,0,0.18) 2.5px, transparent 3.5px),
      radial-gradient(circle at calc(100% - 14px) 14px,    rgba(0,0,0,0.18) 2.5px, transparent 3.5px),
      radial-gradient(circle at 14px calc(100% - 14px),    rgba(0,0,0,0.18) 2.5px, transparent 3.5px),
      radial-gradient(circle at calc(100% - 14px) calc(100% - 14px), rgba(0,0,0,0.18) 2.5px, transparent 3.5px);
    pointer-events: none;
    border-radius: inherit;
    z-index: 1;
  }

  /* ── Stat Card ──────────────────────────────────────── */
  .stat-card {
    background: var(--chassis);
    border-radius: 16px;
    box-shadow: var(--shadow-card);
    padding: 1.25rem 1.5rem;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 12px 12px, rgba(0,0,0,0.15) 2px, transparent 3px),
      radial-gradient(circle at calc(100% - 12px) 12px, rgba(0,0,0,0.15) 2px, transparent 3px);
    pointer-events: none;
    border-radius: inherit;
  }

  /* ── Buttons ────────────────────────────────────────── */
  .btn-primary {
    background: var(--accent);
    color: #fff;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.6rem 1.25rem;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 4px 4px 8px rgba(166,50,60,0.35), -2px -2px 6px rgba(255,100,110,0.3);
    cursor: pointer;
    transition: all 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .btn-primary:hover  { filter: brightness(1.08); }
  .btn-primary:active { transform: translateY(2px); box-shadow: var(--shadow-press); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-ghost {
    background: var(--chassis);
    color: var(--text-secondary);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.55rem 1.1rem;
    border-radius: 8px;
    border: none;
    box-shadow: var(--shadow-card);
    cursor: pointer;
    transition: all 200ms ease;
  }
  .btn-ghost:hover  { color: var(--accent); box-shadow: var(--shadow-float); }
  .btn-ghost:active { transform: translateY(1px); box-shadow: var(--shadow-press); }

  /* ── Inputs ─────────────────────────────────────────── */
  .input-field {
    background: var(--chassis);
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    padding: 0.7rem 1rem;
    border-radius: 8px;
    border: none;
    box-shadow: var(--shadow-recess);
    width: 100%;
    outline: none;
    transition: box-shadow 200ms ease;
  }
  .input-field::placeholder { color: var(--text-muted); opacity: 0.7; }
  .input-field:focus {
    box-shadow: var(--shadow-recess), 0 0 0 2px var(--accent);
  }

  /* ── Risk Badges ────────────────────────────────────── */
  .risk-badge {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
  .risk-badge::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    animation: pulse-led 2s ease-in-out infinite;
  }
  .risk-badge-high   { background: rgba(255,71,87,0.15);  color: #c0392b; }
  .risk-badge-high::before   { background: var(--status-high);   box-shadow: var(--glow-red); }
  .risk-badge-medium { background: rgba(255,165,2,0.15);  color: #b7770d; }
  .risk-badge-medium::before { background: var(--status-medium); box-shadow: var(--glow-amber); }
  .risk-badge-low    { background: rgba(46,213,115,0.15); color: #1a7a45; }
  .risk-badge-low::before    { background: var(--status-low);    box-shadow: var(--glow-green); }

  /* ── LED Indicator ──────────────────────────────────── */
  .led {
    width: 10px; height: 10px;
    border-radius: 50%;
    animation: pulse-led 2s ease-in-out infinite;
  }
  .led-red    { background: var(--status-high);   box-shadow: var(--glow-red); }
  .led-amber  { background: var(--status-medium); box-shadow: var(--glow-amber); }
  .led-green  { background: var(--status-low);    box-shadow: var(--glow-green); }
  .led-blue   { background: var(--status-info);   box-shadow: 0 0 10px 2px rgba(30,144,255,0.6); }

  /* ── Sidebar ────────────────────────────────────────── */
  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.85rem;
    border-radius: 10px;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-secondary);
    transition: all 200ms ease;
    text-decoration: none;
  }
  .sidebar-link:hover {
    color: var(--text-primary);
    box-shadow: var(--shadow-card);
    background: var(--chassis);
  }
  .sidebar-link.active {
    color: var(--accent);
    box-shadow: var(--shadow-recess);
    background: var(--chassis);
  }

  /* ── Vent Slots ─────────────────────────────────────── */
  .vent-slots {
    display: flex;
    gap: 3px;
  }
  .vent-slot {
    width: 3px; height: 20px;
    border-radius: 9999px;
    background: var(--muted);
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.12);
  }

  /* ── Risk Bar ───────────────────────────────────────── */
  .risk-bar-track {
    height: 6px;
    background: var(--muted);
    border-radius: 9999px;
    box-shadow: var(--shadow-recess);
    overflow: hidden;
  }
  .risk-bar-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 600ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  /* ── Dark Panel (stats strip) ───────────────────────── */
  .panel-dark {
    background: var(--surface-dark);
    border-radius: 16px;
    box-shadow: 8px 8px 24px rgba(0,0,0,0.35), -2px -2px 8px rgba(255,255,255,0.05);
    position: relative;
    overflow: hidden;
  }
  .panel-dark::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
    pointer-events: none;
  }

  /* ── Animations ─────────────────────────────────────── */
  @keyframes pulse-led {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.55; }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scan-line {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  .animate-slide-up { animation: slide-up 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

  /* ── Scrollbar ──────────────────────────────────────── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--muted); border-radius: 3px; }
  ::-webkit-scrollbar-thumb { background: #a3b1c6; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #8896aa; }
}
```


2. TAILWIND CONFIG — tailwind.config.js
--------------------------------------------------------------------------------
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        chassis:  '#e0e5ec',
        panel:    '#eaecf0',
        muted:    '#d1d9e6',
        'surface-dark':   '#2d3436',
        'surface-darker': '#1e2527',
        accent:   '#ff4757',
        'risk-high':   '#ff4757',
        'risk-medium': '#ffa502',
        'risk-low':    '#2ed573',
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", 'system-ui', 'sans-serif'],
        mono: ["'IBM Plex Mono'", 'monospace'],
      },
      boxShadow: {
        card:    '8px 8px 16px #babecc, -8px -8px 16px #ffffff',
        float:   '12px 12px 24px #babecc, -12px -12px 24px #ffffff, inset 1px 1px 0 rgba(255,255,255,0.5)',
        press:   'inset 6px 6px 12px #babecc, inset -6px -6px 12px #ffffff',
        recess:  'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff',
        'glow-red':   '0 0 12px 3px rgba(255,71,87,0.55)',
        'glow-amber': '0 0 12px 3px rgba(255,165,2,0.55)',
        'glow-green': '0 0 12px 3px rgba(46,213,115,0.55)',
      },
      borderRadius: {
        sm:  '4px',
        md:  '8px',
        lg:  '16px',
        xl:  '24px',
        '2xl': '30px',
      },
      animation: {
        'pulse-led': 'pulse-led 2s ease-in-out infinite',
        'slide-up':  'slide-up 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
```


3. FONT — index.html
--------------------------------------------------------------------------------
Replace the Google Fonts link:
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```
WHY IBM PLEX: Designed by Bold Monday for IBM — it IS industrial. Perfect for
a system that processes data and makes technical predictions. The Mono variant
gives every number (risk scores, attendance %, SHAP values) an instrument-panel
readout feel.


4. LAYOUT COMPONENT — Layout.tsx
--------------------------------------------------------------------------------
The sidebar becomes a CONTROL PANEL. Dark background, monospace labels,
LED status indicators per nav item, vent slots as decoration.

Key structural changes:
  • Sidebar bg: var(--surface-dark) — dark chassis, not white
  • Nav labels: font-mono uppercase tracking-widest
  • Active link: recessed shadow (pushed IN, not highlighted out)
  • System status panel at bottom with green LED "SYSTEM ONLINE"
  • Logo: SPPS with monospace lettering and blinking LED
  • Right side: var(--chassis) light background — the "workspace"


5. COMPONENT-BY-COMPONENT MAPPING
--------------------------------------------------------------------------------

StatCard → "Instrument Gauge"
  - Dark panel (.panel-dark) with glowing number in accent/status color
  - Monospace value (font-mono text-3xl font-bold)
  - Uppercase label (text-[10px] tracking-[0.12em] text-text-muted)
  - Colored LED dot top-right matching the metric's status
  - Corner screws via ::before

RiskBadge → "Status LED with Label"
  - Pulsing LED dot + monospace uppercase text
  - Recessed pill background (shadow-recess)
  - Already defined as .risk-badge-high/medium/low

RiskBar → "Fuel/Level Gauge"
  - Recessed track (shadow-recess)
  - Fill with gradient: red→amber→green based on value
  - Monospace percentage at right

Teacher's at-risk table → "Mission Control Readout"
  - Dark header row (surface-dark background, light text)
  - Each row: left border colored by risk level (border-l-4)
  - Hover: shadow-card elevation, slight translate-x-1
  - Action button: btn-primary with SHAP icon

Student Dashboard course cards → "Patient Vitals Monitor"
  - Grouped metrics in recessed sections (shadow-recess)
  - Risk score as large monospace number with glow
  - Week trend chart embedded in card

Login Page → "System Authentication Terminal"
  - Full dark background (surface-darker)
  - Central terminal-style card with scanline overlay effect
  - "SPPS v1.0 — AUTHENTICATION REQUIRED" header in mono
  - Input fields: deep recessed wells
  - Submit: full-width accent button "AUTHENTICATE →"
  - Quick-login chips as monospace ghost buttons


6. PAGE-LEVEL DESIGN DECISIONS
--------------------------------------------------------------------------------

ADMIN DASHBOARD:
  - Top row: 4 dark instrument gauges (panel-dark) with colored LEDs
  - Second row: Risk pie chart + trend line chart both in card with vent slots top-right
  - Alert list: dark left border per risk level, mono timestamps

TEACHER DASHBOARD:
  - Course selector: recessed dropdown (input-field style)
  - Trend chart: on dark panel for contrast
  - At-risk table: dark header, row risk coloring via left border

STUDENT DASHBOARD:
  - Soft risk alert banner: full-width dark panel with pulsing LED
  - Course cards in 2-col grid with embedded sparkline
  - Recommendations as recessed list items with colored LED bullets

COUNSELLOR DASHBOARD:
  - Filter tabs: neumorphic pill group (active = recessed, inactive = raised)
  - Alert cards: left border + LED + monospace timestamps
  - Resolve button: green accent (break from red — positive action)


7. ANIMATION GUIDELINES FOR SPPS
--------------------------------------------------------------------------------
Keep mechanical and purposeful — this is monitoring software, not a game:

  • Page entry:    .animate-slide-up with stagger (50ms per element)
  • Risk score:    Count-up animation on mount (from 0 to value, 800ms)
  • LED pulse:     pulse-led always on for high-risk indicators
  • Button press:  translateY(2px) + shadow-press (150ms)
  • Card hover:    -translate-y-0.5 + shadow-float (250ms)
  • Chart bars:    Recharts built-in animation (isAnimationActive=true)
  • Risk bar:      Width transition 600ms with spring easing


8. WHAT NOT TO DO
--------------------------------------------------------------------------------
  ✗ No gradients on the main background (noise texture + flat chassis instead)
  ✗ No colorful gradient cards (all cards are chassis-colored, color is in LEDs)
  ✗ No rounded pill nav items — active links are RECESSED not highlighted
  ✗ No generic Inter/Roboto — IBM Plex only
  ✗ No floating box-shadows with blur only — always dual (dark+light neumorphic)
  ✗ No emoji in the UI — use lucide-react icons only
  ✗ Don't shrink the font-mono text below 10px — legibility is non-negotiable
  ✗ No white backgrounds — the lightest surface is var(--chassis) #e0e5ec


9. FILES TO MODIFY (in order)
--------------------------------------------------------------------------------
1. frontend/index.html                 — font link
2. frontend/src/index.css              — entire CSS (replace with section 1)
3. frontend/tailwind.config.js         — replace with section 2
4. frontend/src/components/shared/Layout.tsx    — sidebar redesign
5. frontend/src/components/shared/index.tsx     — StatCard, RiskBadge, RiskBar
6. frontend/src/pages/LoginPage.tsx    — terminal auth design
7. frontend/src/pages/TeacherDashboard.tsx      — mission control table
8. frontend/src/pages/StudentDashboard.tsx      — vitals monitor cards
9. frontend/src/pages/AdminDashboard.tsx        — instrument gauges
10. frontend/src/pages/CounsellorDashboard.tsx  — kanban intervention board
11. frontend/src/pages/StudentDetail.tsx        — SHAP factor gauge bars

================================================================================
