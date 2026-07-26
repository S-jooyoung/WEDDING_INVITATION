import { describe, expect, it } from "vitest";
import { formatAccountForCopy, selectGiftAccountGroups } from "@/lib/gift";
import type { Couple, Parent, Partner } from "@/types/invitation";

const account = { bank: "○○은행", number: "123-456-789012" };

function parent(name: string, withAccount = true): Parent {
  return { name, account: withAccount ? account : null };
}

function partner(name: string, overrides: Partial<Partner> = {}): Partner {
  return {
    name,
    childOrder: "장남",
    father: parent(`${name}아버지`),
    mother: parent(`${name}어머니`),
    account,
    ...overrides,
  };
}

function couple(overrides: Partial<Couple> = {}): Couple {
  return {
    groom: partner("신랑"),
    bride: partner("신부"),
    ...overrides,
  };
}

describe("selectGiftAccountGroups", () => {
  it("신랑측과 신부측을 각각 하나의 그룹으로 묶는다", () => {
    const groups = selectGiftAccountGroups(couple());

    expect(groups.map((group) => group.label)).toEqual(["신랑측", "신부측"]);
  });

  it("아버지 · 어머니 · 본인 순으로 정렬한다", () => {
    const [groomGroup] = selectGiftAccountGroups(couple());

    expect(groomGroup?.entries.map((entry) => entry.relation)).toEqual([
      "아버지",
      "어머니",
      "신랑",
    ]);
  });

  it("신부측 본인 항목은 '신부'로 표기한다", () => {
    const groups = selectGiftAccountGroups(couple());
    const brideGroup = groups.find((group) => group.label === "신부측");

    expect(brideGroup?.entries.at(-1)?.relation).toBe("신부");
  });

  it("계좌를 공개하지 않은 구성원은 목록에서 제외한다", () => {
    const groups = selectGiftAccountGroups(
      couple({
        groom: partner("신랑", { mother: parent("신랑어머니", false) }),
      }),
    );
    const groomGroup = groups.find((group) => group.label === "신랑측");

    expect(groomGroup?.entries.map((entry) => entry.relation)).toEqual([
      "아버지",
      "신랑",
    ]);
  });

  it("한 쪽이 계좌를 전혀 공개하지 않으면 그룹 자체를 만들지 않는다", () => {
    const groups = selectGiftAccountGroups(
      couple({
        bride: partner("신부", {
          father: parent("신부아버지", false),
          mother: parent("신부어머니", false),
          account: null,
        }),
      }),
    );

    expect(groups.map((group) => group.label)).toEqual(["신랑측"]);
  });
});

describe("formatAccountForCopy", () => {
  it("은행명과 계좌번호를 한 칸 띄워 이어 붙인다", () => {
    const [groomGroup] = selectGiftAccountGroups(couple());
    const entry = groomGroup?.entries[0];

    expect(entry && formatAccountForCopy(entry)).toBe("○○은행 123-456-789012");
  });
});
