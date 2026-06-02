import type { FormPayload } from "@/src/contract/types";

export function downloadJson(payload: FormPayload, filename = "form.json") {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyJson(payload: FormPayload): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    return true;
  } catch {
    return false;
  }
}
