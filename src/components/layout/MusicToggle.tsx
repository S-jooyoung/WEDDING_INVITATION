import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

export interface MusicToggleProps {
  src: string;
  /** 표시할 곡 정보. 스크린 리더가 무엇을 재생하는지 알 수 있게 한다. */
  label?: string;
}

/**
 * 배경음악 재생 토글.
 *
 * 이전에는 <audio autoPlay loop>로 페이지 진입과 동시에 1.7MB짜리 음원을
 * 내려받아 재생하려 했고, 사용자에게 멈출 수단이 없었다. 이 방식에는
 * 세 가지 문제가 있다.
 *
 *   1. 최신 브라우저는 사용자 제스처 없는 소리 있는 자동재생을 차단한다.
 *      즉 의도대로 동작하지도 않았다.
 *   2. 소리를 통제할 수 없는 것은 접근성 위반이다(WCAG 1.4.2). 스크린 리더
 *      사용자에게는 배경음악이 음성 안내를 덮어 페이지를 쓸 수 없게 만든다.
 *   3. 조용한 곳에서 링크를 연 사람에게 예고 없이 소리가 난다.
 *
 * 이제 기본은 정지 상태이고, 재생을 누른 시점에 음원을 내려받는다.
 * (preload="none" 덕분에 누르지 않으면 1.7MB를 아예 받지 않는다.)
 */
export function MusicToggle({ src, label = "배경음악" }: MusicToggleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (audio === null) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      /* 브라우저가 재생을 거부하면 버튼 상태를 정지로 되돌린다. */
      setPlaying(false);
    }
  }, [playing]);

  /* 재생이 외부 요인으로 멈췄을 때 버튼 상태를 실제 상태와 맞춘다. */
  useEffect(() => {
    const audio = audioRef.current;
    if (audio === null) return;

    const syncPaused = () => setPlaying(false);
    const syncPlaying = () => setPlaying(true);

    audio.addEventListener("pause", syncPaused);
    audio.addEventListener("play", syncPlaying);

    return () => {
      audio.removeEventListener("pause", syncPaused);
      audio.removeEventListener("play", syncPlaying);
    };
  }, []);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption --
          가사 없는 연주곡이라 캡션 트랙이 없다. 대신 재생 여부를 버튼의
          aria-pressed로 알리고, 소리는 언제든 끌 수 있게 했다. */}
      <audio ref={audioRef} src={src} loop preload="none" />
      {/*
        aria-pressed가 이미 켜짐/꺼짐을 전달하므로 이름은 고정한다.
        이름까지 "끄기"로 바꾸면 스크린 리더가 "배경음악 끄기, 선택됨"으로
        읽어, 이름은 앞으로 할 일을 말하고 상태는 현재를 말하는 이중 부정이 된다.
      */}
      <ToggleButton
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={label}
      >
        <SpeakerIcon muted={!playing} />
      </ToggleButton>
    </>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M11 5 6 9H3v6h3l5 4V5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {muted ? (
        <path
          d="m16 9 5 6m0-6-5 6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

const ToggleButton = styled.button`
  position: fixed;
  top: ${({ theme }) => theme.space[4]};
  right: ${({ theme }) => theme.space[4]};
  z-index: ${({ theme }) => theme.zIndex.floating};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.85);
  color: ${({ theme }) => theme.color.accent};
  cursor: pointer;
  backdrop-filter: blur(4px);

  &:hover {
    background-color: #ffffff;
  }
`;
