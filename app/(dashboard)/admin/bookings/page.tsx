import { db } from "@/lib/db";
import { bookings, facilities, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { BookingActions } from "@/components/booking-form/BookingActions";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookingList = await db
    .select({
      id: bookings.id,
      userId: bookings.userId,
      facilityId: bookings.facilityId,
      date: bookings.date,
      slotStart: bookings.slotStart,
      slotEnd: bookings.slotEnd,
      status: bookings.status,
      rejectionReason: bookings.rejectionReason,
      cancelReason: bookings.cancelReason,
      createdAt: bookings.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      facility: {
        id: facilities.id,
        name: facilities.name,
        location: facilities.location,
        type: facilities.type,
      },
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.userId, users.id))
    .leftJoin(facilities, eq(bookings.facilityId, facilities.id))
    .orderBy(bookings.createdAt);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELLATION_REQUESTED":
        return "warning";
      case "REJECTED":
      case "CANCELLED":
        return "danger";
      default:
        return "outline";
    }
  };

  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-sm text-gray-500">
          Review, approve, reject, or handle cancellation requests for all facility bookings.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-semibold">User</th>
              <th className="px-6 py-3 font-semibold">Facility</th>
              <th className="px-6 py-3 font-semibold">Date</th>
              <th className="px-6 py-3 font-semibold">Slot Time</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookingList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No booking requests found.
                </td>
              </tr>
            ) : (
              bookingList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.user?.name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{item.user?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.facility?.name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{item.facility?.location}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.date}</td>
                  <td className="px-6 py-4">
                    {formatTime(item.slotStart)} - {formatTime(item.slotEnd)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status.replace("_", " ")}
                    </Badge>
                    {item.cancelReason && (
                      <p className="mt-1 text-xs text-gray-500 italic max-w-xs truncate">
                        Reason: {item.cancelReason}
                      </p>
                    )}
                    {item.rejectionReason && (
                      <p className="mt-1 text-xs text-red-500 italic max-w-xs truncate">
                        Rejected: {item.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <BookingActions booking={item} isAdmin={true} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
