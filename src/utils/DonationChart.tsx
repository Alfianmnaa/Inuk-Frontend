import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Pastikan elemen Chart.js telah didaftarkan (PENTING untuk modularitas)
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DonationData {
  desa: string;
  jumlahDonatur: number;
  totalDonasi: number;
}

interface DonationChartProps {
  data: DonationData[];
  kecamatanName: string;
}

const DonationChart: React.FC<DonationChartProps> = ({ data, kecamatanName }) => {
  const chartData = {
    labels: data.map((item) => item.desa),
    datasets: [
      {
        label: "Total Donasi (Rupiah)",
        data: data.map((item) => item.totalDonasi),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Opsi Konfigurasi Chart.js
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Rekap Donasi Desa di ${kecamatanName}`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              // Format angka sebagai Rupiah
              label += new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Donasi",
        },
        ticks: {
          callback: function (value: any) {
            // if (value >= 1000000) {
            //   return "Rp " + value;
            // }
            // if (value >= 1000) {
            //   return "Rp " + value;
            // }
            return "Rp " + value;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: "100%", minHeight: "300px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default DonationChart;
