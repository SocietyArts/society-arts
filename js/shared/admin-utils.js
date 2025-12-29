/* ========================================
   SOCIETY ARTS - ADMIN UTILITIES
   SuperAdmin tools for style management
   Version: 1.0
   ======================================== */

// ========================================
// R2 UPLOAD UTILITIES
// ========================================

const R2Upload = {
  // Style ID pattern validation
  STYLE_ID_PATTERN: /^[A-Z]{3}-\d{2}$/,
  
  /**
   * Extract Style ID from folder name
   * @param {string} folderName - The folder name
   * @returns {string|null} - The extracted Style ID or null
   */
  extractStyleId(folderName) {
    // Try to match the pattern at the start of the folder name
    const match = folderName.match(/^([A-Z]{3}-\d{2})/);
    return match ? match[1] : null;
  },
  
  /**
   * Validate files in a folder
   * @param {string} styleId - The Style ID
   * @param {FileList} files - The files from the folder
   * @returns {Object} - Validation result
   */
  validateFolder(styleId, files) {
    const errors = [];
    const validFiles = [];
    const skippedFiles = [];
    
    // Check Style ID format
    if (!this.STYLE_ID_PATTERN.test(styleId)) {
      errors.push(`Invalid Style ID format: "${styleId}". Expected: AAA-## (e.g., ABF-49)`);
      return { valid: false, errors, validFiles, skippedFiles };
    }
    
    // Expected file names
    const expectedNames = new Set();
    for (let i = 0; i < 10; i++) {
      expectedNames.add(`${styleId}-0${i}.webp`);
    }
    
    // Check each file
    const foundNames = new Set();
    
    for (const file of files) {
      const fileName = file.name;
      
      // Check if it's a WEBP file matching our pattern
      if (expectedNames.has(fileName)) {
        if (foundNames.has(fileName)) {
          errors.push(`Duplicate file: ${fileName}`);
        } else {
          foundNames.add(fileName);
          validFiles.push(file);
        }
      } else if (fileName.endsWith('.webp')) {
        // It's a WEBP but doesn't match expected naming
        skippedFiles.push({ name: fileName, reason: 'Name does not match expected pattern' });
      } else {
        // Not a WEBP file - skip silently
        skippedFiles.push({ name: fileName, reason: 'Not a WEBP file' });
      }
    }
    
    // Check for missing files
    const missingFiles = [];
    for (const expected of expectedNames) {
      if (!foundNames.has(expected)) {
        missingFiles.push(expected);
      }
    }
    
    if (missingFiles.length > 0) {
      errors.push(`Missing files: ${missingFiles.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0 && validFiles.length === 10,
      errors,
      validFiles,
      skippedFiles,
      foundCount: validFiles.length,
      expectedCount: 10,
      missingFiles
    };
  },
  
  /**
   * Convert file to base64
   * @param {File} file - The file to convert
   * @returns {Promise<string>} - Base64 encoded data
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove data URL prefix to get pure base64
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  /**
   * Upload a validated style folder to R2
   * @param {string} styleId - The Style ID
   * @param {Array<File>} files - The validated files
   * @param {Function} onProgress - Progress callback
   * @param {boolean} overwrite - Whether to overwrite existing
   * @returns {Promise<Object>} - Upload result
   */
  async uploadStyle(styleId, files, onProgress = () => {}, overwrite = false) {
    try {
      // Convert files to base64
      onProgress({ stage: 'preparing', message: 'Preparing files for upload...', percent: 0 });
      
      const fileData = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await this.fileToBase64(file);
        fileData.push({
          name: file.name,
          data: base64
        });
        onProgress({ 
          stage: 'preparing', 
          message: `Prepared ${i + 1}/${files.length} files`, 
          percent: Math.round(((i + 1) / files.length) * 30) 
        });
      }
      
      // Validate on server
      onProgress({ stage: 'validating', message: 'Validating with server...', percent: 30 });
      
      const validateResponse = await fetch('/.netlify/functions/r2-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate',
          styleId,
          files: fileData.map(f => ({ name: f.name })),
          overwrite
        })
      });
      
      const validateResult = await validateResponse.json();
      
      if (!validateResult.canUpload) {
        return {
          success: false,
          error: validateResult.existsInR2 && !overwrite 
            ? 'Style already exists in R2. Enable overwrite to replace.'
            : 'Server validation failed',
          validation: validateResult.validation,
          existsInR2: validateResult.existsInR2
        };
      }
      
      // Upload files
      onProgress({ stage: 'uploading', message: 'Uploading to CloudFlare R2...', percent: 40 });
      
      const uploadResponse = await fetch('/.netlify/functions/r2-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          styleId,
          files: fileData,
          overwrite
        })
      });
      
      const uploadResult = await uploadResponse.json();
      
      onProgress({ stage: 'complete', message: 'Upload complete!', percent: 100 });
      
      return {
        success: uploadResult.success,
        styleId,
        uploaded: uploadResult.uploaded,
        results: uploadResult.results,
        errors: uploadResult.errors,
        warnings: validateResult.warnings || [],
        existsInSupabase: validateResult.existsInSupabase
      };
      
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// ========================================
// REACT COMPONENTS
// ========================================

if (typeof React !== 'undefined') {
  const { useState, useRef, useCallback } = React;

  /**
   * R2 Style Uploader Component
   * Drag-and-drop folder upload for SuperAdmin
   */
  function R2StyleUploader({ onClose }) {
    const [folders, setFolders] = useState([]);
    const [validationResults, setValidationResults] = useState({});
    const [uploadStatus, setUploadStatus] = useState({});
    const [overwriteExisting, setOverwriteExisting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);
    
    // Handle folder selection
    const handleFolderSelect = useCallback((fileList) => {
      const folderMap = new Map();
      
      // Group files by their parent folder
      for (const file of fileList) {
        // webkitRelativePath gives us "folderName/fileName"
        const pathParts = file.webkitRelativePath.split('/');
        if (pathParts.length >= 2) {
          const folderName = pathParts[0];
          
          if (!folderMap.has(folderName)) {
            folderMap.set(folderName, {
              name: folderName,
              styleId: R2Upload.extractStyleId(folderName),
              files: []
            });
          }
          
          folderMap.get(folderName).files.push(file);
        }
      }
      
      // Validate each folder
      const newFolders = [];
      const newValidations = {};
      
      for (const [folderName, folder] of folderMap) {
        const styleId = folder.styleId || folderName;
        const validation = R2Upload.validateFolder(styleId, folder.files);
        
        newFolders.push({
          ...folder,
          styleId,
          validation
        });
        
        newValidations[folderName] = validation;
      }
      
      setFolders(newFolders);
      setValidationResults(newValidations);
      setUploadStatus({});
    }, []);
    
    // Handle file input change
    const handleInputChange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFolderSelect(e.target.files);
      }
    };
    
    // Handle drag and drop
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    };
    
    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      
      // Get items from dataTransfer
      const items = e.dataTransfer.items;
      if (!items) return;
      
      const filePromises = [];
      
      for (const item of items) {
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry?.();
          if (entry && entry.isDirectory) {
            filePromises.push(readDirectoryFiles(entry));
          }
        }
      }
      
      Promise.all(filePromises).then(results => {
        const allFiles = results.flat();
        if (allFiles.length > 0) {
          handleFolderSelect(allFiles);
        }
      });
    };
    
    // Read files from a directory entry recursively
    const readDirectoryFiles = (dirEntry) => {
      return new Promise((resolve) => {
        const reader = dirEntry.createReader();
        const files = [];
        
        const readEntries = () => {
          reader.readEntries((entries) => {
            if (entries.length === 0) {
              resolve(files);
            } else {
              const entryPromises = entries.map(entry => {
                if (entry.isFile) {
                  return new Promise((res) => {
                    entry.file(file => {
                      // Manually set webkitRelativePath
                      Object.defineProperty(file, 'webkitRelativePath', {
                        value: `${dirEntry.name}/${file.name}`,
                        writable: false
                      });
                      res(file);
                    });
                  });
                }
                return Promise.resolve(null);
              });
              
              Promise.all(entryPromises).then(results => {
                files.push(...results.filter(f => f !== null));
                readEntries();
              });
            }
          });
        };
        
        readEntries();
      });
    };
    
    // Upload all valid folders
    const handleUpload = async () => {
      const validFolders = folders.filter(f => f.validation.valid);
      if (validFolders.length === 0) return;
      
      setIsUploading(true);
      
      for (const folder of validFolders) {
        setUploadStatus(prev => ({
          ...prev,
          [folder.name]: { status: 'uploading', progress: 0, message: 'Starting...' }
        }));
        
        const result = await R2Upload.uploadStyle(
          folder.styleId,
          folder.validation.validFiles,
          (progress) => {
            setUploadStatus(prev => ({
              ...prev,
              [folder.name]: { 
                status: 'uploading', 
                progress: progress.percent,
                message: progress.message
              }
            }));
          },
          overwriteExisting
        );
        
        setUploadStatus(prev => ({
          ...prev,
          [folder.name]: {
            status: result.success ? 'success' : 'error',
            progress: 100,
            message: result.success ? 'Upload complete!' : result.error,
            result
          }
        }));
      }
      
      setIsUploading(false);
    };
    
    // Remove a folder from the list
    const removeFolder = (folderName) => {
      setFolders(prev => prev.filter(f => f.name !== folderName));
      setValidationResults(prev => {
        const { [folderName]: removed, ...rest } = prev;
        return rest;
      });
      setUploadStatus(prev => {
        const { [folderName]: removed, ...rest } = prev;
        return rest;
      });
    };
    
    // Clear all
    const clearAll = () => {
      setFolders([]);
      setValidationResults({});
      setUploadStatus({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    const validCount = folders.filter(f => f.validation.valid).length;
    const hasUploaded = Object.values(uploadStatus).some(s => s.status === 'success');
    
    return React.createElement('div', { className: 'r2-uploader' },
      // Header
      React.createElement('div', { className: 'r2-uploader-header' },
        React.createElement('h2', null, 'Upload Styles to R2'),
        React.createElement('button', { 
          className: 'r2-close-btn',
          onClick: onClose,
          'aria-label': 'Close'
        }, '×')
      ),
      
      // Drop Zone
      React.createElement('div', {
        className: `r2-drop-zone ${dragOver ? 'drag-over' : ''} ${folders.length > 0 ? 'has-folders' : ''}`,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        onClick: () => fileInputRef.current?.click()
      },
        React.createElement('input', {
          ref: fileInputRef,
          type: 'file',
          webkitdirectory: 'true',
          directory: 'true',
          multiple: true,
          onChange: handleInputChange,
          style: { display: 'none' }
        }),
        React.createElement('div', { className: 'r2-drop-icon' },
          React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' },
            React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
            React.createElement('polyline', { points: '17 8 12 3 7 8' }),
            React.createElement('line', { x1: '12', y1: '3', x2: '12', y2: '15' })
          )
        ),
        React.createElement('p', { className: 'r2-drop-text' }, 
          'Drag folders here or click to select'
        ),
        React.createElement('p', { className: 'r2-drop-hint' },
          'Folders must contain 10 WEBP files named StyleID-00.webp through StyleID-09.webp'
        )
      ),
      
      // Folder List
      folders.length > 0 && React.createElement('div', { className: 'r2-folder-list' },
        React.createElement('div', { className: 'r2-list-header' },
          React.createElement('span', null, `${folders.length} folder${folders.length !== 1 ? 's' : ''} selected`),
          React.createElement('button', { 
            className: 'r2-clear-btn',
            onClick: clearAll,
            disabled: isUploading
          }, 'Clear All')
        ),
        
        folders.map(folder => {
          const status = uploadStatus[folder.name];
          const validation = folder.validation;
          
          return React.createElement('div', { 
            key: folder.name,
            className: `r2-folder-item ${validation.valid ? 'valid' : 'invalid'} ${status?.status || ''}`
          },
            React.createElement('div', { className: 'r2-folder-info' },
              React.createElement('div', { className: 'r2-folder-name' },
                React.createElement('span', { className: 'r2-style-id' }, folder.styleId),
                !validation.valid && React.createElement('span', { className: 'r2-error-badge' }, 'Invalid')
              ),
              React.createElement('div', { className: 'r2-folder-meta' },
                `${validation.foundCount}/${validation.expectedCount} files`
              )
            ),
            
            // Validation errors
            !validation.valid && React.createElement('div', { className: 'r2-validation-errors' },
              validation.errors.map((err, i) => 
                React.createElement('div', { key: i, className: 'r2-error' }, err)
              )
            ),
            
            // Upload status
            status && React.createElement('div', { className: 'r2-upload-status' },
              status.status === 'uploading' && React.createElement('div', { className: 'r2-progress-bar' },
                React.createElement('div', { 
                  className: 'r2-progress-fill',
                  style: { width: `${status.progress}%` }
                })
              ),
              React.createElement('span', { className: `r2-status-text ${status.status}` }, status.message),
              // Show warnings after successful upload
              status.status === 'success' && status.result?.warnings?.length > 0 && 
                React.createElement('div', { className: 'r2-warnings' },
                  status.result.warnings.map((warn, i) => 
                    React.createElement('div', { key: i, className: 'r2-warning' }, 
                      React.createElement('span', { className: 'r2-warning-icon' }, '⚠️'),
                      warn
                    )
                  )
                )
            ),
            
            // Remove button (if not uploading)
            !isUploading && !status?.status && React.createElement('button', {
              className: 'r2-remove-btn',
              onClick: (e) => { e.stopPropagation(); removeFolder(folder.name); },
              'aria-label': 'Remove'
            }, '×')
          );
        })
      ),
      
      // Options
      folders.length > 0 && React.createElement('div', { className: 'r2-options' },
        React.createElement('label', { className: 'r2-checkbox-label' },
          React.createElement('input', {
            type: 'checkbox',
            checked: overwriteExisting,
            onChange: (e) => setOverwriteExisting(e.target.checked),
            disabled: isUploading
          }),
          'Overwrite existing styles in R2'
        )
      ),
      
      // Actions
      React.createElement('div', { className: 'r2-actions' },
        React.createElement('button', {
          className: 'btn btn-secondary',
          onClick: onClose,
          disabled: isUploading
        }, hasUploaded ? 'Done' : 'Cancel'),
        React.createElement('button', {
          className: 'btn btn-primary',
          onClick: handleUpload,
          disabled: isUploading || validCount === 0
        }, 
          isUploading 
            ? 'Uploading...' 
            : `Upload ${validCount} Style${validCount !== 1 ? 's' : ''}`
        )
      )
    );
  }

  // ========================================
  // EXPORTS
  // ========================================
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.AdminUtils = {
    R2Upload,
    R2StyleUploader
  };
}

// Export for vanilla JS
if (typeof window !== 'undefined') {
  window.R2Upload = R2Upload;
}
