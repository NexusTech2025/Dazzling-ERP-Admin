import React, { useRef, useState } from 'react';

/**
 * FileUpload: Dropzone + Button style file uploader.
 * Supports drag and drop and file preview.
 */
const FileUpload = ({
  label,
  onFileSelect,
  accept = "*",
  multiple = false,
  error,
  helperText,
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    setSelectedFileName(multiple ? `${files.length} files selected` : files[0].name);
    if (onFileSelect) onFileSelect(multiple ? files : files[0]);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">
          {label}
        </span>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center gap-3 text-center
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border-light dark:border-border-dark hover:border-primary/50'}
          ${error ? 'border-red-500' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="w-12 h-12 rounded-full bg-background-light dark:bg-background-dark flex items-center justify-center text-text-secondary">
          <span className="material-symbols-outlined text-2xl">cloud_upload</span>
        </div>

        <div>
          <p className="text-sm font-medium text-text-main dark:text-white">
            {selectedFileName || "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {helperText || `Supported formats: ${accept}`}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-[10px] font-medium text-red-500 pl-1">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
