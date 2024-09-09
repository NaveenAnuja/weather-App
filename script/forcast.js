const key = `d7eb0cf1076149e3b1f181324240609`;

const getCityDetails = async (city) => {
    const base = `https://api.weatherapi.com/v1/current.json`;
    const query = `?key=${key}&q=${city}`;

    const response = await fetch(base + query);
    const data = await response.json();
    return data;
};

const getWeatherNext7days = async (city) => {
    const base = `https://api.weatherapi.com/v1/forecast.json`;
    const query = `?key=${key}&q=${city}&days=7`;

    const response = await fetch(base + query);
    const data = await response.json();
    return data;
};

const getCurentDateTime = async (city) => {
    const base = `https://api.weatherapi.com/v1/timezone.json`;
    const query = `?key=${key}&q=${city}`;

    const response = await fetch(base + query);
    const data = await response.json();
    return data;
};

