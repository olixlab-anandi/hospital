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
  multiple?: boolean;
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
  fileData?: File | File[];
  title?: string;
  isLoading?: boolean;
  imagePreview?: string | null;
  setFileData?: (data: File[]) => void;
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
  imagePreview,
  formData,
  isLoading,
  onImageChange,
  fileData,
  setFileData,
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

    // --- FILE FIELD ---
    if (field.type === "file") {
      const files = Array.isArray(fileData)
        ? fileData
        : fileData
        ? [fileData]
        : [];

      const fieldKey = field.name || "";

      // --- MULTIPLE FILE INPUT ---
      if (field.multiple) {
        return (
          <div className="flex flex-col gap-2 bg-white" key={field.id}>
            <label
              htmlFor={field.id}
              className="font-semibold text-[#1A237E] flex items-center gap-2 cursor-pointer"
            >
              {iconMap[fieldKey]} {field.label}
            </label>
            <input
              type="file"
              id={field.id}
              accept={field.accept}
              multiple
              className="hidden"
              onChange={onImageChange}
            />
            <div
              className="border border-[#B3E5FC] rounded-lg px-3 py-2 bg-[#F5F7FA] flex flex-wrap gap-4 cursor-pointer min-h-[60px]"
              onClick={() => document.getElementById(field.id)?.click()}
            >
              {files.length > 0 ? (
                files.map((file, idx) => {
                  if (file instanceof File) {
                    let preview: React.ReactNode = null;

                    if (file.type.startsWith("image/")) {
                      preview = (
                        <Image
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          width={60}
                          height={60}
                          className="rounded-md object-cover border border-[#0288D1]"
                          unoptimized
                        />
                      );
                    } else if (file.type.startsWith("video/")) {
                      preview = <span className="text-3xl">🎬</span>;
                    } else if (file.type === "application/pdf") {
                      preview = <span className="text-3xl">📄</span>;
                    } else {
                      preview = <span className="text-sm">{file.name}</span>;
                    }

                    return (
                      <div key={idx} className="relative group text-center">
                        {preview}
                        <span className="block text-xs mt-1 truncate w-[80px]">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newFiles = files.filter((_, i) => i !== idx);
                            if (setFileData) setFileData(newFiles);
                            setFormData((prev: FieldValues) => ({
                              ...prev,
                              [fieldKey]: newFiles,
                            }));
                          }}
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    );
                  }

                  // Uploaded file object (from DB)
                  const uploadedFile = file as {
                    type: string;
                    originalName?: string;
                    viewLink?: string;
                  };

                  return (
                    <div
                      key={idx}
                      className="relative group flex flex-col items-center"
                    >
                      {uploadedFile.type === "image" ? (
                        <span className="text-3xl">📷</span>
                      ) : uploadedFile.type === "video" ? (
                        <span className="text-3xl">🎬</span>
                      ) : uploadedFile.type === "pdf" ||
                        uploadedFile.originalName?.endsWith(".pdf") ? (
                        <span className="text-3xl">📄</span>
                      ) : (
                        <span className="text-2xl">📎</span>
                      )}
                      <a
                        href={uploadedFile.viewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs mt-1 text-[#0288D1] underline truncate w-[80px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {uploadedFile.originalName}
                      </a>
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const newFiles = files.filter((_, i) => i !== idx);
                          if (setFileData) setFileData(newFiles);
                          setFormData((prev: FieldValues) => ({
                            ...prev,
                            [fieldKey]: newFiles,
                          }));
                        }}
                        title="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              ) : (
                <span className="text-gray-400">{field.placeholder}</span>
              )}
            </div>
            {field.description && (
              <span className="text-xs text-gray-500">{field.description}</span>
            )}
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-2 bg-white" key={field.id}>
          <label
            htmlFor={field.id}
            className="font-semibold text-[#1A237E] flex items-center gap-2"
          >
            {iconMap[fieldKey]} {field.label}
          </label>

          <input
            type="file"
            id={field.id}
            accept={field.accept || "image/*"}
            className="hidden"
            onChange={onImageChange}
          />

          <div
            onClick={() => document.getElementById(field.id)?.click()}
            className="w-[100px] h-[100px] rounded-md border border-dashed border-gray-300 bg-gray-100 hover:border-[#0288D1] flex items-center justify-center overflow-hidden cursor-pointer transition"
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Profile"
                width={100}
                height={100}
                className="object-cover rounded-md"
                unoptimized
              />
            ) : (
              <span className="text-gray-400 text-sm">100 × 100</span>
            )}
          </div>

          <span className="text-xs text-gray-500">
            Click the image to select or change the profile photo.
          </span>
        </div>
      );
    }

    // --- TEXTAREA FIELD ---
    if (field.type === "textarea") {
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

    // --- SELECT FIELD ---
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

    // --- BUTTON FIELD ---
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

    // --- DEFAULT INPUT FIELD ---
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
            min={field.min || undefined}
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
