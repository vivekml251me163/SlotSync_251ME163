import { db } from "@/lib/db";
import { facilities } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { FacultyBookingTabs } from "@/components/booking-form/FacultyBookingTabs";

export const dynamic = "force-dynamic";

export default async function FacultyBookingsPage() {
  const session = await auth();
  const isStudent = session?.user?.role === "STUDENT";

  const facilityList = await db
    .select()
    .from(facilities)
    .orderBy(facilities.name);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facility Bookings</h1>
        <p className="text-sm text-gray-500">
          Book new facility slots and manage your existing booking requests.
        </p>
      </div>

      <FacultyBookingTabs initialFacilities={facilityList} isStudent={isStudent} />
    </div>
  );
}
