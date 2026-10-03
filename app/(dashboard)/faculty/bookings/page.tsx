import { auth } from "@/lib/auth";
import FacultyBookingsClient from "./FacultyBookingsClient";

export const dynamic = "force-dynamic";

export default async function FacultyBookingsPage() {
  const session = await auth();
  const isStudent = session?.user?.role === "STUDENT";

  return <FacultyBookingsClient isStudent={isStudent} />;
}
