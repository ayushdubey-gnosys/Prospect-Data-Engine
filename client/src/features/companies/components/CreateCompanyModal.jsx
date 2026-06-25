import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Plus, Trash2, X } from "lucide-react";

import api from "../../../api/axios";
import { queryClient } from "../../../api/queryClient";

import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

const companySchema = z.object({
  company_name: z
    .string()
    .min(2, "Company name is required"),

  industry: z.string().optional().or(z.literal("")),

  city: z.string().optional().or(z.literal("")),

  country: z.string().optional().or(z.literal("")),

  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  phone: z.string().optional().or(z.literal("")),

  website: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),



  companyOwnerName: z.string().optional().or(z.literal("")),

  turnover: z.coerce.number().optional().or(z.literal("")),

  source: z.enum([
    "manual",
    "google_sheet",
    "mca",
  ]),

  contacts: z.array(contactSchema).optional(),
  tags: z.array(z.string()).optional(),
});

const CreateCompanyModal = ({
  isOpen,
  onClose,
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companySchema),

    defaultValues: {
      source: "manual",
      country: "India",
      contacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
  });

  const [selectedTags, setSelectedTags] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch all existing tags from backend
  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.get("/tag").then((res) => res.data),
    enabled: isOpen,
  });

  const allTags = tagsData?.tags || tagsData || [];

  // Reset tags when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTags([]);
      setSearchText("");
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tags based on search input
  const filteredTags = allTags.filter((tag) => {
    const matchesSearch = tag.name.toLowerCase().includes(searchText.toLowerCase());
    const isAlreadySelected = selectedTags.some(
      (name) => name.toLowerCase() === tag.name.toLowerCase()
    );
    return matchesSearch && !isAlreadySelected;
  });

  // Check if current search matches an existing tag exactly
  const hasExactMatch = allTags.some(
    (tag) => tag.name.toLowerCase() === searchText.trim().toLowerCase()
  );

  const handleAddTag = (tagName) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    
    // Check for duplicates case-insensitively
    if (selectedTags.some((name) => name.toLowerCase() === trimmed.toLowerCase())) {
      setSearchText("");
      setIsDropdownOpen(false);
      return;
    }

    setSelectedTags([...selectedTags, trimmed]);
    setSearchText("");
    setIsDropdownOpen(false);
  };

  const handleRemoveTag = (tagName) => {
    setSelectedTags(selectedTags.filter((name) => name !== tagName));
  };

  const createMutation = useMutation({
    mutationFn: (data) =>
      api.post("/company", data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["companies"],
      });

      toast.success(
        "Company created successfully"
      );

      reset();
      setSelectedTags([]);

      onClose();
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        "Failed to create company"
      );
    },
  });

  const onSubmit = (data) => {
    const payload = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === "contacts") {
        if (value && value.length > 0) {
          payload[key] = value;
        }
      } else if (value !== "" && value !== null && value !== undefined) {
        payload[key] = value;
      }
    }
    payload.tags = selectedTags;

    createMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Company"
      className="max-w-4xl"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Company Name */}
        <Input
          label="Company Name *"
          placeholder="Enter company name"
          {...register("company_name")}
          error={
            errors.company_name?.message
          }
        />

        {/* Industry + Website */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Industry"
            placeholder="IT, Finance, etc."
            {...register("industry")}
            error={
              errors.industry?.message
            }
          />

          <Input
            label="Website"
            placeholder="https://example.com"
            {...register("website")}
            error={
              errors.website?.message
            }
          />
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            placeholder="company@gmail.com"
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="Phone"
            placeholder="9876543210"
            {...register("phone")}
            error={errors.phone?.message}
          />
        </div>

        {/* City + Country */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="Ahmedabad"
            {...register("city")}
            error={errors.city?.message}
          />

          <Input
            label="Country"
            placeholder="India"
            {...register("country")}
            error={errors.country?.message}
          />
        </div>

        {/* Owner + Tags */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Company Owner Name"
            placeholder="Enter owner/founder name"
            {...register("companyOwnerName")}
            error={errors.companyOwnerName?.message}
          />

          <div className="relative animate-fadeIn" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Tags
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type tag name..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm bg-white h-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchText.trim()) {
                    e.preventDefault();
                    if (filteredTags.length > 0) {
                      handleAddTag(filteredTags[0].name);
                    } else if (!hasExactMatch) {
                      handleAddTag(searchText);
                    }
                  }
                }}
              />
            </div>

            {/* Custom Dropdown list */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => handleAddTag(tag.name)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0"
                  >
                    <span>{tag.name}</span>
                  </button>
                ))}

                {/* Create On-The-Fly Option */}
                {searchText.trim() && !hasExactMatch && (
                  <button
                    type="button"
                    onClick={() => handleAddTag(searchText)}
                    className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create "{searchText.trim()}"</span>
                  </button>
                )}

                {filteredTags.length === 0 && (!searchText.trim() || hasExactMatch) && (
                  <div className="p-3 text-xs text-gray-500 text-center">
                    No matching tags.
                  </div>
                )}
              </div>
            )}

            {/* Selected Tags list */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 p-2 border border-gray-200 bg-gray-50 rounded-lg max-h-24 overflow-y-auto">
                {selectedTags.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"
                  >
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(name)}
                      className="hover:bg-indigo-100 p-0.5 rounded-full text-indigo-500 hover:text-indigo-700 transition"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Turnover + Source */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Turnover"
            type="number"
            placeholder="500000"
            {...register("turnover")}
            error={
              errors.turnover?.message
            }
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Source
            </label>

            <select
              {...register("source")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm bg-white"
            >
              <option value="manual">
                Manual
              </option>

              <option value="google_sheet">
                Google Sheet
              </option>

              <option value="mca">
                MCA
              </option>
            </select>
          </div>
        </div>

        {/* Employee Contacts Section */}
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-800">
              Employee Contacts
            </label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append({ name: "", position: "", contactNumber: "", email: "" })}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Employee
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-xs text-gray-400 italic">No employee contacts added yet.</p>
          )}

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-200 relative">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                  <div>
                    <input
                      placeholder="Employee Name"
                      {...register(`contacts.${index}.name`)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 text-xs"
                    />
                    {errors.contacts?.[index]?.name && (
                      <p className="text-red-500 text-[10px] mt-0.5">{errors.contacts[index].name.message}</p>
                    )}
                  </div>

                  <div>
                    <input
                      placeholder="Position"
                      {...register(`contacts.${index}.position`)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 text-xs"
                    />
                    {errors.contacts?.[index]?.position && (
                      <p className="text-red-500 text-[10px] mt-0.5">{errors.contacts[index].position.message}</p>
                    )}
                  </div>

                  <div>
                    <input
                      placeholder="Contact Number"
                      {...register(`contacts.${index}.contactNumber`)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 text-xs"
                    />
                    {errors.contacts?.[index]?.contactNumber && (
                      <p className="text-red-500 text-[10px] mt-0.5">{errors.contacts[index].contactNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <input
                      placeholder="Email"
                      type="email"
                      {...register(`contacts.${index}.email`)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 text-xs"
                    />
                    {errors.contacts?.[index]?.email && (
                      <p className="text-red-500 text-[10px] mt-0.5">{errors.contacts[index].email.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            isLoading={
              createMutation.isPending
            }
          >
            Create Company
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCompanyModal;