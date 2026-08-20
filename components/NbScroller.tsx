"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * 카드 줄을 옆으로 밀어 보는 틀.
 *
 * 최근 것이 왼쪽에 있고, 지난 피드는 오른쪽에 쌓여 있다.
 * 손가락·트랙패드로 밀어도 되지만, 마우스만 쓰는 사람은 밀 방법이 없어
 * **오른쪽 단추**를 달았다. 더 밀 데가 없으면 그쪽 단추는 흐려진다.
 *
 * 🔴 단추를 안 보이게 숨기지 않고 흐리게만 둔다 - 나타났다 사라지면
 *    누르려던 자리가 도망가 버린다.
 */
export default function NbScroller({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ left: true, right: false });

  const check = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ left: el.scrollLeft <= 2, right: el.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    check();
    const el = ref.current;
    if (!el) return;
    /* 창 크기가 바뀌면 한 화면에 들어가는 장수가 달라진다 - 그때도 다시 잰다. */
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [check]);

  /** 한 번에 보이는 만큼(조금 덜) 민다. 딱 한 화면을 밀면 경계의 카드가 잘려 사라진다. */
  function move(dir: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <div className="nb-scroller">
      <div className="nb-list" ref={ref} onScroll={check}>
        {children}
      </div>

      <button
        type="button"
        className="nb-arrow left"
        onClick={() => move(-1)}
        disabled={edge.left}
        aria-label="최근 피드 쪽으로"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        className="nb-arrow right"
        onClick={() => move(1)}
        disabled={edge.right}
        aria-label="지난 피드 보기"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
