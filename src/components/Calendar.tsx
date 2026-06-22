import { useState } from "react";
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
  const { getDay, setOvernight, setFamilyDay, addEvent, removeEvent, setNote } =
    useCalendar();

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  const selectedDay = selectedKey ? getDay(selectedKey) : null;

  return (
    <div className="max-w-sm mx-auto min-h-screen flex flex-col bg-white">

      {/* Top banner */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-3 border-b border-gray-100">
        <img src="/fam.png" alt="" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="font-semibold text-gray-800 text-sm leading-tight">Lissi & Babs</p>
          <p className="text-xs text-gray-400">Otis's family calendar</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="ml-auto text-xs text-gray-300"
        >
          Sign out
        </button>
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
                ${inMonth ? overnightStyle : "bg-white border-gray-50 opacity-30"}
                ${selected ? "ring-2 ring-gray-400 ring-offset-1" : ""}
              `}
            >
              <span
                className={`text-[10px] font-medium w-5 h-5 flex items-center justify-center rounded-full ${
                  today ? "bg-gray-800 text-white" : "text-gray-700"
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
