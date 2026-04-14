"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, itemName }: ConfirmDeleteModalProps) {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (inputValue === "CONFIRM") {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-red-50 p-6 flex items-start justify-between border-b border-red-100">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Delete {itemName}</h2>
              <p className="text-sm text-red-500 font-medium mt-1 hover:text-red-600">This action cannot be undone.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-red-100 rounded text-red-500 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Please type <strong className="text-red-600 tracking-wider">CONFIRM</strong> to delete:
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition uppercase"
            placeholder="Type CONFIRM"
            autoFocus
          />
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={inputValue !== "CONFIRM"}
            className="px-5 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
