import { useState, useRef, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import type { Overnight } from "../types";
import DaySheet from "./DaySheet";
import { useCalendar } from "../hooks/useCalendar";
import { supabase } from "../supabase";

const OVERNIGHT_STYLES: Record<Overnight, string> = {
  lissi: "bg-pink-50 border-pink-200",
  babs: "bg-blue-50 border-blue-200",
};

const LEGEND = [
  { label: "Lissi", dot: "bg-pink-300" },
  { label: "Babs", dot: "bg-blue-300" },
  { label: "Family day", dot: "bg-purple-400" },
];

export default function Calendar() {
  const [month, setMonth] = useState(new Date());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const { data, getDay, refresh, setOvernight, setFamilyDay, addEvent, removeEvent, setNote } =
    useCalendar();

  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const pulling = useRef(false);
  const [pullY, setPullY] = useState(0);

  async function doRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
    pulling.current = (e.currentTarget as HTMLElement).scrollTop === 0;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!pulling.current) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullY(Math.min(delta * 0.4, 60));
  }

  async function onTouchEnd() {
    if (pullY > 40) doRefresh();
    setPullY(0);
    pulling.current = false;
  }

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  const overnightCounts = useMemo(() => {
    const monthDays = eachDayOfInterval({
      start: startOfMonth(month),
      end: endOfMonth(month),
    });
    let lissi = 0;
    let babs = 0;
    for (const day of monthDays) {
      const overnight = data[format(day, "yyyy-MM-dd")]?.overnight;
      if (overnight === "lissi") lissi++;
      else if (overnight === "babs") babs++;
    }
    return { lissi, babs };
  }, [month, data]);

  const selectedDay = selectedKey ? getDay(selectedKey) : null;

  return (
    <div
      className="max-w-sm mx-auto min-h-screen flex flex-col bg-white overflow-y-auto"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullY > 0 || refreshing) && (
        <div
          className="flex items-center justify-center text-gray-400 text-xs transition-all"
          style={{ height: refreshing ? 36 : pullY }}
        >
          {refreshing ? "Refreshing…" : pullY > 40 ? "Release to refresh" : "Pull to refresh"}
        </div>
      )}

      {/* Top banner */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-3 border-b border-gray-100">
        <img src="/fam.png" alt="" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="font-semibold text-gray-800 text-sm leading-tight">Lissi & Babs</p>
          <p className="text-xs text-gray-400">Otis's family calendar</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={doRefresh}
            disabled={refreshing}
            className="text-gray-300 text-lg leading-none disabled:opacity-40"
            aria-label="Refresh"
          >
            ↻
          </button>
          <button onClick={() => supabase.auth.signOut()} className="text-xs text-gray-300">
            Sign out
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <button onClick={() => setMonth((m) => subMonths(m, 1))} className="text-gray-400 text-2xl px-1">‹</button>
        <span className="font-semibold text-gray-800 text-sm">{format(month, "MMMM yyyy")}</span>
        <button onClick={() => setMonth((m) => addMonths(m, 1))} className="text-gray-400 text-2xl px-1">›</button>
      </div>

      {/* Legend */}
      <div className="flex gap-3 px-4 pb-2">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-sm ${l.dot}`} />
            <span className="text-[10px] text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 px-3 mb-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gray-400 font-medium py-0.5">{d}</div>
        ))}
      </div>

      {/* Grid — fixed height cells, no flex-1 */}
      <div className="grid grid-cols-7 gap-1 px-3">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayData = getDay(key);
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);
          const overnightStyle = dayData.overnight
            ? OVERNIGHT_STYLES[dayData.overnight]
            : "bg-white border-gray-100";
          const selected = selectedKey === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedKey(selected ? null : key)}
              className={`
                h-10 rounded-lg border text-left p-1 transition-all relative
                ${overnightStyle}
                ${!inMonth ? "opacity-50" : ""}
                ${selected ? "ring-2 ring-gray-400 ring-offset-1" : ""}
              `}
            >
              <span
                className={`text-[10px] font-medium w-5 h-5 flex items-center justify-center rounded-full ${
                  today ? "bg-gray-800 text-white" : inMonth ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {format(day, "d")}
              </span>
              {dayData.familyDay && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-400" />
              )}
              {dayData.events.length > 0 && (
                <div className="w-1 h-1 rounded-full bg-gray-400 mt-0.5" />
              )}
              {dayData.note && (
                <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Monthly overnight summary */}
      <div className="px-4 py-4 mt-2 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-500 mb-2">{format(month, "MMMM yyyy")}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-pink-300" />
            <span className="text-xs text-pink-800">
              Lissi — {overnightCounts.lissi} {overnightCounts.lissi === 1 ? "night" : "nights"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-blue-300" />
            <span className="text-xs text-blue-800">
              Babs — {overnightCounts.babs} {overnightCounts.babs === 1 ? "night" : "nights"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      {selectedKey && selectedDay && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedKey(null)} />
          <DaySheet
            dateKey={selectedKey}
            day={selectedDay}
            onClose={() => setSelectedKey(null)}
            onSetOvernight={(o) => setOvernight(selectedKey, o)}
            onToggleFamilyDay={() => setFamilyDay(selectedKey, !selectedDay.familyDay)}
            onAddEvent={(e) => addEvent(selectedKey, e)}
            onRemoveEvent={(id) => removeEvent(selectedKey, id)}
            onSetNote={(n) => setNote(selectedKey, n)}
          />
        </>
      )}
    </div>
  );
}
