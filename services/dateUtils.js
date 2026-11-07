
 // Получаем дату в формате ГГГГ-ММ-ДД для хранения
export function dateToKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Получаем сегодняшнюю дату без ошибок из-за часового пояса
export function getTodayKey() {
  return dateToKey(new Date());
}

// Преобразуем дату хранения в российский формат ДД.ММ.ГГГГ
export function formatDateRussian(dateKey) {
  if (!dateKey) return '';

  const [year, month, day] = dateKey.split('-');

  return `${day}.${month}.${year}`;
}

// Преобразуем ключ даты обратно в объект Date
export function keyToDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

// Перемещаемся на указанное количество дней
export function shiftDate(dateKey, amount) {
  const date = keyToDate(dateKey);
  date.setDate(date.getDate() + amount);

  return dateToKey(date);
}
