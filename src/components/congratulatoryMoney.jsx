import React, { useState } from "react";
import { Button, Divider, message, Modal } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";
import styled from "styled-components";
import CopyToClipboard from "react-copy-to-clipboard";
import Flower from "../assets/flower3.png";
import {
  GROOM_NAME,
  GROOM_ACCOUNT_NUMBER,
  GROOM_FATHER_NAME,
  GROOM_FATHER_ACCOUNT_NUMBER,
  GROOM_MOTHER_NAME,
  GROOM_MOTHER_ACCOUNT_NUMBER,
  BRIDE_NAME,
  BRIDE_ACCOUNT_NUMBER,
  BRIDE_FATHER_NAME,
  BRIDE_FATHER_ACCOUNT_NUMBER,
  BRIDE_MOTHER_NAME,
  BRIDE_MOTHER_ACCOUNT_NUMBER,
} from "../../config";

const Wrapper = styled.div`
  padding-top: 42px;
  padding-bottom: 18px;
  width: 70%;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1rem;
  color: var(--title-color);
  font-weight: bold;
  opacity: 0.85;
  margin-bottom: 0;
`;

const Content = styled.p`
  font-size: 0.875rem;
  line-height: 1.75;
  opacity: 0.75;
  margin-bottom: 42px;
`;

const SubContent = styled.p`
  font-size: 0.875rem;
  line-height: 1.75;
  opacity: 0.75;
  margin-bottom: 42px;
`;

const Description = styled.p`
  font-size: 0.875rem;
  line-height: 1.75;
  opacity: 0.65;
  margin-top: 8px;
`;

const ButtonWrap = styled.div`
  margin-bottom: 3.125rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  text-align: center;
`;
const ContactButton = styled.div`
  width: 10.75rem;
  border: 1px solid #efddde;
  padding: 2.188rem 0;
`;

const Image = styled.img`
  display: block;
  margin: 0 auto;
  width: 1.375rem;
  padding-bottom: 42px;
`;

const CongratulatoryMoney = () => {
  const [groomVisible, setGroomVisible] = useState(false);
  const [brideVisible, setBrideVisible] = useState(false);

  return (
    <Wrapper>
      <Divider
        data-aos="fade-up"
        plain
        style={{ marginTop: 0, marginBottom: 32 }}
      >
        <Title>축하의 마음을 전하세요</Title>
      </Divider>
      <Image src={Flower} />
      <Content data-aos="fade-up">
        축하의 마음을 담아 축의금을 전달해 보세요.
      </Content>

      <ButtonWrap>
        <ContactButton data-aos="fade-up" onClick={() => setGroomVisible(true)}>
          <CheckCircleTwoTone
            style={{ fontSize: 64, marginBottom: 16 }}
            twoToneColor="#829fe0"
          />
          <br />
          <SubContent>신랑측 계좌번호 확인</SubContent>
        </ContactButton>
        <ContactButton data-aos="fade-up" onClick={() => setBrideVisible(true)}>
          <CheckCircleTwoTone
            style={{ fontSize: 64, marginBottom: 16 }}
            twoToneColor="#fe7daf"
          />
          <br />
          <SubContent>신부측 계좌번호 확인</SubContent>
        </ContactButton>
      </ButtonWrap>
      <Modal
        title={<b>신랑측 계좌번호</b>}
        visible={groomVisible}
        onOk={() => setGroomVisible(false)}
        onCancel={() => setGroomVisible(false)}
        footer={[
          <Description>
            계좌번호 클릭시, 붙여넣기 가능한 텍스트로 복사됩니다.
          </Description>,
        ]}
      >
        <div>
          <b>부 : {GROOM_FATHER_NAME}</b>
          <Divider type="vertical" />
          <CopyToClipboard text={GROOM_FATHER_ACCOUNT_NUMBER}>
            <Button
              type="text"
              style={{ padding: 0, margin: 0 }}
              onClick={() => message.success("계좌번호가 복사되었습니다.")}
            >
              {GROOM_FATHER_ACCOUNT_NUMBER}
            </Button>
          </CopyToClipboard>
        </div>
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <b>모 : {GROOM_MOTHER_NAME}</b>
          <Divider type="vertical" />
          <CopyToClipboard text={GROOM_MOTHER_ACCOUNT_NUMBER}>
            <Button
              type="text"
              style={{ padding: 0, margin: 0 }}
              onClick={() => message.success("계좌번호가 복사되었습니다.")}
            >
              {GROOM_MOTHER_ACCOUNT_NUMBER}
            </Button>
          </CopyToClipboard>
        </div>
        <div>
          <b>신랑 {GROOM_NAME}</b>
          <Divider type="vertical" />
          <CopyToClipboard text={GROOM_ACCOUNT_NUMBER}>
            <Button
              type="text"
              style={{ padding: 0, margin: 0 }}
              onClick={() => message.success("계좌번호가 복사되었습니다.")}
            >
              {GROOM_ACCOUNT_NUMBER}
            </Button>
          </CopyToClipboard>
        </div>
      </Modal>
      <Modal
        title={<b>신부측 계좌번호</b>}
        visible={brideVisible}
        onOk={() => setBrideVisible(false)}
        onCancel={() => setBrideVisible(false)}
        footer={[
          <Description>
            계좌번호 클릭시, 붙여넣기 가능한 텍스트로 복사됩니다.
          </Description>,
        ]}
      >
        <div>
          <b>부 : {BRIDE_FATHER_NAME}</b>
          <Divider type="vertical" />
          <CopyToClipboard text={BRIDE_FATHER_ACCOUNT_NUMBER}>
            <Button
              type="text"
              style={{ padding: 0, margin: 0 }}
              onClick={() => message.success("계좌번호가 복사되었습니다.")}
            >
              {BRIDE_FATHER_ACCOUNT_NUMBER}
            </Button>
          </CopyToClipboard>
        </div>
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <b>모 :{BRIDE_MOTHER_NAME}</b>
          <Divider type="vertical" />
          <CopyToClipboard text={BRIDE_MOTHER_ACCOUNT_NUMBER}>
            <Button
              type="text"
              style={{ padding: 0, margin: 0 }}
              onClick={() => message.success("계좌번호가 복사되었습니다.")}
            >
              {BRIDE_MOTHER_ACCOUNT_NUMBER}
            </Button>
          </CopyToClipboard>
        </div>
        <div>
          <b>신부 {BRIDE_NAME}</b>
          <Divider type="vertical" />
          <CopyToClipboard text={BRIDE_ACCOUNT_NUMBER}>
            <Button
              type="text"
              style={{ padding: 0, margin: 0 }}
              onClick={() => message.success("계좌번호가 복사되었습니다.")}
            >
              {BRIDE_ACCOUNT_NUMBER}
            </Button>
          </CopyToClipboard>
        </div>
      </Modal>
    </Wrapper>
  );
};

export default CongratulatoryMoney;
