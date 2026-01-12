import { PrismaClient, UserGrade } from '@prisma/client';
import { GRADE_POLICIES, type UserPointResponse } from '../types/index.js'; // 경로 확인 필요

// ✅ [Helper] 등급별 적립률 매핑 (GRADE_POLICIES의 텍스트와 로직 연결)
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

    // 다음 등급 찾기 로직
    // GRADE_POLICIES는 오름차순(0, 10만, 30만...)이라고 가정
    // 현재 등급 기준 금액보다 큰 등급 중 가장 첫 번째 것을 찾음
    const nextPolicy = GRADE_POLICIES.find(
      policy => policy.minAmount > currentAccumulated,
    );

    let nextGradeName: string | null = null;
    let remainingPoint = 0;
    let progressPercent = 0;

    if (nextPolicy) {
      nextGradeName = nextPolicy.grade;
      remainingPoint = nextPolicy.minAmount - currentAccumulated;

      // 진행률 계산 (현재 누적 / 다음 등급 기준) * 100
      // 예: 누적 5만 / 목표 10만 = 50%
      // 단, 이전 등급 기준액을 빼고 계산하는 방식도 있지만, 여기선 단순 누적 비율로 계산
      progressPercent = Math.min(
        Math.floor((currentAccumulated / nextPolicy.minAmount) * 100),
        99, // 100%가 되면 승급이므로 99%에서 멈춤 표시 (선택사항)
      );
    } else {
      // 다음 등급이 없으면(VIP)
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

  // 2. [내부 로직] 누적 금액 업데이트 및 등급 재산정
  // PurchaseService에서 결제 완료 시 호출합니다.
  async updateGrade(tx: any, userId: string, addedAmount: number) {
    // 1. 현재 정보 가져오기
    const userPoint = await tx.userPoint.findUnique({ where: { userId } });
    if (!userPoint) return;

    // 2. 누적 금액 업데이트
    const newAccumulated = userPoint.accumulatedAmount + addedAmount;

    // 3. 새로운 등급 계산
    // 정책을 뒤집어서(고등급부터) 내 누적금액이 기준을 넘는지 확인
    const sortedPolicies = [...GRADE_POLICIES].sort(
      (a, b) => b.minAmount - a.minAmount,
    );

    const matchPolicy = sortedPolicies.find(
      policy => newAccumulated >= policy.minAmount,
    );

    const newGrade = (matchPolicy?.grade as UserGrade) || UserGrade.Green;
    const newRate = GRADE_RATES[newGrade] || 0.01;

    // 4. DB 업데이트 (등급이 바뀌었거나 누적금액이 바뀌었으므로 업데이트)
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
