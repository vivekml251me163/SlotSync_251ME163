import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "ADMIN":
      redirect("/admin/facilities");
    case "FACULTY":
    case "CONVENOR":
      redirect("/faculty/bookings");
    case "STUDENT":
    default:
      redirect("/student");
  }
}
