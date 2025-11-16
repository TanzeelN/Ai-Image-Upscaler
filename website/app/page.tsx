"use client";

import React, { useState } from "react";

export default function ImageUploader() {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-48 h-48 object-cover rounded-lg shadow"
        />
      )}
    </div>
  );
}
