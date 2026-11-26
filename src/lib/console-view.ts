import { cookies } from "next/headers";

export const CONSOLE_VIEW_COOKIE = "lsds_console_view";
export type ConsoleView = "admin" | "instructor";

export async function getConsoleView(): Promise<ConsoleView> {
  const jar = await cookies();
  const raw = jar.get(CONSOLE_VIEW_COOKIE)?.value;
  return raw === "instructor" ? "instructor" : "admin";
}

export function consoleViewLabel(view: ConsoleView) {
  return view === "instructor" ? "Instructor" : "Administrator";
}
