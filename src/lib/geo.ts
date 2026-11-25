import { City, Country, State } from "country-state-city";

export type GeoCountry = {
  name: string;
  isoCode: string;
  flag: string;
  phonecode: string;
};

export type GeoSubdivision = {
  name: string;
  isoCode: string;
  countryCode: string;
};

export type GeoCity = {
  name: string;
  countryCode: string;
  stateCode: string;
};

export function listCountries(): GeoCountry[] {
  return Country.getAllCountries()
    .map((c) => ({
      name: c.name,
      isoCode: c.isoCode,
      flag: c.flag,
      phonecode: c.phonecode.replace(/^\+/, ""),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listStates(countryCode: string): GeoSubdivision[] {
  if (!countryCode) return [];
  return State.getStatesOfCountry(countryCode.toUpperCase())
    .map((s) => ({
      name: s.name,
      isoCode: s.isoCode,
      countryCode: s.countryCode,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listCities(countryCode: string, stateCode?: string): GeoCity[] {
  if (!countryCode) return [];
  const cc = countryCode.toUpperCase();
  const rows =
    (stateCode ? City.getCitiesOfState(cc, stateCode) : City.getCitiesOfCountry(cc)) || [];
  const seen = new Set<string>();
  const out: GeoCity[] = [];
  for (const c of rows) {
    const key = c.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: c.name, countryCode: c.countryCode, stateCode: c.stateCode });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function countryByIso(isoCode: string) {
  return listCountries().find((c) => c.isoCode === isoCode.toUpperCase()) || null;
}

export function countryByName(name: string) {
  const n = name.trim().toLowerCase();
  return listCountries().find((c) => c.name.toLowerCase() === n) || null;
}
