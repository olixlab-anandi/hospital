"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../store/store";
import { getPatientById } from "../../../../../store/features/patient/patientAction";
import { HashLoader } from "react-spinners";

function PatientDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.patient.isLoading);
  const [patient, setPatient] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    bloodGroup: "",
    flatNo: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
    diagnosed: "",
    primaryDoctor: "",
    medicalHistory: "",
    profileImage: "",
    role: "Patient",
    registered: new Date().toLocaleDateString(),
  });
  useEffect(() => {
    dispatch(getPatientById(id as string)).then((res) => {
      setPatient(res.payload);
    });
  }, [id]);
  return (
    <>
      {!isLoading ? (
        <div className="flex justify-center items-start min-h-[80vh] bg-[#f5f7fa] py-10">
          <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-3xl border border-blue-100">
            <div className="flex items-center gap-8 mb-10">
              {patient.profileImage ? (
                <Image
                  src={patient.profileImage as string}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-blue-200 bg-gray-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-6xl font-extrabold text-white border-4 border-blue-300 shadow">
                  {patient.firstName[0]}
                </div>
              )}
              <div>
                <h2 className="text-3xl font-extrabold text-[#1a237e] mb-2 tracking-tight">
                  {patient.firstName} {patient.lastName}
                </h2>
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-2">
                  {patient.role}
                </span>
                <div className="text-gray-400 text-sm">
                  Registered:{" "}
                  <span className="text-[#1976d2] font-medium">
                    {patient.registered}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <Detail label="Email" value={patient.email} />
              <Detail label="Phone" value={patient.phone} />
              <Detail label="Age" value={patient.age} />
              <Detail label="Blood Group" value={patient.bloodGroup} />
              <Detail
                label="Address"
                value={
                  <span>
                    <span className="block">{patient.flatNo}</span>
                    <span className="block">{patient.area}</span>
                    <span className="block">
                      {patient.city}, {patient.state} {patient.zipCode}
                    </span>
                  </span>
                }
              />
              <Detail label="Diagnosed" value={patient.diagnosed} />
              <Detail label="Primary Doctor" value={patient.primaryDoctor} />
              <Detail label="Medical History" value={patient.medicalHistory} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[80vh] bg-[#f5f7fa]">
          <HashLoader color="#1820e3" />
        </div>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="text-[#1976d2] text-xs font-bold uppercase mb-1 tracking-wider">
        {label}
      </div>
      <div className="text-[#263238] font-medium break-words">{value}</div>
    </div>
  );
}

export default PatientDetailPage;
