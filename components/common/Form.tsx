"use client";

import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import { useForm, FieldValues } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserMd,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaKey,
  FaHome,
  FaCity,
  FaMapPin,
  FaFileMedical,
  FaImage,
  FaUserTag,
  FaTint,
  FaNotesMedical,
  FaHospitalUser,
  FaMapSigns,
} from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa";

type FormField = {
  id: string;
  name?: string;
  label?: string;
  type: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  value?: string;
  options?: string[] | { id: string; value: string }[];
  placeholder?: string;
  accept?: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type SectionField = {
  section: string;
  fields: FormField[];
};

type FormProps = {
  formFields: SectionField[];
  setFormData: (data: FieldValues) => void;
  setIsFormSubmit: (val: boolean) => void;
  formData?: FieldValues;
  title?: string;
  isLoading?: boolean;
  imagePreview?: string | null;
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const iconMap: Record<string, React.ReactNode> = {
  firstName: <FaUser className="text-[#0288D1] text-lg" />,
  lastName: <FaUser className="text-[#0288D1] text-lg" />,
  email: <FaEnvelope className="text-[#0288D1] text-lg" />,
  phone: <FaPhone className="text-[#0288D1] text-lg" />,
  staff: <FaUserMd className="text-[#0288D1] text-lg" />,
  age: <FaCalendarAlt className="text-[#0288D1] text-lg" />,
  location: <FaMapMarkerAlt className="text-[#0288D1] text-lg" />,
  password: <FaKey className="text-[#0288D1] text-lg" />,
  flatNo: <FaHome className="text-[#0288D1] text-lg" />,
  area: <FaMapSigns className="text-[#0288D1] text-lg" />,
  city: <FaCity className="text-[#0288D1] text-lg" />,
  state: <FaMapMarkerAlt className="text-[#0288D1] text-lg" />,
  zipCode: <FaMapPin className="text-[#0288D1] text-lg" />,
  medicalHistory: <FaFileMedical className="text-[#0288D1] text-lg" />,
  profileImage: <FaImage className="text-[#0288D1] text-lg" />,
  role: <FaUserTag className="text-[#0288D1] text-lg" />,
  bloodGroup: <FaTint className="text-[#0288D1] text-lg" />,
  diagnosed: <FaNotesMedical className="text-[#0288D1] text-lg" />,
  primaryDoctor: <FaHospitalUser className="text-[#0288D1] text-lg" />,
  sessionCharge: <FaMoneyBillWave className="text-[#0288D1] text-lg" />,
};

const getValidationRules = (field: FormField) => {
  const rules: Record<string, unknown> = {};
  if (field.required)
    rules.required = `${field.label || field.name} is required`;

  if (typeof field.min === "number")
    rules.min = { value: field.min, message: `Minimum is ${field.min}` };
  if (typeof field.max === "number")
    rules.max = { value: field.max, message: `Maximum is ${field.max}` };
  if (typeof field.minLength === "number")
    rules.minLength = {
      value: field.minLength,
      message: `Minimum length is ${field.minLength}`,
    };
  if (typeof field.maxLength === "number")
    rules.maxLength = {
      value: field.maxLength,
      message: `Maximum length is ${field.maxLength}`,
    };
  return rules;
};

const Form: React.FC<FormProps> = ({
  formFields,
  setFormData,
  setIsFormSubmit,
  formData,
  isLoading,
  imagePreview,
  onImageChange,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: useMemo(() => formData, [formData]),
  });
  console.log(errors);
  function onSubmit(data: FieldValues) {
    setIsFormSubmit(true);
    setFormData({ ...formData, ...data });
  }

  useEffect(() => {
    if (formData) {
      reset(formData);
    }
  }, [formData, reset]);

  const renderField = (field: FormField) => {
    const validation = getValidationRules(field);

    if (field.type === "file") {
      return (
        <div className="flex flex-col items-center mb-8 " key={field.id}>
          <label
            htmlFor={field.id}
            className="mb-2 font-semibold text-[#0288D1] flex items-center gap-2 cursor-pointer"
          >
            {iconMap[field.name || "profileImage"]} {field.label}
          </label>
          <input
            type="file"
            id={field.id}
            accept={field.accept}
            className="hidden"
            onChange={onImageChange}
          />
          <div
            className="w-28 h-28 rounded-full border-2 border-[#0288D1] bg-[#F5F7FA] flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => document.getElementById(field.id)?.click()}
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
                width={112}
                height={112}
              />
            ) : (
              <FaUser className="text-5xl text-[#B3E5FC]" />
            )}
          </div>
        </div>
      );
    }

    if (field.type === "textarea") {
      // Use trigger from react-hook-form to validate the field

      return (
        <div className="flex flex-col gap-2" key={field.id}>
          {field.label && (
            <label
              htmlFor={field.id}
              className="font-semibold text-[#1A237E] flex items-center gap-2"
            >
              {iconMap[field.name || ""]} {field.label}
            </label>
          )}
          <textarea
            id={field.id}
            {...register(field.name || "", validation)}
            placeholder={field.placeholder}
            className={`border border-[#B3E5FC] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-white w-full min-h-[80px] ${
              errors[field.name || ""] ? "border-red-400" : ""
            }`}
            value={formData?.[field.name || ""] || ""}
            onChange={(e) => {
              setFormData({
                ...formData,
                [field.name as string]: (e.target as HTMLTextAreaElement).value,
              });
              setValue(field.name || "", e.target.value, {
                shouldValidate: true,
              });
              trigger(field.name || "");
            }}
          />
          {errors[field.name || ""] && (
            <span className="text-xs text-red-500">
              {errors[field.name || ""]?.message as string}
            </span>
          )}
          {field.description && (
            <span className="text-xs text-gray-500">{field.description}</span>
          )}
        </div>
      );
    }

    if (field.type === "select" && field.options) {
      return (
        <div className="flex flex-col gap-2" key={field.id}>
          {field.label && (
            <label
              htmlFor={field.id}
              className="text-[#1A237E] font-semibold flex items-center gap-2"
            >
              {iconMap[field.name || ""]} {field.label}
            </label>
          )}
          <Autocomplete<{ id: string; value: string } | string>
            {...register(field.name || "", validation)}
            id={field.id}
            options={field.options || []}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option?.value || ""
            }
            isOptionEqualToValue={(option, value) => {
              if (typeof option === "string" && typeof value === "string") {
                return option === value;
              }
              if (
                typeof option === "object" &&
                option !== null &&
                typeof value === "object" &&
                value !== null
              ) {
                return option.id === value.id;
              }
              return false;
            }}
            value={(() => {
              const stored = formData?.[field.name || ""];

              if (
                typeof stored === "string" &&
                Array.isArray(field.options) &&
                field.options.every((opt) => typeof opt === "string") &&
                field.options.includes(stored)
              ) {
                return stored;
              }
              // If object list
              return (
                (field.options || []).find(
                  (opt) => typeof opt === "object" && opt.id === stored
                ) || null
              );
            })()}
            onChange={(_, selectedOption) => {
              let selectedValue;
              if (typeof selectedOption === "string") {
                selectedValue = selectedOption;
              } else {
                selectedValue = selectedOption?.id || "";
              }

              setFormData({
                ...formData,
                [field.name as string]: selectedValue,
              });

              setValue(field.name || "", selectedValue, {
                shouldValidate: true,
              });

              if (field.onChange) {
                // Call onChange with a custom event-like object or just the value
                field.onChange({
                  target: {
                    name: field.name || "",
                    value: selectedValue,
                  },
                } as unknown as React.ChangeEvent<HTMLInputElement>);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={field.placeholder}
                variant="standard"
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: true,
                }}
              />
            )}
            className={`border border-[#B3E5FC] rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-white ${
              errors[field.name || ""] ? "border-red-400" : ""
            }`}
          />
          {errors[field.name || ""] && (
            <span className="text-xs text-red-500">
              {(errors[field.name || ""]?.message as string) || ""}
            </span>
          )}
        </div>
      );
    }

    if (field.type === "button") {
      return (
        <button
          key={field.id}
          className={`w-full bg-gradient-to-r from-[#0288D1] to-[#64B5F6] text-white rounded-full px-4 py-3 font-bold shadow-lg hover:from-[#01579b] hover:to-[#0288D1] transition-all duration-200 flex items-center justify-center text-lg ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          type="submit"
          disabled={isLoading}
        >
          {field.value}
          {isLoading && (
            <span className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
        </button>
      );
    }
    // Default input
    return (
      <div className="flex flex-col gap-2" key={field.id}>
        {field.label && (
          <label
            htmlFor={field.id}
            className="text-[#1A237E] font-semibold flex items-center gap-2"
          >
            {iconMap[field.name || ""]} {field.label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            type={field.type}
            autoComplete="off"
            placeholder={field.placeholder}
            id={field.id}
            {...register(field.name || "", validation)}
            min={field.min}
            max={field.max}
            className={`border border-[#B3E5FC] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-white w-full ${
              errors[field.name || ""] ? "border-red-400" : ""
            }`}
            value={formData?.[field.name || ""] || ""}
            onChange={(e) => {
              setFormData({
                ...formData,
                [field.name as string]: e.target.value,
              });

              if (field.onChange) {
                field.onChange(e);
              }
            }}
          />
        </div>
        {errors[field.name || ""] && (
          <span className="text-xs text-red-500">
            {(errors[field.name || ""]?.message as string) || ""}
          </span>
        )}
      </div>
    );
  };

  const renderSection = (section: SectionField, idx: number) => {
    const isAddress = section.section?.toLowerCase().includes("address");
    const isMedical = section.section?.toLowerCase().includes("medical");
    return (
      <div
        key={section.section + idx}
        className={`mb-8 ${
          isAddress || isMedical
            ? "border border-[#E3E8F0] rounded-xl p-6 bg-[#FCFCFD]"
            : ""
        }`}
      >
        {section.section && (
          <div className="flex items-center gap-2 my-3 text-lg font-semibold text-[#0288D1]">
            {section.section}
          </div>
        )}
        <div
          className={
            isAddress
              ? "grid grid-cols-1 md:grid-cols-2 gap-5"
              : isMedical
              ? "grid grid-cols-1 gap-5"
              : "grid grid-cols-1 md:grid-cols-2 gap-6"
          }
        >
          {section.fields.map((field) => renderField(field))}
        </div>
      </div>
    );
  };

  return (
    <form
      className="w-full mx-auto animate-fade-in"
      onSubmit={handleSubmit(onSubmit)}
      encType="multipart/form-data"
    >
      {formFields.map((section, idx) => renderSection(section, idx))}
    </form>
  );
};

export default Form;
