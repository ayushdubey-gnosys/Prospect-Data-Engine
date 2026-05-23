import React from "react";
import {
  Database,
  UploadCloud,
  Filter,
  Tags,
  FileSpreadsheet,
  History,
  ShieldCheck,
  Users,
  Building2,
  Search,
  Layers3,
} from "lucide-react";

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-black text-white">

        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gray-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-8 sm:p-12">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/10 backdrop-blur-md text-sm">
            <Database className="w-4 h-4" />
            Prospect Data Engine
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl font-semibold leading-tight max-w-4xl">
            Centralized business data management platform for sales and marketing teams
          </h1>

          <p className="mt-6 text-white/70 text-base sm:text-lg leading-relaxed max-w-3xl">
            Prospect Data Engine (PDE) is a centralized database platform
            designed to simplify company data management, importing,
            filtering, tagging, exporting, and activity tracking for modern
            business teams. The system acts as a single source of truth for
            managing prospect and company data in one secure platform.
          </p>

        </div>
      </div>

      {/* About PDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-gray-800" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900">
            What is PDE?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            PDE is a centralized data sourcing and filtering system built for
            managing large-scale company and prospect data. The platform helps
            teams organize business records, manage imports from multiple
            sources, apply advanced filters, manage tags, and export structured
            datasets for outreach campaigns and CRM integrations.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
            <ShieldCheck className="w-7 h-7 text-gray-800" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900">
            Core Objective
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The primary goal of PDE is to centralize company data from
            multiple sources into one organized system where users can
            filter, segment, tag, manage, and export records efficiently.
            PDE is not a CRM platform. Instead, it works as the data backbone
            for outbound sales and marketing operations.
          </p>
        </div>

      </div>

      {/* Features */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8">

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-900">
            Platform Features
          </h2>

          <p className="text-gray-500 mt-2">
            Core modules and workflow management features inside PDE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* Card */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition">
            <UploadCloud className="w-8 h-8 text-gray-800 mb-4" />

            <h3 className="text-lg font-semibold text-gray-900">
              Data Import System
            </h3>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Sales users can import CSV and Excel files into the centralized
              database system. The platform supports structured company data
              imports from multiple sources.
            </p>
          </div>

          {/* Card */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition">
            <Filter className="w-8 h-8 text-gray-800 mb-4" />

            <h3 className="text-lg font-semibold text-gray-900">
              Advanced Filtering
            </h3>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Marketing users can filter data using city, state, industry,
              turnover, tags, source, and custom field selection before
              exporting records.
            </p>
          </div>

          {/* Card */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition">
            <Tags className="w-8 h-8 text-gray-800 mb-4" />

            <h3 className="text-lg font-semibold text-gray-900">
              Tag Management
            </h3>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Users can create and manage tags for better company segmentation
              and data organization inside the centralized database system.
            </p>
          </div>

          {/* Card */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition">
            <FileSpreadsheet className="w-8 h-8 text-gray-800 mb-4" />

            <h3 className="text-lg font-semibold text-gray-900">
              Export Engine
            </h3>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Export filtered company data into Excel and CSV formats with
              customizable column selection based on business requirements.
            </p>
          </div>

          {/* Card */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition">
            <History className="w-8 h-8 text-gray-800 mb-4" />

            <h3 className="text-lg font-semibold text-gray-900">
              Activity History
            </h3>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Track complete upload and export history including which user
              imported or exported data, along with date and time management.
            </p>
          </div>

          {/* Card */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition">
            <Search className="w-8 h-8 text-gray-800 mb-4" />

            <h3 className="text-lg font-semibold text-gray-900">
              Search & Segmentation
            </h3>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Quickly search and segment company records using combined filters
              for better targeting and outbound campaign management.
            </p>
          </div>

        </div>
      </div>

      {/* Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Admin */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <Users className="w-10 h-10 text-gray-900 mb-5" />

          <h3 className="text-2xl font-semibold text-gray-900">
            Admin
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-gray-600">
            <li>• Full system access</li>
            <li>• Manage imports and exports</li>
            <li>• Manage tags and users</li>
            <li>• Track complete activity history</li>
          </ul>
        </div>

        {/* Sales */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <UploadCloud className="w-10 h-10 text-gray-900 mb-5" />

          <h3 className="text-2xl font-semibold text-gray-900">
            Sales User
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-gray-600">
            <li>• Import company data</li>
            <li>• Manage company tags</li>
            <li>• View and filter records</li>
            <li>• Track upload history</li>
          </ul>
        </div>

        {/* Marketing */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8">
          <Layers3 className="w-10 h-10 text-gray-900 mb-5" />

          <h3 className="text-2xl font-semibold text-gray-900">
            Marketing User
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-gray-600">
            <li>• Filter company records</li>
            <li>• Export Excel and CSV files</li>
            <li>• Select export columns</li>
            <li>• Track export history</li>
          </ul>
        </div>

      </div>

      {/* Workflow */}
      <div className="bg-black text-white rounded-3xl p-8 sm:p-10">

        <h2 className="text-3xl font-semibold">
          PDE Workflow
        </h2>

        <p className="text-white/70 mt-3 max-w-3xl leading-relaxed">
          The platform workflow is designed to centralize business data
          operations and simplify outbound prospecting for sales and
          marketing teams.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">

          <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10">
            Import Data
          </div>

          <div className="text-white/40">→</div>

          <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10">
            Filter & Search
          </div>

          <div className="text-white/40">→</div>

          <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10">
            Tag & Segment
          </div>

          <div className="text-white/40">→</div>

          <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10">
            Export Data
          </div>

          <div className="text-white/40">→</div>

          <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10">
            CRM & Outreach
          </div>

        </div>
      </div>

    </div>
  );
};

export default AboutPage;