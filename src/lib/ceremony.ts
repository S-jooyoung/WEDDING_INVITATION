const TIME_ZONE = "Asia/Seoul";
const MS_PER_DAY = 86_400_000;

/**
 * 예식 일시 표기를 ISO 8601 값에서 파생시킨다.
 *
 * 이전에는 "1970년 01월 01일, 목요일 오전 12시 00분"처럼 사람이 통째로
 * 손으로 적었다. 날짜를 고치면서 요일을 안 고치면 그대로 틀린 청첩장이
 * 나가지만, 코드는 그것을 알 방법이 없었다.
 */

function partsOf(
  date: Date,
  options: Intl.DateTimeFormatOptions,
): Map<Intl.DateTimeFormatPartTypes, string> {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: TIME_ZONE,
    ...options,
  }).formatToParts(date);

  return new Map(parts.map((part) => [part.type, part.value]));
}

function requirePart(
  parts: Map<Intl.DateTimeFormatPartTypes, string>,
  type: Intl.DateTimeFormatPartTypes,
): string {
  const value = parts.get(type);
  if (value === undefined) {
    throw new Error(`날짜 포맷 결과에 ${type} 필드가 없습니다.`);
  }
  return value;
}

/** 예: "2026년 5월 16일 토요일 오후 12시 00분" */
export function formatCeremonyDateTime(startsAt: string): string {
  const parts = partsOf(new Date(startsAt), {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const year = requirePart(parts, "year");
  const month = requirePart(parts, "month");
  const day = requirePart(parts, "day");
  const weekday = requirePart(parts, "weekday");
  const minute = requirePart(parts, "minute");
  const { period, hour } = toTwelveHourClock(
    Number(requirePart(parts, "hour")),
  );

  return `${year}년 ${month}월 ${day}일 ${weekday} ${period} ${hour}시 ${minute}분`;
}

/**
 * 오전/오후 표기는 Intl의 dayPeriod가 아니라 직접 파생한다.
 *
 * ko-KR의 dayPeriod는 실행 환경이 탑재한 CLDR 버전에 따라 "오후"가 되기도 하고
 * "PM"이 되기도 한다. 실제로 Node 22(full-icu)는 "PM"을 반환한다.
 * 청첩장 문구가 런타임 환경에 따라 달라지면 안 되므로 24시간 값에서 계산한다.
 */
function toTwelveHourClock(hour24: number): { period: string; hour: number } {
  const remainder = hour24 % 12;

  return {
    period: hour24 < 12 ? "오전" : "오후",
    hour: remainder === 0 ? 12 : remainder,
  };
}

/** 예: "2026.05.16" — 제목처럼 좁은 자리에 쓰는 짧은 표기 */
export function formatCeremonyDateShort(startsAt: string): string {
  const parts = partsOf(new Date(startsAt), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return [
    requirePart(parts, "year"),
    requirePart(parts, "month"),
    requirePart(parts, "day"),
  ].join(".");
}

/** <time dateTime> 속성에 넣을 기계 판독용 표기. 예: "2026-05-16T12:00" */
export function toDateTimeAttribute(startsAt: string): string {
  const parts = partsOf(new Date(startsAt), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    /* h23을 명시하지 않으면 로케일에 따라 자정이 24시로 표기된다. */
    hourCycle: "h23",
  });

  const date = [
    requirePart(parts, "year"),
    requirePart(parts, "month"),
    requirePart(parts, "day"),
  ].join("-");

  return `${date}T${requirePart(parts, "hour")}:${requirePart(parts, "minute")}`;
}

/**
 * 예식까지 남은 일수. 당일이면 0, 지났으면 음수.
 *
 * 시:분이 아니라 한국 시간 기준 "날짜"로 센다. 예식 당일 오전 9시에
 * "1일 남음"이 뜨면 안 되기 때문이다.
 *
 * 현재 시각을 인자로 받는 이유는 테스트 가능하게 하기 위해서다.
 */
export function getDaysUntilCeremony(startsAt: string, now: Date): number {
  const ceremonyDay = toUtcMidnightOfSeoulDate(new Date(startsAt));
  const today = toUtcMidnightOfSeoulDate(now);

  return Math.round((ceremonyDay - today) / MS_PER_DAY);
}

/** 한국 시간 기준 달력 날짜를 뽑아 UTC 자정 타임스탬프로 정규화한다. */
function toUtcMidnightOfSeoulDate(date: Date): number {
  /* en-CA 로케일은 YYYY-MM-DD를 반환한다. */
  const isoDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return Date.parse(`${isoDate}T00:00:00Z`);
}
