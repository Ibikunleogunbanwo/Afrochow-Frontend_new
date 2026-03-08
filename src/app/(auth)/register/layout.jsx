"use client";

import { FormProvider } from "@/app/(auth)/register/vendor/context/Provider";
import { useEffect } from "react";
import { installStorageDebugTools } from "@/lib/utils/storageMonitor";

export default function RegisterLayout({ children }) {
  // Install debug tools in development
  useEffect(() => {
    installStorageDebugTools();
  }, []);

  return <FormProvider>{children}</FormProvider>;
}
