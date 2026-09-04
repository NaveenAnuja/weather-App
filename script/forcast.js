const key = `d7eb0cf1076149e3b1f181324240609`;

const getWeather = async (city) => {
    const base = `https://api.weatherapi.com/v1/forecast.json`;
    const query = `?key=${key}&q=${encodeURIComponent(city)}&days=7&aqi=no&alerts=no`;

    const response = await fetch(base + query);

    if (!response.ok) {
        throw new Error("Could not reach the weather service. Try again in a moment.");
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message || "Location not found.");
    }

    return data;
};
