import raw from "./state_districts_in.json";

type StateBlock = { name: string; districts: string[] };

type GeoRoot = {
  states: StateBlock[];
  union_territories: StateBlock[];
};

const data = raw as GeoRoot;

/** States + UTs sorted for dropdowns */
export function getAllStates(): string[] {
  const states = data.states.map((s) => s.name);
  const uts = data.union_territories.map((s) => s.name);
  return [...states, ...uts];
}

/** Districts for a state or UT; case-insensitive name match */
export function getDistrictsByState(stateName: string): string[] | null {
  if (!stateName) return null;
  const q = stateName.toLowerCase();
  const state = data.states.find((s) => s.name.toLowerCase() === q);
  if (state) return state.districts;
  const ut = data.union_territories.find((s) => s.name.toLowerCase() === q);
  if (ut) return ut.districts;
  return null;
}
