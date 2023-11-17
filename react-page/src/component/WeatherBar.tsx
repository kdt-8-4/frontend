import "style/weatherBar.scss";
import PartlyCloudDay from "assets/partly-cloudy-day.svg";

export default function WeatherBar() {
  return (
    <div id="container">
      <div id="weather">
        <img src={PartlyCloudDay} alt="partly-cloudy-day" />
        <span>7℃</span>
      </div>
      <div id="maxmin">
        <span>최고 10℃&nbsp;</span>
        &nbsp;
        <span>최저 0℃</span>
      </div>
    </div>
  );
}
