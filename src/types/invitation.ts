/**
 * 청첩장 도메인 모델.
 *
 * 화면에 보이는 문자열이 아니라 "무엇인지"를 타입으로 표현한다.
 * 예를 들어 예식 일시는 사람이 손으로 쓴 "1970년 01월 01일, 목요일 오전 12시"
 * 같은 문자열이 아니라 ISO 8601 시각으로 두고, 표기는 Intl로 파생시킨다.
 * 요일을 사람이 계산하지 않으므로 날짜와 요일이 어긋날 수 없다.
 */

/** 입금 계좌. 계좌를 공개하지 않는 구성원이 있으므로 항상 선택적이다. */
export interface Account {
  /** 예: "○○은행" */
  readonly bank: string;
  /** 예: "123-456-789012" */
  readonly number: string;
}

/** 혼주(부모) 한 사람. */
export interface Parent {
  readonly name: string;
  readonly account: Account | null;
}

/** 신랑 또는 신부. */
export interface Partner {
  readonly name: string;
  /** 인사말에 쓰이는 서열 표현. 예: "장남", "차녀" */
  readonly childOrder: string;
  readonly father: Parent;
  readonly mother: Parent;
  readonly account: Account | null;
}

export interface Couple {
  readonly groom: Partner;
  readonly bride: Partner;
}

export interface Ceremony {
  /**
   * 예식 일시. ISO 8601 + 오프셋 표기.
   * 예: "2026-05-16T12:00:00+09:00"
   *
   * 하객이 어느 시간대에서 열든 같은 시각을 가리키도록 오프셋을 포함한다.
   */
  readonly startsAt: string;
}

/** 대중교통 안내 한 묶음. */
export interface TransitGuide {
  /** 예: "버스", "지하철" */
  readonly label: string;
  /** 예: ["410-1, 401 호텔 앞 하차"] */
  readonly directions: readonly string[];
}

/**
 * 카카오맵 "지도 퍼가기"로 발급받는 임베드 식별자.
 *
 * https://map.kakao.com 에서 장소 검색 → HTML 태그 복사 → 소스 생성하기로
 * 발급된다. 공개 임베드용 식별자이므로 비밀 값은 아니다.
 */
export interface KakaoMapEmbed {
  readonly timestamp: string;
  readonly key: string;
}

export interface Venue {
  /** 예: "○○○웨딩홀" */
  readonly name: string;
  /** 예: "3층 ○○홀" */
  readonly hall: string;
  readonly address: string;
  readonly transit: readonly TransitGuide[];
  /** 임베드 식별자를 발급받지 않았다면 null. 지도 영역을 렌더링하지 않는다. */
  readonly map: KakaoMapEmbed | null;
}

export interface GalleryPhoto {
  readonly src: string;
  /**
   * 대체 텍스트. 갤러리 사진은 장식이 아니라 콘텐츠이므로
   * 빈 문자열을 허용하지 않는다.
   */
  readonly alt: string;
}

export interface Quote {
  readonly lines: readonly string[];
  /** 예: "이수동, 「사랑가」" */
  readonly source: string;
}

export interface Greeting {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export interface Invitation {
  readonly couple: Couple;
  readonly ceremony: Ceremony;
  readonly venue: Venue;
  readonly greeting: Greeting;
  readonly quote: Quote;
  readonly gallery: readonly GalleryPhoto[];
}

/**
 * 축의금 안내에 쓰이는 표시 단위.
 *
 * 도메인 모델(Partner/Parent)은 가족 관계를 표현하고,
 * 이 타입은 그것을 "계좌 목록"이라는 화면의 관심사로 평탄화한 결과다.
 * 파생은 selectGiftAccountGroups()가 담당한다.
 */
export interface GiftAccountEntry {
  /** 예: "신랑", "아버지", "어머니" */
  readonly relation: string;
  readonly name: string;
  readonly account: Account;
}

export interface GiftAccountGroup {
  /** 예: "신랑측", "신부측" */
  readonly label: string;
  readonly entries: readonly GiftAccountEntry[];
}
