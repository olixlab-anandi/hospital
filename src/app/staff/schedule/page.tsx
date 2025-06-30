"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getSchedule,
  deleteSchedule,
} from "../../../../store/features/schedule/scheduleActions";
import {
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import Table from "../../../../components/common/Table";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../store/store";
import debounce from "lodash.debounce";
import { redirect } from "next/navigation";

const PAGE_SIZE = 10;
type StatusType = "Scheduled" | "Completed" | "Cancelled";
const statusIcon: Record<StatusType, React.ReactNode> = {
  Scheduled: <FaHourglassHalf className="text-yellow-500" />,
  Completed: <FaCheckCircle className="text-green-600" />,
  Cancelled: <FaTimesCircle className="text-red-500" />,
};

type Schedule = {
  _id: string;
  Date: string;
  StartTime: string;
  EndTime: string;
  Fees: string;
  Location: string;
  Notes: string;
  Status: StatusType;
  createdAt: string;
};

type CacheType = Record<
  string,
  Record<
    number,
    Record<string, Record<string, { data: Schedule[]; totalPages: number }>>
  >
>;

function StaffSchedule() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [sortKey, setSortKey] = useState("Date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentData, setCurrentData] = useState<Schedule[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const dispatch = useDispatch<AppDispatch>();
  const cacheRef = useRef<CacheType>({});
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
    const cached = cacheRef.current[searchKey]?.[page]?.[sortKey]?.[sortOrder];
    if (cached) {
      setTotalPages(cached.totalPages);
      setCurrentData([...cached.data.map((i) => ({ ...i }))]);
      return;
    }

    dispatch(
      getSchedule({
        search: searchKey,
        page,
        sortKey,
        sortOrder,
        pageSize: PAGE_SIZE,
      })
    )
      .then((res) => {
        const schedules = res.payload.schedules || [];
        const totalPages = res.payload.totalPages || 1;

        setCurrentData(schedules);
        setTotalPages(totalPages);

        cacheRef.current[searchKey] ??= {};
        cacheRef.current[searchKey][page] ??= {};
        cacheRef.current[searchKey][page][sortKey] ??= {};
        cacheRef.current[searchKey][page][sortKey][sortOrder] = {
          data: schedules,
          totalPages,
        };
      })
      .catch(() => setTotalPages(1));
  }, [page, searchKey, sortKey, sortOrder, dispatch]);

  useEffect(() => {
    setPage(1);
  }, [searchKey, sortKey, sortOrder]);

  function handleSort(key: string, sortable?: boolean) {
    if (!sortable) return;
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }

  const columns = [
    {
      key: undefined,
      label: "#",
      sortable: false,
      render: (_: Schedule, idx: number = 0) =>
        (page - 1) * PAGE_SIZE + idx + 1,
    },
    {
      key: "Date" as keyof Schedule,
      label: (
        <span className="flex items-center gap-1">
          <FaCalendarAlt /> Date
        </span>
      ),
      render: (row: Schedule) => new Date(row.Date).toLocaleDateString(),
      sortable: true,
      onClick: () => handleSort("Date", true),
    },
    {
      key: "StartTime" as keyof Schedule,
      label: (
        <span className="flex items-center gap-1">
          <FaClock /> StartTime
        </span>
      ),
      render: (row: Schedule) => row.StartTime,
      sortable: true,
      onClick: () => handleSort("StartTime", true),
    },
    {
      key: "EndTime" as keyof Schedule,
      label: (
        <span className="flex items-center gap-1">
          <FaClock /> EndTime
        </span>
      ),
      render: (row: Schedule) => row.EndTime,
      sortable: true,
      onClick: () => handleSort("EndTime", true),
    },
    {
      key: "Fees" as keyof Schedule,
      label: (
        <span className="flex items-center gap-1">
          <FaMoneyBillWave /> Fees
        </span>
      ),
      render: (row: Schedule) => `₹${row.Fees}`,
      sortable: true,
      onClick: () => handleSort("Fees", true),
    },

    {
      key: "Status" as keyof Schedule,
      label: "Status",
      render: (row: Schedule) => (
        <span className="flex items-center gap-2 font-bold">
          {statusIcon[row.Status]}
          <span
            className={
              row.Status === "Scheduled"
                ? "text-yellow-600"
                : row.Status === "Completed"
                ? "text-green-600"
                : "text-red-500"
            }
          >
            {row.Status}
          </span>
        </span>
      ),
      sortable: false,
    },
    {
      key: "createdAt" as keyof Schedule,
      label: "Created",
      render: (row: Schedule) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      onClick: () => handleSort("createdAt", true),
    },
    {
      key: undefined,
      label: "Actions",
      sortable: false,
      render: (row: Schedule) => (
        <div className="flex gap-2">
          <button
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition"
            title="Edit"
            onClick={() => redirect(`/staff/add-schedule?id=${row._id}`)}
          >
            <FaEdit />
          </button>
          <button
            className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-500 transition"
            title="Delete"
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this schedule?")
              ) {
                dispatch(deleteSchedule(row._id)).then(() => {
                  cacheRef.current = {};
                  setPage(1);
                });
              }
            }}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center bg-gradient-to-br from-[#E3F2FD] to-[#F5F7FA] px-1 py-4 md:px-2 md:py-8">
      <div className="bg-white rounded-2xl shadow-2xl px-2 py-4 md:px-4 md:py-8 w-full max-w-full md:max-w-6xl border border-[#B3E5FC]">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 ">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0288D1] tracking-tight drop-shadow text-center md:text-left">
            Schedule List
          </h2>
          <button
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg bg-[#0288D1] text-white font-semibold shadow hover:bg-[#039be5] transition w-full md:w-auto justify-center"
            onClick={() => redirect("/staff/add-schedule")}
          >
            <FaPlus /> Add Schedule
          </button>
        </div>

        <div className="flex justify-end mb-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              className="pl-10 pr-4 py-2 rounded-lg border border-[#B3E5FC] focus:ring-2 focus:ring-[#64B5F6] focus:outline-none w-full text-[#1A237E] bg-[#F5F7FA] placeholder-[#90A4AE] text-sm md:text-base"
              placeholder="Search schedules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0288D1]" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <Table
            columns={columns}
            data={currentData}
            sortKey={sortKey}
            sortOrder={sortOrder}
          />
        </div>

        <div className="flex xs:flex-row justify-center items-center gap-2 mt-8">
          <button
            className="px-4 py-2 rounded-full bg-[#E3F2FD] text-[#0288D1] font-semibold shadow hover:bg-[#B3E5FC] transition disabled:opacity-50 xs:w-auto"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="font-semibold text-[#0288D1] text-center">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-4 py-2 rounded-full bg-[#E3F2FD] text-[#0288D1] font-semibold shadow hover:bg-[#B3E5FC] transition disabled:opacity-50 xs:w-auto"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaffSchedule;
