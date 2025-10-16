// src/components/AddressSelector.tsx
import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
// Sesuaikan path import service
import { getProvinces, getCities, getSubdistricts, getVillages } from "../../services/RegionService";

// Tipe data untuk prop value yang dikontrol
export interface AddressSelection {
  province: string;
  city: string;
  subdistrict: string;
  village: string;
}

interface AddressSelectorProps {
  value: AddressSelection;
  onChange: (selection: AddressSelection) => void;
  // Opsi untuk level: 'province', 'city', 'subdistrict', 'village'
  levels: ("province" | "city" | "subdistrict" | "village")[];
  disabled?: boolean;
  kecamatanName?: string; // Prop tambahan untuk label Kecamatan
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const AddressSelector: React.FC<AddressSelectorProps> = ({ value, onChange, levels, disabled = false, kecamatanName = "Kecamatan" }) => {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [subdistricts, setSubdistricts] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  // --- Efek Pemuatan Data (Cascading Fetch) ---

  // Load Provinces
  useEffect(() => {
    if (!levels.includes("province")) return;
    setLoading("province");
    getProvinces()
      .then((data) => {
        setProvinces(data);
        setLoading(null);
      })
      .catch(() => setLoading(null));
  }, [levels]);

  // Load Cities based on Province
  useEffect(() => {
    if (!levels.includes("city") || !value.province) {
      setCities([]);
      return;
    }
    setLoading("city");
    // Panggil API getCities
    getCities(value.province)
      .then((data) => {
        setCities(data);
        setLoading(null);
      })
      .catch(() => setLoading(null));
  }, [value.province, levels]);

  // Load Subdistricts based on City
  useEffect(() => {
    if (!levels.includes("subdistrict") || !value.city) {
      setSubdistricts([]);
      return;
    }
    setLoading("subdistrict");
    // Panggil API getSubdistricts
    getSubdistricts(value.province, value.city)
      .then((data) => {
        setSubdistricts(data);
        setLoading(null);
      })
      .catch(() => setLoading(null));
  }, [value.province, value.city, levels]);

  // Load Villages based on Subdistrict
  useEffect(() => {
    if (!levels.includes("village") || !value.subdistrict) {
      setVillages([]);
      return;
    }
    setLoading("village");
    // Panggil API getVillages
    getVillages(value.province, value.city, value.subdistrict)
      .then((data) => {
        setVillages(data);
        setLoading(null);
      })
      .catch(() => setLoading(null));
  }, [value.province, value.city, value.subdistrict, levels]);

  // --- Handler Perubahan Pilihan ---
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvince = e.target.value;
    onChange({ province: newProvince, city: "", subdistrict: "", village: "" });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    onChange({ ...value, city: newCity, subdistrict: "", village: "" });
  };

  const handleSubdistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubdistrict = e.target.value;
    onChange({ ...value, subdistrict: newSubdistrict, village: "" });
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVillage = e.target.value;
    onChange({ ...value, village: newVillage });
  };

  const inputClass = "w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white appearance-none";

  const renderDropdown = (key: "province" | "city" | "subdistrict" | "village", label: string, options: string[], currentValue: string, onChangeHandler: (e: React.ChangeEvent<HTMLSelectElement>) => void, placeholder: string) => {
    if (!levels.includes(key)) return null;

    // Logika untuk menonaktifkan dropdown jika level sebelumnya belum dipilih
    const isDisabled = disabled || loading === key || (key !== "province" && !value[levels[levels.indexOf(key) - 1] as keyof AddressSelection]);

    // Tentukan jumlah kolom grid yang akan digunakan
    const colClass = levels.length === 2 ? "md:col-span-2" : levels.length === 3 ? "md:col-span-1" : "md:col-span-1";

    return (
      <motion.div key={key} variants={itemVariants} className={`${colClass} relative`}>
        <label className="block text-gray-700 font-semibold mb-1 text-sm">{label}</label>
        <select name={key} value={currentValue} onChange={onChangeHandler} disabled={isDisabled} className={inputClass}>
          <option value="" disabled>
            {loading === key ? `Memuat ${label}...` : placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {loading === key && <FaSpinner className="animate-spin absolute right-3 top-1/2 mt-3 text-primary" size={16} />}
      </motion.div>
    );
  };

  return (
    // Menggunakan grid dinamis, maks 4 kolom.
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.1 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {renderDropdown("province", "Provinsi", provinces, value.province, handleProvinceChange, "Pilih Provinsi")}
      {renderDropdown("city", "Kabupaten/Kota", cities, value.city, handleCityChange, "Pilih Kabupaten/Kota")}
      {renderDropdown("subdistrict", kecamatanName, subdistricts, value.subdistrict, handleSubdistrictChange, `Pilih ${kecamatanName}`)}
      {renderDropdown("village", "Desa/Kelurahan", villages, value.village, handleVillageChange, "Pilih Desa/Kelurahan")}
    </motion.div>
  );
};

export default AddressSelector;
