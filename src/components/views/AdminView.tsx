import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Upload, CheckCircle2, AlertCircle as AlertIcon, Loader2, Clock } from 'lucide-react';
import { uploadAccidentCSV, fetchUploadLogs } from '../../services/api';

export const AdminView: React.FC = () => {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUploadLogs().then(setLogs);
  }, []);

  const handleFileProcess = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadResult({ success: false, message: 'Please upload a valid .csv file' });
      return;
    }

    setLoading(true);
    setUploadResult(null);

    const result = await uploadAccidentCSV(file);
    setLoading(false);

    if (result.success) {
      setUploadResult({
        success: true,
        message: result.message || `Successfully ingested records into database!`,
        count: result.recordsIngested || 10
      });
      fetchUploadLogs().then(setLogs);
    } else {
      setUploadResult({
        success: false,
        message: result.message || 'Failed to upload CSV to backend database server'
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Administrative CSV Data Ingestion & Audit Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-1">Batch upload MoRTH iRAD CSV datasets directly into the server's SQLite database</p>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
            dragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/60'
          }`}
        >
          {loading ? (
            <div className="py-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-700">Ingesting & parsing CSV records into SQLite database...</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="text-sm font-black text-slate-800">Drag & Drop accident CSV file here</h4>
              <p className="text-xs text-slate-500 mt-1">Supports MoRTH standard schema (.csv format up to 50MB)</p>
              <button 
                type="button"
                className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800"
              >
                Browse Local File
              </button>
            </>
          )}
        </div>

        {uploadResult && (
          <div className={`p-4 border rounded-xl flex items-center justify-between text-xs ${
            uploadResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center gap-3">
              {uploadResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <div>
                <strong className="font-bold">{uploadResult.success ? 'Import Complete' : 'Import Error'}</strong>
                <p className="text-[11px] mt-0.5">{uploadResult.message}</p>
              </div>
            </div>
            {uploadResult.success && uploadResult.count !== undefined && (
              <span className="px-3 py-1 bg-emerald-600 text-white rounded font-bold font-mono">
                {uploadResult.count} Records Added
              </span>
            )}
          </div>
        )}
      </div>

      {/* Upload History Logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Recent Dataset Uploads
          </h3>
          <div className="space-y-2">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-700 font-medium">{log.details}</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
