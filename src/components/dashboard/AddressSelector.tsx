import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSpinner, FaChevronDown } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { getSubdistricts, getVillages } from "../../services/RegionService";

// Hardcoded Constants for fixed region
const FIXED_PROVINCE = "Jawa Tengah";
const FIXED_CITY = "Kudus";

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
  levels: ("province" | "city" | "subdistrict" | "village")[];
  disabled?: boolean;
  kecamatanName?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const AddressSelector: React.FC<AddressSelectorProps> = ({ value, onChange, levels, disabled = false, kecamatanName = "Kecamatan" }) => {
  const [subdistricts, setSubdistricts] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  // --- Initialization Effect: Set fixed values if not set ---
  useEffect(() => {
    if (value.province !== FIXED_PROVINCE || value.city !== FIXED_CITY) {
      // Panggil onChange untuk mengatur nilai provinsi dan kota ke nilai tetap
      onChange({
        province: FIXED_PROVINCE,
        city: FIXED_CITY,
        subdistrict: value.subdistrict,
        village: value.village,
      });
    }
  }, [value.province, value.city, value.subdistrict, value.village, onChange]); // Dependensi lengkap untuk konsistensi

  // Load Subdistricts (Kecamatan) based on fixed Province and City
  useEffect(() => {
    // Hanya jalankan jika "subdistrict" termasuk dalam levels
    if (!levels.includes("subdistrict")) {
      setSubdistricts([]);
      return;
    }

    setLoading("subdistrict");
    // Gunakan nilai tetap untuk fetching
    // CATATAN: Fungsi RegionService.getSubdistricts harus menerima parameter provinsi dan kota, meskipun nilainya tetap di sini.
    getSubdistricts(FIXED_PROVINCE, FIXED_CITY)
      .then((data) => {
        setSubdistricts(data);
        setLoading(null);
      })
      .catch(() => {
        setLoading(null);
        toast.error(`Gagal memuat ${kecamatanName} dari API.`);
      });
  }, [levels, kecamatanName]);

  // Load Villages (Desa/Kelurahan) based on selected Subdistrict (Kecamatan)
  useEffect(() => {
    // Hanya jalankan jika "village" termasuk dalam levels dan subdistrict sudah dipilih
    if (!levels.includes("village") || !value.subdistrict) {
      setVillages([]);
      return;
    }

    setLoading("village");
    // Gunakan nilai tetap dan subdistrict yang dipilih untuk fetching
    getVillages(FIXED_PROVINCE, FIXED_CITY, value.subdistrict)
      .then((data) => {
        setVillages(data);
        setLoading(null);
      })
      .catch(() => {
        setLoading(null);
        toast.error("Gagal memuat Desa/Kelurahan dari API.");
      });
  }, [value.subdistrict, levels]);

  // --- Handler Perubahan Pilihan ---
  const handleSubdistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubdistrict = e.target.value;
    // Tetap atur province dan city ke nilai tetap saat perubahan subdistrict
    onChange({ province: FIXED_PROVINCE, city: FIXED_CITY, subdistrict: newSubdistrict, village: "" });
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVillage = e.target.value;
    // Tetap atur province dan city ke nilai tetap saat perubahan village
    onChange({ ...value, province: FIXED_PROVINCE, city: FIXED_CITY, village: newVillage });
  };

  const inputClass = "w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-white appearance-none";

  const renderDropdown = (key: "province" | "city" | "subdistrict" | "village", label: string, options: string[], currentValue: string, onChangeHandler: (e: React.ChangeEvent<HTMLSelectElement>) => void, placeholder: string) => {
    // Hanya render untuk subdistrict dan village
    if (key !== "subdistrict" && key !== "village") return null;
    if (!levels.includes(key)) return null;

    let isDisabled = disabled || loading === key;

    // Logic untuk Village: disable jika subdistrict belum dipilih
    if (key === "village" && !value.subdistrict) {
      isDisabled = true;
    }

    return (
      <motion.div key={key} variants={itemVariants} className={`md:col-span-1 relative`}>
        <label className="block text-gray-700 font-semibold mb-1 text-sm">{label}</label>
        <div className="relative">
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
          {/* FIX UI: Tambahkan ikon panah */}
          <FaChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 ${isDisabled || loading === key ? "opacity-50" : ""}`} size={14} />
          {loading === key && <FaSpinner className="animate-spin absolute right-8 top-1/2 mt-3 text-primary" size={16} />}
        </div>
      </motion.div>
    );
  };

  // Ubah grid menjadi grid-cols-2 karena hanya ada 2 dropdown
  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderDropdown("subdistrict", kecamatanName, subdistricts, value.subdistrict, handleSubdistrictChange, `Pilih ${kecamatanName}`)}
      {renderDropdown("village", "Desa/Kelurahan", villages, value.village, handleVillageChange, "Pilih Desa/Kelurahan")}
    </motion.div>
  );
};

export default AddressSelector;
