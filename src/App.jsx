import { useState, useEffect, useMemo } from "react";

/* ============================================================
   DESIGN SYSTEM
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
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:${C.surface}}
  ::-webkit-scrollbar-thumb{background:${C.border2};border-radius:3px}
  input,select,button{font-family:'DM Sans',sans-serif}
  .tab-btn{background:none;border:none;cursor:pointer;transition:all 0.2s}
  .icon-btn{background:none;border:none;cursor:pointer;transition:all 0.15s;opacity:0.6}
  .icon-btn:hover{opacity:1}
  .card{background:${C.surface};border:1px solid ${C.border};border-radius:12px}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fadeIn 0.25s ease forwards}
`;

/* ============================================================
   CONFIG
   ============================================================ */
const INITIAL_BALANCE = 3200000;
const MIN_DAILY = 600000;
const MAX_DAILY = 1200000;
const STORAGE_KEY = "gf_v5";
const TODAY = "2026-03-03";

const DEFAULT_PHASES = [
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

const DEFAULT_BILLS = [
  {
    id: "b1",
    icon: "🎮",
    label: "WoW Sub",
    amount: 160000,
    recurring: true,
    dayOfMonth: 6,
    everyNDays: null,
    startDate: null,
    specificDate: null,
  },
  {
    id: "b2",
    icon: "💵",
    label: "Tarik cash",
    amount: 400000,
    recurring: true,
    dayOfMonth: null,
    everyNDays: 5,
    startDate: "2026-03-03",
    specificDate: null,
  },
  {
    id: "b3",
    icon: "📶",
    label: "Wifi+Kuota+Music",
    amount: 410000,
    recurring: true,
    dayOfMonth: 15,
    everyNDays: null,
    startDate: null,
    specificDate: null,
  },
  {
    id: "b4",
    icon: "💡",
    label: "Air+Listrik",
    amount: 150000,
    recurring: true,
    dayOfMonth: 20,
    everyNDays: null,
    startDate: null,
    specificDate: null,
  },
  {
    id: "b5",
    icon: "👩",
    label: "Ibu",
    amount: 200000,
    recurring: true,
    dayOfMonth: 3,
    everyNDays: null,
    startDate: null,
    specificDate: null,
  },
  {
    id: "b6",
    icon: "🎉",
    label: "Lebaran Ponakan",
    amount: 700000,
    recurring: false,
    dayOfMonth: null,
    everyNDays: null,
    startDate: null,
    specificDate: "2026-03-20",
  },
];

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
function addDays(ds, n) {
  const d = new Date(ds + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round(
    (new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000
  );
}
function fmtRp(n, compact = false) {
  const abs = Math.abs(n);
  if (compact) {
    if (abs >= 1000000) return `${(abs / 1000000).toFixed(1)}jt`;
    if (abs >= 1000) return `${Math.round(abs / 1000)}k`;
    return String(abs);
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
function getPhase(ds, phases) {
  return phases.find((p) => ds >= p.startDate && ds <= p.endDate);
}

/* ============================================================
   BUILD SCHEDULED MAP from bills
   ============================================================ */
function buildScheduledMap(bills, from, to) {
  const map = {};
  const add = (ds, ev) => {
    if (!map[ds]) map[ds] = [];
    map[ds].push(ev);
  };
  let cur = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  while (cur <= end) {
    const ds = cur.toISOString().slice(0, 10),
      dom = cur.getDate();
    for (const b of bills) {
      if (!b.recurring && b.specificDate === ds) {
        add(ds, {
          icon: b.icon,
          label: b.label,
          amount: -b.amount,
          billId: b.id,
        });
        continue;
      }
      if (b.recurring && b.dayOfMonth && b.dayOfMonth === dom) {
        add(ds, {
          icon: b.icon,
          label: b.label,
          amount: -b.amount,
          billId: b.id,
        });
        continue;
      }
      if (b.recurring && b.everyNDays && b.startDate) {
        const diff = daysBetween(b.startDate, ds);
        if (diff >= 0 && diff % b.everyNDays === 0)
          add(ds, {
            icon: b.icon,
            label: b.label,
            amount: -b.amount,
            billId: b.id,
          });
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return map;
}

/* ============================================================
   COMPUTE TIMELINE
   ============================================================ */
function computeTimeline(
  items,
  currentBalance,
  dailyForecast,
  targetPegangan,
  scheduledMap
) {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => a.priority - b.priority);
  const results = [];
  let simBal = currentBalance,
    simDate = TODAY,
    totalDays = 0;
  for (const item of sorted) {
    const needed = item.price + targetPegangan;
    if (simBal >= needed) {
      results.push({
        ...item,
        buyDate: simDate,
        daysAway: totalDays,
        simBalanceBefore: simBal,
      });
      simBal -= item.price;
      continue;
    }
    let tb = simBal,
      td = simDate,
      walked = 0;
    while (tb < needed && walked < 365) {
      td = addDays(td, 1);
      tb += dailyForecast;
      (scheduledMap[td] || []).forEach((e) => {
        tb += e.amount;
      });
      walked++;
    }
    totalDays += walked;
    results.push({
      ...item,
      buyDate: td,
      daysAway: totalDays,
      simBalanceBefore: tb,
    });
    simBal = tb - item.price;
    simDate = td;
  }
  return results;
}

/* ============================================================
   CASCADE PHASES
   ============================================================ */
function cascadePhases(phases, changedId, newStart, newEnd) {
  const sorted = [...phases].sort((a, b) => a.id - b.id);
  const idx = sorted.findIndex((p) => p.id === changedId);
  if (idx < 0) return phases;
  const dur = (p) => daysBetween(p.startDate, p.endDate);
  const updated = sorted.map((p) => ({ ...p }));
  updated[idx].startDate = newStart;
  updated[idx].endDate = newEnd;
  for (let i = idx + 1; i < updated.length; i++) {
    const d = dur(updated[i]),
      ns = addDays(updated[i - 1].endDate, 1);
    updated[i].startDate = ns;
    updated[i].endDate = addDays(ns, d);
  }
  return updated;
}

/* ============================================================
   LINE CHART
   ============================================================ */
function LineChart({ datasets, height = 140 }) {
  const [tip, setTip] = useState(null);
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
  const allV = datasets.flatMap((d) => d.data),
    mx = Math.max(...allV),
    mn = Math.min(...allV),
    rng = mx - mn || 1;
  const W = 700,
    H = height,
    P = 16;
  const px = (i, l) => P + (i / (l - 1 || 1)) * (W - P * 2);
  const py = (v) => H - P - ((v - mn) / rng) * (H - P * 2);
  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ borderRadius: 8, background: C.surface3, cursor: "crosshair" }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect(),
            mx2 = ((e.clientX - r.left) / r.width) * W;
          const l = datasets[0].data.length,
            idx = Math.max(
              0,
              Math.min(l - 1, Math.round(((mx2 - P) / (W - P * 2)) * (l - 1)))
            );
          setTip({
            x: px(idx, l),
            idx,
            vals: datasets.map((ds) => ds.data[idx]),
          });
        }}
        onMouseLeave={() => setTip(null)}
      >
        {[0, 0.5, 1].map((t, i) => {
          const v = mn + t * rng,
            y = py(v);
          return (
            <g key={i}>
              <line
                x1={P}
                y1={y}
                x2={W - P}
                y2={y}
                stroke={C.border}
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <text x={P + 2} y={y - 3} fontSize="9" fill={C.textDim}>
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
              {ds.data.length <= 60 &&
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
        {tip && (
          <g>
            <line
              x1={tip.x}
              y1={P}
              x2={tip.x}
              y2={H - P}
              stroke={C.border2}
              strokeWidth="1"
              strokeDasharray="3,2"
            />
            {datasets.map(
              (ds, di) =>
                tip.vals[di] != null && (
                  <circle
                    key={di}
                    cx={tip.x}
                    cy={py(tip.vals[di])}
                    r="5"
                    fill={ds.color}
                    stroke={C.bg}
                    strokeWidth="2"
                  />
                )
            )}
          </g>
        )}
      </svg>
      {tip && (
        <div
          style={{
            position: "absolute",
            top: 6,
            left: `${Math.min((tip.x / 700) * 100, 65)}%`,
            background: C.navy,
            border: `1px solid ${C.border2}`,
            borderRadius: 8,
            padding: "6px 10px",
            pointerEvents: "none",
            zIndex: 10,
            minWidth: 130,
          }}
        >
          {datasets.map(
            (ds, di) =>
              tip.vals[di] != null && (
                <div
                  key={di}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: ds.color }}>●</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: C.text,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    Rp {fmtRp(tip.vals[di])}
                  </span>
                </div>
              )
          )}
        </div>
      )}
    </div>
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
  const tIn = events
    .filter((e) => e.amount > 0)
    .reduce((a, e) => a + e.amount, 0);
  const tOut = events
    .filter((e) => e.amount < 0)
    .reduce((a, e) => a + e.amount, 0);
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
        minWidth: 200,
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
            marginBottom: 4,
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
      {events.length > 1 && (
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            marginTop: 4,
            paddingTop: 5,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 10, color: C.textDim, fontWeight: 700 }}>
            TOTAL
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {tIn > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.green,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                +{fmtRp(tIn, true)}
              </span>
            )}
            {tOut < 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.red,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                -{fmtRp(Math.abs(tOut), true)}
              </span>
            )}
          </div>
        </div>
      )}
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
  dailyActual,
}) {
  const [hov, setHov] = useState(false);
  const all = [...(scheduledEvents || []), ...(entryEvents || [])];
  const dim = activePhase !== null && phase?.id !== activePhase;
  const hit = dailyActual != null && dailyActual >= MIN_DAILY;
  const miss =
    dailyActual != null && dailyActual > 0 && dailyActual < MIN_DAILY;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
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
        cursor: all.length || phase ? "pointer" : "default",
        opacity: dim ? 0.2 : 1,
        transition: "all 0.15s",
        transform: hov && all.length ? "scale(1.1)" : "scale(1)",
        boxShadow: isToday
          ? `0 0 0 1px ${C.accent}`
          : hov && all.length
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
      {hit && <span style={{ fontSize: 8 }}>✅</span>}
      {miss && <span style={{ fontSize: 8 }}>⚠️</span>}
      {!hit &&
        !miss &&
        all.slice(0, 2).map((e, i) => (
          <span key={i} style={{ fontSize: 9, lineHeight: 1.1 }}>
            {e.icon}
          </span>
        ))}
      {all.length > 2 && (
        <span style={{ fontSize: 7, color: C.textDim }}>+{all.length - 2}</span>
      )}
      <Tooltip events={all} visible={hov && all.length > 0} />
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
  scheduledMap,
  activePhase,
  setActivePhase,
  entryMap,
  phases,
  dailyIncomeMap,
}) {
  const first = new Date(year, month, 1).getDay(),
    dim = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
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
          const ds = toDateStr(year, month, d),
            phase = getPhase(ds, phases);
          return (
            <DayCell
              key={i}
              d={d}
              dateStr={ds}
              phase={phase}
              scheduledEvents={scheduledMap[ds] || []}
              entryEvents={(entryMap[ds] || []).map((e) => ({
                icon: e.type === "income" ? "📈" : "📉",
                label: e.label,
                amount: e.amount,
              }))}
              activePhase={activePhase}
              setActivePhase={setActivePhase}
              isToday={ds === TODAY}
              isLebaran={ds === "2026-03-20"}
              dailyActual={dailyIncomeMap[ds]}
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
        Hover → detail · Klik → highlight fase · ✅ hit target · ⚠️ miss
      </div>
    </div>
  );
}

/* ============================================================
   ENTRY FORM
   ============================================================ */
function EntryForm({ onSave, entries }) {
  const [date, setDate] = useState(TODAY),
    [type, setType] = useState("income"),
    [label, setLabel] = useState(""),
    [amount, setAmount] = useState(""),
    [source, setSource] = useState(""),
    [warn, setWarn] = useState("");
  const inp = {
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${C.border2}`,
    background: C.surface3,
    color: C.text,
    fontSize: 13,
    outline: "none",
  };
  const doSave = () => {
    onSave({
      id: Date.now(),
      date,
      type,
      label,
      source: type === "income" ? source : "",
      amount: type === "income" ? parseInput(amount) : -parseInput(amount),
    });
    setLabel("");
    setAmount("");
    setSource("");
    setWarn("");
  };
  const save = () => {
    if (!date || !label || !amount) return;
    if (entries.filter((e) => e.date === date && e.type === type).length > 0) {
      setWarn(`Sudah ada entry ${type} di tanggal ini. Lanjut?`);
      return;
    }
    doSave();
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
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}
      >
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setWarn("");
          }}
          style={{ ...inp, colorScheme: "dark" }}
        />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setWarn("");
          }}
          style={{ ...inp, cursor: "pointer" }}
        >
          <option value="income">📈 Income</option>
          <option value="expense">📉 Expense</option>
        </select>
        <input
          placeholder="Deskripsi"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ ...inp, flex: 1, minWidth: 130 }}
        />
        {type === "income" && (
          <input
            placeholder="Sumber (opsional)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={{ ...inp, minWidth: 110 }}
          />
        )}
        <input
          placeholder="Jumlah"
          value={amount}
          onChange={(e) => setAmount(fmtInput(e.target.value))}
          inputMode="numeric"
          style={{
            ...inp,
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
          }}
        >
          Simpan
        </button>
      </div>
      {warn && (
        <div
          style={{
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
          <span>⚠️ {warn}</span>
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
              onClick={() => setWarn("")}
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
  const [eid, setEid] = useState(null),
    [elabel, setElabel] = useState(""),
    [eamt, setEamt] = useState("");
  const start = (e) => {
    setEid(e.id);
    setElabel(e.label);
    setEamt(fmtRp(Math.abs(e.amount)));
  };
  const save = (e) => {
    onEdit({
      ...e,
      label: elabel,
      amount: e.type === "income" ? parseInput(eamt) : -parseInput(eamt),
    });
    setEid(null);
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
              }}
            >
              {e.type === "income" ? "IN" : "OUT"}
            </span>
            {e.source && (
              <span
                style={{
                  fontSize: 9,
                  color: C.accent,
                  background: `${C.accent}18`,
                  borderRadius: 10,
                  padding: "1px 6px",
                }}
              >
                {e.source}
              </span>
            )}
            {eid === e.id ? (
              <>
                <input
                  value={elabel}
                  onChange={(ev) => setElabel(ev.target.value)}
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
                  value={eamt}
                  onChange={(ev) => setEamt(fmtInput(ev.target.value))}
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
                  onClick={() => save(e)}
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
                  onClick={() => setEid(null)}
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
                  onClick={() => start(e)}
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
   BILLS MANAGER
   ============================================================ */
function BillsManager({ bills, setBills }) {
  const [label, setLabel] = useState(""),
    [amount, setAmount] = useState(""),
    [icon, setIcon] = useState("💸"),
    [dom, setDom] = useState(""),
    [recur, setRecur] = useState(true),
    [specDate, setSpecDate] = useState("");
  const inp = {
    padding: "7px 10px",
    borderRadius: 8,
    border: `1px solid ${C.border2}`,
    background: C.surface3,
    color: C.text,
    fontSize: 12,
    outline: "none",
  };
  const add = () => {
    if (!label || !amount) return;
    setBills((prev) => [
      ...prev,
      {
        id: "b" + Date.now(),
        icon,
        label,
        amount: parseInput(amount),
        recurring: recur,
        dayOfMonth: recur && dom ? parseInt(dom) : null,
        everyNDays: null,
        startDate: null,
        specificDate: !recur ? specDate : null,
      },
    ]);
    setLabel("");
    setAmount("");
    setDom("");
    setSpecDate("");
  };
  return (
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
        🧾 Tagihan Terjadwal
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 12,
        }}
      >
        {bills.map((b) => (
          <div
            key={b.id}
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
            <span style={{ fontSize: 14 }}>{b.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>
                {b.label}
              </div>
              <div style={{ fontSize: 10, color: C.textDim }}>
                {b.recurring && b.dayOfMonth
                  ? `Tgl ${b.dayOfMonth} tiap bulan`
                  : ""}
                {b.recurring && b.everyNDays
                  ? `Setiap ${b.everyNDays} hari`
                  : ""}
                {!b.recurring && b.specificDate
                  ? `Sekali: ${b.specificDate}`
                  : ""}
              </div>
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 12,
                color: C.red,
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              -Rp {fmtRp(b.amount, true)}
            </span>
            <button
              className="icon-btn"
              onClick={() =>
                setBills((prev) => prev.filter((x) => x.id !== b.id))
              }
              style={{ color: C.red, fontSize: 13 }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>
          Tambah tagihan baru:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <input
            placeholder="Ikon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            style={{ ...inp, width: 50, textAlign: "center" }}
          />
          <input
            placeholder="Nama"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{ ...inp, flex: 1, minWidth: 110 }}
          />
          <input
            placeholder="Jumlah"
            value={amount}
            onChange={(e) => setAmount(fmtInput(e.target.value))}
            inputMode="numeric"
            style={{
              ...inp,
              width: 120,
              fontFamily: "'JetBrains Mono',monospace",
            }}
          />
          <select
            value={recur ? "r" : "o"}
            onChange={(e) => setRecur(e.target.value === "r")}
            style={{ ...inp, cursor: "pointer" }}
          >
            <option value="r">🔄 Bulanan</option>
            <option value="o">📅 Sekali</option>
          </select>
          {recur ? (
            <input
              placeholder="Tgl (1-31)"
              value={dom}
              onChange={(e) => setDom(e.target.value)}
              style={{ ...inp, width: 90 }}
            />
          ) : (
            <input
              type="date"
              value={specDate}
              onChange={(e) => setSpecDate(e.target.value)}
              style={{ ...inp, colorScheme: "dark" }}
            />
          )}
          <button
            onClick={add}
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
   PHASE MANAGER
   ============================================================ */
function PhaseManager({ phases, setPhases }) {
  const [eid, setEid] = useState(null),
    [es, setEs] = useState(""),
    [ee, setEe] = useState("");
  const inp = {
    padding: "5px 8px",
    borderRadius: 6,
    border: `1px solid ${C.border2}`,
    background: C.surface,
    color: C.text,
    fontSize: 11,
    outline: "none",
    colorScheme: "dark",
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
        📅 Fase (edit + auto-cascade)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[...phases]
          .sort((a, b) => a.id - b.id)
          .map((p) => (
            <div
              key={p.id}
              style={{
                background: C.surface3,
                borderRadius: 10,
                padding: "8px 12px",
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: eid === p.id ? 8 : 0,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: p.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>
                    F{p.id} · {p.label}
                  </div>
                  {eid !== p.id && (
                    <div
                      style={{
                        fontSize: 10,
                        color: C.textDim,
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      {p.startDate} → {p.endDate}
                    </div>
                  )}
                </div>
                {eid === p.id ? (
                  <>
                    <button
                      onClick={() => {
                        setPhases(cascadePhases(phases, p.id, es, ee));
                        setEid(null);
                      }}
                      style={{
                        padding: "3px 10px",
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
                      onClick={() => setEid(null)}
                      style={{
                        padding: "3px 10px",
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
                  <button
                    className="icon-btn"
                    onClick={() => {
                      setEid(p.id);
                      setEs(p.startDate);
                      setEe(p.endDate);
                    }}
                    style={{ color: C.accent, fontSize: 12 }}
                  >
                    ✏️
                  </button>
                )}
              </div>
              {eid === p.id && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 11, color: C.textMuted }}>Dari</span>
                  <input
                    type="date"
                    value={es}
                    onChange={(e) => setEs(e.target.value)}
                    style={inp}
                  />
                  <span style={{ fontSize: 11, color: C.textMuted }}>s/d</span>
                  <input
                    type="date"
                    value={ee}
                    onChange={(e) => setEe(e.target.value)}
                    style={inp}
                  />
                  <span style={{ fontSize: 10, color: C.textDim }}>
                    ↓ Fase berikutnya cascade otomatis
                  </span>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

/* ============================================================
   GANTT CHART
   ============================================================ */
function GanttChart({ timeline }) {
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
        Tambah item untuk melihat timeline
      </div>
    );
  const end = addDays(timeline[timeline.length - 1].buyDate, 5);
  const total = Math.max(daysBetween(TODAY, end) + 5, 30);
  const BW = 700,
    RH = 48,
    LW = 160,
    H = timeline.length * RH + 40;
  const dx = (d) => LW + (daysBetween(TODAY, d) / total) * BW,
    tx = dx(TODAY);
  const marks = [];
  let c = new Date(TODAY + "T00:00:00");
  while (c <= new Date(end + "T00:00:00")) {
    if (c.getDate() === 1)
      marks.push({
        x: dx(c.toISOString().slice(0, 10)),
        l: c.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      });
    c.setDate(c.getDate() + 7);
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${LW + BW + 20} ${H}`}
        width="100%"
        style={{ minWidth: 500, fontFamily: "'DM Sans',sans-serif" }}
      >
        {marks.map((m, i) => (
          <g key={i}>
            <line
              x1={m.x}
              y1={30}
              x2={m.x}
              y2={H}
              stroke={C.border}
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text x={m.x + 4} y={20} fontSize="10" fill={C.textDim}>
              {m.l}
            </text>
          </g>
        ))}
        <line
          x1={tx}
          y1={24}
          x2={tx}
          y2={H}
          stroke={C.accent}
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />
        <text x={tx + 3} y={20} fontSize="9" fill={C.accent} fontWeight="700">
          NOW
        </text>
        {timeline.map((item, i) => {
          const y = 30 + i * RH,
            u = URGENCY[item.urgency] || URGENCY.mid,
            bx = dx(item.buyDate);
          const bs = Math.min(tx, bx),
            bl = Math.abs(bx - tx);
          return (
            <g key={item.id}>
              <text
                x={4}
                y={y + 14}
                fontSize="11"
                fill={C.text}
                fontWeight="500"
              >
                {item.name.length > 18
                  ? item.name.slice(0, 17) + "…"
                  : item.name}
              </text>
              <text x={4} y={y + 27} fontSize="9" fill={u.color}>
                {u.label} · Rp {fmtRp(item.price, true)}
              </text>
              <rect
                x={LW}
                y={y + 10}
                width={BW}
                height={16}
                rx="4"
                fill={C.surface3}
              />
              {bl > 0 && (
                <rect
                  x={bs}
                  y={y + 10}
                  width={bl}
                  height={16}
                  rx="4"
                  fill={item.daysAway === 0 ? C.greenDim : C.accentDim}
                  opacity="0.7"
                />
              )}
              <circle
                cx={bx}
                cy={y + 18}
                r="6"
                fill={item.daysAway === 0 ? C.green : u.color}
              />
              <text
                x={bx + 10}
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
   RENCANA BELI
   ============================================================ */
function RencanaBeli({
  currentBalance,
  dailyForecast,
  targetPegangan,
  scheduledMap,
}) {
  const [items, setItems] = useState(() => {
    try {
      const s = localStorage.getItem("gf_items_v5");
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
  const [name, setName] = useState(""),
    [price, setPrice] = useState(""),
    [urgency, setUrgency] = useState("mid");
  useEffect(() => {
    try {
      localStorage.setItem("gf_items_v5", JSON.stringify(items));
    } catch {}
  }, [items]);
  useEffect(() => {
    const fn = () => {
      try {
        const s = localStorage.getItem("gf_items_v5");
        if (s) setItems(JSON.parse(s));
      } catch {}
    };
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, []);
  const add = () => {
    if (!name || !price) return;
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        price: parseInput(price),
        urgency,
        priority: Math.max(0, ...prev.map((i) => i.priority)) + 1,
      },
    ]);
    setName("");
    setPrice("");
  };
  const del = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const move = (id, dir) =>
    setItems((prev) => {
      const s = [...prev].sort((a, b) => a.priority - b.priority),
        idx = s.findIndex((i) => i.id === id),
        ni = idx + dir;
      if (ni < 0 || ni >= s.length) return prev;
      [s[idx].priority, s[ni].priority] = [s[ni].priority, s[idx].priority];
      return [...s];
    });
  const tl = useMemo(
    () =>
      computeTimeline(
        [...items].sort((a, b) => a.priority - b.priority),
        currentBalance,
        dailyForecast,
        targetPegangan,
        scheduledMap
      ),
    [items, currentBalance, dailyForecast, targetPegangan, scheduledMap]
  );
  const inp = {
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
        <GanttChart timeline={tl} />
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
              const u = URGENCY[item.urgency] || URGENCY.mid,
                t = tl.find((x) => x.id === item.id);
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
                      onClick={() => move(item.id, -1)}
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
                      onClick={() => move(item.id, 1)}
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
                      {t && (
                        <span
                          style={{
                            marginLeft: 8,
                            color: t.daysAway === 0 ? C.green : C.textMuted,
                          }}
                        >
                          {t.daysAway === 0
                            ? "✓ Bisa beli!"
                            : `~${t.buyDate.slice(5).replace("-", "/")} (${
                                t.daysAway
                              }h)`}
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
                    onClick={() => del(item.id)}
                    style={{ color: C.red, fontSize: 13 }}
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
        </div>
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
            style={{ ...inp, flex: 1, minWidth: 120 }}
          />
          <input
            placeholder="Harga"
            value={price}
            onChange={(e) => setPrice(fmtInput(e.target.value))}
            inputMode="numeric"
            style={{
              ...inp,
              width: 130,
              fontFamily: "'JetBrains Mono',monospace",
            }}
          />
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            style={{ ...inp, cursor: "pointer" }}
          >
            <option value="high">🔴 Urgent</option>
            <option value="mid">🟡 Normal</option>
            <option value="low">🟢 Santai</option>
          </select>
          <button
            onClick={add}
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
   ANALITIK
   ============================================================ */
function Analitik({
  entries,
  currentBalance,
  dailyForecast,
  targetPegangan,
  targetNabung,
  setTargetPegangan,
  setTargetNabung,
  phases,
}) {
  const [editT, setEditT] = useState(false),
    [pI, setPI] = useState(fmtRp(targetPegangan)),
    [nI, setNI] = useState(fmtRp(targetNabung));
  const worst = Math.round(dailyForecast * 0.7);
  const proj = useMemo(() => {
    let b = currentBalance;
    return Array.from({ length: 30 }, () => {
      b += dailyForecast;
      return b;
    });
  }, [currentBalance, dailyForecast]);
  const wproj = useMemo(() => {
    let b = currentBalance;
    return Array.from({ length: 30 }, () => {
      b += worst;
      return b;
    });
  }, [currentBalance, worst]);
  const hist = useMemo(() => {
    let b = INITIAL_BALANCE;
    return [...entries]
      .sort((a, c) => a.date.localeCompare(c.date))
      .map((e) => {
        b += e.amount;
        return b;
      });
  }, [entries]);

  const avgExp = useMemo(() => {
    const cut = addDays(TODAY, -30),
      r = entries.filter((e) => e.type === "expense" && e.date >= cut);
    return r.length ? Math.abs(r.reduce((a, e) => a + e.amount, 0)) : 3320000;
  }, [entries]);
  const efunds = { m3: avgExp * 3, m6: avgExp * 6, y1: avgExp * 12 };
  const moCov = currentBalance / Math.max(1, avgExp);

  const streak = useMemo(() => {
    const d = new Set(
      entries.filter((e) => e.type === "income").map((e) => e.date)
    );
    let s = 0,
      x = TODAY;
    while (d.has(x)) {
      s++;
      x = addDays(x, -1);
    }
    return s;
  }, [entries]);

  const srcBreak = useMemo(() => {
    const m = {};
    entries
      .filter((e) => e.type === "income" && e.source)
      .forEach((e) => {
        m[e.source] = (m[e.source] || 0) + e.amount;
      });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const netSnaps = useMemo(() => {
    const s = {};
    let b = INITIAL_BALANCE;
    [...entries]
      .sort((a, c) => a.date.localeCompare(c.date))
      .forEach((e) => {
        b += e.amount;
        s[e.date.slice(0, 7)] = b;
      });
    return Object.entries(s);
  }, [entries]);

  const dailyPerf = useMemo(() => {
    const m = {};
    entries
      .filter((e) => e.type === "income")
      .forEach((e) => {
        m[e.date] = (m[e.date] || 0) + e.amount;
      });
    return m;
  }, [entries]);

  const phaseStats = useMemo(
    () =>
      phases.map((ph) => {
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
    [entries, phases]
  );

  const dTo = (t) =>
    t <= currentBalance
      ? 0
      : Math.ceil((t - currentBalance) / Math.max(1, dailyForecast));
  const saveT = () => {
    setTargetPegangan(Math.max(1, parseInput(pI)));
    setTargetNabung(Math.max(1, parseInput(nI)));
    setEditT(false);
  };
  const inp = {
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
      {/* Streak + source */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 28 }}>{streak >= 3 ? "🔥" : "⚡"}</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: streak >= 3 ? C.yellow : C.accent,
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            {streak}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted }}>
            Hari farming berturut-turut
          </div>
          {streak === 0 && (
            <div style={{ fontSize: 10, color: C.red, marginTop: 4 }}>
              Belum ada income hari ini
            </div>
          )}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div
            style={{
              fontSize: 11,
              color: C.textMuted,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Income per Sumber
          </div>
          {srcBreak.length > 0 ? (
            srcBreak.slice(0, 4).map(([s, a]) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: C.text }}>{s}</span>
                <span
                  style={{
                    color: C.green,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontWeight: 700,
                  }}
                >
                  +{fmtRp(a, true)}
                </span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: 11, color: C.textDim }}>
              Isi field "Sumber" saat input income.
            </div>
          )}
        </div>
      </div>

      {/* Daily target grid */}
      {Object.keys(dailyPerf).length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div
            style={{
              fontSize: 12,
              color: C.textMuted,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            🎯 Daily Target (min Rp {fmtRp(MIN_DAILY, true)}/hari)
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Object.entries(dailyPerf)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([date, amt]) => (
                <div
                  key={date}
                  title={`${date}: Rp ${fmtRp(amt)}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    background: amt >= MIN_DAILY ? C.greenDim : `${C.red}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    color: amt >= MIN_DAILY ? C.green : C.red,
                    fontWeight: 700,
                  }}
                >
                  {date.slice(8)}
                </div>
              ))}
          </div>
          <div style={{ fontSize: 10, color: C.textDim, marginTop: 8 }}>
            {Object.values(dailyPerf).filter((v) => v >= MIN_DAILY).length}/
            {Object.keys(dailyPerf).length} hari hit target
          </div>
        </div>
      )}

      {/* Targets */}
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
            onClick={() => setEditT(!editT)}
            style={{
              fontSize: 11,
              color: C.accent,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {editT ? "✕ Batal" : "✏️ Edit"}
          </button>
        </div>
        {editT ? (
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
                🛡️ Pegangan
              </div>
              <input
                value={pI}
                onChange={(e) => setPI(fmtInput(e.target.value))}
                inputMode="numeric"
                style={inp}
              />
            </div>
            <div>
              <div
                style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}
              >
                💰 Target nabung
              </div>
              <input
                value={nI}
                onChange={(e) => setNI(fmtInput(e.target.value))}
                inputMode="numeric"
                style={inp}
              />
            </div>
            <button
              onClick={saveT}
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
                dTo(targetPegangan) === 0
                  ? "✅ Tercapai!"
                  : `~${dTo(targetPegangan)} hari lagi`
              }
            />
            <ProgressBar
              label="💰 Target Nabung (sebelum PC)"
              current={Math.min(currentBalance, targetNabung)}
              target={targetNabung}
              color={C.accent}
              sublabel={
                dTo(targetNabung) === 0
                  ? "✅ Tercapai!"
                  : `~${dTo(targetNabung)} hari lagi`
              }
            />
          </>
        )}
      </div>

      {/* Dana Darurat */}
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
          🆘 Dana Darurat
        </div>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12 }}>
          Rata-rata pengeluaran/bulan:{" "}
          <span
            style={{
              color: C.text,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            Rp {fmtRp(avgExp, true)}
          </span>
          {" · "}Saldo kamu cover{" "}
          <span
            style={{
              color: moCov >= 3 ? C.green : moCov >= 1 ? C.yellow : C.red,
              fontWeight: 700,
            }}
          >
            {moCov.toFixed(1)} bulan
          </span>
        </div>
        {[
          { label: "3 Bulan", t: efunds.m3, c: C.yellow },
          { label: "6 Bulan", t: efunds.m6, c: C.accent },
          { label: "1 Tahun", t: efunds.y1, c: C.green },
        ].map((ef) => (
          <ProgressBar
            key={ef.label}
            label={`🆘 Dana Darurat ${ef.label}`}
            current={Math.min(currentBalance, ef.t)}
            target={ef.t}
            color={ef.c}
            sublabel={
              currentBalance >= ef.t
                ? "✅ Tercapai!"
                : `Butuh +Rp ${fmtRp(ef.t - currentBalance, true)} · ~${dTo(
                    ef.t
                  )} hari`
            }
          />
        ))}
      </div>

      {/* Net worth */}
      {netSnaps.length > 0 && (
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
            📈 Net Worth per Bulan
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {netSnaps.map(([mo, val]) => (
              <div
                key={mo}
                style={{
                  background: C.surface3,
                  borderRadius: 8,
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 10, color: C.textDim }}>{mo}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.green,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  Rp {fmtRp(val, true)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          Normal: {fmtRp(dailyForecast, true)}/hari · Worst -30%:{" "}
          {fmtRp(worst, true)}/hari
        </div>
        <LineChart
          datasets={[
            { data: proj, color: C.green },
            { data: wproj, color: C.red, opacity: 0.7 },
          ]}
        />
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: C.green }}>● Normal</span>
          <span style={{ fontSize: 11, color: C.red }}>● Worst Case</span>
        </div>
      </div>

      {/* Historis */}
      {hist.length > 0 && (
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
          <LineChart datasets={[{ data: hist, color: C.accent }]} />
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
  const [phases, setPhases] = useState(DEFAULT_PHASES);
  const [bills, setBills] = useState(DEFAULT_BILLS);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) {
        const d = JSON.parse(s);
        setEntries(d.entries || []);
        setTargetPegangan(d.targetPegangan || 5000000);
        setTargetNabung(d.targetNabung || 7000000);
        if (d.phases) setPhases(d.phases);
        if (d.bills) setBills(d.bills);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ entries, targetPegangan, targetNabung, phases, bills })
      );
    } catch {}
  }, [entries, targetPegangan, targetNabung, phases, bills]);

  const handleSave = (e) =>
    setEntries((p) => [...p, e].sort((a, b) => a.date.localeCompare(b.date)));
  const handleDelete = (id) => setEntries((p) => p.filter((e) => e.id !== id));
  const handleEdit = (u) =>
    setEntries((p) =>
      p
        .map((e) => (e.id === u.id ? u : e))
        .sort((a, b) => a.date.localeCompare(b.date))
    );

  const scheduledMap = useMemo(
    () => buildScheduledMap(bills, "2026-03-01", "2026-04-30"),
    [bills]
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
  const dailyIncomeMap = useMemo(() => {
    const m = {};
    entries
      .filter((e) => e.type === "income")
      .forEach((e) => {
        m[e.date] = (m[e.date] || 0) + e.amount;
      });
    return m;
  }, [entries]);

  const handleExport = () => {
    try {
      const items = JSON.parse(localStorage.getItem("gf_items_v5") || "[]");
      const p = {
        exportedAt: new Date().toISOString(),
        version: "v5",
        entries,
        targetPegangan,
        targetNabung,
        phases,
        bills,
        items,
      };
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(p, null, 2)], { type: "application/json" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-os-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export gagal: " + e.message);
    }
  };
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (!d.entries) throw new Error("Format tidak valid");
        setEntries(d.entries || []);
        setTargetPegangan(d.targetPegangan || 5000000);
        setTargetNabung(d.targetNabung || 7000000);
        if (d.phases) setPhases(d.phases);
        if (d.bills) setBills(d.bills);
        if (d.items) {
          localStorage.setItem("gf_items_v5", JSON.stringify(d.items));
          window.dispatchEvent(new Event("storage"));
        }
        alert("✅ Data berhasil diimport!");
      } catch (err) {
        alert("Import gagal: " + err.message);
      }
    };
    r.readAsText(file);
    e.target.value = "";
  };

  const TABS = [
    { id: "kalender", label: "Kalender" },
    { id: "transaksi", label: "Transaksi" },
    { id: "rencana", label: "Rencana Beli" },
    { id: "analitik", label: "Analitik" },
    { id: "pengaturan", label: "⚙️" },
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
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
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
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleExport}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: C.surface,
                border: `1px solid ${C.border2}`,
                color: C.textMuted,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ⬇ Export
            </button>
            <label
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: C.surface,
                border: `1px solid ${C.border2}`,
                color: C.textMuted,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ⬆ Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        {/* BALANCE CARD */}
        <div
          style={{
            background: `linear-gradient(135deg,${C.navy} 0%,${C.navyLight} 100%)`,
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

        {/* CONTENT */}
        {tab === "kalender" && (
          <div className="fade-in">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginBottom: 14,
              }}
            >
              {phases.map((p) => (
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
                scheduledMap={scheduledMap}
                activePhase={activePhase}
                setActivePhase={setActivePhase}
                entryMap={entryMap}
                phases={phases}
                dailyIncomeMap={dailyIncomeMap}
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
            scheduledMap={scheduledMap}
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
            phases={phases}
          />
        )}

        {tab === "pengaturan" && (
          <div className="fade-in">
            <BillsManager bills={bills} setBills={setBills} />
            <PhaseManager phases={phases} setPhases={setPhases} />
          </div>
        )}
      </div>
    </>
  );
}
