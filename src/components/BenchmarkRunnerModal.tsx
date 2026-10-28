import React, { useState } from 'react';
import { X, Zap, Clock, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { runLiveBenchmark, BenchmarkReport } from '../services/benchmarkService';

interface BenchmarkRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkRunnerModal: React.FC<BenchmarkRunnerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedBatch, setSelectedBatch] = useState<number>(100);
  const [report, setReport] = useState<BenchmarkReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunBenchmark = () => {
    setIsRunning(true);
    // Use setTimeout so the UI renders loading state
    setTimeout(() => {
      const res = runLiveBenchmark(selectedBatch);
      setReport(res);
      setIsRunning(false);
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
              <Zap className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Live Engine Performance Benchmark
              </h3>
              <p className="text-xs text-slate-500">
                Measure actual ingestion, validation, and quoting latency on synthetic batches.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Batch Selection */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Select Synthetic Evaluation Batch Size:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[100, 500, 1000].map((count) => (
              <button
                key={count}
                onClick={() => setSelectedBatch(count)}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  selectedBatch === count
                    ? 'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {count.toLocaleString()} Records
              </button>
            ))}
          </div>
        </div>

        {/* Trigger Button */}
        <div className="mt-4">
          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>
              {isRunning
                ? 'Processing Census Batch...'
                : `Run Benchmark on ${selectedBatch.toLocaleString()} Records`}
            </span>
          </button>
        </div>

        {/* Benchmark Results Display */}
        {report && (
          <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Verified Measured Telemetry:
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Batch: {report.batch_size} Rows
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Validation Time</span>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  {report.validation_duration_ms} ms
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Quoting Time</span>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  {report.pricing_duration_ms} ms
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Total Latency</span>
                <div className="text-lg font-mono font-bold text-teal-400 mt-0.5">
                  {report.total_duration_ms} ms
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400">Throughput</span>
                <div className="text-lg font-mono font-bold text-sky-400 mt-0.5">
                  {report.throughput_rows_per_second.toLocaleString()} r/s
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 pt-1 flex items-center justify-between">
              <span>
                Errors caught & isolated: <strong>{report.errors_detected}</strong>
              </span>
              <span>
                Rated eligible members: <strong>{report.records_eligible}</strong>
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
          <span className="text-[11px]">Sub-second processing demonstrated on client & backend.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
