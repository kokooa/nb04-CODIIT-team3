"use client";

import { useUserStore } from "@/stores/userStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, user, isLoading, setLoading } = useUserStore();

  useEffect(() => {
    if (user && isLoading) setLoading(false);
    if ((!accessToken || user?.type !== "SELLER") && !isLoading) {
      console.log(accessToken);
      router.replace("/products");
    }
  }, [accessToken, user, pathname, router, isLoading]);

  if (isLoading) return <></>;

  return <>{children}</>;
}
