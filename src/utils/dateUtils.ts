type Pasaran = 0 | 1 | 2 | 3 | 4;

const LEGI: Pasaran = 0;
const PAHING: Pasaran = 1;
const PON: Pasaran = 2;
const WAGE: Pasaran = 3;
const KLIWON: Pasaran = 4;

function julianDayNumber(t: Date): number {
  const utc = new Date(t.toISOString());
  const y = utc.getFullYear();
  const m = utc.getMonth() + 1;
  const d = utc.getDate();

  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;

  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

function getPasaran(t: Date): Pasaran {
  const jdn = julianDayNumber(t);
  return (jdn % 5) as Pasaran;
}

export function isFridayPon(t: Date): boolean {
  return t.getDay() === 5 && getPasaran(t) === PON;
}

export function ceilToFridayPon(t: Date): Date {
  const loc = t.getTimezoneOffset();
  const current = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0);
  current.setMinutes(current.getMinutes() - loc);

  for (let i = 0; i < 35; i++) {
    if (isFridayPon(current)) {
      return current;
    }
    current.setDate(current.getDate() + 1);
  }

  return current;
}

export function getAllFridayPons(startYear: number, endYear: number): Date[] {
  const fridayPons: Date[] = [];
  const startDate = new Date(startYear, 0, 1);
  const endDate = new Date(endYear, 11, 31);

  let current = ceilToFridayPon(startDate);

  while (current <= endDate) {
    fridayPons.push(new Date(current));
    current.setDate(current.getDate() + 35);
  }

  return fridayPons;
}

export function formatDateToLocalDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatFridayPonDisplay(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
}

export function toUTCDateTimeString(date: Date): string {
  return date.toISOString();
}
