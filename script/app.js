const form = document.getElementById("searchForm");
const statusLine = document.getElementById("statusLine");
const statusText = statusLine.querySelector(".status-text");
const weatherContent = document.getElementById("weatherContent");
const background = document.getElementById("background");
const backgroundSource = document.getElementById("backgroundsource");
const hourlyTrack = document.getElementById("hourlyTrack");
const dailyList = document.getElementById("dailyList");

const els = {
    city: document.getElementById("city"),
    region: document.getElementById("region"),
    status: document.getElementById("status"),
    temp: document.getElementById("temp"),
    timeIcon: document.getElementById("timeIcon"),
    date: document.getElementById("date"),
    time: document.getElementById("time"),
    hiLo: document.getElementById("hiLo"),
    feelsLike: document.getElementById("feelsLike"),
    wind: document.getElementById("wind"),
    humidity: document.getElementById("humidity"),
    uv: document.getElementById("uv"),
    visibility: document.getElementById("visibility"),
    pressure: document.getElementById("pressure"),
};

const formatDayShort = (dateString) => {
    const date = new Date(`${dateString}T12:00:00`);
    return date.toLocaleDateString("en-US", { weekday: "short" });
};

const formatFullDate = (dateString) => {
    const date = new Date(`${dateString}T12:00:00`);
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
};

