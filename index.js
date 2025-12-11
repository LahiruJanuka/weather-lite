document.addEventListener("DOMContentLoaded", () => {
  const cityName = document.querySelector(".inputCityName");
  const formData = document.querySelector(".weatherForm");
  const card = document.querySelector(".card");
  const mainInfo = document.querySelector(".mainInfo");
  const subInfo = document.querySelector(".subInfo");
  const apikey = "9942dfeb2d48ef9184d2ccadecf89869";

  formData.addEventListener("submit", async event => {
    event.preventDefault();
    const city = cityName.value && cityName.value.trim();
    if (city) {
      try {
        const weatherInfo = await getInfo(city);
        showInfo(weatherInfo);
      } catch (error) {
        console.error(error);
        displayError(error.message || error);
      }
    } else {
      displayError("Error: Enter a City!");
    }
  });

  async function getInfo(city) {
    let cleanedCity = city.replace(/[^A-Za-z]/g, "");
    const apiurl = `https://api.openweathermap.org/data/2.5/weather?q=${cleanedCity}&appid=${apikey}&units=metric`;
    const response = await fetch(apiurl);
    if (!response.ok) {
      throw new Error("Couldn't fetch Weather Info!");
    }
    return response.json();
  }

  function showInfo(data) {
    // destructure with safe defaults
    const { name: city = "", 
            sys: { country = "" } = {}, 
            main: { temp = "", humidity = "", feels_like = "", pressure = "" } = {}, 
            wind: { speed = "" } = {}, 
            timezone: timezone, 
            dt: dt,
            weather: [{main, description}] } = data;

    // Clear existing content only inside containers
    mainInfo.innerHTML = "";
    subInfo.innerHTML = "";

    // Build main info
    const main_info = [
      { label: "cityNameDisplay", value: `${city} | ${country}` },
      { label: "datetimeDisplay", value: formatWeatherDateTime(dt, timezone) },
      { label: "tempDisplay", value: `${temp} °C` },
      { label: "descriptionDisplay", value: `${main} : ${description}` }
    ];

    main_info.forEach(info => {
      const p = document.createElement("p");
      p.textContent = info.value;
      p.classList.add(info.label);
      mainInfo.appendChild(p);
    });

    // Build sub info boxes, using data-label for visible label text
    const sub_info = [
      { label: "Feels Like", value: `${feels_like} °C` },
      { label: "Humidity", value: `${humidity} %` },
      { label: "Wind Speed", value: `${speed} m/s` },
      { label: "Pressure", value: `${pressure} hPa` }
    ];

    sub_info.forEach(info => {
      const p = document.createElement("p");
      p.textContent = info.value;
      // set a class name safe for CSS / debugging (no spaces)
      p.classList.add(info.label.replace(/\s+/g, ''));
      // set the pretty label used in ::before
      p.setAttribute('data-label', info.label);
      subInfo.appendChild(p);
    });

    // Show the card by removing the hidden class (keeps CSS rules intact)
    card.classList.remove("hidden");
  }

  function displayError(message) {
    mainInfo.innerHTML = "";
    subInfo.innerHTML = "";
    mainInfo.appendChild(createErrorNode(message));
    // ensure the card is visible
    card.classList.remove("hidden");
  }

  function createErrorNode(msg) {
    const errorMsg = document.createElement("p");
    errorMsg.textContent = msg;
    errorMsg.classList.add("errorMsg");
    return errorMsg;
  }

  function formatWeatherDateTime(dt, timezone) {
    const localTime = new Date((dt + timezone - 19800 + 180) * 1000);
    const parts = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).formatToParts(localTime);
    const dict = {};
    for (const part of parts) {
      if (part.type !== 'literal') dict[part.type] = part.value;
    }
    return `${dict.weekday}, ${dict.month} ${dict.year} ${dict.hour}:${dict.minute} ${dict.dayPeriod}`;
  }

});
