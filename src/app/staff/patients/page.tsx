"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { redirect } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../store/store";
import Pagination from "@mui/material/Pagination";
import {
  deletePatient,
  getPatient,
} from "../../../../store/features/patient/patientAction";
import Table from "../../../../components/common/Table";
import Search from "../../../../components/common/Search";
import debounce from "lodash.debounce";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

export interface patient {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  staff?: string;
  profileImage?: File | string;
  role?: string;
  id?: string;
  _id?: string;
}

function Patient() {
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortKey, setSortKey] = useState("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentData, setCurrentData] = useState([]);

  const cacheRef = useRef<
    Record<
      string,
      Record<
        number,
        Record<string, Record<string, { data: []; totalPages: number }>>
      >
    >
  >({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearchKey = useCallback(
    debounce((value: string) => setSearchKey(value.trim().toLowerCase()), 500),
    []
  );

  useEffect(() => {
    debouncedSetSearchKey(search);
    return () => {
      debouncedSetSearchKey.cancel();
    };
  }, [search, debouncedSetSearchKey]);

  useEffect(() => {
    const cached = cacheRef.current[searchKey]?.[page]?.[sortKey]?.[sortOrder];
    if (cached) {
      setTotalPages(cached.totalPages);
      setCurrentData([...cached.data]);
      return;
    }
    dispatch(
      getPatient({
        search: searchKey,
        page,
        sortKey,
        sortOrder,
        pageSize: 5,
      })
    ).then((res) => {
      if (res && res.payload) {
        setTotalPages(res.payload.totalPages || 1);
        setCurrentData(res.payload.patient || []);

        if (!cacheRef.current[searchKey]) cacheRef.current[searchKey] = {};
        if (!cacheRef.current[searchKey][page])
          cacheRef.current[searchKey][page] = {};
        if (!cacheRef.current[searchKey][page][sortKey])
          cacheRef.current[searchKey][page][sortKey] = {};
        cacheRef.current[searchKey][page][sortKey][sortOrder] = {
          data: res.payload.patient || [],
          totalPages: res.payload.totalPages || 1,
        };
      }
    });
  }, [dispatch, searchKey, page, sortKey, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [searchKey]);

  const columns = [
    {
      key: "index",
      label: "#",
      sortable: false,
      render: (_: patient, idx: number = 0) => (page - 1) * 5 + idx + 1,
    },
    {
      label: "FIRST NAME",
      key: "firstName",
      sortable: true,
      onClick: () => handleSort("firstName", true),
    },
    {
      label: "LASTNAME",
      key: "lastName",
      sortable: true,
      onClick: () => handleSort("lastName", true),
    },
    {
      label: "EMAIL",
      key: "email",
      sortable: true,
      onClick: () => handleSort("email", true),
    },
    {
      label: "PHONE NO",
      key: "phone",
      sortable: false,
    },
    {
      label: "Actions",
      render: (row: patient) => (
        <div className="flex gap-2">
          <button
            onClick={() => redirect(`/staff/patients/${row._id}`)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-xs font-semibold shadow-sm"
            title="View"
          >
            <FaEye className="text-base" />
          </button>
          <button
            onClick={() => handleEdit(row._id)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition text-xs font-semibold shadow-sm"
            title="Edit"
          >
            <FaEdit className="text-base" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="flex items-center gap-1 px-3 py-3 text-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition text-xs font-semibold shadow-sm"
            title="Delete"
          >
            <FaTrash className="text-base" />
          </button>
        </div>
      ),
    },
  ];

  function handleSort(key: string, sortable?: boolean) {
    if (!sortable) return;
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }

  const handleEdit = (id: string | undefined) => {
    redirect(`/staff/add-patient-details?id=${id}`);
  };

  const handleDelete = (id: string | undefined) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      dispatch(deletePatient(id as string)).then(() => {
        if (cacheRef.current[searchKey]) {
          delete cacheRef.current[searchKey][page];
        }
        setPage(1);
      });
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    redirect("/staff/add-patient-details");
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
      <Search setSearchVal={setSearch} searchVal={search} />
      <div className="overflow-x-auto my-6">
        <Table
          columns={columns}
          data={currentData}
          sortKey={sortKey}
          sortOrder={sortOrder}
        />
      </div>
      <div className="flex justify-center mt-5">
        <Pagination
          count={totalPages}
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
