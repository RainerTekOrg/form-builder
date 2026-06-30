"use client";

import { use } from "react";
import { FillPage } from "@/src/components/fill/FillPage";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const params = use(searchParams);
  return <FillPage embed={params?.embed === "1"} />;
}
