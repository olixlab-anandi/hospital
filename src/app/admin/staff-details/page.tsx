"use client";

import React, { useEffect, useRef, useState } from "react";
import Table from "../../../../components/common/Table";
import Search from "../../../../components/common/Search";
import Pagination from "@mui/material/Pagination";
import { useDebounce } from "@uidotdev/usehooks";
import { redirect } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import {
  deleteStaff,
  getStaff,
} from "../../../../store/features/admin/adminActions";

export interface staff {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  phone?: number;
  profileImage?: File;
}

export interface Column<T> {
  key?: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
}

function Staff() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchVal, setSearchVal] = useState("");
  const [page, setPage] = useState(1);
  const { staff, totalPages } = useSelector((state: RootState) => state.staff);

  const debouncedSearch = useDebounce(searchVal, 500);

  // Cache: { [searchVal]: { [page]: { data, totalPages } } }
  const cacheRef = useRef<
    Record<string, Record<number, { data: []; totalPages: number }>>
  >({});

  useEffect(() => {
    const searchKey = debouncedSearch.trim().toLowerCase();
    // Check cache
    if (cacheRef.current[searchKey] && cacheRef.current[searchKey][page]) {
      // Already cached, do nothing
      return;
    }
    // Not cached, fetch and cache after fetch
    dispatch(getStaff({ searchVal: debouncedSearch, page })).then((res) => {
      if (res && res.payload) {
        if (!cacheRef.current[searchKey]) cacheRef.current[searchKey] = {};
        cacheRef.current[searchKey][page] = {
          data: res.payload.staff || [],
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

  const columns: Column<staff>[] = [
    { label: "ID", key: "id" },
    { label: "FIRST NAME", key: "firstName" },
    { label: "LASTNAME", key: "lastName" },
    { label: "email", key: "email" },
    { label: "Phone No", key: "phone" },
    { label: "Role", key: "role" },
    {
      label: "Actions",
      render: (row: staff) => (
        <div className="flex gap-2">
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
    redirect(`/admin/add-staff-details?id=${id}`);
  };

  const handleDelete = (id: string | undefined) => {
    dispatch(deleteStaff(id as string));
    // Optionally, clear cache for current search/page to force refresh
    if (cacheRef.current[searchKey]) {
      delete cacheRef.current[searchKey][page];
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    redirect("/admin/add-staff-details");
  };

  const onPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <>
      <div className="mb-10">
        <div className="flex justify-between pr-5 items-center py-5">
          <h2 className="text-xl font-bold mb-4 text-[#0288D1]">
            Staff Members
          </h2>
          <button
            className="py-2 px-5 bg-gray-300 rounded-2xl text-black font-bold"
            onClick={handleAddStaff}
          >
            Add Staff
          </button>
        </div>
        <Search setSearchVal={setSearchVal} searchVal={searchVal} />
        <div className="overflow-x-auto my-4">
          <Table columns={columns} data={cached ? cached.data : staff} />
        </div>
        <div className="flex justify-center mt-5">
          {(cached ? cached.totalPages : totalPages) > 1 ? (
            <Pagination
              count={cached ? cached.totalPages : totalPages}
              page={page}
              onChange={onPageChange}
              color="primary"
              shape="rounded"
            />
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
}

export default Staff;
