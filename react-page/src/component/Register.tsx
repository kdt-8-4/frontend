import CloseIcon from "@mui/icons-material/Close";
import "../style/register.scss";

export default function Register() {
  return (
    <div id="container">
      <div id="x-div">
        <CloseIcon id="x" />
      </div>
      <hr />
      <section id="main">
        <p>회원가입</p>
        <form>
          {/* 이메일 👉🏻 이메일 형식 유효성 검사*/}
          <label htmlFor="email">이메일</label>
          <div>
            <input type="email" id="email" />
            <button id="btn_verify">인증</button>
          </div>
          {/* 이름*/}
          <label htmlFor="name">이름</label>
          <input type="text" id="name" />
          {/* 닉네임 👉🏻 중복검사*/}
          <label htmlFor="nickname">닉네임</label>
          <input type="text" id="nickname" />
          {/* 비밀번호 👉🏻 중복검사 & 유효성 검사*/}
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            placeholder="비밀번호(8~20자 영문, 숫자, 특수기호 조합)"
          />
          <input type="password" id="re-password" placeholder="비밀번호 확인" />
          <button id="btn_register">옷늘 캐스터 등록</button>
        </form>
      </section>
      <footer></footer>
    </div>
  );
}
