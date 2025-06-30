"use client";

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
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../store/store";
import {
  getSchedule,
  deleteSchedule,
} from "../../../../store/features/schedule/scheduleActions";
import AddSchedule from "../add-schedule/page";
import { useRouter } from "next/navigation";

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
  };
};

export default function CalendarPage() {
  const [schedule, setSchedule] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);
  const [showChoice, setShowChoice] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    dispatch(getSchedule({})).then((res) =>
      setSchedule(res.payload?.schedules)
    );
  }, [dispatch]);

  const handleSelectEvent = (event: MyEvent) => {
    setSelectedEvent(event);
    setShowChoice(true);
  };

  const handleClose = () => {
    setSelectedEvent(null);
    setShowChoice(false);
    setShowEdit(false);
  };

  const handleEdit = (id: string) => {
    setShowChoice(false);
    setShowEdit(true);
    router.push(`?id=${id}`, { scroll: false });
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
      patient: { firstName: string; lastName: string };
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
            color="primary"
            onClick={() => handleEdit(selectedEvent?.resource?.id as string)}
            sx={{ width: "100%" }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{ width: "100%" }}
          >
            Delete
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
    </div>
  );
}
