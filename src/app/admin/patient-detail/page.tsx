"use client";

import React, { useState, useRef } from "react";
import { redirect } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import Pagination from "@mui/material/Pagination";
import {
  deletePatient,
  getPatient,
} from "../../../../store/features/patient/patientAction";
import { useEffect } from "react";
import Table from "../../../../components/common/Table";
import Search from "../../../../components/common/Search";

export interface patient {
  firstName?: string;
  lastName?: string;
  email?: string;
  staff?: string;
  phone?: string;
  role?: string;
  id?: string;
  _id?: string;
  profileImage?: File | string;
}

export interface Column<T> {
  key?: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
}

function Patient() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchVal, setSearchVal] = useState("");
  const [page, setPage] = useState(1);
  const { patient, totalPages } = useSelector(
    (state: RootState) => state.patient
  );

  const debouncedSearch = useDebounce(searchVal, 500);

  const cacheRef = useRef<
    Record<string, Record<number, { data: []; totalPages: number }>>
  >({});

  useEffect(() => {
    const searchKey = debouncedSearch.trim().toLowerCase();
    // Check cache
    if (cacheRef.current[searchKey] && cacheRef.current[searchKey][page]) {
      return;
    }
    // Not cached, fetch and cache after fetch
    dispatch(getPatient({ search: debouncedSearch, page })).then((res) => {
      if (res && res.payload) {
        if (!cacheRef.current[searchKey]) cacheRef.current[searchKey] = {};
        cacheRef.current[searchKey][page] = {
          data: res.payload.patient || [],
          totalPages: res.payload.totalPages || 1,
        };
      }
    });
  }, [dispatch, debouncedSearch, page]);

  // Use cached data if available, else use Redux state
  const searchKey = debouncedSearch.trim().toLowerCase();
  const cached =
    cacheRef.current[searchKey] && cacheRef.current[searchKey][page]
      ? cacheRef.current[searchKey][page]
      : null;

  const columns: Column<patient>[] = [
    { label: "ID", key: "id" },
    { label: "FIRST NAME", key: "firstName" },
    { label: "LASTNAME", key: "lastName" },
    { label: "email", key: "email" },
    { label: "Staff", key: "staff" },
    { label: "Phone no", key: "phone" },
    {
      label: "Actions",
      render: (row: patient) => (
        <div className="flex gap-2">
          <button
            onClick={() => redirect(`/admin/patient-detail/${row._id}`)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-xs font-semibold shadow-sm"
            title="View"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>
          <button
            onClick={() => handleEdit(row._id)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition text-xs font-semibold shadow-sm"
            title="Edit"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" />
              <path d="M16 7l1.5-1.5a2.121 2.121 0 10-3-3L13 4" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition text-xs font-semibold shadow-sm"
            title="Delete"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (id: string | undefined) => {
    redirect(`/admin/add-patient-details?id=${id}`);
  };

  const handleDelete = (id: string | undefined) => {
    dispatch(deletePatient(id as string));
    // Optionally, clear cache for current search/page to force refresh
    if (cacheRef.current[searchKey]) {
      delete cacheRef.current[searchKey][page];
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    redirect("/admin/add-patient-details");
  };

  const onPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <div className="mb-10">
      <div className="flex justify-between pr-5 items-center py-5">
        <h2 className="text-xl font-bold mb-4 text-[#0288D1]">Patients</h2>
        <button
          className="py-2 px-5 bg-gray-300 rounded-2xl text-black font-bold"
          onClick={handleAddStaff}
        >
          Add patient
        </button>
      </div>
      <Search setSearchVal={setSearchVal} searchVal={searchVal} />
      <div className="overflow-x-auto my-6">
        <Table columns={columns} data={cached ? cached.data : patient} />
      </div>
      <div className="flex justify-center mt-5">
        <Pagination
          count={cached ? cached.totalPages : totalPages}
          page={page}
          onChange={onPageChange}
          color="primary"
          shape="rounded"
        />
      </div>
    </div>
  );
}

export default Patient;
