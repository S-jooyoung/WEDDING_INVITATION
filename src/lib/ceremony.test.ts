import { afterEach, describe, expect, it } from "vitest";
import {
  formatCeremonyDateShort,
  formatCeremonyDateTime,
  getDaysUntilCeremony,
  toDateTimeAttribute,
} from "@/lib/ceremony";

/** 2026-05-16은 토요일이다. 요일을 하드코딩하지 않고 맞히는지 확인하기 위한 값. */
const CEREMONY = "2026-05-16T12:00:00+09:00";

describe("formatCeremonyDateTime", () => {
  it("요일과 오전/오후를 ISO 시각에서 파생한다", () => {
    expect(formatCeremonyDateTime(CEREMONY)).toBe(
      "2026년 5월 16일 토요일 오후 12시 00분",
    );
  });

  it("오전 시각의 dayPeriod를 올바르게 표기한다", () => {
    expect(formatCeremonyDateTime("2026-05-16T09:30:00+09:00")).toBe(
      "2026년 5월 16일 토요일 오전 9시 30분",
    );
  });

  it("UTC로 주어진 같은 순간을 한국 시간으로 환산한다", () => {
    /* 2026-05-16T03:00Z === 2026-05-16T12:00+09:00 */
    expect(formatCeremonyDateTime("2026-05-16T03:00:00Z")).toBe(
      formatCeremonyDateTime(CEREMONY),
    );
  });

  describe("실행 환경의 시간대와 무관하게 동작한다", () => {
    const originalTimeZone = process.env.TZ;

    afterEach(() => {
      /*
       * 원래 TZ가 없었다면 지워야 한다. undefined를 대입하면 문자열
       * "undefined"가 들어가 이후 테스트의 시간대가 오염된다.
       */
      if (originalTimeZone === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTimeZone;
      }
    });

    /*
     * 이 테스트는 구현이 Intl에 timeZone을 명시한다는 사실을 고정한다.
     * 옵션을 빠뜨리면 TZ=UTC에서 "오전 3시"가 나와 여기서 걸린다.
     */
    it.each(["UTC", "America/New_York", "Asia/Seoul"])(
      "TZ=%s 에서도 한국 시간 기준으로 표기한다",
      (timeZone) => {
        process.env.TZ = timeZone;
        expect(formatCeremonyDateTime(CEREMONY)).toBe(
          "2026년 5월 16일 토요일 오후 12시 00분",
        );
      },
    );
  });

  describe("해석할 수 없는 값", () => {
    /*
     * Date는 잘못된 입력을 예외 대신 Invalid Date로 돌려주고, 그것을 Intl에
     * 넘기는 순간 "RangeError: Invalid time value"로 터진다. SSG에서는
     * 빌드 전체가 실패하므로, 어느 데이터가 잘못됐는지 알려 줘야 한다.
     */
    it.each(["", "2026-13-45", "내년 봄", "2026/05/16 12시"])(
      "%s 를 넘기면 고칠 위치를 알려주며 실패한다",
      (invalid) => {
        expect(() => formatCeremonyDateTime(invalid)).toThrow(
          /예식 일시를 해석할 수 없습니다/,
        );
      },
    );

    it("오류 메시지에 잘못된 입력값을 포함한다", () => {
      expect(() => formatCeremonyDateTime("2026-13-45")).toThrow(/2026-13-45/);
    });
  });
});

describe("formatCeremonyDateShort", () => {
  it("한 자리 월·일을 0으로 채운다", () => {
    expect(formatCeremonyDateShort("2026-05-06T12:00:00+09:00")).toBe(
      "2026.05.06",
    );
  });
});

describe("toDateTimeAttribute", () => {
  it("time 요소가 읽을 수 있는 표기를 만든다", () => {
    expect(toDateTimeAttribute(CEREMONY)).toBe("2026-05-16T12:00");
  });

  it("자정을 24시가 아닌 00시로 정규화한다", () => {
    expect(toDateTimeAttribute("2026-05-16T00:00:00+09:00")).toBe(
      "2026-05-16T00:00",
    );
  });
});

describe("getDaysUntilCeremony", () => {
  it("예식 당일 새벽이면 0을 반환한다", () => {
    const now = new Date("2026-05-16T00:30:00+09:00");
    expect(getDaysUntilCeremony(CEREMONY, now)).toBe(0);
  });

  it("예식 시작 30분 전에도 여전히 0이다", () => {
    /* 시각이 아니라 달력 날짜로 세기 때문이다. */
    const now = new Date("2026-05-16T11:30:00+09:00");
    expect(getDaysUntilCeremony(CEREMONY, now)).toBe(0);
  });

  it("전날 자정 직전이면 1을 반환한다", () => {
    const now = new Date("2026-05-15T23:59:00+09:00");
    expect(getDaysUntilCeremony(CEREMONY, now)).toBe(1);
  });

  it("예식이 지나면 음수를 반환한다", () => {
    const now = new Date("2026-05-17T09:00:00+09:00");
    expect(getDaysUntilCeremony(CEREMONY, now)).toBe(-1);
  });

  it("한국 시간 기준으로 날짜 경계를 판단한다", () => {
    /*
     * 2026-05-15T15:00Z는 한국에서 이미 5월 16일 자정이다.
     * UTC 달력으로 셌다면 1이 나왔을 것이다.
     */
    const now = new Date("2026-05-15T15:00:00Z");
    expect(getDaysUntilCeremony(CEREMONY, now)).toBe(0);
  });
});
