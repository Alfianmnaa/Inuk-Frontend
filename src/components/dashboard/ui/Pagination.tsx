import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, hasNextPage, onPageChange }) => {
  const pageNumbers = [];
  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, currentPage + 1);

  if (currentPage === 1 && totalPages > 2) {
    endPage = Math.min(totalPages, 3);
  }
  if (currentPage === totalPages && totalPages > 2) {
    startPage = Math.max(1, totalPages - 2);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Logic untuk menambahkan titik-titik (ellipses)
  if (startPage > 1) {
    pageNumbers.unshift(1, 0); // 0 sebagai placeholder untuk ellipsis
  }
  if (endPage < totalPages) {
    pageNumbers.push(0, totalPages);
  }
  // Hapus duplikasi titik-titik
  const finalPageNumbers = pageNumbers.filter((num, index, arr) => num !== 0 || arr[index - 1] !== 0);

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <motion.button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
        whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
        className={`p-3 rounded-lg text-sm font-medium transition-colors border ${currentPage === 1 ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-gray-700 hover:bg-green-50"}`}
      >
        <FaChevronLeft className="w-4 h-4" />
      </motion.button>

      {finalPageNumbers.map((num, index) => {
        if (num === 0) {
          return (
            <span key={`dots-${index}`} className="px-3 text-gray-500">
              ...
            </span>
          );
        }
        return (
          <motion.button
            key={num}
            onClick={() => onPageChange(num)}
            disabled={num === currentPage}
            whileHover={{ scale: num === currentPage ? 1 : 1.05 }}
            whileTap={{ scale: num === currentPage ? 1 : 0.95 }}
            className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${num === currentPage ? "bg-primary text-white shadow-md" : "text-gray-700 hover:bg-green-50"}`}
          >
            {num}
          </motion.button>
        );
      })}

      <motion.button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        whileHover={{ scale: !hasNextPage ? 1 : 1.05 }}
        whileTap={{ scale: !hasNextPage ? 1 : 0.95 }}
        className={`p-3 rounded-lg text-sm font-medium transition-colors border ${!hasNextPage ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-gray-700 hover:bg-green-50"}`}
      >
        <FaChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

export default Pagination;
