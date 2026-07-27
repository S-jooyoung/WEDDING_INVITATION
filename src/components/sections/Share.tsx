import { useState } from "react";
import styled from "styled-components";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button, Reveal, useToast } from "@/components/ui";
import { getShareUrl, siteConfig, toAbsoluteUrl } from "@/config/site";
import { invitation } from "@/data/invitation";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { loadKakaoSdk, shareInvitation } from "@/lib/kakao";

/** 청첩장 공유. */
export function Share() {
  const { couple } = invitation;
  const { copy } = useCopyToClipboard();
  const { showToast } = useToast();
  const [sharing, setSharing] = useState(false);

  const kakaoKey = siteConfig.kakao.javaScriptKey;

  const handleKakaoShare = async () => {
    if (kakaoKey === null) return;

    setSharing(true);
    try {
      const kakao = await loadKakaoSdk(kakaoKey);
      shareInvitation(kakao, {
        title: `${couple.groom.name} ♥ ${couple.bride.name} 결혼식에 초대합니다`,
        description: "아래 '청첩장 열기' 버튼을 눌러 읽어주세요.",
        imageUrl: toAbsoluteUrl(siteConfig.ogImagePath),
        url: getShareUrl(),
      });
    } catch {
      /*
       * 기존 구현은 SDK가 없으면 조용히 아무 일도 하지 않았다.
       * 사용자는 버튼을 눌렀는데 반응이 없으니 고장인지 알 수 없다.
       */
      showToast("카카오톡 공유를 열지 못했습니다. 링크 복사를 이용해 주세요.");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    const copied = await copy(getShareUrl());
    showToast(
      copied
        ? "청첩장 링크가 복사되었습니다."
        : "복사하지 못했습니다. 주소창의 주소를 직접 복사해 주세요.",
    );
  };

  return (
    <Container>
      <Section title="청첩장 공유하기">
        <Reveal>
          <Buttons>
            {/*
              키가 설정되지 않았으면 버튼 자체를 그리지 않는다.
              눌러도 동작하지 않는 버튼을 남겨 두는 것보다 낫다.
            */}
            {kakaoKey !== null && (
              <Button
                variant="kakao"
                fullWidth
                onClick={handleKakaoShare}
                disabled={sharing}
                icon={<TalkIcon />}
              >
                {sharing ? "공유창을 여는 중…" : "카카오톡으로 공유하기"}
              </Button>
            )}

            <Button
              variant="outline"
              fullWidth
              onClick={handleCopyLink}
              icon={<LinkIcon />}
            >
              링크로 공유하기
            </Button>
          </Buttons>
        </Reveal>
      </Section>
    </Container>
  );
}

function TalkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 3C6.99 3 3 6.22 3 10.19c0 2.52 1.68 4.73 4.2 6L6.3 20.1c-.09.33.27.6.56.42l4.62-3.05c.17.01.35.02.52.02 5.01 0 9-3.22 9-7.2S17.01 3 12 3Z"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 13a4 4 0 0 0 5.66 0l2.83-2.83a4 4 0 0 0-5.66-5.66L11.5 5.9M14 11a4 4 0 0 0-5.66 0L5.5 13.83a4 4 0 0 0 5.66 5.66l1.33-1.33"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[3]};
`;
