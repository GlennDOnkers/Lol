export const climateData: Record<string, {
  tempMax: number;
  tempMin: number;
  weathercode: number;
}> = {
  'Las Vegas': { tempMax: 35, tempMin: 22, weathercode: 800 },
  'Los Angeles': { tempMax: 22, tempMin: 15, weathercode: 801 },
  'San Francisco': { tempMax: 18, tempMin: 12, weathercode: 802 },
  'California': { tempMax: 22, tempMin: 14, weathercode: 801 },
  'Nevada': { tempMax: 30, tempMin: 18, weathercode: 800 },
  'Arizona': { tempMax: 32, tempMin: 20, weathercode: 800 },
  'Utah': { tempMax: 25, tempMin: 12, weathercode: 801 },
  'New Mexico': { tempMax: 26, tempMin: 13, weathercode: 800 },
  'Texas': { tempMax: 28, tempMin: 18, weathercode: 801 },
  'Florida': { tempMax: 29, tempMin: 22, weathercode: 500 },
  'Northeast': { tempMax: 15, tempMin: 8, weathercode: 802 },
  'Multi-region': { tempMax: 22, tempMin: 14, weathercode: 801 },
};
