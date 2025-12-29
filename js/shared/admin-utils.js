/* ========================================
   SOCIETY ARTS - ADMIN UTILITIES
   SuperAdmin tools for style management
   Version: 2.1
   ======================================== */

console.log('🔄 admin-utils.js: Script loading...');
console.log('🔄 admin-utils.js: React available:', typeof React !== 'undefined');

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
    const errors = [];
    const uploadedFiles = [];
    
    try {
      // Step 1: Validate with server (lightweight - no file data)
      onProgress({ stage: 'validating', message: 'Checking style with server...', percent: 0 });
      
      const validateResponse = await fetch('/.netlify/functions/r2-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate',
          styleId,
          files: files.map(f => ({ name: f.name })),
          overwrite
        })
      });
      
      const validateResult = await validateResponse.json();
      
      if (!validateResult.canUpload) {
        const errorMsg = validateResult.existsInR2 && !overwrite 
          ? 'Style already exists in R2. Enable overwrite to replace.'
          : validateResult.validation?.errors?.join(', ') || 'Server validation failed';
        return {
          success: false,
          error: errorMsg,
          errorCode: 'VALIDATION_FAILED',
          validation: validateResult.validation,
          existsInR2: validateResult.existsInR2
        };
      }
      
      // Step 2: Upload each file INDIVIDUALLY to avoid 6MB payload limit
      onProgress({ stage: 'uploading', message: 'Uploading files...', percent: 5 });
      
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert single file to base64
        const base64 = await this.fileToBase64(file);
        const fileSizeKB = Math.round(file.size / 1024);
        
        onProgress({ 
          stage: 'uploading', 
          message: `Uploading ${file.name} (${fileSizeKB}KB)...`, 
          percent: 5 + Math.round((i / totalFiles) * 90)
        });
        
        try {
          const uploadResponse = await fetch('/.netlify/functions/r2-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'upload-single-file',
              styleId,
              fileName: file.name,
              fileData: base64
            })
          });
          
          const uploadResult = await uploadResponse.json();
          
          if (uploadResult.success) {
            uploadedFiles.push({
              name: file.name,
              url: uploadResult.url,
              size: file.size
            });
          } else {
            errors.push({
              file: file.name,
              error: uploadResult.error || 'Upload failed',
              code: uploadResult.code || 'UNKNOWN'
            });
          }
        } catch (uploadError) {
          errors.push({
            file: file.name,
            error: uploadError.message,
            code: 'NETWORK_ERROR'
          });
        }
      }
      
      onProgress({ stage: 'complete', message: 'Upload complete!', percent: 100 });
      
      // Determine overall success
      const allUploaded = uploadedFiles.length === totalFiles;
      const partialSuccess = uploadedFiles.length > 0 && errors.length > 0;
      
      return {
        success: allUploaded,
        partialSuccess,
        styleId,
        uploaded: uploadedFiles.length,
        total: totalFiles,
        files: uploadedFiles,
        errors: errors.length > 0 ? errors : undefined,
        warnings: validateResult.warnings || [],
        existsInSupabase: validateResult.existsInSupabase,
        error: errors.length > 0 
          ? `Failed to upload ${errors.length} file(s): ${errors.map(e => `${e.file} (${e.error})`).join(', ')}`
          : undefined
      };
      
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message,
        errorCode: 'UNEXPECTED_ERROR',
        uploaded: uploadedFiles.length,
        files: uploadedFiles,
        errors: errors.length > 0 ? errors : [{ file: 'overall', error: error.message }]
      };
    }
  }
};

// ========================================
// REACT COMPONENTS
// ========================================

