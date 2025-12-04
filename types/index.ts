export type DBUserResult = {
  id: number;
  email: string;
  name: string;
  type: 'BUYER' | 'SELLER';
  image: string | null;
  createdAt: Date;
  updatedAt: Date;

  userPoints: {
    points: number;
    grade: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  } | null;
};
