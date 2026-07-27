import GalleryPhoto1 from "@/assets/Gallery_Photo_1.webp";
import GalleryPhoto2 from "@/assets/Gallery_Photo_2.webp";
import GalleryPhoto3 from "@/assets/Gallery_Photo_3.webp";
import GalleryPhoto4 from "@/assets/Gallery_Photo_4.webp";
import GalleryPhoto5 from "@/assets/Gallery_Photo_5.webp";
import GalleryPhoto6 from "@/assets/Gallery_Photo_6.webp";
import type { Invitation } from "@/types/invitation";

/**
 * 청첩장에 표시되는 모든 내용.
 *
 * 이 템플릿을 사용하려면 이 파일 하나만 수정하면 된다.
 * 컴포넌트에는 어떤 개인 정보도 하드코딩되어 있지 않다.
 */
export const invitation: Invitation = {
  couple: {
    groom: {
      name: "○○○",
      childOrder: "장남",
      father: {
        name: "○○○",
        account: { bank: "○○은행", number: "***-***-******" },
      },
      mother: {
        name: "○○○",
        account: { bank: "○○은행", number: "***-***-******" },
      },
      account: { bank: "○○은행", number: "***-***-******" },
    },
    bride: {
      name: "○○○",
      childOrder: "장녀",
      father: {
        name: "○○○",
        account: { bank: "○○은행", number: "***-***-******" },
      },
      mother: {
        name: "○○○",
        account: { bank: "○○은행", number: "***-***-******" },
      },
      account: { bank: "○○은행", number: "***-***-******" },
    },
  },

  ceremony: {
    /* 요일과 오전/오후는 이 값에서 자동으로 파생된다. 직접 적지 않는다. */
    startsAt: "2026-05-16T12:00:00+09:00",
  },

  venue: {
    name: "○○○웨딩홀",
    hall: "3층 ○○홀",
    address: "○○시 ○○구 ○○로 000",
    transit: [
      {
        label: "버스",
        directions: [
          "○○○, ○○○ ○○웨딩홀 앞 하차",
          "○○○, ○○○ ○○사거리 하차 후 도보 5분",
        ],
      },
      {
        label: "지하철",
        directions: ["○호선 ○○역 ○번 출구 (도보 10분)"],
      },
    ],
    /*
     * 카카오맵 임베드 식별자.
     *
     * 1. https://map.kakao.com 에서 예식장 검색
     * 2. "지도 퍼가기" → "HTML 태그 복사" → "소스 생성하기"
     * 3. 생성된 코드의 timestamp, key 값을 아래에 입력
     *
     *     map: { timestamp: "1652464367301", key: "2a8fe" }
     *
     * null로 두면 지도 영역이 렌더링되지 않고 주소와 길찾기 링크만 나온다.
     * 기본값을 null로 두는 이유는, 임베드 키가 특정 장소를 그대로 가리키기
     * 때문이다. 예시 키를 남겨 두면 이름·주소는 ○○○인데 지도 핀만 실제
     * 장소를 찍는 모순된 화면이 나온다.
     */
    map: null,
  },

  greeting: {
    heading: "초대합니다",
    paragraphs: [
      "서로 마주 보며 다져온 사랑을",
      "이제 함께 한곳을 바라보며 걸어갈 수 있는",
      "큰 사랑으로 키우고자 합니다.",
      "저희 두 사람이 사랑의 이름으로 지켜나갈 수 있게",
      "앞날을 축복해 주시면 감사하겠습니다.",
    ],
  },

  quote: {
    lines: [
      "장담하건대, 세상이 다 겨울이어도",
      "우리 사랑은 늘 봄처럼 따뜻하고",
      "간혹, 여름처럼 뜨거울 겁니다",
    ],
    source: "이수동, 「사랑가」",
  },

  gallery: [
    { src: GalleryPhoto1, alt: "예식장 앞에서 마주 보고 선 신랑과 신부" },
    { src: GalleryPhoto2, alt: "손을 맞잡고 걷는 신랑과 신부" },
    { src: GalleryPhoto3, alt: "야외에서 함께 웃고 있는 신랑과 신부" },
    { src: GalleryPhoto4, alt: "나란히 앉아 이야기를 나누는 신랑과 신부" },
    { src: GalleryPhoto5, alt: "꽃을 든 신부와 곁에 선 신랑" },
    { src: GalleryPhoto6, alt: "서로를 바라보며 미소 짓는 신랑과 신부" },
  ],
};
