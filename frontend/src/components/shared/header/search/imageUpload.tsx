
// components/ImageUpload.tsx
"use client";

import { useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";

interface Props {
  onFileSelect?: (file: File | null) => void;
}

export default function ImageUpload({ onFileSelect }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (onFileSelect) onFileSelect(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-500"
    >
      {preview ? (
        <div className="relative inline-block group">
          <Image
            src={preview}
            alt="Preview"
            width={128}
            height={128}
            className="mx-auto max-h-32 rounded object-contain"
          />
          {/* ❌ Remove button (visible only on hover) */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <ImageIcon className="h-10 w-10" />
          <p className="text-sm">Drag & drop image here</p>
          <label className="flex items-center gap-1 text-blue-600 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span className="text-sm">Upload image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
          </label>
        </div>
      )}
    </div>
  );
}

