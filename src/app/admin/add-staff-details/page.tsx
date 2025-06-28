"use client";

import React, { useEffect, useState } from "react";
import Form from "../../../../components/common/Form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import {
  addStaff,
  editStaff,
} from "../../../../store/features/admin/adminActions";
import { useRouter, useSearchParams } from "next/navigation";
import { staff } from "../staff-details/page";

function AddStaff() {
  const [formData, setFormData] = useState<Partial<staff>>({});
  const [isFormSubmit, setIsFormSubmit] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const staffList = useSelector(
    (state: RootState) => state.staff.staff
  ) as staff[];
  const dispatch = useDispatch<AppDispatch>();

  const isLoading = useSelector((state: RootState) => state.staff.isLoading);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: staff) => ({
        ...prev,
        profileImage: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Set form data for edit
  useEffect(() => {
    if (id && staffList.length) {
      const data = staffList.find((elem: staff) => elem._id == id);
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
  }, [id, staffList]);

  // Handle submit
  useEffect(() => {
    if (isFormSubmit) {
      const formDataObj = new FormData();
      const submitData = { ...formData };

      Object.entries(submitData).forEach(([key, val]) => {
        formDataObj.append(key, val as string | Blob);
      });

      if (id) {
        dispatch(editStaff({ id, data: formDataObj })).then(() => {
          setIsFormSubmit(false);
          redirect("/admin/staff-details");
        });
      } else {
        dispatch(addStaff(formDataObj)).then(() => {
          setIsFormSubmit(false);
          redirect("/admin/staff-details");
        });
      }
    }
    // eslint-disable-next-line
  }, [isFormSubmit]);

  // Dynamic form fields grouped by section (like add patient)
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
          min: 10,
          max: 10,
          placeholder: "Enter phone number...",
        },
        {
          name: "sessionCharge",
          type: "number",
          id: "sessionCharge",
          label: "Session Charge",
          placeholder: "Enter session charge...",
          min: 0,
          max: 1000000,
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
      section: "",
      fields: [
        {
          type: "button",
          id: "btn",
          value: id ? "Edit Staff Detail" : "Add Staff Detail",
        },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#B3E5FC] p-8">
        <h2 className="text-3xl font-bold text-[#0288D1] mb-8 text-center tracking-tight">
          {id ? "Edit Staff" : "Add Staff"}
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

export default AddStaff;
