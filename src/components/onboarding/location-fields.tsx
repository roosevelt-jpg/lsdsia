"use client";

import { useEffect, useMemo, useState } from "react";

type Country = { name: string; isoCode: string; flag: string; phonecode: string };
type Subdivision = { name: string; isoCode: string; countryCode: string };
type City = { name: string; countryCode: string; stateCode: string };

type Props = {
  defaultCountry?: string;
  defaultState?: string;
  defaultCity?: string;
  defaultPhoneCountry?: string;
  defaultPhone?: string;
};

export function LocationFields({
  defaultCountry = "United States",
  defaultState = "Minnesota",
  defaultCity = "",
  defaultPhoneCountry = "US",
  defaultPhone = "",
}: Props) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<Subdivision[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateName, setStateName] = useState(defaultState);
  const [city, setCity] = useState(defaultCity);
  const [phoneCountry, setPhoneCountry] = useState(defaultPhoneCountry);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [customCity, setCustomCity] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/geo/countries")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list = (data.countries || []) as Country[];
        setCountries(list);
        const byName = list.find((c) => c.name.toLowerCase() === defaultCountry.toLowerCase());
        const byIso = list.find((c) => c.isoCode === defaultPhoneCountry.toUpperCase());
        const initial = byName || byIso || list.find((c) => c.isoCode === "US") || list[0];
        if (initial) {
          setCountryCode(initial.isoCode);
          if (!defaultPhoneCountry) setPhoneCountry(initial.isoCode);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [defaultCountry, defaultPhoneCountry]);

  useEffect(() => {
    if (!countryCode) return;
    let cancelled = false;
    setLoadingStates(true);
    fetch(`/api/geo/states?country=${encodeURIComponent(countryCode)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list = (data.states || []) as Subdivision[];
        setStates(list);
        const match =
          list.find((s) => s.name.toLowerCase() === defaultState.toLowerCase()) ||
          list.find((s) => s.isoCode.toLowerCase() === defaultState.toLowerCase());
        if (match) {
          setStateCode(match.isoCode);
          setStateName(match.name);
        } else if (list.length === 0) {
          setStateCode("");
          setStateName(defaultState || "");
        } else if (!stateCode) {
          setStateCode("");
          setStateName("");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingStates(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reload when country changes
  }, [countryCode]);

  useEffect(() => {
    if (!countryCode) return;
    let cancelled = false;
    setLoadingCities(true);
    const qs = new URLSearchParams({ country: countryCode });
    if (stateCode) qs.set("state", stateCode);
    fetch(`/api/geo/cities?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list = (data.cities || []) as City[];
        setCities(list);
        if (defaultCity && list.some((c) => c.name.toLowerCase() === defaultCity.toLowerCase())) {
          setCity(defaultCity);
          setCustomCity(false);
        } else if (defaultCity && !list.length) {
          setCity(defaultCity);
          setCustomCity(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on country/state
  }, [countryCode, stateCode]);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.isoCode === countryCode) || null,
    [countries, countryCode],
  );

  const phoneOptions = useMemo(() => {
    const seen = new Set<string>();
    return countries.filter((c) => {
      if (seen.has(c.isoCode)) return false;
      seen.add(c.isoCode);
      return true;
    });
  }, [countries]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">Phone Number</label>
        <div className="flex gap-2">
          <select
            name="phoneCountry"
            value={phoneCountry}
            onChange={(e) => setPhoneCountry(e.target.value)}
            className="h-11 max-w-[9.5rem] rounded-lg border border-[var(--navy)]/15 px-2 text-sm"
          >
            {phoneOptions.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.flag} +{c.phonecode}
              </option>
            ))}
          </select>
          <input
            name="phone"
            defaultValue={defaultPhone}
            className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">Country</label>
        <input type="hidden" name="country" value={selectedCountry?.name || ""} />
        <input type="hidden" name="countryCode" value={countryCode} />
        <select
          value={countryCode}
          onChange={(e) => {
            setCountryCode(e.target.value);
            setStateCode("");
            setStateName("");
            setCity("");
            setCustomCity(false);
            const c = countries.find((x) => x.isoCode === e.target.value);
            if (c) setPhoneCountry(c.isoCode);
          }}
          required
          className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm"
        >
          <option value="" disabled>
            Select country…
          </option>
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">State / Province / Region</label>
        <input type="hidden" name="state" value={stateName} />
        <input type="hidden" name="stateCode" value={stateCode} />
        {states.length > 0 ? (
          <select
            value={stateCode}
            onChange={(e) => {
              const next = states.find((s) => s.isoCode === e.target.value);
              setStateCode(e.target.value);
              setStateName(next?.name || e.target.value);
              setCity("");
              setCustomCity(false);
            }}
            required
            disabled={loadingStates}
            className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm"
          >
            <option value="">{loadingStates ? "Loading…" : "Select state / province…"}</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            placeholder={loadingStates ? "Loading…" : "Enter state, province, or region"}
            className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
          />
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-semibold text-[var(--navy)]">City</label>
        {!customCity && cities.length > 0 ? (
          <div className="space-y-2">
            <select
              name="city"
              value={city}
              onChange={(e) => {
                if (e.target.value === "__other__") {
                  setCustomCity(true);
                  setCity("");
                  return;
                }
                setCity(e.target.value);
              }}
              required
              disabled={loadingCities}
              className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm"
            >
              <option value="">{loadingCities ? "Loading cities…" : "Select city…"}</option>
              {cities.map((c) => (
                <option key={`${c.stateCode}-${c.name}`} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="__other__">Other city (type manually)…</option>
            </select>
            <p className="text-xs text-[var(--steel)]">
              {cities.length.toLocaleString()} cities listed for this area. Choose “Other” if yours is missing.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              list={cities.length ? "geo-city-suggestions" : undefined}
              placeholder="Enter your city"
              className="flex h-11 w-full rounded-lg border border-[var(--navy)]/15 px-3 text-sm outline-none ring-[var(--amber)] focus:ring-2"
            />
            {cities.length > 0 && (
              <datalist id="geo-city-suggestions">
                {cities.slice(0, 800).map((c) => (
                  <option key={`${c.stateCode}-${c.name}`} value={c.name} />
                ))}
              </datalist>
            )}
            {cities.length > 0 && (
              <button
                type="button"
                className="text-xs font-semibold text-[#2b6cb0] hover:underline"
                onClick={() => setCustomCity(false)}
              >
                Back to city list
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
