# 모바일 청첩장 템플릿

<p>
  <img alt="Gatsby" src="https://img.shields.io/badge/Gatsby-5-663399?logo=gatsby&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue" />
</p>

카카오톡으로 공유하는 모바일 청첩장입니다. **파일 하나만 고치면** 바로 쓸 수 있습니다.

마음에 드셨다면 ⭐️ Star와 Fork 부탁드립니다 😊

**미리 보기** — https://wedding-templete.netlify.app/

---

## 담긴 기능

- 신랑·신부 소개와 인사말
- 예식 일시 · 예식장 안내 (카카오맵 · 길찾기 링크)
- 사진첩 (스와이프 · 좌우 이동 · 위치 표시)
- 축의금 계좌 안내 (누르면 클립보드로 복사)
- 카카오톡 공유 · 링크 복사
- 배경음악 켜기/끄기
- 링크 미리보기 카드 (카카오톡 · 페이스북 · 트위터)

---

## 시작하기

Node 20 이상이 필요합니다 ([`.nvmrc`](./.nvmrc) 기준 22 권장).

```bash
git clone https://github.com/S-jooyoung/WEDDING_INVITATION.git
cd WEDDING_INVITATION

npm install
npm start          # http://localhost:8000
```

---

## 커스터마이징

### 1. 청첩장 내용

[`src/data/invitation.ts`](./src/data/invitation.ts) **한 파일만 고치면 됩니다.**
신랑·신부, 예식 일시, 예식장, 인사말, 인용구, 사진이 전부 여기 있습니다.

```ts
export const invitation: Invitation = {
  couple: {
    groom: {
      name: "김철수",
      childOrder: "장남",
      father: {
        name: "김아버지",
        account: { bank: "○○은행", number: "123-456-789" },
      },
      mother: { name: "김어머니", account: null }, // 계좌를 안 넣으려면 null
      account: { bank: "○○은행", number: "123-456-789" },
    },
    bride: {/* 신랑과 같은 구조 */},
  },

  ceremony: {
    // 이 값 하나만 적으면 요일과 오전/오후가 자동으로 계산됩니다.
    startsAt: "2026-05-16T12:00:00+09:00",
  },

  venue: {
    name: "○○○웨딩홀",
    hall: "3층 그랜드홀",
    address: "서울특별시 ○○구 ○○로 123",
    transit: [
      { label: "버스", directions: ["101, 202번 ○○웨딩홀 앞 하차"] },
      { label: "지하철", directions: ["2호선 ○○역 3번 출구 (도보 5분)"] },
    ],
    map: null, // 아래 "2. 지도" 참고
  },

  greeting: {
    heading: "초대합니다",
    paragraphs: ["첫 번째 문단", "두 번째 문단"],
  },

  quote: {
    lines: ["인용구 첫 줄", "둘째 줄"],
    source: "이수동, 「사랑가」",
  },

  gallery: [
    { src: GalleryPhoto1, alt: "사진 설명" }, // alt은 시각장애인용 설명입니다
  ],
};
```

> **`account: null`** — 계좌를 공개하지 않으실 분은 `null`로 두세요. 목록에서 빠집니다.
> 한쪽 집안 전체가 `null`이면 그쪽 버튼 자체가 나오지 않습니다.

> **날짜** — `startsAt` 하나만 정확히 적으면 "2026년 5월 16일 토요일 오후 12시 00분"과
> D-day가 자동으로 만들어집니다. 요일을 직접 적지 않으니 틀릴 일이 없습니다.

### 2. 지도

