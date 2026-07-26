import type {
  Couple,
  GiftAccountEntry,
  GiftAccountGroup,
  Partner,
} from "@/types/invitation";

/**
 * 가족 관계로 표현된 도메인 모델을 "계좌 목록"이라는 화면의 관심사로 평탄화한다.
 *
 * 이 파생을 컴포넌트 밖으로 꺼낸 덕분에, 축의금 섹션은 신랑측/신부측을
 * 각각 손으로 나열하지 않고 그룹 배열을 순회하기만 하면 된다.
 * 계좌를 공개하지 않은 구성원은 여기서 걸러지므로, 화면에는 빈 항목이 남지 않는다.
 */
export function selectGiftAccountGroups(
  couple: Couple,
): readonly GiftAccountGroup[] {
  return [
    toGroup("신랑측", couple.groom, "신랑"),
    toGroup("신부측", couple.bride, "신부"),
  ].filter((group) => group.entries.length > 0);
}

function toGroup(
  label: string,
  partner: Partner,
  selfRelation: string,
): GiftAccountGroup {
  const candidates = [
    {
      relation: "아버지",
      name: partner.father.name,
      account: partner.father.account,
    },
    {
      relation: "어머니",
      name: partner.mother.name,
      account: partner.mother.account,
    },
    { relation: selfRelation, name: partner.name, account: partner.account },
  ];

  /* filter로는 account의 null이 타입에서 제거되지 않으므로 flatMap으로 좁힌다. */
  const entries: GiftAccountEntry[] = candidates.flatMap((candidate) =>
    candidate.account === null
      ? []
      : [
          {
            relation: candidate.relation,
            name: candidate.name,
            account: candidate.account,
          },
        ],
  );

  return { label, entries };
}

/** 클립보드에 복사할 계좌 문자열. 예: "○○은행 123-456-789012" */
export function formatAccountForCopy(entry: GiftAccountEntry): string {
  return `${entry.account.bank} ${entry.account.number}`;
}
