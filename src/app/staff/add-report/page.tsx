"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import { getPatientForReport } from "../../../../store/features/reports/reportsAction";
import {
  addReport,
  editReport,
} from "../../../../store/features/reports/reportsAction";
import Form from "../../../../components/common/Form";

import axios from "axios";
import { redirect, useSearchParams } from "next/navigation";

const AddReportPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  interface ReportFormData {
    patient?: string;
    date?: string;
    healthStatus?: string;
    currentCondition?: string;
    suggestions?: string;
    reportFile?: File[] | object[]; // Accepts array of File or array of file info objects
  }

  const [formData, setFormData] = useState<ReportFormData>({});
  const [fileData, setFileData] = useState<File[]>([]);
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [patients, setPatients] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);
  const reports = useSelector((state: RootState) => state.reports.reports);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  useEffect(() => {
    dispatch(
      getPatientForReport({
        staffId: user._id,
        date: "",
      })
    ).then((res) => {
      setPatients(res.payload);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      const data: Record<string, unknown> =
        reports?.find(
          (elem: Record<string, string | Record<string, string>>) =>
            elem._id == id
        ) || {};

      if (data) {
        setFormData({
          ...data,
          patient:
            typeof data.patient === "object" && data.patient !== null
              ? (data.patient as { _id: string })._id
              : (data.patient as string | undefined),
        });
        // Only set fileData if it's an array of File, otherwise set to empty array
        setFileData(
          Array.isArray(data.reportFile)
            ? data.reportFile // <-- this should be your array of file info objects
            : []
        );
      }
    }
  }, [id, reports]);

  useEffect(() => {
    const handleSubmit = async () => {
      try {
        setLoading(true);

        // Step 1: Create FormData for files
        const formDataFiles = new FormData();
        fileData.forEach((file) => {
          formDataFiles.append("file", file);
        });

        if (!id) {
          // Step 2: First API - addReport
          const res = await dispatch(
            addReport({
              id: user._id,
              data: Object.fromEntries(
                Object.entries(formData).filter(
                  ([, v]) => typeof v === "string"
                ) as [string, string][]
              ),
            })
          );

          const payload = res.payload as { id: string; success?: boolean };
          if (!payload?.id) throw new Error("Report creation failed");

          // Step 3: Second API - upload using new report ID
          const uploadRes = await axios.post(
            `/api/upload?reportId=${payload.id}`,
            formDataFiles,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Step 4: Third API - editReport with uploaded files
          await dispatch(
            editReport({
              id: payload.id,
              data: {
                reportFile: uploadRes.data.results,
              },
            })
          );

          // Step 5: Redirect after everything completes
          if (payload.success) {
            redirect("/staff/report");
          }
        } else {
          const uploadRes = await axios.post(
            `/api/upload?reportId=${id}`,
            formDataFiles,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          const res = await dispatch(
            editReport({
              id,
              data: {
                ...formData,
                reportFile: [
                  ...(formData.reportFile || []),
                  ...uploadRes.data.results,
                ],
              },
            })
          );

          const payload = res.payload as { id: string; success?: boolean };
          if (!payload?.id) throw new Error("Report creation failed");

          // Step 5: Redirect after everything completes
          if (payload.success) {
            redirect("/staff/report");
          }
        }
      } catch (error) {
        console.error("Failed to submit report:", error);
        // optionally show toast here
      } finally {
        setIsFormSubmit(false); // reset trigger
        setLoading(false); // enable button again
        redirect("/staff/report");
      }
    };

    if (isFormSubmit) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormSubmit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files && files.length > 0) {
      const prevFiles = (fileData as File[]) || [];

      const newFiles = [...prevFiles, ...Array.from(files)];

      setFileData(newFiles);
    }
  };

  const formFields = [
    {
      section: "Daily Report",
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
          name: "date",
          type: "date",
          id: "date",
          label: "Date",
          placeholder: "Select date...",
          required: true,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(
              getPatientForReport({ staffId: user._id, date: e.target.value })
            ).then((res) => {
              setPatients(res.payload);
            });
          },
        },
        {
          name: "healthStatus",
          type: "textarea",
          id: "healthStatus",
          label: "Patient Health Status",
          placeholder: "Describe patient's health...",
          required: true,
        },
        {
          name: "currentCondition",
          type: "textarea",
          id: "currentCondition",
          label: "Current Condition",
          placeholder: "Describe current condition...",
          required: true,
        },
        {
          name: "suggestions",
          type: "textarea",
          id: "suggestions",
          label: "Suggestions",
          placeholder: "Any suggestions or advice...",
        },
        {
          name: "reportFile",
          type: "file",
          id: "reportFile",
          label: "Upload Report Files",
          accept: "image/*,application/pdf,video/*",
          multiple: true,
        },
      ],
    },
    {
      section: "",
      fields: [
        {
          type: "button",
          id: "btn",
          value: id ? "Edit Report" : "Add Report",
        },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#B3E5FC] p-8">
        <h2 className="text-3xl font-bold text-[#0288D1] mb-8 text-center tracking-tight">
          {id ? "Edit Daily Report" : "Add Daily Report"}
        </h2>
        <Form
          formFields={formFields}
          formData={formData}
          setFormData={setFormData}
          fileData={fileData}
          setIsFormSubmit={setIsFormSubmit}
          onImageChange={handleFileChange}
          isLoading={isLoading}
          setFileData={setFileData}
        />
      </div>
    </div>
  );
};

export default AddReportPage;
