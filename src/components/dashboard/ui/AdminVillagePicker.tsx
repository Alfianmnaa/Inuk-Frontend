import React, { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { getVillages } from "../../../services/RegionService";

interface AdminVillagePickerProps {
  province: string;
  city: string;
  subdistrict: string;
  village: string;
  onChange: (village: string) => void;
}

const AdminVillagePicker: React.FC<AdminVillagePickerProps> = ({ province, city, subdistrict, village, onChange }) => {
  const [villages, setVillages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!province || !city || !subdistrict) return;
    let cancelled = false;
    setLoading(true);
    getVillages(province, city, subdistrict)
      .then((result) => {
        if (!cancelled) setVillages(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [province, city, subdistrict]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="text-sm text-gray-600 flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
        <FaInfoCircle className="mr-2 text-blue-500" />
        Kecamatan: <span className="font-semibold ml-1">{subdistrict}</span>
        <span className="italic ml-1">(tidak dapat diubah)</span>
      </div>
      <select
        value={village}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-primary focus:border-primary transition-colors bg-white"
      >
        <option value="">Semua Desa/Kelurahan</option>
        {villages.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AdminVillagePicker;
