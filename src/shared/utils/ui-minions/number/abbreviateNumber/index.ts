export function abbreviateNumber(value: string | number): any {
  // Преобразуем в число
  let num = Number(value);

  // Если значение некорректное или не число — возвращаем исходное
  if (isNaN(num)) return value;

  // Если меньше тысячи — выводим как есть
  if (Math.abs(num) < 1000) return num.toString();

  // Массив единиц измерения: K, M, B, T...
  const units = ["K", "M", "B", "T", "P", "E"];

  let unitIndex = -1;
  // Делим на 1000, пока число не станет < 1000
  // или пока не закончатся доступные суффиксы
  while (Math.abs(num) >= 1000 && unitIndex < units.length - 1) {
    num /= 1000;
    unitIndex++;
  }

  // Округляем вниз (убираем дробную часть)
  num = Math.floor(num);

  // Формируем итоговую строку
  return `${num}${units[unitIndex] || ""}`;
}