// R2 Style Uploader Component - Uses React hooks directly
// Note: This component is only rendered when React is available (via React.createElement)
function R2StyleUploader({ onClose, userEmail }) {
  // Extract hooks from React at the top level
  const useState = React.useState;
  const useRef = React.useRef;
  const useCallback = React.useCallback;
  const useEffect = React.useEffect;
  
  const [folders, setFolders] = useState([]);
  const [validationResults, setValidationResults] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [uploadReport, setUploadReport] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Progress tracking
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentFolderIndex, setCurrentFolderIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null); // folders per second
  
  const fileInputRef = useRef(null);
  const folderListRef = useRef(null);
  const activeFolderRef = useRef(null);
  
  /**
   * Format time in H:MM (hours:minutes)
   */
  function formatTime(seconds) {
    if (!seconds || seconds === Infinity || isNaN(seconds)) return '--:--';
    seconds = Math.round(seconds);
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    // Round up if there are remaining seconds
    const adjustedMins = (seconds % 60) > 0 ? mins + 1 : mins;
    const finalMins = adjustedMins >= 60 ? 0 : adjustedMins;
    const finalHours = adjustedMins >= 60 ? hours + 1 : hours;
    return `${finalHours}:${finalMins.toString().padStart(2, '0')}`;
  }
  
  // Auto-scroll to active folder
  useEffect(() => {
    if (isUploading && activeFolderRef.current && folderListRef.current) {
      activeFolderRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [currentFolderIndex, isUploading]);
  
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
      setStartTime(Date.now());
      setCurrentFolderIndex(0);
      setOverallProgress(0);
      
      const results = [];
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < validFolders.length; i++) {
        const folder = validFolders[i];
        setCurrentFolderIndex(i);
        
        // Calculate overall progress
        const baseProgress = (i / validFolders.length) * 100;
        setOverallProgress(baseProgress);
        
        setUploadStatus(prev => ({
          ...prev,
          [folder.name]: { status: 'uploading', progress: 0, message: 'Starting...' }
        }));
        
        const folderStartTime = Date.now();
        
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
            
            // Update overall progress with sub-progress
            const subProgress = (progress.percent / 100) * (1 / validFolders.length) * 100;
            setOverallProgress(baseProgress + subProgress);
          },
          overwriteExisting
        );
        
        const folderEndTime = Date.now();
        const folderDuration = (folderEndTime - folderStartTime) / 1000;
        
        // Update time estimate based on actual upload speed
        const completedFolders = i + 1;
        const remainingFolders = validFolders.length - completedFolders;
        const elapsedTime = (folderEndTime - startTime) / 1000;
        const avgTimePerFolder = elapsedTime / completedFolders;
        const newEstimate = avgTimePerFolder * remainingFolders;
        
        setEstimatedTimeRemaining(newEstimate);
        setUploadSpeed(completedFolders / elapsedTime);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
        
        // Build detailed result with file-level errors
        const detailedResult = {
          styleId: folder.styleId,
          folderName: folder.name,
          success: result.success,
          partialSuccess: result.partialSuccess || false,
          error: result.error,
          errorCode: result.errorCode,
          warnings: result.warnings || [],
          filesUploaded: result.uploaded || 0,
          totalFiles: result.total || 10,
          fileErrors: result.errors || [],
          duration: folderDuration
        };
        
        results.push(detailedResult);
        
        // Build detailed status message
        let statusMessage = result.success ? 'Upload complete!' : result.error;
        if (result.partialSuccess) {
          statusMessage = `Partial success: ${result.uploaded}/${result.total} files uploaded`;
        }
        
        setUploadStatus(prev => ({
          ...prev,
          [folder.name]: {
            status: result.success ? 'success' : (result.partialSuccess ? 'partial' : 'error'),
            progress: 100,
            message: statusMessage,
            result: detailedResult
          }
        }));
      }
      
      const endTime = Date.now();
      const totalDuration = (endTime - startTime) / 1000;
      
      // Create upload report
      const report = {
        timestamp: new Date().toISOString(),
        totalFolders: validFolders.length,
        successCount,
        errorCount,
        totalDuration,
        results
      };
      
      setUploadReport(report);
      setOverallProgress(100);
      setIsUploading(false);
      setEstimatedTimeRemaining(0);
      
      // Show completion modal
      setShowCompletionModal(true);
    };
    
    // Send email report
    const handleSendEmail = async () => {
      if (!userEmail || !uploadReport) return;
      
      setSendingEmail(true);
      
      try {
        const response = await fetch('/.netlify/functions/r2-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send-report',
            email: userEmail,
            report: uploadReport
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setEmailSent(true);
        } else {
          console.error('Failed to send email:', result.error);
          alert('Failed to send email. Please try again.');
        }
      } catch (error) {
        console.error('Email error:', error);
        alert('Failed to send email. Please try again.');
      }
      
      setSendingEmail(false);
    };
    
    // Close completion modal and main uploader
    const handleCloseCompletion = () => {
      setShowCompletionModal(false);
      onClose();
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
    const validFolders = folders.filter(f => f.validation.valid);
    
    // Completion Modal
    if (showCompletionModal && uploadReport) {
      return React.createElement('div', { className: 'r2-uploader r2-completion-modal' },
        React.createElement('div', { className: 'r2-completion-content' },
          React.createElement('div', { className: 'r2-completion-icon' },
            uploadReport.errorCount === 0 ? '✅' : '⚠️'
          ),
          React.createElement('h2', null, 'Upload Complete!'),
          React.createElement('div', { className: 'r2-completion-stats' },
            React.createElement('div', { className: 'r2-stat' },
              React.createElement('span', { className: 'r2-stat-value' }, uploadReport.successCount),
              React.createElement('span', { className: 'r2-stat-label' }, 'Successful')
            ),
            uploadReport.errorCount > 0 && React.createElement('div', { className: 'r2-stat error' },
              React.createElement('span', { className: 'r2-stat-value' }, uploadReport.errorCount),
              React.createElement('span', { className: 'r2-stat-label' }, 'Failed')
            ),
            React.createElement('div', { className: 'r2-stat' },
              React.createElement('span', { className: 'r2-stat-value' }, formatTime(uploadReport.totalDuration)),
              React.createElement('span', { className: 'r2-stat-label' }, 'Total Time')
            )
          ),
          
          !emailSent ? React.createElement('div', { className: 'r2-email-prompt' },
            React.createElement('p', null, 'Would you like to receive an email confirmation with upload details?'),
            userEmail && React.createElement('p', { className: 'r2-email-address' }, `Email will be sent to: ${userEmail}`),
            React.createElement('div', { className: 'r2-completion-actions' },
              React.createElement('button', {
                className: 'btn btn-secondary',
                onClick: handleCloseCompletion,
                disabled: sendingEmail
              }, 'No Thanks'),
              React.createElement('button', {
                className: 'btn btn-primary',
                onClick: handleSendEmail,
                disabled: sendingEmail || !userEmail
              }, sendingEmail ? 'Sending...' : 'Yes, Send Email')
            )
          ) : React.createElement('div', { className: 'r2-email-sent' },
            React.createElement('p', { className: 'r2-success-message' }, '📧 Email confirmation sent!'),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: handleCloseCompletion
            }, 'Done')
          )
        )
      );
    }
    
    return React.createElement('div', { className: 'r2-uploader' },
      // Header
      React.createElement('div', { className: 'r2-uploader-header' },
        React.createElement('h2', null, 'Upload Styles to Society Arts™'),
        React.createElement('button', { 
          className: 'r2-close-btn',
          onClick: onClose,
          'aria-label': 'Close',
          disabled: isUploading
        }, '×')
      ),
      
      // Overall Progress (when uploading)
      isUploading && React.createElement('div', { className: 'r2-overall-progress' },
        React.createElement('div', { className: 'r2-overall-header' },
          React.createElement('span', { className: 'r2-overall-label' }, 
            `Uploading ${currentFolderIndex + 1} of ${validCount} styles`
          ),
          React.createElement('span', { className: 'r2-time-remaining' },
            estimatedTimeRemaining !== null && estimatedTimeRemaining > 0
              ? `⏱️ ${formatTime(estimatedTimeRemaining)} to complete`
              : ''
          )
        ),
        React.createElement('div', { className: 'r2-overall-bar' },
          React.createElement('div', { 
            className: 'r2-overall-fill',
            style: { width: `${overallProgress}%` }
          })
        ),
        React.createElement('div', { className: 'r2-overall-percent' }, 
          `${Math.round(overallProgress)}%`
        )
      ),
      
      // Drop Zone
      !isUploading && React.createElement('div', {
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
      folders.length > 0 && React.createElement('div', { 
        className: 'r2-folder-list',
        ref: folderListRef
      },
        React.createElement('div', { className: 'r2-list-header' },
          React.createElement('span', null, `${folders.length} folder${folders.length !== 1 ? 's' : ''} selected (${validCount} valid)`),
          !isUploading && React.createElement('button', { 
            className: 'r2-clear-btn',
            onClick: clearAll
          }, 'Clear All')
        ),
        
        folders.map((folder, index) => {
          const status = uploadStatus[folder.name];
          const validation = folder.validation;
          const isActive = isUploading && validFolders[currentFolderIndex]?.name === folder.name;
          
          return React.createElement('div', { 
            key: folder.name,
            ref: isActive ? activeFolderRef : null,
            className: `r2-folder-item ${validation.valid ? 'valid' : 'invalid'} ${status?.status || ''} ${isActive ? 'active' : ''}`
          },
            React.createElement('div', { className: 'r2-folder-info' },
              React.createElement('div', { className: 'r2-folder-name' },
                React.createElement('span', { className: 'r2-style-id' }, folder.styleId),
                !validation.valid && React.createElement('span', { className: 'r2-error-badge' }, 'Invalid'),
                isActive && React.createElement('span', { className: 'r2-active-badge' }, '● Uploading')
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
      folders.length > 0 && !isUploading && React.createElement('div', { className: 'r2-options' },
        React.createElement('label', { className: 'r2-checkbox-label' },
          React.createElement('input', {
            type: 'checkbox',
            checked: overwriteExisting,
            onChange: (e) => setOverwriteExisting(e.target.checked)
          }),
          'Overwrite existing styles in R2'
        )
      ),
      
      // Actions
      !isUploading && React.createElement('div', { className: 'r2-actions' },
        React.createElement('button', {
          className: 'btn btn-secondary',
          onClick: onClose
        }, 'Cancel'),
        React.createElement('button', {
          className: 'btn btn-primary',
          onClick: handleUpload,
          disabled: validCount === 0
        }, `Upload ${validCount} Style${validCount !== 1 ? 's' : ''}`)
      )
    );
}

// ========================================
// EXPORTS
// ========================================
try {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.AdminUtils = {
    R2Upload,
    R2StyleUploader
  };
  console.log('✅ admin-utils.js: Exports registered successfully');
} catch (e) {
  console.error('❌ admin-utils.js: Failed to register exports:', e);
}

// Export R2Upload for vanilla JS (always available)
if (typeof window !== 'undefined') {
  window.R2Upload = R2Upload;
}
