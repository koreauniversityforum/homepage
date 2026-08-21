"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, ExternalLink, List, MapPin } from "lucide-react";
import type { SiteEvent } from "@/lib/events";

/**
 * 「곧 만날 수 있는 자리」.
 *
 * 보는 방법이 둘이다.
 *  - 목록: 한대포 일정 3건을 위에, 국회 일정 2건을 아래에 나누어 둔다.
 *  - 달력: 두 출처를 한 달에 함께 놓고 국회 일정에는 커뮤니케이션마크를 단다.
 *
 * 🔴 오늘이 며칠인지는 **보는 사람의 화면에서** 정해야 한다.
 *    이 홈페이지는 만들어 둘 때 한 번 찍혀 나가므로(SSG), 서버에서 오늘을 정해 두면
 *    배포한 날에 굳어 다음 날부터 「다가오는 자리」가 거짓말이 된다.
 *    그래서 now 는 처음에 null 이고, 화면에 붙은 뒤에 채운다.
 *    null 인 동안 보이는 것(앞에서 3건)은 서버가 그린 것과 같아야 한다 - 안 그러면 하이드레이션이 깨진다.
 */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const ASSEMBLY_AGENDA = "https://www.assembly.go.kr/portal/na/agenda/agendaSchl.do?menuNo=600015";
const ASSEMBLY_MARK_GUIDE = "https://www.assembly.go.kr/portal/main/contents.do?menuNo=600120";
const ASSEMBLY_MARK = "https://www.assembly.go.kr/static/portal/img/img_assemblyCi_02.gif";

/** "2026-08-24" → 그 날 자정(한국 시간)의 밀리초. 시간대를 안 박으면 하루씩 어긋난다. */
function stamp(date: string): number {
  return new Date(`${date}T00:00:00+09:00`).getTime();
}

function parts(date: string) {
  const [y, m, d] = String(date).split("-").map((n) => Number(n));
  return { y, m, d };
}

function AssemblyMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      className={compact ? "assembly-mark compact" : "assembly-mark"}
      src={ASSEMBLY_MARK}
      alt="국회커뮤니케이션마크"
      width={84}
      height={30}
      unoptimized
    />
  );
}

/** 목록은 각 출처별로 바로 지난 일정 1건과 가까운 예정 일정을 보여 준다. */
function pickForList(list: SiteEvent[], limit: number, now: number | null): SiteEvent[] {
  if (now === null) return list.slice(0, limit);
  const past = list.filter((event) => stamp(event.date) < now);
  const soon = list.filter((event) => stamp(event.date) >= now);
  const back = past.slice(-1);
  const front = soon.slice(0, limit - back.length);
  const short = limit - back.length - front.length;
  const end = past.length - back.length;
  const extra = short > 0 ? past.slice(Math.max(0, end - short), end) : [];
  return [...extra, ...back, ...front];
}

