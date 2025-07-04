"use client";
import {
  FaDownload,
  FaEye,
  FaFilePdf,
  FaFileImage,
  FaFile,
  FaTimes,
} from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { enUS } from "date-fns/locale/en-US";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import {
  getSchedule,
  deleteSchedule,
  getStaffWiseSchedule,
} from "../../../../store/features/schedule/scheduleActions";
import AddSchedule from "../add-schedule/page";
import { redirect, useRouter } from "next/navigation";
import { getReports } from "../../../../store/features/reports/reportsAction";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type MyEvent = {
  title: string;
  start: Date;
  end: Date;
  resource: {
    id: string;
    staff: string;
    patient: string;
    status: string;
    patientId: string;
    date: string;
  };
};

export default function CalendarPage() {
  const [schedule, setSchedule] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);
  const [showChoice, setShowChoice] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showReport, setShowReport] = useState(false);
  type ReportFile = {
    type: string;
    originalName: string;
    viewLink: string;
    downloadLink: string;
  };

  type Report = {
    staff: string;
    date: string;
    healthStatus?: string;
    currentCondition?: string;
    suggestions?: string;
    reportFile?: ReportFile[];
    patient: { _id: string; firstName: string; lastName: string };
  };

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    dispatch(getStaffWiseSchedule(user._id)).then((res) =>
      setSchedule(res.payload)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleSelectEvent = (event: MyEvent) => {
    setSelectedEvent(event);
    setShowChoice(true);
  };

  const handleClose = () => {
    console.log("closed");
    setSelectedEvent(null);
    setShowChoice(false);
    setSelectedReport(null);
    setShowEdit(false);
    setShowReport(false);
  };

  const handleEdit = (id: string) => {
    setShowChoice(false);
    setShowEdit(true);
    router.push(`?id=${id}`, { scroll: false });
  };

  const handleOpenReport = (id: string, date: string) => {
    let reports = [];
    setShowChoice(false);
    setShowReport(true);
    dispatch(getReports({ search: date })).then((res) => {
      reports = res.payload.report;
      const report = reports?.find(
        (report: Report) => report.patient._id == id
      );
      setSelectedReport(report);
    });
  };
  const handleDelete = async () => {
    if (selectedEvent?.resource?.id) {
      await dispatch(deleteSchedule(selectedEvent.resource.id));
      dispatch(getSchedule({})).then((res) =>
        setSchedule(res.payload.schedules)
      );
    }
    handleClose();
  };

  const myEvents = (
    schedule: {
      _id: string;
      Date: string;
      StartTime: string;
      EndTime: string;
      staff: string;
      Status: string;
      patient: { firstName: string; lastName: string; _id: string };
    }[]
  ): MyEvent[] => {
    return schedule?.map((item) => {
      const { Date: date, StartTime, EndTime, patient, _id: id } = item;
      const start = new Date(`${date}T${StartTime}`);
      const end = new Date(`${date}T${EndTime}`);

      return {
        title: `${patient.firstName} ${patient.lastName}`,
        start,
        end,
        resource: {
          id: id,
          staff: item.staff,
          patient: `${item.patient.firstName} ${item.patient.lastName}`,
          status: item.Status,
          patientId: item.patient._id,
          date: item.Date,
        },
      };
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>My Calendar</h2>
      <Calendar
        localizer={localizer}
        events={myEvents(schedule)}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 630 }}
        allDayMaxRows={5}
        selectable={true}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={(event: MyEvent) => {
          let backgroundColor = "";
          switch (event?.resource.status.toLowerCase()) {
            case "completed":
              backgroundColor = "green";
              break;
            case "scheduled":
              backgroundColor = "orange";
              break;
            case "cancelled":
              backgroundColor = "red";
              break;
            default:
              backgroundColor = "lightgray";
          }
          return {
            style: {
              backgroundColor,
              color: "white",
              borderRadius: "4px",
              padding: "4px",
            },
          };
        }}
      />
      {/* Choice Modal */}
      <Modal
        open={showChoice}
        onClose={handleClose}
        aria-labelledby="choice-modal-title"
        aria-describedby="choice-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            minWidth: 300,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
          }}
        >
          <h3 id="choice-modal-title">What do you want to do?</h3>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{ width: "100%" }}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => handleEdit(selectedEvent?.resource?.id as string)}
            sx={{ width: "100%" }}
          >
            Edit
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              handleOpenReport(
                selectedEvent?.resource?.patientId as string,
                selectedEvent?.resource?.date as string
              )
            }
            sx={{ width: "100%" }}
          >
            View Report
          </Button>
          <Button variant="text" onClick={handleClose} sx={{ width: "100%" }}>
            Cancel
          </Button>
        </Box>
      </Modal>

      <Modal
        open={showEdit}
        onClose={handleClose}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <AddSchedule />
      </Modal>

      <Modal
        open={showReport}
        onClose={handleClose}
        aria-labelledby="report-modal-title"
        aria-describedby="report-modal-description"
      >
        {selectedReport ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-4 sm:p-8 relative animate-fade-in overflow-y-auto max-h-[90vh]">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500"
                onClick={handleClose}
                title="Close"
              >
                <FaTimes />
              </button>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0288D1] mb-4">
                Report Details
              </h3>
              <div className="mb-2 flex flex-col gap-2 text-sm sm:text-base">
                <div>
                  <span className="font-semibold text-[#0288D1]">Patient:</span>{" "}
                  {selectedReport?.patient.firstName}{" "}
                  {selectedReport?.patient.lastName}
                </div>
                <div>
                  <span className="font-semibold text-[#0288D1]">Staff:</span>{" "}
                  {selectedReport?.staff}
                </div>
                <div>
                  <span className="font-semibold text-[#0288D1]">Date:</span>{" "}
                  {selectedReport?.date
                    ? new Date(selectedReport.date).toLocaleDateString()
                    : "N/A"}
                </div>
                <div>
                  <span className="font-semibold text-[#0288D1]">
                    Health Status:
                  </span>{" "}
                  {selectedReport?.healthStatus}
                </div>
                <div>
                  <span className="font-semibold text-[#0288D1]">
                    Current Condition:
                  </span>{" "}
                  {selectedReport?.currentCondition}
                </div>
                <div>
                  <span className="font-semibold text-[#0288D1]">
                    Suggestions:
                  </span>{" "}
                  {selectedReport?.suggestions}
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
                        <th className="py-2 px-2 sm:px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport?.reportFile?.map(
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
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-4 sm:p-8 relative animate-fade-in overflow-y-auto max-h-[90vh]">
              <button
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500"
                onClick={handleClose}
                title="Close"
              >
                <FaTimes />
              </button>
              <div className="flex justify-between mt-5 pt-5">
                <div>No Report Found</div>
                <button
                  onClick={() => redirect("/staff/add-report")}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded bg-[#0288D1] hover:bg-[#01579b] text-white font-semibold shadow transition text-xs sm:text-base"
                  title="Edit"
                >
                  Add Report
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
