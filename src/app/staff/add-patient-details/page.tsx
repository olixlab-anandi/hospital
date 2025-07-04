"use client";

import React from "react";
import Form from "../../../../components/common/Form";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import { getStaffList } from "../../../../store/features/patient/patientAction";
import {
  addPatient,
  editPatient,
} from "../../../../store/features/patient/patientAction";
import { patient } from "../patients/page";
import { redirect } from "next/navigation";

function AddPatient() {
  const [formData, setFormData] = useState({});
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [staff, setStaff] = useState([]);
  const patient = useSelector((state: RootState) => state.patient.patient);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.patient.isLoading);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id && patient.length) {
      const data = patient.find((elem: patient) => elem._id == id) as
        | patient
        | undefined;
      if (data) {
        setFormData(data);
        if (typeof data.profileImage === "string") {
          setImagePreview(data.profileImage);
        } else if (data.profileImage instanceof File) {
          setImagePreview(URL.createObjectURL(data.profileImage));
        } else {
          setImagePreview(null);
        }
      }
    }
  }, [id, patient]);

  useEffect(() => {
    const forDatObje = new FormData();

    Object.entries(formData).forEach(([key, val]) => {
      forDatObje.append(key, val as string | Blob);
    });

    if (isFormSubmit) {
      if (id) {
        dispatch(editPatient({ id, data: forDatObje })).then(() => {
          setIsFormSubmit(false);
          redirect("/staff/patients");
        });
      } else {
        dispatch(addPatient(forDatObje)).then(() => {
          setIsFormSubmit(false);
          redirect("/staff/patients");
        });
      }
    }
    dispatch(getStaffList()).then((res) => {
      setStaff(res.payload.fullNames);
    });
    if (id) {
      const data = patient.filter((elem: patient) => elem._id == id);
      setFormData(data[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormSubmit, dispatch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: patient) => ({
        ...prev,
        profileImage: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const formFields = [
    {
      section: "Personal Details",
      fields: [
        {
          name: "profileImage",
          type: "file",
          id: "profileImage",
          label: "Profile Image",
          accept: "image/*",
          placeholder: "Enter Profile Image...",
        },
        {
          name: "firstName",
          type: "text",
          id: "firstName",
          label: "First Name",
          placeholder: "Enter first name...",
        },
        {
          name: "lastName",
          type: "text",
          id: "lastName",
          label: "Last Name",
          placeholder: "Enter last name...",
        },
        {
          name: "email",
          type: "email",
          id: "email",
          label: "Email",
          placeholder: "Enter email...",
        },
        {
          name: "phone",
          label: "Phone No",
          type: "number",
          id: "phone",
          minLength: 10,
          maxLength: 10,
          placeholder: "Enter phone number...",
        },
        {
          name: "age",
          type: "number",
          id: "age",
          label: "Age",
          placeholder: "Enter age...",
        },
        {
          name: "staff",
          type: "select",
          id: "staff",
          label: "Staff",
          options: staff,
          placeholder: "Select staff...",
        },
      ],
    },
    {
      section: "Address (Optional)",
      fields: [
        {
          name: "flatNo",
          type: "text",
          id: "flatNo",
          label: "Address Line 1",
          placeholder: "Flat, House no., Building, Company",
        },
        {
          name: "area",
          type: "text",
          id: "area",
          label: "Address Line 2",
          placeholder: "Area, Colony, Street, Sector, Village",
        },
        {
          name: "city",
          type: "text",
          id: "city",
          label: "City/Town",
          placeholder: "City",
        },
        {
          name: "state",
          type: "text",
          id: "state",
          label: "State",
          placeholder: "State",
        },
        {
          name: "zipCode",
          type: "text",
          id: "zipCode",
          label: "Zip Code",
          placeholder: "Zip Code",
        },
      ],
    },
    {
      section: "Medical History (Optional)",
      fields: [
        {
          name: "bloodGroup",
          type: "text",
          id: "bloodGroup",
          label: "Blood Group",
          placeholder: "A+, O-, etc.",
        },
        {
          name: "diagnosed",
          type: "text",
          id: "diagnosed",
          label: "Diagnosed Conditions",
          placeholder: "If any diagnosed condition...",
        },
        {
          name: "primaryDoctor",
          type: "text",
          id: "doctore",
          label: "Primary Doctore",
          placeholder: "If any primary doctor...",
        },
        {
          name: "medicalHistory",
          type: "textarea",
          id: "medicalHistory",
          label: "Medical History",
          placeholder: "Relevant medical history, allergies, etc.",
          description:
            "Brief summary of past conditions, allergies, medications.",
        },
      ],
    },
    {
      section: "",
      fields: [
        {
          type: "button",
          id: "btn",
          value: id ? "Edit Patient Detail" : "Add Patient Detail",
        },
      ],
    },
  ];
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#B3E5FC] p-8">
        <h2 className="text-3xl font-bold text-[#0288D1] mb-8 text-center tracking-tight">
          {id ? "Edit Patient" : "Add Patient"}
        </h2>
        <Form
          formFields={formFields}
          formData={formData}
          setFormData={setFormData}
          setIsFormSubmit={setIsFormSubmit}
          isLoading={isLoading}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
        />
      </div>
    </div>
  );
}

export default AddPatient;
