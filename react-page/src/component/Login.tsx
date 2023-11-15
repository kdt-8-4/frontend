import { Link } from "@mui/icons-material";
import "../style/login.scss";
import CloseIcon from "@mui/icons-material/Close";

export default function Login() {
  return (
    <>
      <CloseIcon />
      <hr />
      <br />
      <div className="login_logobox">
        기온별 옷차림은,
        <p>옷 늘 날 씨</p>
      </div>
      <br />
      <br />
      <form className="login_form">
        <input type="text" className="login_id" placeholder="아이디" />
        <br />
        <input type="password" className="login_pw" placeholder="비밀번호" />
        <br />
        <br />
        <button type="button">로 그 인</button>
      </form>
      <div className="login_linkbox">
        <a>비밀번호 찾기</a> | <a>회원가입</a>
      </div>
    </>
  );
}
