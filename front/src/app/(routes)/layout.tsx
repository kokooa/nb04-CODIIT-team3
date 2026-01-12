import { CategoryNav } from "@/components/CategoryNav";

export default function RoutesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CategoryNav />
      <main className="pt-[3.125rem]">{children}</main>
    </div>
  );
}
