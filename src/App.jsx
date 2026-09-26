import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ShieldCheck, 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Trash2, 
  Menu,
  X,
  TrendingUp,
  Filter,
  Calendar,
  Activity,
  FileText,
  FileSpreadsheet,
  Download,
  Upload,
  Settings,
  LogOut,
  Users,
  Lock,
  UserPlus,
  Key,
  Check
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Data User untuk demo Login
const initialUsers = [
  { id: 1, username: 'admin', password: '123', role: 'admin', name: 'Administrator Utama' },
  { id: 2, username: 'tukin', password: '123', role: 'user_tukin', name: 'Bendahara Tukin' },
  { id: 3, username: 'keamanan', password: '123', role: 'user_keamanan', name: 'Bendahara Keamanan' },
];

const initialTransactions = []; // Dikosongkan agar database bersih dari awal

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const applyDateFilter = (data, filterType, filterMonth, dateRange, dateKey = 'date') => {
  if (filterType === 'all') return data;
  return data.filter(item => {
    const itemDate = new Date(item[dateKey]);
    if (filterType === 'month') {
      if (!filterMonth) return true;
      const itemMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
      return itemMonth === filterMonth;
    }
    if (filterType === 'range') {
      const start = dateRange.start ? new Date(dateRange.start) : new Date('2000-01-01');
      const end = dateRange.end ? new Date(dateRange.end) : new Date('2100-01-01');
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    }
    return true;
  });
};

const DateFilter = ({ filterType, setFilterType, filterMonth, setFilterMonth, dateRange, setDateRange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 animate-in fade-in print:hidden">
      <div className="flex items-center gap-2 text-gray-600 font-medium min-w-max">
        <Filter className="w-5 h-5 text-emerald-600" /> 
        <span>Filter Waktu:</span>
      </div>
      <select 
        value={filterType} 
        onChange={(e) => setFilterType(e.target.value)}
        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm bg-gray-50"
      >
        <option value="all">Semua Waktu</option>
        <option value="month">Pilih Bulan</option>
        <option value="range">Rentang Waktu</option>
      </select>

      {filterType === 'month' && (
        <input 
          type="month" 
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-gray-50 flex-1 sm:flex-none"
        />
      )}

      {filterType === 'range' && (
        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <input 
            type="date" 
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm w-full bg-gray-50"
          />
          <span className="text-gray-500">-</span>
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm w-full bg-gray-50"
          />
        </div>
      )}
    </div>
  );
};

