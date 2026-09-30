"use client";

import { useState, useEffect } from "react";
import { Facility } from "@/lib/db/schema";
import { BookingView } from "./BookingView";
import { Badge } from "@/components/ui/badge";
import { BookingActions } from "./BookingActions";

interface FacultyBookingTabsProps {
  initialFacilities: Facility[];
  isStudent?: boolean;
}

interface UserBooking {
  id: string;
  userId: string;
  facilityId: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  rejectionReason?: string;
  cancelReason?: string;
  createdAt: string;
  facility?: {
    name: string;
    location: string;
    type: string;
  };
}

export function FacultyBookingTabs({ initialFacilities, isStudent = false }: FacultyBookingTabsProps) {
  const [activeTab, setActiveTab] = useState<"book" | "my-bookings">("book");
  const [myBookings, setMyBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "my-bookings") {
      fetchMyBookings();
    }
  }, [activeTab]);

  const fetchMyBookings = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to load your bookings.");
      } else {
        setMyBookings(data || []);
      }
    } catch {
      setErrorMsg("An error occurred while fetching bookings.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("book")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "book"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Book a Slot
          </button>
          <button
            onClick={() => setActiveTab("my-bookings")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "my-bookings"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            My Bookings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "book" ? (
        <BookingView initialFacilities={initialFacilities} isStudent={isStudent} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">My Booking Requests</h2>
            <button
              onClick={fetchMyBookings}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Refresh List
            </button>
          </div>

          {errorMsg && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-500 bg-white rounded-lg border">
              Loading your bookings...
            </div>
          ) : myBookings.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 bg-white rounded-lg border border-dashed">
              You have no booking records yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Facility</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Slot Time</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{b.facility?.name || "Facility"}</div>
                        <div className="text-xs text-gray-500">{b.facility?.location}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{b.date}</td>
                      <td className="px-6 py-4">
                        {formatTime(b.slotStart)} - {formatTime(b.slotEnd)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusBadgeVariant(b.status)}>
                          {b.status.replace("_", " ")}
                        </Badge>
                        {b.rejectionReason && (
                          <p className="mt-1 text-xs text-red-500 italic max-w-xs truncate">
                            Rejection Reason: {b.rejectionReason}
                          </p>
                        )}
                        {b.cancelReason && (
                          <p className="mt-1 text-xs text-gray-500 italic max-w-xs truncate">
                            Cancel Reason: {b.cancelReason}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <BookingActions booking={b} isAdmin={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
