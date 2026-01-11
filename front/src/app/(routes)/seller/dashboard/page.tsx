"use client";

import MyPageMenu from "@/components/MyPageMenu";
import Divder from "@/components/divider/Divder";
import { menuItems } from "@/data/sellerMenuItems";
import { getDashboard } from "@/lib/api/dashboard";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardBarChart from "./components/DashboardBarChart";
import DashboardCard from "./components/DashboardCard";
import DashboardPieChart from "./components/DashboardPieChart";

const SellerDashboardPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("dashbord");
  const router = useRouter();

  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });

  return (
    <div className="flex w-380 items-start gap-10">
      <MyPageMenu
        items={menuItems}
        selectedId={selectedMenu}
        onSelect={(id, path) => {
          setSelectedMenu(id);
          router.push(path);
        }}
        className="mt-[2.75rem] h-[337.5px] w-[218px]"
      />
      <div className="w-full">
        <h2 className="border-black01 mb-7.5 h-13 border-b text-[1.75rem] leading-none font-extrabold">대시보드</h2>
        <DashboardCard data={data} />
        <Divder className="mt-7.5 mb-10" />
        <div className="grid grid-cols-2 gap-5">
          <div>
            <h2 className="mb-5 text-xl leading-none font-extrabold">많이 판매된 상품 Top5</h2>
            <DashboardPieChart data={data?.topSales} />
          </div>
          <div>
            <h2 className="mb-5 text-xl leading-none font-extrabold">가격대별 매출 비중 조회</h2>
            <DashboardBarChart data={data?.priceRange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
