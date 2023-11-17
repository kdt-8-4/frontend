import "../style/inputSearch.scss";
import Search from "assets/search.svg";
import Back from "assets/back.svg";

export default function InputSearch() {
  return (
    <div className="container">
      <img src={Back} alt="back" />
      <div id="search">
        <input type="text" placeholder="검색어를 입력하세요" />
        {/* 버튼 ui -> = 취소랑 같은 기능 */}
        <img src={Search} alt="search" />
        <button id="btn_cancel">취소</button>
      </div>
    </div>
  );
}
