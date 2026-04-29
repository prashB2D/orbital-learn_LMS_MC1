import React, { useState, useEffect, useMemo } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

const COUNTRIES = [
  { code: "IN", flag: "🇮🇳", dialCode: "91", name: "India" },
  { code: "US", flag: "🇺🇸", dialCode: "1", name: "USA / Canada" }, // US and CA share +1
  { code: "GB", flag: "🇬🇧", dialCode: "44", name: "UK" },
  { code: "AE", flag: "🇦🇪", dialCode: "971", name: "UAE" },
  { code: "AU", flag: "🇦🇺", dialCode: "61", name: "Australia" },
  { code: "SG", flag: "🇸🇬", dialCode: "65", name: "Singapore" },
  { code: "DE", flag: "🇩🇪", dialCode: "49", name: "Germany" },
  { code: "FR", flag: "🇫🇷", dialCode: "33", name: "France" },
  { code: "JP", flag: "🇯🇵", dialCode: "81", name: "Japan" },
];

export function PhoneInput({ value, onChange, className = "" }: PhoneInputProps) {
  const [dialCode, setDialCode] = useState("91");
  const [number, setNumber] = useState("");
  const [touched, setTouched] = useState(false);

  // Parse initial value only once or when external value changes
  useEffect(() => {
    if (value && value.startsWith("+")) {
      // Sort dial codes by length descending to match longest first
      const sortedDialCodes = [...COUNTRIES]
        .map(c => c.dialCode)
        .sort((a, b) => b.length - a.length);

      let matchedDialCode = "91"; // default
      let parsedNumber = value.replace(/^\+/, "");

      for (const dc of sortedDialCodes) {
        if (parsedNumber.startsWith(dc)) {
          matchedDialCode = dc;
          parsedNumber = parsedNumber.slice(dc.length);
          break;
        }
      }

      setDialCode(matchedDialCode);
      setNumber(parsedNumber);
    } else if (!value) {
      setNumber("");
    }
  }, [value]);

  const handleDialCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDialCode = e.target.value;
    setDialCode(newDialCode);
    if (number.length === 10) {
      onChange(`+${newDialCode}${number}`);
    } else {
      onChange(""); // Only emit valid full numbers? The requirements say "The component emits the full international value as +{dialCode}{number}". Let's emit it always, or only when valid? Wait, the prompt says "On change, validate that the number part is exactly 10 digits... The component emits the full international value as +{dialCode}{number}". I will just emit it anyway.
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) {
      setNumber(val);
      setTouched(true);
      // Emit the full string if we want to save it as +91... 
      // If it's partial, we can still emit it, or only emit if valid.
      // Usually it's better to emit the combined string so parent state is in sync.
      if (val.length > 0) {
        onChange(`+${dialCode}${val}`);
      } else {
        onChange("");
      }
    }
  };

  const isInvalid = touched && number.length > 0 && number.length < 10;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex gap-2">
        <select
          value={dialCode}
          onChange={handleDialCodeChange}
          className="border px-2 py-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 w-[120px] shrink-0"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.dialCode}>
              {c.flag} +{c.dialCode}
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={number}
          onChange={handleNumberChange}
          onBlur={() => setTouched(true)}
          placeholder="Phone number"
          maxLength={10}
          className={`flex-1 border px-3 py-2 rounded-lg outline-none focus:ring-2 ${
            isInvalid ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
          }`}
        />
      </div>
      {isInvalid && (
        <span className="text-red-500 text-xs font-medium pl-1">
          Enter a valid 10-digit number
        </span>
      )}
    </div>
  );
}