[map.kakao.com](https://map.kakao.com)에서 예식장을 검색한 뒤
**지도 퍼가기 → HTML 태그 복사 → 소스 생성하기**를 누르면 아래 같은 코드가 나옵니다.

```js
new daum.roughmap.Lander({
  "timestamp" : "1652464367301",
  "key" : "2a8fe",
  ...
```

이 두 값을 그대로 옮겨 적으세요.

```ts
map: { timestamp: "1652464367301", key: "2a8fe" },
```

`null`로 두면 지도 없이 **주소와 "카카오맵에서 길찾기" 링크만** 표시됩니다.

### 3. 사진 · 배경 영상 · 음악

[`src/assets/`](./src/assets) 안의 파일을 같은 이름으로 바꿔치기하면 됩니다.

| 파일                    | 쓰이는 곳                |
| ----------------------- | ------------------------ |
| `Gallery_Photo_1~6`     | 사진첩                   |
| `BackgroundVideo.mp4`   | 첫 화면 배경 영상        |
| `BackgroundVideoPoster` | 영상 로딩 전 대체 이미지 |
| `song.mp3`              | 배경음악                 |
| `flower1.png`           | 섹션 장식                |
| `GroovePaper.png`       | 페이지 배경 무늬         |

**사진을 바꾸셨다면 최적화 스크립트를 꼭 돌려 주세요.**
카메라 원본은 6000×4000처럼 매우 커서, 그대로 두면 모바일에서 로딩이 몇 초씩 걸립니다.

```bash
brew install webp                  # 처음 한 번만
./scripts/optimize-images.sh       # 1200px WebP로 다시 인코딩
```

인용구 문구를 크게 바꾸셔서 글꼴이 깨져 보일 때만:

```bash
pip install fonttools brotli
python3 scripts/subset-font.py
```

### 4. 카카오톡 공유

[카카오 개발자센터](https://developers.kakao.com)에서 애플리케이션을 만들고
**JavaScript 키**를 발급받으세요. 그리고 **[앱 설정 → 플랫폼 → Web]에 배포 주소를 꼭
등록**해야 동작합니다.

```bash
cp .env.example .env
```

```bash
GATSBY_KAKAO_JAVASCRIPT_KEY=발급받은_JavaScript_키
GATSBY_SITE_URL=https://your-domain.com
```

키를 넣지 않으면 카카오톡 버튼 없이 **링크 복사 기능만** 제공됩니다.
`.env`는 커밋되지 않으니 안심하고 넣으셔도 됩니다.

### 5. 색상 · 글자 크기

[`src/styles/theme.ts`](./src/styles/theme.ts)에서 한 번에 바꿉니다.

```ts
accent: "#a8434a",       // 제목·강조 색
background: "#efebe9",   // 페이지 배경
```

> 색을 바꾸실 때는 배경과의 명암 대비를 **4.5:1 이상**으로 유지해 주세요.
> 연한 색은 밝은 곳에서 보거나 나이 드신 하객에게 잘 보이지 않습니다.
> [WebAIM 대비 검사기](https://webaim.org/resources/contrastchecker/)에서 확인할 수 있습니다.

---

## 배포하기

### Netlify (가장 간단합니다)

1. 이 저장소를 Fork
2. [Netlify](https://app.netlify.com)에서 **Add new site → Import an existing project**
3. Fork한 저장소 선택 → 빌드 설정은 [`netlify.toml`](./netlify.toml)에 있으니 그대로 두시면 됩니다
4. **Site settings → Environment variables**에 `GATSBY_KAKAO_JAVASCRIPT_KEY` 추가

`GATSBY_SITE_URL`은 넣지 않으셔도 됩니다. Netlify가 배포 주소를 자동으로 알려 줍니다.

자세한 과정은 [Gatsby 테마로 모바일 결혼 청첩장 만들기](https://joy.pe.kr/gatsby-wedding-deploy/)를
참고하세요.

### Vercel · GitHub Pages

`npm run build`로 만들어진 `public/` 폴더를 올리시면 됩니다.

---

## 자주 묻는 것

**Q. 신랑측만 계좌를 넣고 싶어요**
신부측 `account`를 전부 `null`로 두시면 신부측 버튼이 나오지 않습니다.

**Q. 배경음악을 빼고 싶어요**
[`src/pages/index.tsx`](./src/pages/index.tsx)에서 `<MusicToggle />` 한 줄을 지우세요.

**Q. 사진첩을 빼고 싶어요**
같은 파일에서 `<Gallery />` 한 줄을 지우세요. 다른 섹션도 같은 방식입니다.

**Q. 설치가 안 돼요**
Node 버전을 확인해 주세요. `node -v`가 20 미만이면 [nvm](https://github.com/nvm-sh/nvm)으로
올리시거나, 이 폴더에서 `nvm use`를 실행하시면 됩니다.

---

## 기술 스택

Gatsby 5 · React 18 · TypeScript · styled-components

런타임 의존성을 5개로 유지하고 UI 컴포넌트를 직접 구현했습니다.
모달 포커스 트랩, 스크린 리더 알림, 색 대비 같은 접근성 요구사항을 반영했고
Vitest 테스트 79건을 갖추고 있습니다.

```bash
npm run validate    # 타입 검사 + 린트 + 테스트
npm test
npm run build
```

설계 판단과 구현 배경은 커밋 히스토리에 정리해 두었습니다.

---

## 코드 없이 만들고 싶으시다면

이 템플릿은 직접 코드를 고치고 배포까지 하셔야 합니다.
그 과정이 부담스러우시다면 **[아름 (Areum)](https://www.areum.co.kr/)** 을 추천드립니다.

무료로 모바일 청첩장을 만들 수 있는 서비스입니다.

- 테마 15종 · 워터마크 없음
- 방명록과 RSVP로 참석 여부 확인
- 하객 포토 드롭 — 하객이 직접 사진을 올려 줍니다
- D-day 카운트다운 · 교통편 · 공지사항
- 카카오톡 송금 링크
- 무제한 수정 · 기간 제한 없이 평생 소장

결제 단계 없이 전부 무료이고, 청첩장은 3개까지 만들 수 있습니다.

---

## 라이선스

[MIT](./LICENSE) — 자유롭게 쓰시고 수정하셔도 됩니다.
