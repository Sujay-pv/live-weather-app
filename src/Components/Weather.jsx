import React, { useEffect, useState } from "react";
import cloudy from "../assets/images/cloudy.png";
import snowy from "../assets/images/snowy.png";
import sunny from "../assets/images/sunny.png";
import rainy from "../assets/images/rainy.png";
import loadingGif from "../assets/images/loading.gif";

const Weather = () => {
  const api_key = import.meta.env.VITE_API_KEY;
  const [location, setLocation] = useState("Bengaluru");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=Metric&appid=${api_key}`;

  const handleChange = (event) => {
    setLocation(event.target.value);
  };
  useEffect(() => {
    search();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (location.trim().length > 2) {
        fetchSuggestions(location);
      } else {
        setSuggestions([]);
      }
    }, 300); // wait 300ms after typing stops

    return () => clearTimeout(delayDebounce);
  }, [location]);

  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${api_key}`
      );
      const data = await res.json();
      setSuggestions(data); // array of location objects
    } catch (err) {
      console.error("Error fetching location suggestions", err);
    }
  };

const handleSelectSuggestion = (item) => {
  const fullName = `${item.name}${item.state ? `, ${item.state}` : ""}, ${item.country}`;
  setLocation(fullName);
  setSuggestions([]);
  search(fullName); // direct call with the correct value
};




const search = async (loc = location) => {
  if (loc.trim() !== "") {
    try {
      setLoading(true);
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(loc)}&appid=${api_key}&units=metric`;
      const res = await fetch(url);
      const searchData = await res.json();
      if (searchData.cod !== 200) {
        setData({ notFound: true });
      } else {
        setData(searchData);
        console.log(searchData);
        setLocation(""); // clear input
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
};


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  const weatherImages = {
    Clear: sunny,
    Clouds: cloudy,
    Rain: rainy,
    Snow: snowy,
    Haze: cloudy,
    Mist: cloudy,
  };

  const currentWeather = data.weather
    ? weatherImages[data.weather[0].main]
    : null;

  const backgroundImages = {
    Clear: "linear-gradient(to right,  #f3b07c, #fcd283)",
    Clouds: "linear-gradient(to right,  #57d6d4, #71eeec)",
    Rain: "linear-gradient(to right,  #5bc8fb, #80eaff)",
    Snow: "linear-gradient(to right,  #aff2ff, #fff)",
    Haze: "linear-gradient(to right,  #57d6d4, #71eeec)",
    Mist: "linear-gradient(to right,  #57d6d4, #71eeec)",
  };

  const backgroundImage = data.weather
    ? backgroundImages[data.weather[0].main]
    : "linear-gradient(to right,  #57d6d4, #71eeec)";

  function getDate() {
    const today = new Date();
    const month = today.toLocaleString("default", { month: "short" });
    const date = today.getDate();
    const day = today.toLocaleDateString("default", { weekday: "short" });
    return `${day}, ${date} ${month} `;
  }
  const [currentdate, setCurrentDate] = useState(getDate());

  return (
    <div className="container" style={{ backgroundImage }}>
      <div
        className="weather-app"
        style={{
          backgroundImage:
            backgroundImage && backgroundImage.replace
              ? backgroundImage.replace("to right", "to top")
              : null,
        }}
      >
        <div className="search">
          <div className="search-top">
            <i className="fa-solid fa-location-dot"></i>
            <div className="location">{data.name}</div>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter your location"
              value={location}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />

            <i className="fa-solid fa-magnifying-glass" onClick={search}></i>
            {suggestions.length > 0 && (
              <ul className="suggestions-dropdown">
                {suggestions.map((item, index) => (
                  <li key={index} onMouseDown={() => handleSelectSuggestion(item)}>
                    {item.name},{item.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {loading ? (
          <img className="loader" src={loadingGif} alt="loading" />
        ) : data.notFound ? (
          <div className="not-found">Not Found 😒</div>
        ) : (
          <>
            <div className="weather">
              <img src={currentWeather} alt="sunny" />
              <div className="weather-type">
                {data.weather ? data.weather[0].main : null}
              </div>
              <div className="temp">
                {data.main ? `${Math.floor(data.main.temp)}°` : null}
                <div className="feels-like">
                  Feels like{" "}
                  {data.main ? `${Math.floor(data.main.feels_like)}°` : null}
                </div>
              </div>
            </div>
            <div className="weather-date">{currentdate}</div>
            <div className="weather-data">
              <div className="humidity">
                <div className="data-name">Humidity</div>
                <i className="fa-solid fa-droplet"></i>
                <div className="data">
                  {data.main ? `${data.main.humidity}%` : null}
                </div>
              </div>
              <div className="wind">
                <div className="data-name">Wind</div>
                <i className="fa-solid fa-wind"></i>
                <div className="data">
                  {data.wind ? data.wind.speed : null} Km/h
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Weather;
