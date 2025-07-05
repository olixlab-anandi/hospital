"use client";

import React, { useEffect, useState } from "react";
import Form from "../../../../components/common/Form";
import { useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import {
  addPatient,
  editPatient,
  getStaffList,
} from "../../../../store/features/patient/patientAction";
import { patient } from "../patient-detail/page";
import { redirect } from "next/navigation";

function getDirectImageUrl(viewUrl: string): string {
  const match = viewUrl.match(/\/d\/(.+?)\//);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return viewUrl; // fallback
}
function AddPatient() {
  const [formData, setFormData] = useState<patient>({});
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [staff, setStaff] = useState<string[]>([]);
  const patientList = useSelector(
    (state: RootState) => state.patient.patient
  ) as patient[];
  const dispatch = useDispatch<AppDispatch>();

  const isLoading = useSelector((state: RootState) => state.patient.isLoading);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Handle image preview
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

  // Set form data for edit
  useEffect(() => {
    if (id && patientList.length) {
      const data = patientList.find((elem: patient) => elem._id == id) as
        | patient
        | undefined;

      console.log(data);
      if (data) {
        setFormData(data);
        if (typeof data.profileImage === "string") {
          const directUrl = getDirectImageUrl(data.profileImage);
          setImagePreview(directUrl);
        } else if (data.profileImage instanceof File) {
          setImagePreview(URL.createObjectURL(data.profileImage));
        } else {
          setImagePreview(null);
        }
      }
    }
  }, [id, patientList]);

  // Handle submit
  useEffect(() => {
    if (isFormSubmit) {
      const submitData = { ...formData };
      const formDataObj = new FormData();
      Object.entries(submitData).forEach(([key, val]) => {
        formDataObj.append(key, val);
      });
      if (id) {
        dispatch(editPatient({ id, data: formDataObj })).then(() => {
          setIsFormSubmit(false);
          redirect("/admin/patient-detail");
        });
      } else {
        dispatch(addPatient(formDataObj)).then(() => {
          setIsFormSubmit(false);
          redirect("/admin/patient-detail");
        });
      }
    }
    // eslint-disable-next-line
  }, [isFormSubmit]);

  // Fetch staff list for assignment
  useEffect(() => {
    dispatch(getStaffList()).then((res) => {
      setStaff(res.payload?.fullNames || []);
    });
  }, [dispatch]);

  // Form fields grouped by section
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
