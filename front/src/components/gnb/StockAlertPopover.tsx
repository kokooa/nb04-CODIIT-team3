"use client";

import useIntersectionObserver from "@/hooks/useIntersection";
import { postRefresh } from "@/lib/api/auth";
import { connectNotificationSSE, getNotifications, updateNotificationCheck } from "@/lib/api/notification";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import styles from "@/styles/scrollbar.module.css";
import { NotificationItem } from "@/types/notification";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export default function StockAlertPopover() {
  const queryClient = useQueryClient();
  const toaster = useToaster();
  const hasWarnedRef = useRef(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const PAGE_SIZE = 10;

  // 알림 목록 가져오기 (무한 스크롤)
  const {
    data: notificationData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam = 1 }) => {
      return getNotifications({ page: pageParam, pageSize: PAGE_SIZE });
    },
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지의 아이템 수가 pageSize보다 적으면 더 이상 페이지가 없음
      if (lastPage.list.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 0,
  });

  // 모든 페이지의 알림을 하나의 배열로 합치기
  const notifications = notificationData?.pages.flatMap((page) => page.list) ?? [];

  // 알림 읽음 처리
  const mutation = useMutation({
    mutationFn: updateNotificationCheck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 읽지 않은 알림이 있는지 확인
  useEffect(() => {
    if (notifications.length > 0) {
      setHasUnread(notifications.some((n) => !n.isChecked));
    }
  }, [notifications]);

  // SSE 연결
  useEffect(() => {
    let eventSource: EventSource;

    const connect = () => {
      eventSource = connectNotificationSSE();

      eventSource.onmessage = (event) => {
        if (!event.data || event.data === "[]" || event.data === "{}") return;

        try {
          const newAlarm: NotificationItem = JSON.parse(event.data);

          // id 없는 경우
          if (!newAlarm?.id) return;

          // 새 알림이 오면 쿼리 무효화하여 첫 페이지를 다시 가져옴
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          setHasUnread(true); // 배지
        } catch {
          console.warn("잘못된 데이터:", event.data);
        }
      };

      eventSource.onerror = async () => {
        if (eventSource.readyState === EventSource.CLOSED) {
          eventSource.close(); // 에러 시 연결 닫힘

          try {
            // access token 갱신
            await postRefresh();
            // 성공 시 SSE 재연결
            connect();
          } catch {
            if (!hasWarnedRef.current) {
              toaster("warn", "토큰 갱신 실패");
              hasWarnedRef.current = true;
            }
          }
        }
      };
    };
    connect();

    return () => eventSource?.close();
  }, [toaster]);

  // 팝오버 열릴 때
  useEffect(() => {
    if (isOpen) {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // setHasUnread(false);
    }
  }, [isOpen, queryClient]);

  // 무한 스크롤을 위한 Intersection Observer
  const { setTarget } = useIntersectionObserver({
    threshold: 0.1,
    hasNextPage,
    fetchNextPage,
  });

  const handleClick = (alarmId: string) => {
    mutation.mutate(alarmId);
  };

  return (
    <div
      ref={popoverRef}
      className="relative"
    >
      <button
        className="flex cursor-pointer items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          src="/icon/bell.svg"
          alt=""
          width={20}
          height={20}
        />
        {hasUnread && <span className="absolute top-0 right-0 h-1 w-1 rounded-full bg-red-500" />}
      </button>

      {isOpen && (
        <div
          className={`border-gray04 absolute left-0 z-[60] mt-2 h-[420px] w-[300px] cursor-pointer overflow-y-auto rounded-lg border bg-white p-5 ${styles["scrollbar-hidden"]}`}
        >
          {notifications.length === 0 ? (
            <p className="text-black01 pb-4 text-sm font-normal">알림이 없습니다.</p>
          ) : (
            <>
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="border-gray04 relative mb-5 flex flex-col border-b pb-4 last:mb-0 last:border-none"
                  onClick={() => handleClick(item.id)}
                >
                  {!item.isChecked && (
                    <span className="absolute top-0 right-0 h-[6px] w-[6px] rounded-full bg-red-500" />
                  )}
                  <p className="text-black01 h-11 text-sm font-normal">{item.content}</p>
                  <span className="text-gray01 mt-[5px] self-end text-sm">{dayjs(item.createdAt).fromNow()}</span>
                </div>
              ))}
              {/* 무한 스크롤을 위한 타겟 요소 */}
              {hasNextPage && (
                <div
                  ref={setTarget}
                  className="flex items-center justify-center py-4"
                >
                  {isFetchingNextPage && <p className="text-gray01 text-sm">로딩 중...</p>}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