const TransactionForm = ({ onAddTransaction, onBulkAddTransactions, category }) => {
  const [type, setType] = useState('in');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [satuan, setSatuan] = useState('');
  const [qty, setQty] = useState(1);
  const [hargaSatuan, setHargaSatuan] = useState('');
  const [amount, setAmount] = useState(''); 
  const [importMsg, setImportMsg] = useState({ text: '', type: '' });

  const handleQtyChange = (e) => {
    const val = e.target.value;
    setQty(val);
    const calc = (parseFloat(val) || 0) * (parseFloat(hargaSatuan) || 0);
    setAmount(calc || '');
  };

  const handleHargaChange = (e) => {
    const val = e.target.value;
    setHargaSatuan(val);
    const calc = (parseFloat(qty) || 0) * (parseFloat(val) || 0);
    setAmount(calc || '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAmount = parseFloat(amount) || 0;
    if (!finalAmount || !description || !date) return;
    
    onAddTransaction({
      date,
      type,
      category,
      satuan: satuan || '-',
      qty: parseFloat(qty) || 1,
      hargaSatuan: parseFloat(hargaSatuan) || 0,
      amount: finalAmount, 
      description
    });
    
    setSatuan('');
    setQty(1);
    setHargaSatuan('');
    setAmount('');
    setDescription('');
  };

  const downloadTemplate = () => {
    const headers = "Tanggal;Jenis (in/out);Keterangan;Satuan;Qty;HargaSatuan;Saldo\n";
    const example1 = "2026-09-25;in;Pemasukan Contoh Tukin;Bulan;1;500000;500000\n";
    const example2 = "2026-09-26;out;Pengeluaran Contoh Tukin;Pcs;2;50000;400000\n";
    const note = ";;;;;;PENTING: Jenis harus diisi 'in' (Pemasukan) atau 'out' (Pengeluaran). Format Tanggal YYYY-MM-DD.\n";
    
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, headers + example1 + example2 + note], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "Template_Import_Transaksi.csv";
    link.click();
  };

 const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const delimiter = text.includes(';') ? ';' : ',';
        const lines = text.split('\n').map(line => line.replace('\r', '').trim()).filter(line => line !== '');
        
        if (lines.length < 2) {
          alert("File CSV kosong atau format tidak sesuai.");
          return;
        }

        const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
        const importedTransactions = [];

        const dateIdx = headers.findIndex(h => h.includes('tanggal'));
        const typeIdx = headers.findIndex(h => h.includes('jenis'));
        const descIdx = headers.findIndex(h => h.includes('keterangan'));
        const amountIdx = headers.findIndex(h => h.includes('harga') || h.includes('nominal') || h.includes('saldo'));
        
        // Coba cari kolom opsional
        const satIdx = headers.findIndex(h => h.includes('satuan'));
        const qtyIdx = headers.findIndex(h => h.includes('qty'));

        if (dateIdx === -1 || typeIdx === -1 || descIdx === -1 || amountIdx === -1) {
          alert("Gagal membaca template! Kolom yang terdeteksi: " + headers.join(', '));
          return;
        }

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(delimiter).map(v => v.trim());
          
          let rawAmount = (values[amountIdx] || '').replace(/[^0-9]/g, '');
          let amount = parseInt(rawAmount, 10);
          
          let typeStr = (values[typeIdx] || '').replace(/['"]/g, '').toLowerCase();
          let type = typeStr.includes('in') ? 'in' : 'out'; 
          
          let description = (values[descIdx] || '').replace(/['"]/g, '');
          let dateStr = values[dateIdx] || '';
          
          let satuan = satIdx !== -1 ? (values[satIdx] || '-') : '-';
          let qty = qtyIdx !== -1 ? (parseInt(values[qtyIdx]) || 1) : 1;

          if (!isNaN(amount) && amount > 0) {
            importedTransactions.push({
              id: Date.now() + i, 
              date: dateStr,
              type: type,
              category: category, // PERBAIKAN BUG: Pastikan kategori terisi agar tidak nyasar ke Dashboard saja
              description: description,
              satuan: satuan,
              qty: qty,
              hargaSatuan: amount / qty, // Estimasi harga satuan
              amount: amount
            });
          }
        }

        if (importedTransactions.length > 0) {
          onBulkAddTransactions(importedTransactions);
          alert(`Berhasil mengimpor ${importedTransactions.length} data transaksi ke kas ${category}!`);
        } else {
          alert("Tidak ada data transaksi yang valid. Cek isi baris file CSV Anda.");
        }
      } catch (error) {
        alert("Terjadi kesalahan sistem saat membaca file: " + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 animate-in fade-in">
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-emerald-600" />
          Tambah Transaksi {category === 'tukin' ? 'Tukin' : 'Keamanan'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm">
              <option value="in">Pemasukan (+)</option>
              <option value="out">Pengeluaran (-)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Contoh: Beli Token Listrik" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Satuan (Opsional)</label>
            <input type="text" value={satuan} onChange={(e) => setSatuan(e.target.value)} placeholder="Misal: Pcs, Kg, Bulan" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
            <input type="number" value={qty} onChange={handleQtyChange} min="0.01" step="0.01" required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga / Satuan (Rp)</label>
            <input type="number" value={hargaSatuan} onChange={handleHargaChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Total (Rp) - <span className="text-gray-400 font-normal">Bisa diedit manual jika ada diskon</span></label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700 bg-emerald-50" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm"
          >
            Simpan Transaksi
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
          <Upload className="w-4 h-4 mr-2 text-blue-600" />
          Import Massal via CSV
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
          >
            <Download className="w-4 h-4" />
            Unduh Template CSV
          </button>
          
          <div className="relative">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCSV}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Pilih file CSV"
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium border border-gray-200">
              <Upload className="w-4 h-4" />
              Unggah File CSV
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionList = ({ transactions, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
              <th className="p-4 font-semibold">Tanggal</th>
              <th className="p-4 font-semibold">Keterangan</th>
              <th className="p-4 font-semibold">Satuan</th>
              <th className="p-4 font-semibold text-center">Qty</th>
              <th className="p-4 font-semibold text-right">Harga/Sat</th>
              <th className="p-4 font-semibold text-right">Pemasukan</th>
              <th className="p-4 font-semibold text-right">Pengeluaran</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-400">Belum ada data transaksi.</td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="p-4 text-sm font-medium text-gray-800">{t.description}</td>
                  <td className="p-4 text-sm text-gray-600">{t.satuan || '-'}</td>
                  <td className="p-4 text-sm text-gray-600 text-center">{t.qty || '-'}</td>
                  <td className="p-4 text-sm text-right text-gray-600 whitespace-nowrap">{t.hargaSatuan ? formatRupiah(t.hargaSatuan) : '-'}</td>
                  <td className="p-4 text-sm text-right text-emerald-600 font-semibold whitespace-nowrap">
                    {t.type === 'in' ? formatRupiah(t.amount) : '-'}
                  </td>
                  <td className="p-4 text-sm text-right text-red-500 font-semibold whitespace-nowrap">
                    {t.type === 'out' ? formatRupiah(t.amount) : '-'}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-red-50"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RekapList = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none">
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-50 border-b border-emerald-100 text-emerald-800 text-sm print:bg-transparent print:border-gray-800">
              <th className="p-4 font-semibold">Tanggal</th>
              <th className="p-4 font-semibold">Keterangan</th>
              <th className="p-4 font-semibold">Satuan</th>
              <th className="p-4 font-semibold text-center">Qty</th>
              <th className="p-4 font-semibold text-right">Harga/Sat</th>
              <th className="p-4 font-semibold text-right">Pemasukan</th>
              <th className="p-4 font-semibold text-right">Pengeluaran</th>
              <th className="p-4 font-semibold text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-400">Belum ada data rekap.</td>
              </tr>
            ) : (
              data.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="p-4 text-sm font-medium text-gray-800">{t.description}</td>
                  <td className="p-4 text-sm text-gray-600">{t.satuan || '-'}</td>
                  <td className="p-4 text-sm text-gray-600 text-center">{t.qty || '-'}</td>
                  <td className="p-4 text-sm text-right text-gray-600 whitespace-nowrap">{t.hargaSatuan ? formatRupiah(t.hargaSatuan) : '-'}</td>
                  <td className="p-4 text-sm text-right text-emerald-600 font-semibold whitespace-nowrap">
                    {t.type === 'in' ? formatRupiah(t.amount) : '-'}
                  </td>
                  <td className="p-4 text-sm text-right text-red-500 font-semibold whitespace-nowrap">
                    {t.type === 'out' ? formatRupiah(t.amount) : '-'}
                  </td>
                  <td className="p-4 text-sm text-right text-blue-700 font-bold bg-blue-50/30 whitespace-nowrap">
                    {formatRupiah(t.saldo)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CategoryView = ({ category, title, transactions, onAddTransaction, onBulkAddTransactions, onDeleteTransaction, onDeleteAllTransactions }) => {
  const [activeSubTab, setActiveSubTab] = useState('input');
  
  const [filterType, setFilterType] = useState('all');
  const [filterMonth, setFilterMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [kopImage, setKopImage] = useState(null);

  const handleKopUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setKopImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const rekapData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let currentSaldo = 0;
    return sorted.map(t => {
      if (t.type === 'in') currentSaldo += t.amount;
      if (t.type === 'out') currentSaldo -= t.amount;
      return { ...t, saldo: currentSaldo };
    });
  }, [transactions]);

  const filteredRekapData = useMemo(() => {
    return applyDateFilter(rekapData, filterType, filterMonth, dateRange);
  }, [rekapData, filterType, filterMonth, dateRange]);

  const filteredHistoryData = useMemo(() => {
    const reversed = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date));
    return applyDateFilter(reversed, filterType, filterMonth, dateRange);
  }, [transactions, filterType, filterMonth, dateRange]);

  const exportToExcel = () => {
    const headers = ['Tanggal', 'Keterangan', 'Satuan', 'Qty', 'Harga/Satuan (Rp)', 'Pemasukan (Rp)', 'Pengeluaran (Rp)', 'Saldo (Rp)'];
    const csvRows = filteredRekapData.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.satuan || '-'}"`,
      t.qty || '-',
      t.hargaSatuan || 0,
      t.type === 'in' ? t.amount : 0,
      t.type === 'out' ? t.amount : 0,
      t.saldo
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_${title}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    try {
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      if (!window.jspdf.jsPDF.API.autoTable) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      
      let startYPos = 45;

      if (kopImage) {
        doc.addImage(kopImage, 'PNG', 14, 10, pageWidth - 28, 45);
        startYPos = 65; 
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42); 
        doc.text("PONDOK TAHFIDH YANBU'UL QURA'AN 1 PATI", pageWidth / 2, 16, { align: 'center' });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); 
        doc.text("Jl. Raya Margorejo - Pati Km. 5, Kabupaten Pati, Jawa Tengah 59163", pageWidth / 2, 22, { align: 'center' });
        doc.text("Telepon: (0295) 1234567 | Email: info@binainsani-pati.sch.id", pageWidth / 2, 27, { align: 'center' });
        
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.8);
        doc.line(14, 32, pageWidth - 14, 32); 
        doc.setLineWidth(0.2);
        doc.line(14, 33.5, pageWidth - 14, 33.5); 
        
        startYPos = 45;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(`LAPORAN KEUANGAN - ${title.toUpperCase()}`, pageWidth / 2, startYPos, { align: 'center' });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Periode Cetak: ${formatDate(new Date().toISOString())}`, pageWidth / 2, startYPos + 6, { align: 'center' });

      const tableColumn = ["No.", "Tanggal", "Keterangan", "Satuan", "Qty", "Harga/Sat", "Pemasukan", "Pengeluaran", "Saldo"];
      const tableRows = [];

      filteredRekapData.forEach((t, index) => {
        const rowData = [
          index + 1,
          formatDate(t.date),
          t.description,
          t.satuan || '-',
          t.qty || '-',
          t.hargaSatuan ? formatRupiah(t.hargaSatuan) : '-',
          t.type === 'in' ? formatRupiah(t.amount) : '-',
          t.type === 'out' ? formatRupiah(t.amount) : '-',
          formatRupiah(t.saldo)
        ];
        tableRows.push(rowData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: startYPos + 12,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [5, 150, 105], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          8: { fontStyle: 'bold' } 
        }
      });

      doc.save(`Rekap_${title}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Gagal memuat library PDF", error);
    }
  };

  return (
    <div className="space-y-6 print:space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      
      <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-200 pb-4 print:hidden">
        <button 
          onClick={() => setActiveSubTab('input')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm md:text-base flex-1 md:flex-none text-center ${activeSubTab === 'input' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          Input Transaksi
        </button>
        <button 
          onClick={() => setActiveSubTab('rekap')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm md:text-base flex-1 md:flex-none text-center ${activeSubTab === 'rekap' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          Rekap Transaksi
        </button>
        <button 
          onClick={() => setActiveSubTab('riwayat')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm md:text-base flex-1 md:flex-none text-center ${activeSubTab === 'riwayat' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          Riwayat Transaksi
        </button>
      </div>

      {(activeSubTab === 'rekap' || activeSubTab === 'riwayat') && (
        <DateFilter 
          filterType={filterType} setFilterType={setFilterType}
          filterMonth={filterMonth} setFilterMonth={setFilterMonth}
          dateRange={dateRange} setDateRange={setDateRange}
        />
      )}

      <div className="animate-in fade-in duration-300">
        {activeSubTab === 'input' && (
          <TransactionForm 
            onAddTransaction={onAddTransaction} 
            onBulkAddTransactions={onBulkAddTransactions}
            category={category} 
          />
        )}
        {activeSubTab === 'rekap' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-end gap-3 mb-2 print:hidden">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${kopImage ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                <span>{kopImage ? '✅ Gambar Kop Terpasang' : '🖼️ Pilih File Kop (Opsional)'}</span>
                <input type="file" accept="image/*" onChange={handleKopUpload} className="hidden" />
              </label>
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
              <button 
                onClick={exportToPDF}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
            </div>
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100 print:bg-transparent print:border-none print:p-0">
              <span className="text-blue-800 font-medium print:text-black">Total Saldo {category === 'tukin' ? 'Tukin' : 'Keamanan'} (Akhir Periode):</span>
              <span className="text-xl font-bold text-blue-700 print:text-black">
                {formatRupiah(filteredRekapData.length > 0 ? filteredRekapData[filteredRekapData.length - 1].saldo : 0)}
              </span>
            </div>
            <RekapList data={filteredRekapData} />
          </div>
        )}
        {activeSubTab === 'riwayat' && (
          <div className="space-y-4">
            <div className="flex justify-end mb-2 print:hidden">
              <button 
                onClick={onDeleteAllTransactions}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Semua Riwayat
              </button>
            </div>
            <TransactionList 
              transactions={filteredHistoryData} 
              onDelete={onDeleteTransaction}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ transactions, role, onDeleteTransaction, onDeleteAllTransactions }) => {
  const [filterType, setFilterType] = useState('all');
  const [filterMonth, setFilterMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showHistory, setShowHistory] = useState(false);

  const filteredTransactions = useMemo(() => {
    return applyDateFilter(transactions, filterType, filterMonth, dateRange);
  }, [transactions, filterType, filterMonth, dateRange]);

  const stats = useMemo(() => {
    let absoluteTotalIn = 0, absoluteTotalOut = 0;
    let absoluteTukinIn = 0, absoluteTukinOut = 0;
    let absoluteKeamananIn = 0, absoluteKeamananOut = 0;

    transactions.forEach(t => {
      if (t.type === 'in') {
        absoluteTotalIn += t.amount;
        if (t.category === 'tukin') absoluteTukinIn += t.amount;
        if (t.category === 'keamanan') absoluteKeamananIn += t.amount;
      } else {
        absoluteTotalOut += t.amount;
        if (t.category === 'tukin') absoluteTukinOut += t.amount;
        if (t.category === 'keamanan') absoluteKeamananOut += t.amount;
      }
    });

    let periodIn = 0, periodOut = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'in') periodIn += t.amount;
      else periodOut += t.amount;
    });

    return {
      totalSaldo: absoluteTotalIn - absoluteTotalOut,
      tukinSaldo: absoluteTukinIn - absoluteTukinOut,
      keamananSaldo: absoluteKeamananIn - absoluteKeamananOut,
      periodIn,
      periodOut
    };
  }, [transactions, filteredTransactions]);

  const chartData = useMemo(() => {
    const grouped = {};
    filteredTransactions.forEach(t => {
      const dateStr = t.date;
      if (!grouped[dateStr]) grouped[dateStr] = { date: dateStr, label: formatDate(dateStr), Pemasukan: 0, Pengeluaran: 0 };
      if (t.type === 'in') grouped[dateStr].Pemasukan += t.amount;
      if (t.type === 'out') grouped[dateStr].Pengeluaran += t.amount;
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredTransactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {formatRupiah(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <DateFilter 
        filterType={filterType} setFilterType={setFilterType}
        filterMonth={filterMonth} setFilterMonth={setFilterMonth}
        dateRange={dateRange} setDateRange={setDateRange}
      />

      <div className={`grid grid-cols-1 md:grid-cols-${role === 'admin' ? '3' : '1'} gap-6`}>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="flex-1">
            <h3 className="text-emerald-100 font-medium mb-1 relative z-10">
              {role === 'admin' ? 'Total Saldo Pondok Saat Ini' : `Total Saldo Kas ${role === 'user_tukin' ? 'Tukin' : 'Keamanan'}`}
            </h3>
            <div className="text-3xl font-bold mb-4 relative z-10">
              {formatRupiah(
                role === 'admin' ? stats.totalSaldo : 
                role === 'user_tukin' ? stats.tukinSaldo : stats.keamananSaldo
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-emerald-500/50">
            <h4 className="text-xs text-emerald-200 mb-2 uppercase tracking-wider font-semibold">Arus Kas Periode Terpilih</h4>
            <div className="flex justify-between items-center text-sm relative z-10">
              <div className="flex items-center">
                <ArrowUpCircle className="w-4 h-4 mr-1 text-emerald-300" />
                <span>{formatRupiah(stats.periodIn)}</span>
              </div>
              <div className="flex items-center">
                <ArrowDownCircle className="w-4 h-4 mr-1 text-red-300" />
                <span>{formatRupiah(stats.periodOut)}</span>
              </div>
            </div>
          </div>
        </div>

        {role === 'admin' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-gray-500 font-medium mb-1">Saldo Kas Tukin</h3>
              <div className="text-2xl font-bold text-gray-800">{formatRupiah(stats.tukinSaldo)}</div>
            </div>
          </div>
        )}

        {role === 'admin' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-gray-500 font-medium mb-1">Saldo Kas Keamanan</h3>
              <div className="text-2xl font-bold text-gray-800">{formatRupiah(stats.keamananSaldo)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-600"/>
            Grafik Arus Kas
          </h3>
          {chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis 
                    tickFormatter={(val) => new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(val)} 
                    tick={{ fontSize: 12 }} 
                    tickLine={false} 
                    axisLine={false} 
                    width={70} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                  <Bar dataKey="Pemasukan" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Tidak ada data transaksi untuk rentang waktu ini
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col animate-in fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-emerald-600"/>
            Total Transaksi
          </h3>
          
          <div 
            onClick={() => setShowHistory(!showHistory)}
            className="flex-1 bg-emerald-50/50 rounded-xl border-2 border-dashed border-emerald-200 p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-300 group"
          >
            <div className="text-6xl font-bold text-emerald-600 group-hover:scale-110 transition-transform mb-2">
              {filteredTransactions.length}
            </div>
            <div className="text-gray-600 font-medium text-center">Item Transaksi</div>
            <div className="text-sm bg-white px-4 py-1.5 rounded-full shadow-sm text-emerald-600 mt-6 font-medium group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              {showHistory ? 'Tutup Riwayat' : 'Lihat Detail Riwayat'}
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-6 animate-in slide-in-from-top-4 mt-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pl-4 gap-4 md:gap-0">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-emerald-600"/>
                Detail Riwayat Transaksi (Periode Terpilih)
              </h3>
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button 
                  onClick={onDeleteAllTransactions}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4"/> Hapus Semua Transaksi
                </button>
                <button 
                  onClick={() => setShowHistory(false)} 
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="pl-4">
              <TransactionList 
                transactions={filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))} 
                onDelete={onDeleteTransaction} 
              />
            </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('bendahara_users');
    return savedUsers ? JSON.parse(savedUsers) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedSession = localStorage.getItem('bendahara_session');
    if (savedSession) {
      try {
        const sessionUser = JSON.parse(savedSession);
        const validUser = users.find(u => u.id === sessionUser.id);
        if (validUser && validUser.role !== 'admin') {
          return validUser;
        }
      } catch (error) {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [transactions, setTransactions] = useState(() => {
    const savedTxs = localStorage.getItem('bendahara_transactions');
    return savedTxs ? JSON.parse(savedTxs) : initialTransactions;
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('bendahara_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('bendahara_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      setLoginUsername('');
      setLoginPassword('');
      setActiveTab('dashboard'); 
      
      if (user.role !== 'admin') {
        localStorage.setItem('bendahara_session', JSON.stringify(user));
      }
    } else {
      setLoginError('Username atau password salah.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bendahara_session');
  };

  const handleAddTransaction = (newTx) => {
    setTransactions(prev => [
      { ...newTx, id: Date.now() },
      ...prev
    ]);
  };

  const handleBulkAddTransactions = (newTxs) => {
    setTransactions(prev => [...newTxs, ...prev]);
  };

  const handleDeleteTransaction = (id) => {
    const konfirmasi = window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?");
    if (konfirmasi) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // FITUR BARU: Hapus Semua Database Sekaligus
  const handleDeleteAllTransactions = () => {
    const konfirmasi = window.confirm("AWAS! Anda yakin ingin menghapus SEMUA database transaksi secara permanen? (Data tidak bisa dikembalikan)");
    if (konfirmasi) {
      setTransactions([]); // Kosongkan state
      localStorage.removeItem('bendahara_transactions'); // Hapus dari memori lokal
      alert("Seluruh data transaksi berhasil dikosongkan!");
    }
  };

  const getDashboardTransactions = () => {
    if (currentUser?.role === 'admin') return transactions;
    if (currentUser?.role === 'user_tukin') return transactions.filter(t => t.category === 'tukin');
    if (currentUser?.role === 'user_keamanan') return transactions.filter(t => t.category === 'keamanan');
    return [];
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={getDashboardTransactions()} 
            role={currentUser?.role} 
            onDeleteTransaction={handleDeleteTransaction}
            onDeleteAllTransactions={handleDeleteAllTransactions}
          />
        );
      case 'tukin':
        return (
          <CategoryView
            category="tukin"
            title="Manajemen Kas Tukin"
            transactions={transactions.filter(t => t.category === 'tukin')}
            onAddTransaction={handleAddTransaction}
            onBulkAddTransactions={handleBulkAddTransactions}
            onDeleteTransaction={handleDeleteTransaction}
            onDeleteAllTransactions={handleDeleteAllTransactions}
          />
        );
      case 'keamanan':
        return (
          <CategoryView
            category="keamanan"
            title="Manajemen Kas Keamanan"
            transactions={transactions.filter(t => t.category === 'keamanan')}
            onAddTransaction={handleAddTransaction}
            onBulkAddTransactions={handleBulkAddTransactions}
            onDeleteTransaction={handleDeleteTransaction}
            onDeleteAllTransactions={handleDeleteAllTransactions}
          />
        );
      case 'pengaturan':
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold mb-4">Menu Pengaturan Sedang Disembunyikan untuk Sinkronisasi</h2>
             <p className="text-gray-500">Silakan gunakan menu Dashboard atau Kas Tukin/Keamanan untuk menghapus seluruh database.</p>
          </div>
        );
      default:
        return <Dashboard transactions={getDashboardTransactions()} role={currentUser?.role} onDeleteTransaction={handleDeleteTransaction} onDeleteAllTransactions={handleDeleteAllTransactions} />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">SIM Bendahara</h1>
            <p className="text-gray-500 text-sm mt-2">Pondok Pesantren Yanbu'ul Qur'an 1 Pati</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center border border-red-100">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Pengguna</label>
              <select 
                value={loginUsername} 
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50" 
              >
                <option value="" disabled>-- Pilih Pengguna --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.name} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50" 
                placeholder="Masukkan password..."
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg font-bold transition-colors shadow-sm"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'user_tukin', 'user_keamanan'] },
    { id: 'tukin', label: 'Kas Tukin', icon: Wallet, roles: ['admin', 'user_tukin'] },
    { id: 'keamanan', label: 'Kas Keamanan', icon: ShieldCheck, roles: ['admin', 'user_keamanan'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans print:bg-white">
      <div className="md:hidden bg-emerald-800 text-white p-4 flex justify-between items-center shadow-md z-20 print:hidden">
        <h1 className="font-bold text-lg truncate">SIM Bendahara</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        fixed md:static inset-y-0 left-0 w-64 bg-emerald-900 text-emerald-50 transition-transform duration-300 ease-in-out z-10 flex flex-col
        print:hidden
      `}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold text-white tracking-tight">SIM Bendahara</h1>
          <p className="text-emerald-300 text-sm mt-1 truncate">Hai, {currentUser.name}</p>
        </div>
        
        <div className="p-4 md:hidden border-b border-emerald-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white uppercase">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-sm text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-emerald-300">
                {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'user_tukin' ? 'Bendahara Tukin' : 'Bendahara Keamanan'}
              </p>
            </div>
        </div>

        <nav className="mt-4 md:mt-0 px-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-800 text-white font-medium shadow-sm' 
                    : 'hover:bg-emerald-800/50 text-emerald-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-emerald-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-emerald-800/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-emerald-200 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 print:bg-white print:overflow-visible flex flex-col">
        <header className="bg-white border-b border-gray-100 px-8 py-4 hidden md:flex justify-between items-center print:hidden">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {activeTab === 'tukin' ? 'Kas Tukin' : 
             activeTab === 'keamanan' ? 'Kas Keamanan' : 'Dashboard Utama'}
          </h2>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-700">{currentUser.name}</p>
              <p className="text-xs text-emerald-600 font-medium">
                {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'user_tukin' ? 'Bendahara Tukin' : 'Bendahara Keamanan'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold uppercase border border-emerald-200 shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
      
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
