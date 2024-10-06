const form = document.querySelector('form');
const timeImage = document.getElementById('timeImage');
const timeIcon = document.getElementById('timeIcon');
const weather_info = document.querySelector('.weather-info');
const appBody = document.querySelector('.app-body');
const forecastItemsContainer = document.querySelector('.forcast-items-container');
const forecast24hoursContainer1 = document.querySelector('.forecast-24-hours-container1');
const forecast24hoursContainer2 = document.querySelector('.forecast-24-hours-container2');
const forecastName = document.querySelector('.forecast-title');
const background = document.getElementById('background');
const backgroundsource = document.getElementById('backgroundsource');
const currentdateTime = document.querySelector('.current-date-time');




const formatDate1 = (dateString) => {
    const options = { month: 'short', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
};


const formatDate2 = (dateStr) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', options);
};

const getInfo = async (city) => {
    const cityData = await getCityDetails(city);
    const weatherData = await getWeatherNext7days(city);
    const currentDateTime = await getCurrentDateTime(city);

    return { cityData, weatherData, currentDateTime };
};

const updateUi = (data) => {
    const cityData = data.cityData;
    const weatherData = data.weatherData;
    const currentDateTime = data.currentDateTime;

    let isTime = cityData.current.is_day;

    if (isTime === 0) {
        timeImage.setAttribute('src', 'images/nightTime.png');
        backgroundsource.setAttribute('src', 'videos/nightTime.mp4');
        background.load();
        background.play();
    } else if (isTime === 1) {
        timeImage.setAttribute('src', 'images/dayTime.png');
        backgroundsource.setAttribute('src', 'videos/dayTime.mp4');
        background.load();
        background.play();
    }

    const iconUrl = cityData.current.condition.icon;
    const fillIcon = `https:${iconUrl}`;
    timeIcon.setAttribute('src', fillIcon);

    const cityName = String(cityData.location.name).toUpperCase();

    const info = `<p id="city">${cityName}</p>
                    <p id="status">${cityData.current.condition.text}</p>
                    <p id="temp"><span class="temperature-label">Temperature</span>${cityData.current.temp_c} &#8451;</p>
                    <p id="wind"><span class="wind-label">Wind Speed</span> ${cityData.current.wind_kph} &#127786;</p>
                    <p id="humidity"><span class="humidity-label">Humidity</span>  ${cityData.current.humidity}&#128167;</p>`;

    weather_info.innerHTML = info;

    const title = `<p id="name">7-Day forecast ${cityName}</p>`;
    forecastName.innerHTML = title;

    forecastItemsContainer.innerHTML = '';

   

 for (let i = 0; i < 3; i++) { 
     const forecastdate = weatherData.forecast.forecastday[i].date;
     const formatdate = formatDate1(forecastdate);
     const forecastimage = weatherData.forecast.forecastday[i].day.condition.icon;
     const forecasttemp = weatherData.forecast.forecastday[i].day.mintemp_c;

     const forecastItem = document.createElement('div');
     forecastItem.classList.add('forcast-item');

     forecastItem.innerHTML = `<h5 class="forcast-item-date">${formatdate}</h5>
                               <img src="https:${forecastimage}" class="forcast-item-image">
                               <h5 class="forcast-item-temp">${forecasttemp} &#8451;</h5>`;

     forecastItemsContainer.appendChild(forecastItem);
 }


    const date = weatherData.forecast.forecastday[0].date;
    const updateDate = formatDate2(date);
    const updateTime = currentDateTime.location.localtime.substring(11, 16);

    const dateTime = `<p id="time">${updateTime}</p>
                      <p id="date">${updateDate}</p>`;

    currentdateTime.innerHTML = dateTime;

    forecast24hoursContainer1.innerHTML = '';
    for (let i = 0; i < 1; i++) {
        for (let j = 0; j < 12; j++) {
            const forecastTime = weatherData.forecast.forecastday[i].hour[j].time;
            const forecastImage = weatherData.forecast.forecastday[i].hour[j].condition.icon;
            const forecastCondition = weatherData.forecast.forecastday[i].hour[j].condition.text;
            const forecastTemp = weatherData.forecast.forecastday[i].hour[j].temp_c;

            const forecast24Item = document.createElement('div');
            forecast24Item.classList.add('forecast-24-items');

            forecast24Item.innerHTML = `<h5 class="forecast-item-time">${forecastTime.substring(11)}<small> hrs</small></h5>  
                                        <img src="https:${forecastImage}" class="forecast-24-image"> 
                                        <h5 class="forecast-status">${forecastCondition}</h5>
                                        <h5 class="forecast-24-temp">${forecastTemp} &#8451;</h5>`;

            forecast24hoursContainer1.appendChild(forecast24Item);
        }
    }

    forecast24hoursContainer2.innerHTML = '';
    for (let i = 0; i < 1; i++) {
        for (let j = 12; j < 24; j++) {
            const forecastTime = weatherData.forecast.forecastday[i].hour[j].time;
            const forecastImage = weatherData.forecast.forecastday[i].hour[j].condition.icon;
            const forecastCondition = weatherData.forecast.forecastday[i].hour[j].condition.text;
            const forecastTemp = weatherData.forecast.forecastday[i].hour[j].temp_c;

            const forecast24Item = document.createElement('div');
            forecast24Item.classList.add('forecast-24-items');

            forecast24Item.innerHTML = `<h5 class="forecast-item-time">${forecastTime.substring(11)}<small> hrs</small></h5>  
                                        <img src="https:${forecastImage}" class="forecast-24-image"> 
                                        <h5 class="forecast-status">${forecastCondition}</h5>
                                        <h5 class="forecast-24-temp">${forecastTemp} &#8451;</h5>`;

            forecast24hoursContainer2.appendChild(forecast24Item);
        }
    }

    appBody.style.display = "block";
    background.style.display = "block";
    forecastItemsContainer.style.display = "grid";
    forecast24hoursContainer1.style.display = "flex";
    forecast24hoursContainer2.style.display = "flex";
    forecastName.style.display = "block";
    currentdateTime.style.display = "block";

    const forecastItems = document.querySelectorAll('.forcast-item');
    forecastItems.forEach(item => {
        item.style.display = "block";
    });

    const forecast24Item = document.querySelectorAll('.forecast-24-items');
    forecast24Item.forEach(item => {
        item.style.display = "block";
    });
};

form.addEventListener('submit', e => {
    e.preventDefault();

    const city = form.userLocation.value.trim();
    form.reset();

    getInfo(city)
        .then(data => {
            updateUi(data);
            console.log(data);
        })
        .catch(err => console.log(err));
});