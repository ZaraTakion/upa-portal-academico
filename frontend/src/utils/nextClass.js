const weekdays = {
  domingo: 0, "segunda-feira": 1, "terca-feira": 2,
  "quarta-feira": 3, "quinta-feira": 4, "sexta-feira": 5, sabado: 6,
};
function normalize(day) {
  return String(day || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
/** Select a future class using the campus timezone, not the device timezone. */
export function findNextClass(classes, now = new Date()) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo", weekday: "long",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const find = (type) => parts.find((part) => part.type === type)?.value;
  const today = weekdays[normalize(find("weekday"))];
  const currentMinute = Number(find("hour")) * 60 + Number(find("minute"));
  if (today === undefined || !Array.isArray(classes)) return null;
  const next = classes
    .map((item) => {
      const day = weekdays[normalize(item.weekday)];
      const time = /^(\d{1,2}):(\d{2})/.exec(item.start_time || "");
      if (day === undefined || !time) return null;
      const startMinute = Number(time[1]) * 60 + Number(time[2]);
      let dayOffset = (day - today + 7) % 7;
      if (dayOffset === 0 && startMinute <= currentMinute) dayOffset = 7;
      return { ...item, dayOffset, until: dayOffset * 1440 + startMinute };
    })
    .filter(Boolean)
    .sort((a, b) => a.until - b.until)[0];
  return next || null;
}
