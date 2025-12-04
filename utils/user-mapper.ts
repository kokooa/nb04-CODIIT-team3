const GRADE_INFO = {
  BRONZE: { rate: 1, minAmount: 0 },
  SILVER: { rate: 3, minAmount: 50000 },
  GOLD: { rate: 5, minAmount: 100000 },
  PLATINUM: { rate: 7, minAmount: 500000 },
} as const;

type Grade = keyof typeof GRADE_INFO;

export const mapUserToClientResponse = (dbUser: any) => {
  // userPoints가 없거나 비어있으면 기본값 사용
  const userPointData =
    dbUser.userPoints && dbUser.userPoints.length > 0
      ? dbUser.userPoints[0]
      : { points: 0, grade: 'BRONZE' }; // 기본값

  const gradeKey = (userPointData.grade || 'BRONZE') as Grade;
  const gradeData = GRADE_INFO[gradeKey] || GRADE_INFO.BRONZE;

  const userGrade = {
    id: `grade_${gradeKey.toLowerCase()}`,
    name: gradeKey,
    rate: gradeData.rate,
    minAmount: gradeData.minAmount,
  };

  const userPayload = {
    id: String(dbUser.id),
    email: dbUser.email,
    name: dbUser.name,
    type: dbUser.type,
    image: dbUser.image,
    createdAt: dbUser.createdAt.toISOString(),
    updatedAt: dbUser.updatedAt.toISOString(),
    points: String(userPointData.points || 0),
    grade: userGrade,
  };

  return userPayload;
};
