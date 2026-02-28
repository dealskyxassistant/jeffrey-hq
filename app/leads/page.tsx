"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

interface LeadBatch {
  id: string;
  filename: string;
  csvContent: string;
  totalLeads: number;
  approvedLeads: number;
  rejectedLeads: number;
  qaReport: string;
  date: string;
}

export default function LeadsPage() {
  const [batches, setBatches] = useState<LeadBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => { setBatches(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function downloadCSV(batch: LeadBatch) {
    const blob = new Blob([batch.csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = batch.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Lead CSV Downloads</h1>
          <span className="text-sm text-gray-500">{batches.length} Batches</span>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">Laden...</div>
        )}

        {!loading && batches.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500">Noch keine Lead-Batches vorhanden.</p>
            <p className="text-sm text-gray-400 mt-1">CSVs erscheinen hier automatisch nach dem QA-Check.</p>
          </div>
        )}

        <div className="space-y-4">
          {batches.map((batch) => (
            <div key={batch.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{batch.filename}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {new Date(batch.date).toLocaleString("de-DE")} &nbsp;·&nbsp;
                    <span className="text-green-600 font-medium">{batch.approvedLeads} approved</span>
                    {batch.rejectedLeads > 0 && (
                      <span className="text-red-500 ml-2">{batch.rejectedLeads} rejected</span>
                    )}
                    <span className="text-gray-400 ml-2">/ {batch.totalLeads} gesamt</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpanded(expanded === batch.id ? null : batch.id)}
                    className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    {expanded === batch.id ? "↑ QA Report" : "↓ QA Report"}
                  </button>
                  <button
                    onClick={() => downloadCSV(batch)}
                    className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    ⬇ CSV
                  </button>
                </div>
              </div>

              {expanded === batch.id && (
                <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-950">
                  <div className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{batch.qaReport}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
