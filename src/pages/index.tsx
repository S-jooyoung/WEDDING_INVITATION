import styled from "styled-components";
import GroovePaper from "@/assets/GroovePaper.png";
import Song from "@/assets/song.mp3";
import { Seo } from "@/components/Seo";
import { MusicToggle } from "@/components/layout/MusicToggle";
import { Gallery } from "@/components/sections/Gallery";
import { Gift } from "@/components/sections/Gift";
import { Greeting } from "@/components/sections/Greeting";
import { Hero } from "@/components/sections/Hero";
import { Location } from "@/components/sections/Location";
import { Quote } from "@/components/sections/Quote";
import { Share } from "@/components/sections/Share";
import "@/styles/index.css";

export default function IndexPage() {
  return (
    <Page>
      <MusicToggle src={Song} />

      {/*
        문서의 본문임을 알린다. 스크린 리더 사용자는 "본문으로 건너뛰기"로
        머리말을 지나칠 수 있고, 각 섹션은 제목과 연결돼 목록으로 탐색된다.
      */}
      <main>
        <Hero />
        <Greeting />
        <Gallery />
        <Location />
        <Quote />
        <Gift />
        <Share />
      </main>

      <Footer>
        <small>© 2022 Shin Jooyoung</small>
      </Footer>
    </Page>
  );
}

export function Head() {
  return <Seo />;
}

const Page = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.color.background};
  background-image: url(${GroovePaper});
`;

const Footer = styled.footer`
  margin-top: ${({ theme }) => theme.space[16]};
  padding: ${({ theme }) => theme.space[8]};
  color: ${({ theme }) => theme.color.textSubtle};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-align: center;
`;
