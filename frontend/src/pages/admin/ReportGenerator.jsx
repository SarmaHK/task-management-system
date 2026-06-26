import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ENTITIES = {
  USERS: {
    label: 'Users',
    filters: [
      { key: 'role', label: 'Role', options: ['ADMIN', 'PROJECT_MANAGER', 'COLLABORATOR'] },
      { key: 'status', label: 'Status', options: ['ACTIVE', 'INACTIVE'] },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
      { key: 'ownedProjectsCount', label: 'Projects Owned' },
      { key: 'joinedProjectsCount', label: 'Projects Joined' },
      { key: 'createdAt', label: 'Joined Date' },
    ]
  },
  PROJECTS: {
    label: 'Projects',
    filters: [
      { key: 'status', label: 'Status', options: ['ACTIVE', 'ARCHIVED', 'COMPLETED'] },
    ],
    columns: [
      { key: 'name', label: 'Project Name' },
      { key: 'description', label: 'Description' },
      { key: 'ownerName', label: 'Owner' },
      { key: 'status', label: 'Status' },
      { key: 'membersCount', label: 'Members' },
      { key: 'tasksCount', label: 'Tasks' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
    ]
  },
  TASKS: {
    label: 'Tasks',
    filters: [
      { key: 'status', label: 'Status', options: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED'] },
      { key: 'priority', label: 'Priority', options: ['LOW', 'MEDIUM', 'HIGH'] },
    ],
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'projectName', label: 'Project' },
      { key: 'creatorName', label: 'Creator' },
      { key: 'assignees', label: 'Assignees' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'dueDate', label: 'Due Date' },
    ]
  }
};

export default function ReportGenerator() {
  const [entity, setEntity] = useState('USERS');
  const [filters, setFilters] = useState({});
  const [selectedColumns, setSelectedColumns] = useState(ENTITIES['USERS'].columns.map(c => c.key));
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset states when entity changes
  useEffect(() => {
    setFilters({});
    setSelectedColumns(ENTITIES[entity].columns.map(c => c.key));
    setData([]);
    setError('');
  }, [entity]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleColumnToggle = (key) => {
    setSelectedColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleGeneratePreview = async () => {
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        entity,
        filters: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== 'ALL'))
      };
      const res = await api.post('/reports/generate', payload);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF('landscape');
    
    // Add Report Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text(`TaskFlow System Report: ${ENTITIES[entity].label}`, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    doc.text(`Generated on: ${dateStr}`, 14, 30);
    
    // Format Filters for display
    const activeFilters = Object.entries(filters)
      .filter(([_, v]) => v !== 'ALL')
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join(', ');
    if (activeFilters) {
      doc.text(`Applied Filters: ${activeFilters}`, 14, 36);
    }

    // Build Table
    const tableColumns = ENTITIES[entity].columns.filter(c => selectedColumns.includes(c.key));
    const head = [tableColumns.map(c => c.label)];
    
    const body = data.map(row => {
      return tableColumns.map(col => {
        let val = row[col.key];
        if (val === null || val === undefined) return 'N/A';
        // Handle dates
        if (col.key.toLowerCase().includes('date') || col.key === 'createdAt') {
          return new Date(val).toLocaleDateString();
        }
        return val.toString();
      });
    });

    autoTable(doc, {
      startY: activeFilters ? 42 : 36,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 4 }
    });

    doc.save(`TaskFlow_${entity}_Report_${new Date().getTime()}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-6 animate-fadeUp">
        
        {/* Left Sidebar - Configuration */}
        <div className="w-80 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden shrink-0">
          <div className="p-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Report Builder</h2>
            <p className="text-xs text-gray-500 mt-1">Configure your dynamic report</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Entity Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Data Source</label>
              <select 
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
              >
                {Object.entries(ENTITIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Filters */}
            {ENTITIES[entity].filters.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filters</label>
                <div className="space-y-3">
                  {ENTITIES[entity].filters.map(filter => (
                    <div key={filter.key}>
                      <span className="text-xs text-gray-500 mb-1 block">{filter.label}</span>
                      <select
                        value={filters[filter.key] || 'ALL'}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
                      >
                        <option value="ALL">All {filter.label}s</option>
                        {filter.options.map(opt => (
                          <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Columns Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Include Columns</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {ENTITIES[entity].columns.map(col => (
                  <label key={col.key} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedColumns.includes(col.key)}
                        onChange={() => handleColumnToggle(col.key)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                        <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      {col.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-gray-200 bg-white">
            <button
              onClick={handleGeneratePreview}
              disabled={isLoading || selectedColumns.length === 0}
              className="w-full py-3 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Generating...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Fetch Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Area - Preview & Export */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-20 px-8 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Data Preview</h1>
              <p className="text-sm text-gray-500">{data.length} records found</p>
            </div>
            
            <button
              onClick={handleDownloadPDF}
              disabled={data.length === 0}
              className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download PDF</span>
            </button>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50 p-6">
            {error ? (
              <div className="m-auto p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 max-w-md text-center">
                {error}
              </div>
            ) : data.length === 0 ? (
              <div className="m-auto flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-1">No Data Fetched</h3>
                <p className="text-sm">Configure your report on the left and click "Fetch Data" to generate a preview.</p>
              </div>
            ) : (
              <div className="overflow-auto bg-white rounded-xl border border-gray-200 shadow-sm h-full">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 shadow-sm z-10">
                    <tr>
                      {ENTITIES[entity].columns
                        .filter(c => selectedColumns.includes(c.key))
                        .map(col => (
                          <th key={col.key} className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                            {col.label}
                          </th>
                        ))
                      }
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((row, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                        {ENTITIES[entity].columns
                          .filter(c => selectedColumns.includes(c.key))
                          .map(col => {
                            let val = row[col.key];
                            if (col.key.toLowerCase().includes('date') || col.key === 'createdAt') {
                              val = val ? new Date(val).toLocaleDateString() : 'N/A';
                            }
                            return (
                              <td key={col.key} className="p-4 text-sm text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                                {val !== null && val !== undefined ? val : 'N/A'}
                              </td>
                            );
                          })
                        }
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