export default function EventBoard({ events, assemblyEvents }: { events: SiteEvent[]; assemblyEvents: SiteEvent[] }) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [now, setNow] = useState<number | null>(null);
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    /* 오늘도 한국 시간으로 본다. 밤 12시 언저리에 나라마다 하루가 갈리지 않도록. */
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
    const timer = window.setTimeout(() => setNow(stamp(today)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const kufShown = useMemo(() => pickForList(events, 3, now), [events, now]);
  const assemblyShown = useMemo(() => pickForList(assemblyEvents, 2, now), [assemblyEvents, now]);
  const allEvents = useMemo(
    () => [...events, ...assemblyEvents].sort((a, b) => `${a.date} ${a.time ?? ""}`.localeCompare(`${b.date} ${b.time ?? ""}`)),
    [events, assemblyEvents],
  );

  const monthCursor = useMemo(() => {
    if (cursor) return cursor;
    const base = now === null ? allEvents[0]?.date : null;
    if (base) {
      const p = parts(base);
      return { y: p.y, m: p.m };
    }
    const d = now === null ? new Date() : new Date(now);
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  }, [cursor, now, allEvents]);

  /* 그 달 격자에 넣을 날들. 앞뒤로 빈 칸을 채워 요일을 맞춘다. */
  const cells = useMemo(() => {
    const { y, m } = monthCursor;
    const first = new Date(y, m - 1, 1);
    const days = new Date(y, m, 0).getDate();
    const lead = first.getDay();
    const out: (string | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= days; d++) {
      out.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [monthCursor]);

  const byDate = useMemo(() => {
    const map = new Map<string, SiteEvent[]>();
    allEvents.forEach((e) => {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    });
    return map;
  }, [allEvents]);

  const todayStr = now === null ? "" : new Date(now).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  const pickedList = picked ? byDate.get(picked) ?? [] : [];

  /* 달력 아래에 펴 놓을 것 - 고른 날이 있으면 그 날만, 없으면 보고 있는 달 전체. */
  const detail = picked
    ? pickedList
    : allEvents.filter((e) => {
        const p = parts(e.date);
        return p.y === monthCursor.y && p.m === monthCursor.m;
      });

  function moveMonth(step: number) {
    const { y, m } = monthCursor;
    const d = new Date(y, m - 1 + step, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() + 1 });
    setPicked(null);
  }

  function renderEvent(event: SiteEvent) {
    const p = parts(event.date);
    const over = now !== null && stamp(event.date) < now;
    return (
      <article className={`event-item${over ? " past" : ""}${event.source === "assembly" ? " assembly" : ""}`} key={event.id}>
        <div className="event-date">
          <strong>{String(p.d).padStart(2, "0")}</strong>
          <span>{MONTHS[p.m - 1]}</span>
        </div>
        <div className="event-info">
          <span className="event-label">
            {event.source === "assembly" && <AssemblyMark compact />}
            {event.source === "assembly" ? "대한민국 국회 일정" : over ? "지난 자리" : "한대포 공식 행사"}
          </span>
          <h3>{event.title}</h3>
          <p>
            {event.place && <><MapPin size={15} /> {event.place}</>}
            {event.time && <><Clock3 size={15} /> {event.time}</>}
          </p>
          {event.organizer && <small className="event-organizer">주최 · {event.organizer}</small>}
        </div>
        {event.url ? (
          <a className="event-go" href={event.url} target="_blank" rel="noreferrer" aria-label="국회 원문 일정 열기">
            <ExternalLink size={18} />
          </a>
        ) : (
          <span className="event-go" aria-hidden="true"><ArrowRight size={19} /></span>
        )}
      </article>
    );
  }

  return (
    <>
      <div className="section-heading">
        <div>
          <h2>곧 만날 수 있는 자리</h2>
        </div>
        {/* 보는 방법 고르개. 지금 보고 있는 쪽이 눌려 있다. */}
        <div className="view-switch" role="group" aria-label="일정 보는 방법">
          <button
            type="button"
            className={view === "list" ? "on" : ""}
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List size={15} /> 목록
          </button>
          <button
            type="button"
            className={view === "calendar" ? "on" : ""}
            aria-pressed={view === "calendar"}
            onClick={() => setView("calendar")}
          >
            <CalendarDays size={15} /> 달력
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="event-groups">
          <section className="event-group" aria-labelledby="kuf-events-title">
            <div className="event-group-title">
              <h3 id="kuf-events-title">한대포 일정</h3>
              <span>최대 3개</span>
            </div>
            {kufShown.length > 0 ? <div className="event-list">{kufShown.map(renderEvent)}</div> : <p className="empty">잡혀 있는 한대포 일정이 없습니다.</p>}
          </section>
          <section className="event-group assembly-group" aria-labelledby="assembly-events-title">
            <div className="event-group-title">
              <div><AssemblyMark compact /><h3 id="assembly-events-title">국회 일정</h3></div>
              <span>최근·예정 2개</span>
            </div>
            {assemblyShown.length > 0 ? <div className="event-list">{assemblyShown.map(renderEvent)}</div> : <p className="empty">현재 공개된 국회 일정이 없습니다.</p>}
            <p className="assembly-credit">
              일정 출처 · <a href={ASSEMBLY_AGENDA} target="_blank" rel="noreferrer">대한민국 국회 일정</a>
              <span> · </span>
              마크 출처 · <a href={ASSEMBLY_MARK_GUIDE} target="_blank" rel="noreferrer">국회상징</a>
            </p>
          </section>
        </div>
      ) : (
        <div className="cal">
          <div className="cal-head">
            <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">
              <ChevronLeft size={18} />
            </button>
            <strong>
              {monthCursor.y}년 {monthCursor.m}월
            </strong>
            <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="cal-grid">
            {WEEK.map((w) => (
              <span className="cal-wd" key={w}>
                {w}
              </span>
            ))}
            {cells.map((date, i) => {
              if (!date) return <span className="cal-cell empty" key={`x${i}`} />;
              const list = byDate.get(date) ?? [];
              const kufList = list.filter((event) => event.source !== "assembly");
              const assemblyList = list.filter((event) => event.source === "assembly");
              const p = parts(date);
              const isToday = date === todayStr;
              return (
                <button
                  type="button"
                  key={date}
                  className={`cal-cell${list.length ? " has" : ""}${assemblyList.length ? " has-assembly" : ""}${isToday ? " today" : ""}${
                    picked === date ? " on" : ""
                  }`}
                  onClick={() => setPicked(list.length ? (picked === date ? null : date) : null)}
                  aria-label={`${p.m}월 ${p.d}일${list.length ? `, 일정 ${list.length}건` : ""}`}
                >
                  <span className="cal-day">{p.d}</span>
                  {/* 점 하나가 일정 하나. 셋을 넘으면 점 대신 숫자로 접는다. */}
                  {assemblyList.length > 0 && (
                    <span className="cal-assembly"><AssemblyMark compact /></span>
                  )}
                  {kufList.length > 0 && kufList.length <= 3 ? (
                    <span className="cal-dots">
                      {kufList.map((e) => (
                        <i key={e.id} />
                      ))}
                    </span>
                  ) : null}
                  {kufList.length > 3 && <span className="cal-more">{kufList.length}</span>}
                  {assemblyList.length > 1 && <span className="cal-count">{assemblyList.length}</span>}
                </button>
              );
            })}
          </div>

          {/* 날짜를 누르면 그 날 것만, 안 누르면 이 달 전체를 아래에 편다. */}
          <ul className="cal-detail">
            {detail.map((e) => (
              <li key={e.id}>
                <span className="cal-when">
                  {e.source === "assembly" && <AssemblyMark compact />}
                  {parts(e.date).m}.{String(parts(e.date).d).padStart(2, "0")}
                  {e.time ? ` ${e.time}` : ""}
                </span>
                <span className="cal-what">
                  <b>{e.title}</b>
                  {e.place && <em>{e.place}</em>}
                  {e.note && <small>{e.note}</small>}
                  {e.url && (
                    <a className="assembly-original" href={e.url} target="_blank" rel="noreferrer">
                      국회 원문 <ExternalLink size={11} />
                    </a>
                  )}
                </span>
              </li>
            ))}
            {detail.length === 0 && <li className="none">이 달에는 잡힌 일정이 없습니다.</li>}
          </ul>
          <p className="assembly-credit">
            일정 출처 · <a href={ASSEMBLY_AGENDA} target="_blank" rel="noreferrer">대한민국 국회 일정</a>
            <span> · </span>
            마크 출처 · <a href={ASSEMBLY_MARK_GUIDE} target="_blank" rel="noreferrer">국회상징</a>
          </p>
        </div>
      )}
    </>
  );
}
