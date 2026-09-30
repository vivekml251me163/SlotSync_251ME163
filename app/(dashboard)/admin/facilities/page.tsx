import { db } from "@/lib/db";
import { facilities } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { AddFacilityDialog } from "@/components/booking-form/AddFacilityDialog";
import { FacilityActions } from "@/components/booking-form/FacilityActions";

export const dynamic = "force-dynamic";

export default async function AdminFacilitiesPage() {
  const facilityList = await db
    .select()
    .from(facilities)
    .orderBy(facilities.name);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "success";
      case "UNDER_MAINTENANCE":
        return "warning";
      case "UNAVAILABLE":
        return "danger";
      default:
        return "outline";
    }
  };

  const formatType = (type: string) => {
    switch (type) {
      case "classroom":
        return "Classroom";
      case "seminar_hall":
        return "Seminar Hall";
      case "lab":
        return "Lab";
      case "sports":
        return "Sports Complex";
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facility Management</h1>
          <p className="text-sm text-gray-500">
            View, add, edit, and manage all campus facilities.
          </p>
        </div>
        <AddFacilityDialog />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Type</th>
              <th className="px-6 py-3 font-semibold">Location</th>
              <th className="px-6 py-3 font-semibold">Capacity</th>
              <th className="px-6 py-3 font-semibold">Hours</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {facilityList.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No facilities found. Click &quot;Add Facility&quot; to create one.
                </td>
              </tr>
            ) : (
              facilityList.map((facility) => (
                <tr key={facility.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {facility.name}
                  </td>
                  <td className="px-6 py-4">{formatType(facility.type)}</td>
                  <td className="px-6 py-4">{facility.location}</td>
                  <td className="px-6 py-4">{facility.capacity}</td>
                  <td className="px-6 py-4">
                    {facility.openingTime} - {facility.closingTime}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadgeVariant(facility.status)}>
                      {facility.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <FacilityActions facility={facility} />
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
