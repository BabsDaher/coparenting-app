import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { CalEvent, CalendarData, DayData, Overnight } from "../types";

const DOC_ID = "shared";

export function useCalendar() {
  const [data, setData] = useState<CalendarData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "calendar", DOC_ID);
    const unsub = onSnapshot(ref, (snap) => {
      setData((snap.data() as CalendarData) ?? {});
      setLoading(false);
    });
    return unsub;
  }, []);

  function getDay(dateKey: string): DayData {
    return data[dateKey] ?? { events: [] };
  }

  async function setOvernight(
    dateKey: string,
    overnight: Overnight | undefined,
  ) {
    const ref = doc(db, "calendar", DOC_ID);
    await setDoc(
      ref,
      { [dateKey]: { ...getDay(dateKey), overnight: overnight ?? null } },
      { merge: true },
    );
  }

  async function addEvent(dateKey: string, event: Omit<CalEvent, "id">) {
    const day = getDay(dateKey);
    const newEvent: CalEvent = { ...event, id: crypto.randomUUID() };
    const ref = doc(db, "calendar", DOC_ID);
    await setDoc(
      ref,
      { [dateKey]: { ...day, events: [...day.events, newEvent] } },
      { merge: true },
    );
  }

  async function removeEvent(dateKey: string, eventId: string) {
    const day = getDay(dateKey);
    const ref = doc(db, "calendar", DOC_ID);
    await setDoc(
      ref,
      {
        [dateKey]: {
          ...day,
          events: day.events.filter((e) => e.id !== eventId),
        },
      },
      { merge: true },
    );
  }

  async function setNote(dateKey: string, note: string) {
    const ref = doc(db, "calendar", DOC_ID);
    await setDoc(
      ref,
      { [dateKey]: { ...getDay(dateKey), note } },
      { merge: true },
    );
  }

  return {
    data,
    loading,
    getDay,
    setOvernight,
    addEvent,
    removeEvent,
    setNote,
  };
}
