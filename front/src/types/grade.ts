export interface Grade {
  id: string;
  name: string;
  rate: number;
  minAmount: number;
}

export type GradeResponse = Grade[];
