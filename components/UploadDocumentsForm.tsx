"use client";
import { useState, type DragEvent } from "react";

export function UploadDocumentsForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);

    for (const file of droppedFiles) {
      setUploadingFiles((prevUploadingFiles) => [...prevUploadingFiles, file]);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        try {
          const response = await fetch("/api/retrieval/ingest", {
            method: "POST",
            body: JSON.stringify({
              text,
              metadata: {
                title: file.name,
              },
            }),
          });
          if (response.status !== 200) {
            const json = await response.json();
            if (json.error) {
              console.error("Error uploading file:", json.error);
            }
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        } finally {
          setUploadingFiles((prevUploadingFiles) =>
            prevUploadingFiles.filter((f) => f !== file)
          );
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex w-full mb-4 text-slate-500">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="grow p-4 bg-slate-100 overflow-auto max-h-60"
      >
        {files.length > 0 ? (
          <ul>
            {files.map((file, index) => (
              <li key={index} className="flex items-center">
                <span>{file.name}</span>
                {uploadingFiles.includes(file) ? (
                  <div className="ml-2">
                    <svg
                      className="animate-spin h-4 w-4 text-sky-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p>Drag and drop files here</p>
        )}
      </div>
    </div>
  );
}