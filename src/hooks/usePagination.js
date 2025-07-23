import { useMemo, useState } from 'react';

export default function usePagination(data, initialRowsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const totalPages = useMemo(() => Math.ceil(data.length / rowsPerPage), [data, rowsPerPage]);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [currentPage, rowsPerPage, data]);

  const handleChangeRowsPerPage = (e) => {
    const newValue = Number(e.target.value);
    setRowsPerPage(newValue);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return {
    currentData,
    currentPage,
    totalPages,
    rowsPerPage,
    handleChangeRowsPerPage,
    handlePrevPage,
    handleNextPage,
    setCurrentPage,
    setRowsPerPage,
  };
}