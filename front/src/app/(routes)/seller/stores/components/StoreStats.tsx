type StatItem = { label: string; value: number };

export function StoreStats({ stats }: { stats: StatItem[] }) {
  return (
    <section className="border-gray03 text-black01 flex w-[280px] flex-col justify-center gap-10 rounded-2xl border bg-white px-10 py-[3.375rem]">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="flex min-w-[200px] items-center justify-between"
        >
          <span>{label}</span>
          <span className="text-[24px] font-bold">{value.toLocaleString()}</span>
        </div>
      ))}
    </section>
  );
}
