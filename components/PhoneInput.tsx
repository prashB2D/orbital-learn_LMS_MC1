import React, { useState, useEffect, useRef } from "react";
import { allCountries } from "country-telephone-data";

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function PhoneInput({ value, onChange, className = "" }: PhoneInputProps) {
  const [dialCode, setDialCode] = useState("91");
  const [number, setNumber] = useState("");
  const [touched, setTouched] = useState(false);
  
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value.startsWith("+")) {
      const sortedDialCodes = [...allCountries]
        .map(c => c.dialCode)
        .sort((a, b) => b.length - a.length);

      let matchedDialCode = "91";
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDialCodeSelect = (dc: string) => {
    setDialCode(dc);
    setIsOpen(false);
    setSearch("");
    if (number.length > 0) onChange(`+${dc}${number}`);
  };

  const handleDialCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (!isOpen) setIsOpen(true);
    
    // Allow custom typed dial codes starting with + and digits
    if (val.match(/^\+\d{1,4}$/)) {
      const code = val.replace("+", "");
      setDialCode(code);
      if (number.length > 0) onChange(`+${code}${number}`);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setNumber(val);
    setTouched(true);
    if (val.length > 0) {
      onChange(`+${dialCode}${val}`);
    } else {
      onChange("");
    }
  };

  const isInvalid = touched && number.length === 0;

  const filteredCountries = allCountries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.dialCode.includes(search.replace("+", ""))
  );

  const currentCountry = allCountries.find(c => c.dialCode === dialCode);
  const displayValue = isOpen ? search : `+${dialCode} ${currentCountry ? currentCountry.name : ""}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`} ref={containerRef}>
      <div className="flex gap-2 relative">
        <div className="relative w-[140px] shrink-0">
          <input
            type="text"
            value={displayValue}
            onChange={handleDialCodeInput}
            onFocus={() => { setIsOpen(true); setSearch(""); }}
            placeholder="+91 India"
            className="w-full border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          />
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-[250px] max-h-60 overflow-y-auto bg-white border rounded-lg shadow-xl z-50">
              {filteredCountries.map((c, i) => (
                <div 
                  key={`${c.iso2}-${i}`} 
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex gap-2"
                  onClick={() => handleDialCodeSelect(c.dialCode)}
                >
                  <span className="font-bold text-gray-700 w-12 shrink-0">+{c.dialCode}</span>
                  <span className="text-gray-600 truncate">{c.name}</span>
                </div>
              ))}
              {filteredCountries.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">Press enter to use custom code</div>
              )}
            </div>
          )}
        </div>
        <input
          type="tel"
          value={number}
          onChange={handleNumberChange}
          onBlur={() => setTouched(true)}
          placeholder="Phone number"
          className={`flex-1 border px-3 py-2 rounded-lg outline-none focus:ring-2 ${
            isInvalid ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
          }`}
        />
      </div>
      {isInvalid && (
        <span className="text-red-500 text-xs font-medium pl-1">
          Phone number cannot be empty
        </span>
      )}
      {touched && number.length > 0 && number.length < 6 && (
        <span className="text-red-500 text-xs font-medium pl-1">
          Enter a valid phone number (min 6 digits)
        </span>
      )}
    </div>
  );
}
