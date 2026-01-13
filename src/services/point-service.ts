import { PrismaClient, UserGrade } from '@prisma/client';
import { GRADE_POLICIES, type UserPointResponse } from '../types/index.js';

const GRADE_RATES: { [key in UserGrade]: number } = {
  Green: 0.01, // 1%
  Orange: 0.02, // 2%
  Red: 0.03, // 3%
  Black: 0.05, // 5%
  VIP: 0.07, // 7%
};

class PointServiceClass {
  private prisma = new PrismaClient();

  // 1. 내 포인트 대시보드 정보 조회 (DTO 반환)
  async getMyPointInfo(userId: string): Promise<UserPointResponse> {
    // 유저 포인트 정보 조회 (없으면 생성)
    let userPoint = await this.prisma.userPoint.findUnique({
      where: { userId },
    });

    if (!userPoint) {
      userPoint = await this.prisma.userPoint.create({
        data: {
          userId,
          grade: UserGrade.Green,
          points: 0,
          accumulatedAmount: 0,
          pointRate: 0.01,
        },
      });
    }

    const currentGrade = userPoint.grade;
    const currentAccumulated = userPoint.accumulatedAmount;

    const nextPolicy = GRADE_POLICIES.find(
      policy => policy.minAmount > currentAccumulated,
    );

    let nextGradeName: string | null = null;
    let remainingPoint = 0;
    let progressPercent = 0;

    if (nextPolicy) {
      nextGradeName = nextPolicy.grade;
      remainingPoint = nextPolicy.minAmount - currentAccumulated;

      progressPercent = Math.min(
        Math.floor((currentAccumulated / nextPolicy.minAmount) * 100),
        99,
      );
    } else {
      nextGradeName = null;
      remainingPoint = 0;
      progressPercent = 100;
    }

    // ✅ 프론트엔드 요구사항(UserPointResponse)에 딱 맞춰 반환
    return {
      userSummary: {
        currentPoint: userPoint.points,
        currentGrade: currentGrade, // "Green" 등 Enum 값
        nextGrade: nextGradeName,
        remainingPoint: remainingPoint,
        progressPercent: progressPercent,
      },
    };
  }

  async updateGrade(tx: any, userId: string, addedAmount: number) {
    // 1. 현재 유저 포인트 정보 조회
    const userPoint = await tx.userPoint.findUnique({ where: { userId } });

    // 없으면 생성 (방어 코드)
    const currentData =
      userPoint ||
      (await tx.userPoint.create({
        data: {
          userId,
          grade: 'Green',
          points: 0,
          accumulatedAmount: 0,
          pointRate: 0.01,
        },
      }));

    // 2. 누적 금액 업데이트
    const oldAccumulated = currentData.accumulatedAmount;
    const newAccumulated = oldAccumulated + addedAmount;

    const sortedPolicies = [...GRADE_POLICIES].sort(
      (a, b) => b.minAmount - a.minAmount,
    );

    const matchPolicy = sortedPolicies.find(
      policy => newAccumulated >= policy.minAmount,
    );

    const newGrade = (matchPolicy?.grade as UserGrade) || UserGrade.Green;
    const newRate = GRADE_RATES[newGrade] || 0.01;

    // 4. DB 업데이트 (누적 금액과 등급을 동시에 저장)
    await tx.userPoint.update({
      where: { userId },
      data: {
        accumulatedAmount: newAccumulated,
        grade: newGrade,
        pointRate: newRate,
      },
    });
  }
}

export const PointService = new PointServiceClass();
