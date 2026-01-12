"use client";

import ToasterProvider from "@/proviers/toaster/toaster.provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToasterProvider
        color={{
          type: "tailwind",
          code: {
            info: "bg-black01",
            warn: "bg-red01",
          },
        }}
      >
        {children}
        <ReactQueryDevtools />
      </ToasterProvider>
    </QueryClientProvider>
  );
}
