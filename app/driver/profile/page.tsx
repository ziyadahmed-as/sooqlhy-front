"use client";
import { useEffect, useState } from "react";
import { useDriverStore } from "@/stores/driver-store";
import { updateDriverProfile, updateDriverProfilePhoto } from "@/lib/api/driver";
import { DriverPageWrapper } from "@/components/driver/DriverPageWrapper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { User, Camera, Save, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const VEHICLE_TYPES = ["MOTORCYCLE", "CAR", "VAN", "TRUCK", "BICYCLE"];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function DriverProfilePage() {
  const { profile, loadProfile, setProfile } = useDriverStore();
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    vehicle_type: "MOTORCYCLE",
    vehicle_brand: "",
    vehicle_model: "",
    vehicle_color: "",
    plate_number: "",
    license_number: "",
    national_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    preferred_areas: "",
    working_days: [] as string[],
    work_start_time: "",
    work_end_time: "",
    max_delivery_distance_km: 50,
    insurance_info: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        vehicle_type: profile.vehicle_type ?? "MOTORCYCLE",
        vehicle_brand: profile.vehicle_brand ?? "",
        vehicle_model: profile.vehicle_model ?? "",
        vehicle_color: profile.vehicle_color ?? "",
        plate_number: profile.plate_number ?? "",
        license_number: profile.license_number ?? "",
        national_id: profile.national_id ?? "",
        emergency_contact_name: profile.emergency_contact_name ?? "",
        emergency_contact_phone: profile.emergency_contact_phone ?? "",
        preferred_areas: profile.preferred_areas ?? "",
        working_days: profile.working_days ?? [],
        work_start_time: profile.work_start_time ?? "",
        work_end_time: profile.work_end_time ?? "",
        max_delivery_distance_km: profile.max_delivery_distance_km ?? 50,
        insurance_info: profile.insurance_info ?? "",
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));
  const toggleDay = (day: string) =>
    setForm((prev) => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter((d) => d !== day)
        : [...prev.working_days, day],
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateDriverProfile(form as any);
      setProfile(updated);
      toast.success("Profile updated successfully");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const updated = await updateDriverProfilePhoto(file);
      setProfile(updated);
      toast.success("Profile photo updated");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!profile) return (
    <DriverPageWrapper title="Profile">
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    </DriverPageWrapper>
  );

  const name = profile.full_name || profile.email;

  return (
    <DriverPageWrapper
      title="My Profile"
      subtitle="Manage your driver profile and vehicle information."
      actions={
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo + status */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            {profile.profile_photo ? (
              <img src={profile.profile_photo} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900/30" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-blue-100 dark:ring-blue-900/30">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <label className={cn(
              "absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors",
              uploadingPhoto && "opacity-50 cursor-not-allowed"
            )}>
              {uploadingPhoto ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={uploadingPhoto} />
            </label>
          </div>
          <p className="font-bold text-gray-900 dark:text-white text-lg">{name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{profile.email}</p>
          <div className="flex items-center gap-2">
            <StatusBadge status={profile.status} />
            <StatusBadge status={profile.delivery_status} />
          </div>
          {profile.phone_number && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{profile.phone_number}</p>}
        </div>

        {/* Form sections */}
        <div className="lg:col-span-2 space-y-5">
          {/* Vehicle */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" />Vehicle Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Vehicle Type</label>
                <select value={form.vehicle_type} onChange={(e) => handleChange("vehicle_type", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {VEHICLE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              {[
                { field: "vehicle_brand", label: "Brand" },
                { field: "vehicle_model", label: "Model" },
                { field: "vehicle_color", label: "Color" },
                { field: "plate_number", label: "Plate Number" },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
                  <input type="text" value={(form as any)[field]} onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={label} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Insurance Info (optional)</label>
                <textarea value={form.insurance_info} onChange={(e) => handleChange("insurance_info", e.target.value)} rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Insurance details..." />
              </div>
            </div>
          </section>

          {/* Identity */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Identity & License</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { field: "license_number", label: "Driving License Number" },
                { field: "national_id", label: "National ID / Passport" },
                { field: "emergency_contact_name", label: "Emergency Contact Name" },
                { field: "emergency_contact_phone", label: "Emergency Contact Phone" },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
                  <input type="text" value={(form as any)[field]} onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={label} />
                </div>
              ))}
            </div>
          </section>

          {/* Work preferences */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Work Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                        form.working_days.includes(day)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300")}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Start Time</label>
                  <input type="time" value={form.work_start_time ?? ""} onChange={(e) => handleChange("work_start_time", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">End Time</label>
                  <input type="time" value={form.work_end_time ?? ""} onChange={(e) => handleChange("work_end_time", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Max Distance (km)</label>
                  <input type="number" min={1} max={500} value={form.max_delivery_distance_km} onChange={(e) => handleChange("max_delivery_distance_km", Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Preferred Areas</label>
                <input type="text" value={form.preferred_areas} onChange={(e) => handleChange("preferred_areas", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Downtown, Airport District, East Side" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </DriverPageWrapper>
  );
}