const formatHour = (timeString) => {
    const hour = Number(timeString.slice(11, 13));
    const suffix = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12} ${suffix}`;
};

const safeRound = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? Math.round(num) : null;
};

const setStatus = (mode, message) => {
    const isFirstLoad = weatherContent.hidden;

    document.body.classList.toggle("is-loading", mode === "loading" && isFirstLoad);
    document.body.classList.toggle("is-refreshing", mode === "loading" && !isFirstLoad);
    document.body.classList.toggle("is-error", mode === "error");

    if (mode === "ready") {
        document.body.classList.remove("is-loading", "is-error", "is-refreshing");
        weatherContent.hidden = false;
        return;
    }

    if (mode === "error") {
        document.body.classList.remove("is-refreshing");
        weatherContent.hidden = true;
        statusText.textContent = message;
        return;
    }

    if (isFirstLoad) {
        weatherContent.hidden = true;
        statusText.textContent = message;
    }
};

const replayEntrance = () => {
    weatherContent.classList.remove("is-animating");
    // Force reflow so the animation can restart
    void weatherContent.offsetWidth;
    weatherContent.classList.add("is-animating");
};

const setTheme = (isDay) => {
    document.body.dataset.theme = isDay ? "day" : "night";

    const videoSrc = isDay ? "videos/dayTime.mp4" : "videos/nightTime.mp4";
    const current = backgroundSource.getAttribute("src") || "";

    if (!current.endsWith(videoSrc)) {
        backgroundSource.setAttribute("src", videoSrc);
        background.load();
        background.play().catch(() => {});
    }

    background.classList.add("is-ready");
};

const buildHourly = (forecastDays, localTime) => {
    const currentHour = Number(localTime.slice(11, 13));
    const hours = [];

    forecastDays.forEach((day) => {
        (day.hour || []).forEach((hour) => hours.push(hour));
    });

    let startIndex = hours.findIndex((h) => {
        const sameDay = h.time.slice(0, 10) === localTime.slice(0, 10);
        const hour = Number(h.time.slice(11, 13));
        return sameDay && hour >= currentHour;
    });

    if (startIndex < 0) startIndex = 0;

    const slice = hours.slice(startIndex, startIndex + 24);

    hourlyTrack.innerHTML = slice
        .map((hour, index) => {
            const isNow = index === 0;
            const temp = safeRound(hour.temp_c);
            return `
                <article class="hour-card${isNow ? " is-now" : ""}" style="animation-delay: ${index * 0.035}s">
                    <p class="hour-time">${isNow ? "Now" : formatHour(hour.time)}</p>
                    <img src="https:${hour.condition.icon}" alt="${hour.condition.text}" width="40" height="40" loading="lazy">
                    <p class="hour-temp">${temp === null ? "—" : `${temp}°`}</p>
                </article>
            `;
        })
        .join("");
};

const buildDaily = (forecastDays) => {
    dailyList.innerHTML = forecastDays
        .map((day, index) => {
            const label = index === 0 ? "Today" : formatDayShort(day.date);
            const high = safeRound(day.day.maxtemp_c);
            const low = safeRound(day.day.mintemp_c);
            return `
                <article class="day-row" style="animation-delay: ${0.04 + index * 0.05}s">
                    <p class="day-name">${label}</p>
                    <img src="https:${day.day.condition.icon}" alt="" width="34" height="34" loading="lazy">
                    <p class="day-cond">${day.day.condition.text}</p>
                    <p class="day-temps">
                        <span class="day-high">${high === null ? "—" : `${high}°`}</span>
                        <span class="day-low">${low === null ? "—" : `${low}°`}</span>
                    </p>
                </article>
            `;
        })
        .join("");
};

const updateUi = (data) => {
    const { location, current, forecast } = data;
    const today = forecast.forecastday[0];
    const isDay = Number(current.is_day) === 1;
    const temp = safeRound(current.temp_c);
    const feels = safeRound(current.feelslike_c);
    const wind = safeRound(current.wind_kph);
    const high = safeRound(today?.day?.maxtemp_c);
    const low = safeRound(today?.day?.mintemp_c);
    const uv = safeRound(current.uv);
    const visibility = safeRound(current.vis_km);
    const pressure = safeRound(current.pressure_mb);

    setTheme(isDay);

    els.city.textContent = location.name || "Unknown";
    els.region.textContent = [location.region, location.country].filter(Boolean).join(", ");
    els.status.textContent = current.condition?.text || "—";
    els.temp.textContent = temp === null ? "—" : String(temp);
    els.timeIcon.src = current.condition?.icon ? `https:${current.condition.icon}` : "";
    els.timeIcon.alt = current.condition?.text || "";

    const localDate = String(location.localtime || "").slice(0, 10);
    els.date.textContent = localDate ? formatFullDate(localDate) : "—";
    els.time.textContent = String(location.localtime || "").slice(11, 16) || "—";
    els.hiLo.textContent = `H ${high === null ? "—" : high}° · L ${low === null ? "—" : low}°`;

    els.feelsLike.textContent = feels === null ? "—" : `${feels}°`;
    els.wind.textContent = wind === null ? "—" : `${wind} km/h`;
    els.humidity.textContent = current.humidity != null ? `${current.humidity}%` : "—";
    els.uv.textContent = uv === null ? "—" : String(uv);
    els.visibility.textContent = visibility === null ? "—" : `${visibility} km`;
    els.pressure.textContent = pressure === null ? "—" : `${pressure} mb`;

    buildHourly(forecast.forecastday, location.localtime);
    buildDaily(forecast.forecastday);

    setStatus("ready");
    replayEntrance();
};

const loadWeather = async (city) => {
    setStatus("loading", "Fetching the sky…");

    try {
        const data = await getWeather(city);
        updateUi(data);
    } catch (err) {
        console.error(err);
        setStatus("error", err.message || "Something went wrong. Try another city.");
    }
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = form.userLocation.value.trim();
    if (!city) return;
    form.reset();
    loadWeather(city);
});

const enableHourlyDragScroll = (track) => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let moved = false;

    const endDrag = () => {
        if (!isDown) return;
        isDown = false;
        track.classList.remove("is-dragging");
    };

    track.addEventListener("mousedown", (e) => {
        isDown = true;
        moved = false;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        track.classList.add("is-dragging");
    });

    track.addEventListener("mouseleave", endDrag);
    track.addEventListener("mouseup", endDrag);

    track.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.25;
        if (Math.abs(walk) > 3) moved = true;
        track.scrollLeft = scrollLeft - walk;
    });

    track.addEventListener("click", (e) => {
        if (moved) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    track.addEventListener(
        "wheel",
        (e) => {
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
            e.preventDefault();
            track.scrollBy({ left: e.deltaY, behavior: "smooth" });
        },
        { passive: false }
    );

    track.addEventListener("dragstart", (e) => e.preventDefault());
};

enableHourlyDragScroll(hourlyTrack);

window.addEventListener("load", () => {
    loadWeather("Colombo");
});
