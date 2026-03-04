import { useState, useEffect, useMemo, useCallback } from "react";

/* ============================================================
   DESIGN SYSTEM — Dark Grey + Dark Navy Dashboard
   ============================================================ */
const C = {
  bg: "#0d1117",
  surface: "#161b22",
  surface2: "#1c2333",
  surface3: "#21262d",
  border: "#30363d",
  border2: "#3d444d",
  navy: "#0d1b2e",
  navyLight: "#112240",
  accent: "#58a6ff",
  accentDim: "#1f6feb",
  green: "#3fb950",
  greenDim: "#238636",
  yellow: "#d29922",
  red: "#f85149",
  redDim: "#da3633",
  purple: "#bc8cff",
  text: "#e6edf3",
  textMuted: "#7d8590",
  textDim: "#484f58",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${C.surface}; }
  ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 3px; }
  input, select, button { font-family: 'DM Sans', sans-serif; }
  .tab-btn { background: none; border: none; cursor: pointer; transition: all 0.2s; }
  .tab-btn:hover { opacity: 0.8; }
  .icon-btn { background: none; border: none; cursor: pointer; transition: all 0.15s; opacity: 0.6; }
  .icon-btn:hover { opacity: 1; }
  .card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 12px; }
  .card2 { background: ${C.surface2}; border: 1px solid ${C.border}; border-radius: 10px; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .fade-in { animation: fadeIn 0.25s ease forwards; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
`;

/* ============================================================
   CONFIG
   ============================================================ */
const INITIAL_BALANCE = 3200000;
const MIN_DAILY = 600000;
const MAX_DAILY = 1200000;
const STORAGE_KEY = "gf_financial_v4";
const TODAY = "2026-03-03";
const LEBARAN_DATE = "2026-03-20";

const PHASES = [
  {
    id: 1,
    label: "Beli IEM + Mouse + Mousepad",
    color: C.green,
    startDate: "2026-03-03",
    endDate: "2026-03-03",
  },
  {
    id: 2,
    label: "Farming & Nabung",
    color: C.yellow,
    startDate: "2026-03-04",
    endDate: "2026-03-09",
  },
  {
    id: 3,
    label: "Beli Kursi",
    color: C.purple,
    startDate: "2026-03-10",
    endDate: "2026-03-10",
  },
  {
    id: 4,
    label: "Jaga Tagihan Maret",
    color: C.red,
    startDate: "2026-03-11",
    endDate: "2026-03-20",
  },
  {
    id: 5,
    label: "Nabung ke Target",
    color: C.accent,
    startDate: "2026-03-21",
    endDate: "2026-04-05",
  },
  {
    id: 6,
    label: "Beli PC",
    color: C.purple,
    startDate: "2026-04-06",
    endDate: "2026-04-07",
  },
  {
    id: 7,
    label: "HP + Reward",
    color: C.textMuted,
    startDate: "2026-04-08",
    endDate: "2026-04-30",
  },
];

const SCHEDULED_EVENTS = {
  "2026-03-03": [
    { icon: "💵", label: "Tarik cash", amount: -400000 },
    { icon: "🎧", label: "IEM+Mouse+Mousepad", amount: -1100000 },
  ],
  "2026-03-06": [{ icon: "🎮", label: "WoW Sub", amount: -160000 }],
  "2026-03-08": [{ icon: "💵", label: "Tarik cash", amount: -400000 }],
  "2026-03-10": [{ icon: "🪑", label: "Beli Kursi", amount: -1800000 }],
  "2026-03-13": [{ icon: "💵", label: "Tarik cash", amount: -400000 }],
  "2026-03-15": [{ icon: "📶", label: "Wifi+Kuota+Music", amount: -410000 }],
  "2026-03-18": [{ icon: "💵", label: "Tarik cash", amount: -400000 }],
  "2026-03-20": [
    { icon: "💡", label: "Air+Listrik", amount: -150000 },
    { icon: "🎉", label: "Lebaran", amount: -700000 },
  ],
  "2026-03-23": [{ icon: "💵", label: "Tarik cash", amount: -400000 }],
  "2026-03-28": [{ icon: "💵", label: "Tarik cash", amount: -400000 }],
  "2026-04-02": [{ icon: "💵", label: "Tarik cash", amount: -400000 }],
  "2026-04-03": [
    { icon: "🎮", label: "WoW Sub", amount: -160000 },
    { icon: "👩", label: "Ibu", amount: -200000 },
  ],
  "2026-04-07": [{ icon: "💵", label: "Tarik cash", amount: -400000 }],
  "2026-04-12": [{ icon: "💵", label: "Tarik cash", amount: -400000 }],
  "2026-04-15": [{ icon: "📶", label: "Wifi+Kuota+Music", amount: -410000 }],
  "2026-04-17": [{ icon: "💵", label: "Tarik cash", amount: -400000 }],
  "2026-04-20": [{ icon: "💡", label: "Air+Listrik", amount: -150000 }],
  "2026-04-22": [{ icon: "💵", label: "Tarik cash", amount: -400000 }],
  "2026-04-27": [{ icon: "💵", label: "Tarik cash", amount: -400000 }],
};

const URGENCY = {
  high: { label: "🔴 Urgent", color: C.red },
  mid: { label: "🟡 Normal", color: C.yellow },
  low: { label: "🟢 Santai", color: C.green },
};
const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS_CONFIG = [
  { name: "Maret 2026", year: 2026, month: 2 },
  { name: "April 2026", year: 2026, month: 3 },
];

/* ============================================================
   UTILS
   ============================================================ */
function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function getPhase(dateStr) {
  return PHASES.find((p) => dateStr >= p.startDate && dateStr <= p.endDate);
}

function fmtRp(n, compact = false) {
  const abs = Math.abs(n);
  if (compact) {
    if (abs >= 1000000) return `${(abs / 1000000).toFixed(1)}jt`;
    if (abs >= 1000) return `${Math.round(abs / 1000)}k`;
    return abs.toString();
  }
  return abs.toLocaleString("id-ID");
}

function fmtInput(val) {
  const num = val.replace(/\D/g, "");
  if (!num) return "";
  return parseInt(num, 10).toLocaleString("id-ID");
}

function parseInput(val) {
  return parseInt(val.replace(/\D/g, ""), 10) || 0;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round(
    (new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000
  );
}

/* ============================================================
   SMART TIMELINE — hitung kapan tiap item bisa dibeli
   ============================================================ */
function computeTimeline(items, currentBalance, dailyForecast, targetPegangan) {
  if (!items.length) return [];

  const sorted = [...items].sort((a, b) => a.priority - b.priority);
  const results = [];
  let simBalance = currentBalance;
  let simDate = TODAY;

  for (const item of sorted) {
    const needed = item.price + targetPegangan;
    if (simBalance >= needed) {
      results.push({
        ...item,
        buyDate: simDate,
        daysAway: 0,
        simBalanceBefore: simBalance,
      });
      simBalance -= item.price;
      continue;
    }

    // Walk forward day by day accounting for scheduled expenses
    let tempBal = simBalance;
    let tempDate = simDate;
    let days = 0;
    const MAX_DAYS = 120;

    while (tempBal < needed && days < MAX_DAYS) {
      tempDate = addDays(tempDate, 1);
      tempBal += dailyForecast;
      const scheduled = SCHEDULED_EVENTS[tempDate] || [];
      scheduled.forEach((e) => {
        tempBal += e.amount;
      });
      days++;
    }

    results.push({
      ...item,
      buyDate: tempDate,
      daysAway: days,
      simBalanceBefore: tempBal,
    });
    simBalance = tempBal - item.price;
    simDate = tempDate;
  }

  return results;
}

/* ============================================================
   GANTT CHART
   ============================================================ */
function GanttChart({ timeline, currentBalance }) {
  if (!timeline.length)
    return (
      <div
        style={{
          textAlign: "center",
          padding: 40,
          color: C.textMuted,
          fontSize: 13,
        }}
      >
        Tambah item di bawah untuk melihat timeline
      </div>
    );

  const startDate = TODAY;
  const endDate = timeline[timeline.length - 1].buyDate || addDays(TODAY, 30);
  const totalDays = Math.max(daysBetween(startDate, endDate) + 5, 30);
  const barW = 700;
  const rowH = 44;
  const labelW = 160;
  const svgH = timeline.length * rowH + 40;

  const dayX = (d) => labelW + (daysBetween(startDate, d) / totalDays) * barW;
  const todayX = dayX(TODAY);

  // Month markers
  const markers = [];
  let cur = new Date(startDate + "T00:00:00");
  const end = new Date(addDays(endDate, 5) + "T00:00:00");
  while (cur <= end) {
    const ds = cur.toISOString().slice(0, 10);
    if (cur.getDate() === 1) {
      markers.push({
        x: dayX(ds),
        label: cur.toLocaleDateString("id-ID", {
          month: "short",
          year: "2-digit",
        }),
      });
    }
    cur.setDate(cur.getDate() + 7);
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${labelW + barW + 20} ${svgH}`}
        width="100%"
        style={{ minWidth: 560, fontFamily: "'DM Sans',sans-serif" }}
      >
        {/* Grid lines */}
        {markers.map((m, i) => (
          <line
            key={i}
            x1={m.x}
            y1={30}
            x2={m.x}
            y2={svgH}
            stroke={C.border}
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        ))}
        {markers.map((m, i) => (
          <text key={i} x={m.x + 4} y={20} fontSize="10" fill={C.textDim}>
            {m.label}
          </text>
        ))}

        {/* Today line */}
        <line
          x1={todayX}
          y1={24}
          x2={todayX}
          y2={svgH}
          stroke={C.accent}
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />
        <text
          x={todayX + 3}
          y={20}
          fontSize="9"
          fill={C.accent}
          fontWeight="700"
        >
          HARI INI
        </text>

        {/* Rows */}
        {timeline.map((item, i) => {
          const y = 30 + i * rowH;
          const urgency = URGENCY[item.urgency] || URGENCY.mid;
          const bx = dayX(item.buyDate);
          const dotR = 6;

          // Accumulation bar from today to buy date
          const barStart = Math.min(todayX, bx);
          const barEnd = Math.max(todayX, bx);
          const barLen = barEnd - barStart;

          return (
            <g key={item.id}>
              {/* Label */}
              <text
                x={4}
                y={y + 14}
                fontSize="11"
                fill={C.text}
                fontWeight="500"
                style={{ dominantBaseline: "middle" }}
              >
                {item.name.length > 18
                  ? item.name.slice(0, 17) + "…"
                  : item.name}
              </text>
              <text x={4} y={y + 27} fontSize="9" fill={urgency.color}>
                {urgency.label} · Rp {fmtRp(item.price, true)}
              </text>

              {/* Accumulation track */}
              <rect
                x={labelW}
                y={y + 10}
                width={barW}
                height={16}
                rx="4"
                fill={C.surface3}
              />

              {/* Progress bar */}
              {barLen > 0 && (
                <rect
                  x={barStart}
                  y={y + 10}
                  width={barLen}
                  height={16}
                  rx="4"
                  fill={item.daysAway === 0 ? C.greenDim : C.accentDim}
                  opacity="0.7"
                />
              )}

              {/* Buy dot */}
              <circle
                cx={bx}
                cy={y + 18}
                r={dotR}
                fill={item.daysAway === 0 ? C.green : urgency.color}
              />
              <text
                x={bx + 9}
                y={y + 22}
                fontSize="10"
                fill={item.daysAway === 0 ? C.green : C.textMuted}
              >
                {item.daysAway === 0
                  ? "✓ Bisa beli!"
                  : `~${item.buyDate.slice(5).replace("-", "/")} (${
                      item.daysAway
                    }h)`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ============================================================
   LINE CHART
   ============================================================ */
function LineChart({ datasets, height = 140 }) {
  if (!datasets || datasets.every((d) => !d.data.length))
    return (
      <div
        style={{
          color: C.textMuted,
          fontSize: 12,
          padding: 20,
          textAlign: "center",
        }}
      >
        Belum ada data
      </div>
    );

  const allVals = datasets.flatMap((d) => d.data);
  const max = Math.max(...allVals);
  const min = Math.min(...allVals);
  const range = max - min || 1;
  const W = 700,
    H = height,
    PAD = 6;

  const px = (i, len) => PAD + (i / (len - 1 || 1)) * (W - PAD * 2);
  const py = (v) => H - PAD - ((v - min) / range) * (H - PAD * 2);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ borderRadius: 8, background: C.surface3 }}
    >
      {[0, 0.5, 1].map((t, i) => {
        const v = min + t * range;
        const y = py(v);
        return (
          <g key={i}>
            <line
              x1={PAD}
              y1={y}
              x2={W - PAD}
              y2={y}
              stroke={C.border}
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text x={PAD + 2} y={y - 3} fontSize="9" fill={C.textDim}>
              {fmtRp(v, true)}
            </text>
          </g>
        );
      })}
      {datasets.map((ds, di) => {
        const pts = ds.data
          .map((v, i) => `${px(i, ds.data.length)},${py(v)}`)
          .join(" ");
        return (
          <g key={di}>
            <polyline
              fill="none"
              stroke={ds.color}
              strokeWidth="2.5"
              points={pts}
              opacity={ds.opacity || 1}
            />
            {ds.data.length <= 30 &&
              ds.data.map((v, i) => (
                <circle
                  key={i}
                  cx={px(i, ds.data.length)}
                  cy={py(v)}
                  r="2.5"
                  fill={ds.color}
                  opacity={ds.opacity || 1}
                />
              ))}
          </g>
        );
      })}
    </svg>
  );
}

/* ============================================================
   PROGRESS BAR
   ============================================================ */
function ProgressBar({ label, current, target, color, sublabel }) {
  const pct = Math.min(
    100,
    Math.round((Math.max(0, current) / Math.max(1, target)) * 100)
  );
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <span style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
        <span
          style={{
            fontSize: 12,
            color,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono',monospace",
          }}
        >
          {pct}% · Rp {fmtRp(Math.min(current, target))} / Rp {fmtRp(target)}
        </span>
      </div>
      <div
        style={{
          background: C.surface3,
          borderRadius: 20,
          height: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            background: color,
            height: "100%",
            borderRadius: 20,
            transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
      {sublabel && (
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TOOLTIP
   ============================================================ */
function Tooltip({ events, visible }) {
  if (!visible || !events?.length) return null;
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 999,
        bottom: "110%",
        left: "50%",
        transform: "translateX(-50%)",
        background: C.navy,
        border: `1px solid ${C.border2}`,
        borderRadius: 10,
        padding: "8px 12px",
        minWidth: 190,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        pointerEvents: "none",
      }}
    >
      {events.map((e, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 11,
            color: C.text,
            marginBottom: i < events.length - 1 ? 4 : 0,
          }}
        >
          <span style={{ color: C.textMuted }}>
            {e.icon} {e.label}
          </span>
          <span
            style={{
              fontWeight: 700,
              color: e.amount < 0 ? C.red : C.green,
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            {e.amount < 0 ? "-" : "+"}Rp {fmtRp(Math.abs(e.amount), true)}
          </span>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          bottom: -5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 10,
          height: 10,
          background: C.navy,
          border: `1px solid ${C.border2}`,
          borderTop: "none",
          borderLeft: "none",
          rotate: "45deg",
        }}
      />
    </div>
  );
}

/* ============================================================
   DAY CELL
   ============================================================ */
function DayCell({
  d,
  dateStr,
  phase,
  scheduledEvents,
  entryEvents,
  activePhase,
  setActivePhase,
  isToday,
  isLebaran,
}) {
  const [hovered, setHovered] = useState(false);
  const allEvents = [...(scheduledEvents || []), ...(entryEvents || [])];
  const dim = activePhase !== null && phase?.id !== activePhase;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() =>
        phase && setActivePhase(activePhase === phase.id ? null : phase.id)
      }
      style={{
        position: "relative",
        borderRadius: 8,
        padding: "5px 3px",
        minHeight: 52,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: isLebaran
          ? "#2d1f00"
          : isToday
          ? C.navyLight
          : phase
          ? `${phase.color}12`
          : C.surface3,
        border: `1.5px solid ${
          isToday
            ? C.accent
            : isLebaran
            ? "#d29922"
            : phase
            ? activePhase === phase.id
              ? phase.color
              : `${phase.color}40`
            : C.border
        }`,
        cursor: allEvents.length || phase ? "pointer" : "default",
        opacity: dim ? 0.2 : 1,
        transition: "all 0.15s",
        transform: hovered && allEvents.length ? "scale(1.1)" : "scale(1)",
        boxShadow: isToday
          ? `0 0 0 1px ${C.accent}`
          : hovered && allEvents.length
          ? "0 4px 16px rgba(0,0,0,0.4)"
          : "none",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: isToday ? 900 : 600,
          color: isLebaran ? "#d29922" : phase ? phase.color : C.textDim,
          fontFamily: "'JetBrains Mono',monospace",
        }}
      >
        {d}
      </span>
      {isToday && (
        <span
          style={{
            fontSize: 6,
            background: C.accent,
            color: C.bg,
            borderRadius: 3,
            padding: "0 2px",
            fontWeight: 800,
            letterSpacing: 0.5,
          }}
        >
          NOW
        </span>
      )}
      {isLebaran && <span style={{ fontSize: 8 }}>🎉</span>}
      {allEvents.slice(0, 2).map((e, i) => (
        <span key={i} style={{ fontSize: 9, lineHeight: 1.1 }}>
          {e.icon}
        </span>
      ))}
      {allEvents.length > 2 && (
        <span style={{ fontSize: 7, color: C.textDim }}>
          +{allEvents.length - 2}
        </span>
      )}
      <Tooltip events={allEvents} visible={hovered && allEvents.length > 0} />
    </div>
  );
}

/* ============================================================
   MONTH CALENDAR
   ============================================================ */
function MonthCalendar({
  name,
  year,
  month,
  balances,
  activePhase,
  setActivePhase,
  entryMap,
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="card" style={{ padding: 16, marginBottom: 16 }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: C.text,
          marginBottom: 12,
          textAlign: "center",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {name}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 4,
        }}
      >
        {DAYS_ID.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 9,
              fontWeight: 700,
              color: C.textDim,
              paddingBottom: 4,
              letterSpacing: 1,
            }}
          >
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = toDateStr(year, month, d);
          const phase = getPhase(dateStr);
          const scheduledEvents = SCHEDULED_EVENTS[dateStr] || [];
          const entryEvents = (entryMap[dateStr] || []).map((e) => ({
            icon: e.type === "income" ? "📈" : "📉",
            label: e.label,
            amount: e.amount,
          }));
          return (
            <DayCell
              key={i}
              d={d}
              dateStr={dateStr}
              phase={phase}
              scheduledEvents={scheduledEvents}
              entryEvents={entryEvents}
              activePhase={activePhase}
              setActivePhase={setActivePhase}
              isToday={dateStr === TODAY}
              isLebaran={dateStr === LEBARAN_DATE}
            />
          );
        })}
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: 9,
          color: C.textDim,
          marginTop: 10,
        }}
      >
        Hover hari → tooltip · Klik → highlight fase
      </div>
    </div>
  );
}

