import React from 'react';

const FileSelector = ({ files, selectedFiles, onSelectFile, loading }) => {
  return (
    <div className="mb-6">
      <h3 className="text-md font-medium mb-2">Select Data Files</h3>
      <div className="space-y-2">
        {files.map(file => (
          <div key={file.id} className="flex items-center">
            <input
              type="checkbox"
              id={`file-${file.id}`}
              checked={selectedFiles.includes(file.id)}
              onChange={() => onSelectFile(file.id)}
              disabled={loading}
              className="mr-2"
            />
            <label htmlFor={`file-${file.id}`} className="text-sm">
              {file.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileSelector;
