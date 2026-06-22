import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { CalEvent, DayData, Overnight } from "../types";

const OVERNIGHTS: {
  value: Overnight;
  label: string;
  bg: string;
  border: string;
  text: string;
}[] = [
  {
    value: "lissi",
    label: "Lissi",
    bg: "bg-pink-50",
    border: "border-pink-400",
    text: "text-pink-800",
  },
  {
    value: "babs",
    label: "Babs",
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-800",
  },
];

interface Props {
  dateKey: string;
  day: DayData;
  onClose: () => void;
  onSetOvernight: (o: Overnight | undefined) => void;
  onToggleFamilyDay: () => void;
  onAddEvent: (e: Omit<CalEvent, "id">) => void;
  onRemoveEvent: (id: string) => void;
  onSetNote: (n: string) => void;
}

export default function DaySheet({
  dateKey,
  day,
  onClose,
  onSetOvernight,
  onToggleFamilyDay,
  onAddEvent,
  onRemoveEvent,
  onSetNote,
}: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [note, setNote] = useState(day.note ?? "");
  const [addingEvent, setAddingEvent] = useState(false);

  const date = parseISO(dateKey);

  function handleAddEvent() {
    if (!newTitle.trim()) return;
    onAddEvent({ title: newTitle.trim(), time: newTime || undefined });
    setNewTitle("");
    setNewTime("");
    setAddingEvent(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl px-4 pt-3 pb-8 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-3" />

        <p className="font-semibold text-gray-800 mb-4">
          {format(date, "EEEE, d MMMM")}
        </p>

        {/* Overnight */}
        <section className="mb-5">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">
            Overnight
          </p>
          <div className="grid grid-cols-2 gap-2">
            {OVERNIGHTS.map((o) => {
              const active = day.overnight === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => onSetOvernight(active ? undefined : o.value)}
                  className={`py-2 rounded-xl text-sm border transition-all ${
                    active
                      ? `${o.bg} ${o.border} ${o.text} font-medium`
                      : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Family day toggle */}
        <section className="mb-5">
          <button
            onClick={onToggleFamilyDay}
            className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl border text-sm transition-all ${
              day.familyDay
                ? "bg-purple-50 border-purple-400 text-purple-800 font-medium"
                : "bg-gray-50 border-gray-200 text-gray-500"
            }`}
          >
            <span>Family day</span>
            <span className="text-base">{day.familyDay ? "✓" : ""}</span>
          </button>
        </section>

        {/* Events */}
        <section className="mb-5">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">
            Events
          </p>
          {day.events.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-2"
            >
              {ev.time && (
                <span className="text-xs text-gray-400 min-w-[36px]">
                  {ev.time}
                </span>
              )}
              <span className="text-sm text-gray-700 flex-1">{ev.title}</span>
              <button
                onClick={() => onRemoveEvent(ev.id)}
                className="text-gray-300 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}

          {addingEvent ? (
            <div className="bg-gray-50 rounded-xl px-3 py-2 space-y-2">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Event title"
                className="w-full text-sm bg-transparent outline-none"
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddEvent}
                  className="text-xs text-blue-500 font-medium"
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingEvent(false)}
                  className="text-xs text-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingEvent(true)}
              className="text-xs text-gray-400 mt-1"
            >
              + add event
            </button>
          )}
        </section>

        {/* Note */}
        <section>
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">
            Note
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => onSetNote(note)}
            placeholder="Add a note…"
            rows={3}
            className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none resize-none border border-transparent focus:border-gray-200"
          />
        </section>
      </div>
    </div>
  );
}
