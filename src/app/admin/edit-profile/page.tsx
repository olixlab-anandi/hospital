"use client";

import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../../store/store";
import { updateProfile } from "../../../../store/features/auth/authActions";
import { redirect } from "next/navigation";

function EditProfile() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    profileImage: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files && files.length > 0 ? files[0] : value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?._id) return;

      setIsSubmitting(true);
      try {
        const formData = new FormData();
        const fields = {
          id: user._id,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          role: user.role,
          ...(form.profileImage && { profileImage: form.profileImage }),
        };

        Object.entries(fields).forEach(([key, value]) => {
          if (value) formData.append(key, value as string | Blob);
        });

        const res = await dispatch(updateProfile(formData)).unwrap();
        console.log(res);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          redirect("/admin/profile");
        }, 1200);
      } catch (error) {
        console.error("Profile update failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, form, user?._id, user?.role]
  );

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl p-10 border border-[#B3E5FC] mt-16 relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#B3E5FC] opacity-30 rounded-full blur-2xl animate-float-slow z-0" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#0288D1] opacity-20 rounded-full blur-2xl animate-float z-0" />
      <form
        className="relative z-10 flex flex-col gap-6"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
        autoComplete="off"
        noValidate
      >
        <h2 className="text-3xl font-bold text-[#0288D1] mb-2 text-center">
          Edit Profile
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="flex-1 border border-[#B3E5FC] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-[#F5F7FA]"
            required
          />
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="flex-1 border border-[#B3E5FC] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-[#F5F7FA]"
            required
          />
        </div>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border border-[#B3E5FC] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-[#F5F7FA]"
          required
        />
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="border border-[#B3E5FC] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-[#F5F7FA]"
        />
        <input
          type="file"
          name="profileImage"
          onChange={handleChange}
          accept="image/*"
          className="border border-[#B3E5FC] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#64B5F6] text-[#1A237E] bg-[#F5F7FA]"
        />
        <button
          type="submit"
          className="bg-[#0288D1] text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-[#01579b] transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
          )}
          Save Changes
        </button>
        {success && (
          <div className="text-green-600 text-center font-semibold">
            Profile updated successfully!
          </div>
        )}
      </form>
    </div>
  );
}

export default EditProfile;
