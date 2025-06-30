"use client";

import React, { useState, useEffect } from "react";
import Form from "../../../../components/common/Form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import { FieldValues } from "react-hook-form";

import {
  addSchedule,
  editSchedule,
} from "../../../../store/features/schedule/scheduleActions";
import { useSearchParams, redirect } from "next/navigation";
import { getPatientList } from "./../../../../store/features/schedule/scheduleActions";

function AddSchedule() {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FieldValues>({});
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [patients, setPatients] = useState<string[]>([]);
  // const [schedule, setSchedule] = useState();
  const isLoading = useSelector((state: RootState) => state.schedule.isLoading);
  const user = useSelector((state: RootState) => state.auth.user);
  const searchParams = useSearchParams();
  const scheduleList = useSelector(
    (state: RootState) => state.schedule.schedule
  );
  const id = searchParams.get("id");

  useEffect(() => {
    dispatch(getPatientList({ staffId: user._id, date: "" })).then((res) => {
      setPatients(res.payload);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      const data: Record<string, string> =
        scheduleList.find(
          (elem: Record<string, string | Record<string, string>>) =>
            elem._id == id
        ) || {};

      if (data) {
        setFormData({
          ...data,
          patient:
            typeof data.patient === "object" && data.patient !== null
              ? (data.patient as { _id: string })._id
              : data.patient,
        });
      }
    }
  }, [id, scheduleList]);

  useEffect(() => {
    if (isFormSubmit) {
      if (id) {
        dispatch(editSchedule({ id, data: formData })).then((res) => {
          setIsFormSubmit(false);
          if (res.payload?.success) {
            redirect("/staff/schedule");
          }
        });
      } else {
        dispatch(addSchedule(formData)).then((res) => {
          setIsFormSubmit(false);
          if (res.payload?.success) {
            redirect("/staff/schedule");
          }
        });
      }
    }
  }, [isFormSubmit, formData, id, dispatch]);

  const formFields = [
    {
      section: "Schedule Details",
      fields: [
        {
          name: "patient",
          type: "select",
          id: "patient",
          label: "Select Patient",
          options: patients,
          placeholder: "Select patient...",
          required: true,
        },
        {
          name: "Date",
          type: "date",
          id: "date",
          label: "Date",
          placeholder: "Select date...",
          required: true,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(
              getPatientList({ staffId: user._id, date: e.target.value })
            ).then((res) => {
              setPatients(res.payload);
            });
          },
        },
        {
          name: "StartTime",
          type: "time",
          id: "stime",
          label: "Start Time",
          placeholder: "Select time...",
          required: true,
        },
        {
          name: "EndTime",
          type: "time",
          id: "etime",
          label: "End Time",
          placeholder: "Select time...",
          required: true,
        },

        {
          name: "Location",
          type: "textarea",
          id: "location",
          label: "Location",
          placeholder: "Enter location...",
          required: true,
        },
        {
          name: "Notes",
          type: "textarea",
          id: "notes",
          label: "Notes (Optional)",
          placeholder: "Add any notes...",
        },
        {
          name: "Fees",
          type: "number",
          id: "fees",
          label: "Fees (Optional)",
          placeholder: "Enter fees...",
        },
        {
          name: "Status",
          type: "select",
          id: "status",
          label: "Status",
          options: ["Scheduled", "Completed", "Cancelled"],
          placeholder: "Select status...",
          defaultValue: "Scheduled",
        },
      ],
    },
    {
      section: "",
      fields: [
        {
          type: "button",
          id: "btn",
          value: id ? "Edit Schedule" : "Add Schedule",
        },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#B3E5FC] p-8">
        <h2 className="text-3xl font-bold text-[#0288D1] mb-8 text-center tracking-tight">
          {id ? "Edit Schedule" : "Add Schedule"}
        </h2>
        <Form
          formFields={formFields}
          formData={formData}
          setFormData={setFormData}
          setIsFormSubmit={setIsFormSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default AddSchedule;
