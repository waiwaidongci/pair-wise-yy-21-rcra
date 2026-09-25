import { seed } from "../seed";
import type { Crew } from "../models/Crew";

const rows: Crew[] = (seed.crew as unknown as Crew[]).map((row) => ({ ...row }));

export const crewRepository = {
  findAll: (): Crew[] => rows,
  findById: (id: number): Crew | undefined => rows.find((row) => row.id === id),
  save: (row: unknown) => row
};
