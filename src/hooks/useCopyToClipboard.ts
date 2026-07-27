import { useCallback } from "react";

/**
 * 클립보드 복사. react-copy-to-clipboard 의존성을 대체한다.
 *
 * 라이브러리를 걷어낸 이유는 이 기능이 표준 API 한 줄이기 때문만은 아니다.
 * 기존 구현은 복사 성공 여부와 무관하게 항상 "복사되었습니다" 토스트를 띄웠다.
 * CopyToClipboard의 onCopy가 아니라 자식 버튼의 onClick에 토스트를 붙여 놓아,
 * 실패해도 성공 메시지가 나가는 구조였다.
 *
 * 여기서는 성공 여부를 boolean으로 돌려주고, 호출부가 그에 맞는 메시지를 고른다.
 */
export function useCopyToClipboard() {
  const copy = useCallback(async (text: string): Promise<boolean> => {
    /*
     * navigator.clipboard는 보안 컨텍스트(HTTPS 또는 localhost)에서만 존재한다.
     * 카카오톡 인앱 브라우저 등 구형 WebView를 위해 폴백을 남겨 둔다.
     */
    if (navigator.clipboard !== undefined && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* 권한 거부 등. 아래 폴백을 시도한다. */
      }
    }

    return copyWithTextArea(text);
  }, []);

  return { copy };
}

/** document.execCommand("copy") 기반 폴백. 지원이 끊기는 날까지의 안전망이다. */
function copyWithTextArea(text: string): boolean {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  /* 화면 밖에 두되 포커스는 받을 수 있어야 선택이 동작한다. */
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  textArea.style.opacity = "0";

  /*
   * select()는 대상 요소에 포커스를 옮긴다. 이 textarea는 body 직속이라
   * 모달이 열려 있을 때 포커스가 다이얼로그 밖으로 빠져나가고, 요소를
   * 제거하고 나면 포커스가 body에 남는다. 그 상태에서는 포커스 트랩과
   * ESC가 함께 무력해지므로 원래 위치로 되돌려 놓는다.
   */
  const previouslyFocused = document.activeElement;

  document.body.appendChild(textArea);

  try {
    textArea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textArea);
    if (previouslyFocused instanceof HTMLElement) {
      previouslyFocused.focus();
    }
  }
}
