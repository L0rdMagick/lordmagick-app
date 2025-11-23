// --- START OF FILE src/app/components/HumanDesignForm.tsx ---
import React, { useState } from 'react';
import type { FormData } from '@/lib/types';
import { SubmitIcon } from './icons';

interface HumanDesignFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

const InputField: React.FC<{
  id: keyof FormData;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}> = ({ id, label, type, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-200"
      required
    />
  </div>
);

const HumanDesignForm: React.FC<HumanDesignFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    birthplace: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // FIX: Cast target to any to bypass strict EventTarget type checking
    const { name, value } = e.target as any;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
       <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Create Your Report</h2>
            <p className="text-gray-400">Enter your birth details to generate your personalized blueprint.</p>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          id="name"
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Jane Doe"
        />
        <InputField
          id="birthplace"
          label="Birthplace (City, State, Country)"
          type="text"
          value={formData.birthplace}
          onChange={handleChange}
          placeholder="e.g., New York, NY, USA"
        />
        <InputField
          id="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          placeholder=""
        />
        <InputField
          id="timeOfBirth"
          label="Time of Birth"
          type="time"
          value={formData.timeOfBirth}
          onChange={handleChange}
          placeholder=""
        />
      </div>
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <SubmitIcon />
          {isLoading ? 'Generating Your Blueprint...' : 'Generate My Report'}
        </button>
      </div>
    </form>
  );
};

export default HumanDesignForm;