/* ============================================================
   ENTRY FORM
   ============================================================ */
function EntryForm({ onSave, entries }) {
  const [date, setDate] = useState(TODAY);
  const [type, setType] = useState("income");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [warning, setWarning] = useState("");

  const handleAmountChange = (e) => setAmount(fmtInput(e.target.value));

  const save = () => {
    if (!date || !label || !amount) return;
    const existing = entries.filter((e) => e.date === date && e.type === type);
    if (existing.length > 0) {
      setWarning(
        `Sudah ada ${existing.length} entry ${type} di tanggal ini. Lanjut?`
      );
      return;
    }
    doSave();
  };

  const doSave = () => {
    onSave({
      id: Date.now(),
      date,
      type,
      label,
      amount: type === "income" ? parseInput(amount) : -parseInput(amount),
    });
    setLabel("");
    setAmount("");
    setWarning("");
  };

  const inputStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${C.border2}`,
    background: C.surface3,
    color: C.text,
    fontSize: 13,
    outline: "none",
  };

  return (
    <div className="card" style={{ padding: 16 }}>
      <div
        style={{
          fontSize: 12,
          color: C.textMuted,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        ➕ Tambah Transaksi
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setWarning("");
          }}
          style={{ ...inputStyle, colorScheme: "dark" }}
        />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setWarning("");
          }}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="income">📈 Income</option>
          <option value="expense">📉 Expense</option>
        </select>
        <input
          placeholder="Deskripsi"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 140 }}
        />
        <input
          placeholder="Jumlah"
          value={amount}
          onChange={handleAmountChange}
          inputMode="numeric"
          style={{
            ...inputStyle,
            width: 150,
            fontFamily: "'JetBrains Mono',monospace",
          }}
        />
        <button
          onClick={save}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            background: C.greenDim,
            color: "white",
            border: `1px solid ${C.green}`,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
            transition: "all 0.15s",
          }}
        >
          Simpan
        </button>
      </div>
      {warning && (
        <div
          style={{
            marginTop: 10,
            background: `${C.yellow}18`,
            border: `1px solid ${C.yellow}60`,
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            color: C.yellow,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>⚠️ {warning}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={doSave}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                background: C.yellow,
                color: C.bg,
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Lanjut
            </button>
            <button
              onClick={() => setWarning("")}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                background: C.surface3,
                color: C.textMuted,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ENTRY LIST
   ============================================================ */
function EntryList({ entries, onDelete, onEdit }) {
  const [editId, setEditId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const startEdit = (e) => {
    setEditId(e.id);
    setEditLabel(e.label);
    setEditAmount(fmtRp(Math.abs(e.amount)));
  };
  const saveEdit = (entry) => {
    onEdit({
      ...entry,
      label: editLabel,
      amount:
        entry.type === "income"
          ? parseInput(editAmount)
          : -parseInput(editAmount),
    });
    setEditId(null);
  };

  if (!entries.length)
    return (
      <div
        style={{
          color: C.textMuted,
          fontSize: 12,
          padding: 16,
          textAlign: "center",
        }}
      >
        Belum ada transaksi.
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        maxHeight: 360,
        overflowY: "auto",
        paddingRight: 4,
      }}
    >
      {[...entries]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((e) => (
          <div
            key={e.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: C.surface3,
              padding: "8px 12px",
              borderRadius: 10,
              border: `1px solid ${C.border}`,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: C.textDim,
                minWidth: 82,
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {e.date}
            </span>
            <span
              style={{
                fontSize: 10,
                background: e.type === "income" ? `${C.green}22` : `${C.red}22`,
                color: e.type === "income" ? C.green : C.red,
                borderRadius: 20,
                padding: "1px 8px",
                fontWeight: 700,
                minWidth: 36,
                textAlign: "center",
              }}
            >
              {e.type === "income" ? "IN" : "OUT"}
            </span>
            {editId === e.id ? (
              <>
                <input
                  value={editLabel}
                  onChange={(ev) => setEditLabel(ev.target.value)}
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: `1px solid ${C.border2}`,
                    background: C.surface,
                    color: C.text,
                    fontSize: 12,
                  }}
                />
                <input
                  value={editAmount}
                  onChange={(ev) => setEditAmount(fmtInput(ev.target.value))}
                  inputMode="numeric"
                  style={{
                    width: 110,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: `1px solid ${C.border2}`,
                    background: C.surface,
                    color: C.text,
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                />
                <button
                  onClick={() => saveEdit(e)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: C.greenDim,
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                  }}
                >
                  ✓
                </button>
                <button
                  onClick={() => setEditId(null)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: C.surface,
                    color: C.textMuted,
                    border: `1px solid ${C.border}`,
                    cursor: "pointer",
                    fontSize: 11,
                  }}
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: 12, color: C.text }}>
                  {e.label}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: e.amount >= 0 ? C.green : C.red,
                    fontFamily: "'JetBrains Mono',monospace",
                    minWidth: 80,
                    textAlign: "right",
                  }}
                >
                  {e.amount >= 0 ? "+" : "-"}Rp{" "}
                  {fmtRp(Math.abs(e.amount), true)}
                </span>
                <button
                  className="icon-btn"
                  onClick={() => startEdit(e)}
                  style={{ color: C.accent, fontSize: 13 }}
                >
                  ✏️
                </button>
                <button
                  className="icon-btn"
                  onClick={() => onDelete(e.id)}
                  style={{ color: C.red, fontSize: 13 }}
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}
    </div>
  );
}

/* ============================================================
   RENCANA BELI — item manager + gantt
   ============================================================ */
function RencanaBeli({ currentBalance, dailyForecast, targetPegangan }) {
  const [items, setItems] = useState(() => {
    try {
      const s = localStorage.getItem("gf_items_v4");
      return s
        ? JSON.parse(s)
        : [
            {
              id: 1,
              name: "PC Bekas",
              price: 5000000,
              urgency: "high",
              priority: 1,
            },
            {
              id: 2,
              name: "HP Kamu",
              price: 2000000,
              urgency: "mid",
              priority: 2,
            },
            {
              id: 3,
              name: "HP Ayah",
              price: 2000000,
              urgency: "mid",
              priority: 3,
            },
            {
              id: 4,
              name: "CS2 Prime",
              price: 250000,
              urgency: "low",
              priority: 4,
            },
            {
              id: 5,
              name: "Deskmate",
              price: 100000,
              urgency: "low",
              priority: 5,
            },
          ];
    } catch {
      return [];
    }
  });

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [urgency, setUrgency] = useState("mid");

  useEffect(() => {
    try {
      localStorage.setItem("gf_items_v4", JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = () => {
    if (!name || !price) return;
    const p = parseInput(price);
    const newPri = Math.max(0, ...items.map((i) => i.priority)) + 1;
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name, price: p, urgency, priority: newPri },
    ]);
    setName("");
    setPrice("");
  };

  const deleteItem = (id) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const movePriority = (id, dir) => {
    setItems((prev) => {
      const sorted = [...prev].sort((a, b) => a.priority - b.priority);
      const idx = sorted.findIndex((i) => i.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= sorted.length) return prev;
      const temp = sorted[idx].priority;
      sorted[idx].priority = sorted[newIdx].priority;
      sorted[newIdx].priority = temp;
      return sorted;
    });
  };

  const timeline = useMemo(
    () =>
      computeTimeline(
        [...items].sort((a, b) => a.priority - b.priority),
        currentBalance,
        dailyForecast,
        targetPegangan
      ),
    [items, currentBalance, dailyForecast, targetPegangan]
  );

  const inputStyle = {
    padding: "7px 11px",
    borderRadius: 8,
    border: `1px solid ${C.border2}`,
    background: C.surface3,
    color: C.text,
    fontSize: 12,
    outline: "none",
  };

  return (
    <div className="fade-in">
      {/* Gantt */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            color: C.textMuted,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          📊 Timeline Pembelian
        </div>
        <GanttChart timeline={timeline} currentBalance={currentBalance} />
      </div>

      {/* Item list */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            color: C.textMuted,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          🛒 Daftar Item ({items.length})
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {[...items]
            .sort((a, b) => a.priority - b.priority)
            .map((item, idx) => {
              const u = URGENCY[item.urgency] || URGENCY.mid;
              const tl = timeline.find((t) => t.id === item.id);
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: C.surface3,
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <button
                      className="icon-btn"
                      onClick={() => movePriority(item.id, -1)}
                      style={{
                        color: C.textMuted,
                        fontSize: 10,
                        lineHeight: 1,
                      }}
                    >
                      ▲
                    </button>
                    <span
                      style={{
                        fontSize: 10,
                        color: C.textDim,
                        textAlign: "center",
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <button
                      className="icon-btn"
                      onClick={() => movePriority(item.id, 1)}
                      style={{
                        color: C.textMuted,
                        fontSize: 10,
                        lineHeight: 1,
                      }}
                    >
                      ▼
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 13, color: C.text, fontWeight: 500 }}
                    >
                      {item.name}
                    </div>
                    <div style={{ fontSize: 10, color: C.textDim }}>
                      <span style={{ color: u.color }}>{u.label}</span>
                      {tl && (
                        <span
                          style={{
                            marginLeft: 8,
                            color: tl.daysAway === 0 ? C.green : C.textMuted,
                          }}
                        >
                          {tl.daysAway === 0
                            ? "✓ Bisa beli sekarang!"
                            : `~${tl.buyDate.slice(5).replace("-", "/")} (${
                                tl.daysAway
                              } hari lagi)`}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 12,
                      color: C.text,
                      fontFamily: "'JetBrains Mono',monospace",
                      minWidth: 70,
                      textAlign: "right",
                    }}
                  >
                    Rp {fmtRp(item.price, true)}
                  </span>
                  <button
                    className="icon-btn"
                    onClick={() => deleteItem(item.id)}
                    style={{ color: C.red, fontSize: 13 }}
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
        </div>

        {/* Add form */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            paddingTop: 12,
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <input
            placeholder="Nama item"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: 120 }}
          />
          <input
            placeholder="Harga"
            value={price}
            onChange={(e) => setPrice(fmtInput(e.target.value))}
            inputMode="numeric"
            style={{
              ...inputStyle,
              width: 130,
              fontFamily: "'JetBrains Mono',monospace",
            }}
          />
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="high">🔴 Urgent</option>
            <option value="mid">🟡 Normal</option>
            <option value="low">🟢 Santai</option>
          </select>
          <button
            onClick={addItem}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              background: C.accentDim,
              color: "white",
              border: `1px solid ${C.accent}`,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            + Tambah
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ANALITIK TAB
   ============================================================ */
function Analitik({
  entries,
  currentBalance,
  dailyForecast,
  targetPegangan,
  targetNabung,
  setTargetPegangan,
  setTargetNabung,
}) {
  const [peganganInput, setPeganganInput] = useState(fmtRp(targetPegangan));
  const [nabungInput, setNabungInput] = useState(fmtRp(targetNabung));
  const [editTargets, setEditTargets] = useState(false);

  const avgDynamic = useMemo(() => {
    const inc = entries
      .filter((e) => e.type === "income")
      .slice(-7)
      .map((e) => e.amount);
    if (inc.length >= 3) {
      const avg = inc.reduce((a, b) => a + b, 0) / inc.length;
      return Math.min(MAX_DAILY, Math.max(MIN_DAILY, Math.round(avg)));
    }
    return MIN_DAILY;
  }, [entries]);

  const worstForecast = Math.round(dailyForecast * 0.7);

  const proj30 = useMemo(() => {
    let b = currentBalance;
    return Array.from({ length: 30 }, () => {
      b += dailyForecast;
      return b;
    });
  }, [currentBalance, dailyForecast]);
  const worst30 = useMemo(() => {
    let b = currentBalance;
    return Array.from({ length: 30 }, () => {
      b += worstForecast;
      return b;
    });
  }, [currentBalance, worstForecast]);
  const histData = useMemo(() => {
    let b = INITIAL_BALANCE;
    return entries
      .sort((a, c) => a.date.localeCompare(c.date))
      .map((e) => {
        b += e.amount;
        return b;
      });
  }, [entries]);

  const phaseStats = useMemo(
    () =>
      PHASES.map((ph) => {
        const pe = entries.filter(
          (e) => e.date >= ph.startDate && e.date <= ph.endDate
        );
        const inc = pe
          .filter((e) => e.type === "income")
          .reduce((a, b) => a + b.amount, 0);
        const exp = pe
          .filter((e) => e.type === "expense")
          .reduce((a, b) => a + Math.abs(b.amount), 0);
        return { ...ph, inc, exp, net: inc - exp, count: pe.length };
      }),
    [entries]
  );

  const saveTargets = () => {
    const p = Math.max(1, parseInput(peganganInput));
    const n = Math.max(1, parseInput(nabungInput));
    setTargetPegangan(p);
    setTargetNabung(n);
    setPeganganInput(fmtRp(p));
    setNabungInput(fmtRp(n));
    setEditTargets(false);
  };

  const daysTo = (target) =>
    target <= currentBalance
      ? 0
      : Math.ceil((target - currentBalance) / Math.max(1, dailyForecast));

  const inputStyle = {
    padding: "6px 10px",
    borderRadius: 8,
    border: `1px solid ${C.border2}`,
    background: C.surface3,
    color: C.text,
    fontSize: 13,
    fontFamily: "'JetBrains Mono',monospace",
    outline: "none",
    width: 160,
  };

  return (
    <div className="fade-in">
      {/* Target editor */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: C.textMuted,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            🎯 Target
          </div>
          <button
            onClick={() => setEditTargets(!editTargets)}
            style={{
              fontSize: 11,
              color: C.accent,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {editTargets ? "✕ Batal" : "✏️ Edit"}
          </button>
        </div>
        {editTargets ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "flex-end",
            }}
          >
            <div>
              <div
                style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}
              >
                🛡️ Pegangan minimum
              </div>
              <input
                value={peganganInput}
                onChange={(e) => setPeganganInput(fmtInput(e.target.value))}
                inputMode="numeric"
                style={inputStyle}
              />
            </div>
            <div>
              <div
                style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}
              >
                💰 Target nabung (sebelum PC)
              </div>
              <input
                value={nabungInput}
                onChange={(e) => setNabungInput(fmtInput(e.target.value))}
                inputMode="numeric"
                style={inputStyle}
              />
            </div>
            <button
              onClick={saveTargets}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                background: C.greenDim,
                color: "white",
                border: `1px solid ${C.green}`,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Simpan
            </button>
          </div>
        ) : (
          <>
            <ProgressBar
              label="🛡️ Pegangan Minimum"
              current={Math.min(currentBalance, targetPegangan)}
              target={targetPegangan}
              color={C.green}
              sublabel={
                daysTo(targetPegangan) === 0
                  ? "✅ Tercapai!"
                  : `Estimasi ${daysTo(targetPegangan)} hari lagi`
              }
            />
            <ProgressBar
              label="💰 Target Nabung (sebelum PC)"
              current={Math.min(currentBalance, targetNabung)}
              target={targetNabung}
              color={C.accent}
              sublabel={
                daysTo(targetNabung) === 0
                  ? "✅ Tercapai!"
                  : `Estimasi ${daysTo(targetNabung)} hari lagi`
              }
            />
          </>
        )}
      </div>

      {/* Proyeksi */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            color: C.textMuted,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          🔮 Proyeksi 30 Hari
        </div>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12 }}>
          Normal: Rp {fmtRp(dailyForecast, true)}/hari · Worst case -30%: Rp{" "}
          {fmtRp(worstForecast, true)}/hari
        </div>
        <LineChart
          datasets={[
            { data: proj30, color: C.green, opacity: 1 },
            { data: worst30, color: C.red, opacity: 0.7 },
          ]}
        />
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: C.green }}>● Normal</span>
          <span style={{ fontSize: 11, color: C.red }}>
            ● Worst Case (-30%)
          </span>
        </div>
      </div>

      {/* Historis */}
      {histData.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div
            style={{
              fontSize: 12,
              color: C.textMuted,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            📊 Grafik Historis
          </div>
          <LineChart datasets={[{ data: histData, color: C.accent }]} />
        </div>
      )}

      {/* Phase analytics */}
      <div className="card" style={{ padding: 16 }}>
        <div
          style={{
            fontSize: 12,
            color: C.textMuted,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          📈 Performa Fase
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {phaseStats.map((p) => (
            <div
              key={p.id}
              style={{
                background: C.surface3,
                borderRadius: 10,
                padding: "10px 14px",
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: p.count > 0 ? 8 : 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: p.color,
                    }}
                  />
                  <div>
                    <div
                      style={{ fontSize: 12, color: C.text, fontWeight: 600 }}
                    >
                      F{p.id} · {p.label}
                    </div>
                    <div style={{ fontSize: 10, color: C.textDim }}>
                      {p.startDate} s/d {p.endDate} · {p.count} transaksi
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: p.net >= 0 ? C.green : C.red,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {p.net >= 0 ? "+" : "-"}Rp {fmtRp(Math.abs(p.net), true)}
                </span>
              </div>
              {p.count > 0 && (
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      background: C.surface,
                      borderRadius: 6,
                      padding: "4px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 9, color: C.textDim }}>Income</div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.green,
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      +{fmtRp(p.inc, true)}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: C.surface,
                      borderRadius: 6,
                      padding: "4px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 9, color: C.textDim }}>Expense</div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.red,
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      -{fmtRp(p.exp, true)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [entries, setEntries] = useState([]);
  const [forecastMode, setForecastMode] = useState("dynamic");
  const [activePhase, setActivePhase] = useState(null);
  const [tab, setTab] = useState("kalender");
  const [targetPegangan, setTargetPegangan] = useState(5000000);
  const [targetNabung, setTargetNabung] = useState(7000000);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) {
        const d = JSON.parse(s);
        setEntries(d.entries || []);
        setTargetPegangan(d.targetPegangan || 5000000);
        setTargetNabung(d.targetNabung || 7000000);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ entries, targetPegangan, targetNabung })
      );
    } catch {}
  }, [entries, targetPegangan, targetNabung]);

  const handleSave = (e) =>
    setEntries((prev) =>
      [...prev, e].sort((a, b) => a.date.localeCompare(b.date))
    );
  const handleDelete = (id) =>
    setEntries((prev) => prev.filter((e) => e.id !== id));
  const handleEdit = (u) =>
    setEntries((prev) =>
      prev
        .map((e) => (e.id === u.id ? u : e))
        .sort((a, b) => a.date.localeCompare(b.date))
    );

  const { balances, entryMap } = useMemo(() => {
    let bal = INITIAL_BALANCE;
    const bMap = {},
      eMap = {};
    [...entries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((e) => {
        bal += e.amount;
        bMap[e.date] = bal;
        if (!eMap[e.date]) eMap[e.date] = [];
        eMap[e.date].push(e);
      });
    return { balances: bMap, entryMap: eMap };
  }, [entries]);

  const currentBalance = Object.values(balances).pop() ?? INITIAL_BALANCE;

  const avgDynamic = useMemo(() => {
    const inc = entries
      .filter((e) => e.type === "income")
      .slice(-7)
      .map((e) => e.amount);
    if (inc.length >= 3) {
      const avg = inc.reduce((a, b) => a + b, 0) / inc.length;
      return Math.min(MAX_DAILY, Math.max(MIN_DAILY, Math.round(avg)));
    }
    return MIN_DAILY;
  }, [entries]);

  const dailyForecast =
    forecastMode === "conservative"
      ? MIN_DAILY
      : forecastMode === "aggressive"
      ? MAX_DAILY
      : avgDynamic;

  const TABS = [
    { id: "kalender", label: "Kalender" },
    { id: "transaksi", label: "Transaksi" },
    { id: "rencana", label: "Rencana Beli" },
    { id: "analitik", label: "Analitik" },
  ];

  return (
    <>
      <style>{css}</style>
      <div
        style={{
          maxWidth: 780,
          margin: "0 auto",
          padding: "20px 16px",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              color: C.textDim,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "'JetBrains Mono',monospace",
              marginBottom: 4,
            }}
          >
            Gold Farmer
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.text,
              letterSpacing: -0.5,
            }}
          >
            Financial OS
          </h1>
        </div>

        {/* BALANCE CARD */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
            border: `1px solid ${C.border2}`,
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 16,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `${C.accent}08`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -20,
              right: 40,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `${C.green}06`,
            }}
          />
          <div
            style={{
              fontSize: 11,
              color: C.textMuted,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Saldo Saat Ini
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: currentBalance >= targetPegangan ? C.green : C.yellow,
              fontFamily: "'JetBrains Mono',monospace",
              letterSpacing: -1,
            }}
          >
            Rp {fmtRp(currentBalance)}
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: C.textDim }}>
                Forecast / hari
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: C.text,
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                Rp {fmtRp(dailyForecast, true)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.textDim }}>Mode</div>
              <select
                value={forecastMode}
                onChange={(e) => setForecastMode(e.target.value)}
                style={{
                  fontSize: 12,
                  background: "none",
                  border: "none",
                  color: C.accent,
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "'DM Sans',sans-serif",
                  outline: "none",
                }}
              >
                <option value="dynamic">Dynamic</option>
                <option value="conservative">Konservatif</option>
                <option value="aggressive">Agresif</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.textDim }}>Transaksi</div>
              <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>
                {entries.length}
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 4,
            marginBottom: 20,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              className="tab-btn"
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 600,
                background: tab === t.id ? C.surface3 : "none",
                color: tab === t.id ? C.text : C.textMuted,
                border:
                  tab === t.id
                    ? `1px solid ${C.border2}`
                    : "1px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {tab === "kalender" && (
          <div className="fade-in">
            {/* Phase legend */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginBottom: 14,
              }}
            >
              {PHASES.map((p) => (
                <div
                  key={p.id}
                  onClick={() =>
                    setActivePhase(activePhase === p.id ? null : p.id)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 10px",
                    borderRadius: 20,
                    cursor: "pointer",
                    background:
                      activePhase === p.id ? `${p.color}18` : C.surface,
                    border: `1.5px solid ${
                      activePhase === p.id ? p.color : C.border
                    }`,
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: p.color,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: activePhase === p.id ? p.color : C.textMuted,
                    }}
                  >
                    F{p.id}: {p.label}
                  </span>
                </div>
              ))}
            </div>
            {MONTHS_CONFIG.map((m) => (
              <MonthCalendar
                key={m.name}
                {...m}
                balances={balances}
                activePhase={activePhase}
                setActivePhase={setActivePhase}
                entryMap={entryMap}
              />
            ))}
          </div>
        )}

        {tab === "transaksi" && (
          <div className="fade-in">
            <div style={{ marginBottom: 16 }}>
              <EntryForm onSave={handleSave} entries={entries} />
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  color: C.textMuted,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                📋 Riwayat ({entries.length})
              </div>
              <EntryList
                entries={entries}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          </div>
        )}

        {tab === "rencana" && (
          <RencanaBeli
            currentBalance={currentBalance}
            dailyForecast={dailyForecast}
            targetPegangan={targetPegangan}
          />
        )}

        {tab === "analitik" && (
          <Analitik
            entries={entries}
            currentBalance={currentBalance}
            dailyForecast={dailyForecast}
            targetPegangan={targetPegangan}
            targetNabung={targetNabung}
            setTargetPegangan={setTargetPegangan}
            setTargetNabung={setTargetNabung}
          />
        )}
      </div>
    </>
  );
}
