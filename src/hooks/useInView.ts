import { useEffect, useRef, useState } from "react";

export interface UseInViewOptions {
  /** 한 번 보이면 계속 보이는 상태로 유지할지. 기본값 true. */
  once?: boolean;
  /** 뷰포트 경계에서 얼마나 앞당겨 반응할지. */
  rootMargin?: string;
}

/**
 * 요소가 화면에 들어왔는지 알려준다. AOS 라이브러리를 대체한다.
 *
 * AOS(약 15KB + CSS)는 전역 스캔과 스크롤 리스너로 동작하고, 초기화가
 * 컴포넌트 밖 생명주기에 묶여 있었다. IntersectionObserver는 브라우저가
 * 직접 처리하므로 스크롤마다 메인 스레드를 쓰지 않는다.
 *
 * "동작 줄이기"를 켠 사용자에게는 관찰을 시작하지 않고 곧바로 보이는
 * 상태로 둔다. 애니메이션을 0초로 만드는 것과 달리, 요소가 화면 밖에
 * 있는 동안 투명한 채로 남는 문제 자체가 생기지 않는다.
 */
export function useInView<T extends HTMLElement>({
  once = true,
  rootMargin = "0px 0px -10% 0px",
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry === undefined) return;

        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, rootMargin]);

  return { ref, inView };
}
