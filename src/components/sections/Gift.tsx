import { useState } from "react";
import styled from "styled-components";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Modal, Reveal, useToast } from "@/components/ui";
import { invitation } from "@/data/invitation";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { formatAccountForCopy, selectGiftAccountGroups } from "@/lib/gift";
import type { GiftAccountEntry, GiftAccountGroup } from "@/types/invitation";

/**
 * 축의금 안내.
 *
 * 기존 구현은 신랑측·신부측 모달을 통째로 복사해 약 100줄이 중복돼 있었고,
 * 그 복사본은 이미 어긋나 있었다. 한쪽은 `모 : {이름}`, 다른 쪽은
 * `모 :{이름}`으로 공백이 빠져 있었다. 복붙한 코드는 반드시 이렇게 갈라진다.
 *
 * 이제 계좌 목록을 데이터에서 파생시키므로(selectGiftAccountGroups)
 * 표시 규칙이 한 곳에만 존재한다.
 */
export function Gift() {
  const groups = selectGiftAccountGroups(invitation.couple);

  /*
   * 열린 그룹을 하나의 상태로 표현한다. boolean 두 개를 쓰면
   * "두 모달이 동시에 열림"이라는 있을 수 없는 상태가 타입상 가능해진다.
   */
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  if (groups.length === 0) return null;

  return (
    <Container>
      <Section title="축하의 마음을 전하세요" ornament>
        <Reveal>
          <Description>축하의 마음을 담아 축의금을 전달해 보세요.</Description>

          <Choices>
            {groups.map((group) => (
              <ChoiceButton
                key={group.label}
                type="button"
                onClick={() => setOpenLabel(group.label)}
              >
                <HeartIcon />
                {group.label} 계좌번호 확인
              </ChoiceButton>
            ))}
          </Choices>
        </Reveal>

        {groups.map((group) => (
          <AccountModal
            key={group.label}
            group={group}
            open={openLabel === group.label}
            onClose={() => setOpenLabel(null)}
          />
        ))}
      </Section>
    </Container>
  );
}

function AccountModal({
  group,
  open,
  onClose,
}: {
  group: GiftAccountGroup;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${group.label} 계좌번호`}
      description="계좌번호를 누르면 복사됩니다."
    >
      {group.entries.map((entry) => (
        <AccountRow
          key={`${entry.relation}-${entry.account.number}`}
          entry={entry}
        />
      ))}
    </Modal>
  );
}

function AccountRow({ entry }: { entry: GiftAccountEntry }) {
  const { copy } = useCopyToClipboard();
  const { showToast } = useToast();

  const handleCopy = async () => {
    const copied = await copy(formatAccountForCopy(entry));

    /* 성공했을 때만 성공을 알린다. 계좌번호에서 이 구분은 중요하다. */
    showToast(
      copied
        ? "계좌번호가 복사되었습니다."
        : "복사하지 못했습니다. 길게 눌러 직접 복사해 주세요.",
    );
  };

  return (
    <Row>
      <Who>
        {entry.relation} {entry.name}
      </Who>
      <CopyButton
        type="button"
        onClick={handleCopy}
        aria-label={`${entry.relation} ${entry.name}의 계좌번호 ${entry.account.bank} ${entry.account.number} 복사`}
      >
        {entry.account.bank} {entry.account.number}
      </CopyButton>
    </Row>
  );
}

function HeartIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const Description = styled.p`
  margin-bottom: ${({ theme }) => theme.space[10]};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: center;
`;

const Choices = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.space[3]};
`;

/**
 * 기존에는 styled.div에 onClick만 달려 있었다. 키보드 사용자는 Tab으로
 * 도달할 수 없고, 스크린 리더는 버튼이라는 사실조차 알리지 않는다.
 * 계좌번호에 이르는 유일한 경로가 마우스 클릭뿐이었다.
 */
const ChoiceButton = styled.button`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => theme.space[6]} ${({ theme }) => theme.space[3]};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 4px;
  background-color: transparent;
  color: ${({ theme }) => theme.color.text};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.motion.duration.fast} ease;

  svg {
    color: ${({ theme }) => theme.color.accent};
  }

  &:hover {
    background-color: ${({ theme }) => theme.color.accentSurface};
  }
`;

const Row = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[3]};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const Who = styled.span`
  flex: 0 0 auto;
  font-weight: 700;
`;

const CopyButton = styled.button`
  flex: 1 1 auto;
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.space[2]};
  border: 0;
  border-radius: 4px;
  background: none;
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: right;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.color.accentSurface};
    color: ${({ theme }) => theme.color.accent};
  }
`;
