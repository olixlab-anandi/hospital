"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  FaPlus,
  FaDownload,
  FaEye,
  FaFilePdf,
  FaFileImage,
  FaFile,
  FaTimes,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import Table, { Column } from "../../../../components/common/Table";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import {
  deleteReport,
  getReports,
} from "../../../../store/features/reports/reportsAction";
import debounce from "lodash.debounce";
import { redirect } from "next/navigation";

interface PatientObj {
  firstName: string;
  lastName: string;
}

interface reportType {
  _id: string;
  patient: string | PatientObj;
  staff: string;
  date: string;
  healthStatus: string;
  currentCondition: string;
  suggestions: string;
  reportFile: Array<Record<string, string>>;
}

const PAGE_SIZE = 10;

const getPatientName = (patient: string | PatientObj) => {
  if (!patient) return "";
  if (typeof patient === "object" && patient.firstName && patient.lastName) {
    return `${patient.firstName} ${patient.lastName}`;
  }
  return String(patient);
};

type CacheType = Record<
  string,
  Record<
    number,
    Record<string, Record<string, { data: reportType[]; totalPages: number }>>
  >
>;

const ReportPage = () => {
  const [reports, setReports] = useState<reportType[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<reportType | null>(null);
  const report = useSelector((state: RootState) => state.reports.reports);
  // Backend search/sort state
  const [search, setSearch] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [sortKey, setSortKey] = useState<keyof reportType | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [totalPages, setTotalPages] = useState(1);

  // Caching like schedule page
  const cacheRef = useRef<CacheType>({});

  // Debounced search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearchKey = useCallback(
    debounce((value: string) => setSearchKey(value.trim().toLowerCase()), 500),
    []
  );

  useEffect(() => {
    debouncedSetSearchKey(search);
    return () => debouncedSetSearchKey.cancel();
  }, [search, debouncedSetSearchKey]);

  useEffect(() => {
    setReports(report);
  }, [report]);

  useEffect(() => {
    const cache =
      cacheRef.current[searchKey]?.[currentPage]?.[sortKey]?.[sortOrder];
    if (cache) {
      setReports([...cache.data]);
      setTotalPages(cache.totalPages);
      return;
    }

    dispatch(
      getReports({
        search: searchKey,
        page: currentPage,
        sortKey,
        sortOrder,
        pageSize: PAGE_SIZE,
      })
    ).then((res) => {
      const data = res.payload?.report || [];
      const total = res.payload?.totalPages || 1;
      setReports(data);
      setTotalPages(total);

      cacheRef.current[searchKey] ??= {};
      cacheRef.current[searchKey][currentPage] ??= {};
      cacheRef.current[searchKey][currentPage][sortKey as string] ??= {};
      cacheRef.current[searchKey][currentPage][sortKey as string][sortOrder] = {
        data,
        totalPages: total,
      };
    });
  }, [currentPage, searchKey, sortKey, sortOrder, dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey, sortKey, sortOrder]);

  function handleSort(key: keyof reportType) {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }

  // Table columns
  const columns: Column<reportType>[] = [
    {
      label: "#",
      render: (_row, idx) => (currentPage - 1) * PAGE_SIZE + (idx ?? 0) + 1,
    },
    {
      key: "patient",
      label: (
        <span
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => handleSort("patient")}
        >
          Patient
          {sortKey === "patient" ? (
            sortOrder === "asc" ? (
              <FaSortUp />
            ) : (
              <FaSortDown />
            )
          ) : (
            <FaSort />
          )}
        </span>
      ),
      render: (row) => getPatientName(row.patient),
    },
    {
      key: "date",
      label: (
        <span
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => handleSort("date")}
        >
          Date
          {sortKey === "date" ? (
            sortOrder === "asc" ? (
              <FaSortUp />
            ) : (
              <FaSortDown />
            )
          ) : (
            <FaSort />
          )}
        </span>
      ),
      render: (row) =>
        row.date ? new Date(row.date).toLocaleDateString() : "N/A",
    },
    {
      key: "healthStatus",
      label: (
        <span
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => handleSort("healthStatus")}
        >
          Health Status
        </span>
      ),
      render: (row) => row.healthStatus || "N/A",
    },
    {
      label: "Files",
      render: (row) => row.reportFile?.length || 0,
    },
    {
      label: "Action",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedReport(row)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded bg-[#0288D1] hover:bg-[#01579b] text-white font-semibold shadow transition text-xs sm:text-base"
            title="View"
          >
            <FaEye /> View
          </button>
          <button
            onClick={() => redirect(`/staff/add-report?id=${row._id}`)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded bg-[#0288D1] hover:bg-[#01579b] text-white font-semibold shadow transition text-xs sm:text-base"
            title="Edit"
          >
            <FaEdit /> Edit
          </button>
          <button
            onClick={() => dispatch(deleteReport(row._id))}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded bg-[#0288D1] hover:bg-[#01579b] text-white font-semibold shadow transition text-xs sm:text-base"
            title="Edit"
          >
            <FaTrash /> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A237E] mb-1">
            Reports
          </h2>
          <p className="text-[#0288D1] text-base sm:text-lg">
            All patient reports added by staff
          </p>
        </div>
        <Link
          href="/staff/add-report"
          className="flex items-center gap-2 bg-gradient-to-r from-[#0288D1] to-[#64B5F6] hover:from-[#01579b] hover:to-[#0288D1] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg transition-all text-base sm:text-lg w-full md:w-auto justify-center"
        >
          <FaPlus /> Add Report
        </Link>
      </div>
      {/* Search input */}
      <div className="flex justify-end mb-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            className="pl-10 pr-4 py-2 rounded-lg border border-[#B3E5FC] focus:ring-2 focus:ring-[#64B5F6] focus:outline-none w-full text-[#1A237E] bg-[#F5F7FA] placeholder-[#90A4AE] text-sm md:text-base"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0288D1]" />
        </div>
      </div>
      {reports.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <span className="text-gray-400 text-lg">No reports found.</span>
        </div>
      ) : (
        <>
          <Table
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            data={reports as unknown as Record<string, string>[]}
            sortKey={sortKey}
            sortOrder={sortOrder}
          />
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center mt-6 gap-2">
              <button
                className="px-3 py-1 rounded bg-[#E3F2FD] text-[#0288D1] font-bold disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded font-bold ${
                    currentPage === i + 1
                      ? "bg-[#0288D1] text-white"
                      : "bg-[#E3F2FD] text-[#0288D1]"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded bg-[#E3F2FD] text-[#0288D1] font-bold disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
          {/* Modal for viewing report */}
          {selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-4 sm:p-8 relative animate-fade-in overflow-y-auto max-h-[90vh]">
                <button
                  className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500"
                  onClick={() => setSelectedReport(null)}
                  title="Close"
                >
                  <FaTimes />
                </button>
                <h3 className="text-xl sm:text-2xl font-bold text-[#0288D1] mb-4">
                  Report Details
                </h3>
                <div className="mb-2 flex flex-col gap-2 text-sm sm:text-base">
                  <div>
                    <span className="font-semibold text-[#0288D1]">
                      Patient:
                    </span>{" "}
                    {getPatientName(selectedReport.patient)}
                  </div>
                  <div>
                    <span className="font-semibold text-[#0288D1]">Staff:</span>{" "}
                    {selectedReport.staff}
                  </div>
                  <div>
                    <span className="font-semibold text-[#0288D1]">Date:</span>{" "}
                    {selectedReport.date
                      ? new Date(selectedReport.date).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold text-[#0288D1]">
                      Health Status:
                    </span>{" "}
                    {selectedReport.healthStatus}
                  </div>
                  <div>
                    <span className="font-semibold text-[#0288D1]">
                      Current Condition:
                    </span>{" "}
                    {selectedReport.currentCondition}
                  </div>
                  <div>
                    <span className="font-semibold text-[#0288D1]">
                      Suggestions:
                    </span>{" "}
                    {selectedReport.suggestions}
                  </div>
                </div>
                <div className="mt-4">
                  <span className="font-semibold text-[#0288D1] text-lg mb-2 block">
                    Attachments
                  </span>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-[#B3E5FC] rounded-lg bg-[#F8FBFF] text-xs sm:text-base">
                      <thead>
                        <tr className="bg-[#E3F2FD] text-[#0288D1]">
                          <th className="py-2 px-2 sm:px-4 text-left">Type</th>
                          <th className="py-2 px-2 sm:px-4 text-left">
                            File Name
                          </th>
                          <th className="py-2 px-2 sm:px-4 text-left">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.reportFile?.map(
                          (file: Record<string, unknown>, idx: number) => (
                            <tr key={idx}>
                              <td className="py-2 px-2 sm:px-4">
                                {file.type === "image" ? (
                                  <span className="flex items-center gap-2">
                                    <FaFileImage className="text-[#0288D1]" />{" "}
                                    Image
                                  </span>
                                ) : file.type === "pdf" ? (
                                  <span className="flex items-center gap-2">
                                    <FaFilePdf className="text-red-500" /> PDF
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2">
                                    <FaFile className="text-gray-400" /> File
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-2 sm:px-4 break-all">
                                {file.originalName as string}
                              </td>
                              <td className="py-2 px-2 sm:px-4">
                                <div className="flex gap-3">
                                  <a
                                    href={file.viewLink as string}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="View"
                                    className="text-[#0288D1] hover:text-[#01579b] text-xl"
                                  >
                                    <FaEye />
                                  </a>
                                  <a
                                    href={file.downloadLink as string}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Download"
                                    className="text-green-600 hover:text-green-800 text-xl"
                                  >
                                    <FaDownload />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportPage;
