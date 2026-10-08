import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import { commerceDb } from '../../services/supabase/supabaseClient';
import { useToast } from '../../context/ToastContext';

export function ProductImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedProducts, setParsedProducts] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  // Sample CSV template generator
  const handleDownloadTemplate = () => {
    const templateContent = `name,price,original_price,category,stock,brand,description,image
"Sony WH-1000XM5 Wireless Headphones",26990,34990,"Electronics",25,"Sony","Industry leading noise cancelling bluetooth headphones with 30h battery.","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
"Nike Air Max 270 React Sneakers",11995,14995,"Fashion",40,"Nike","Breathable athletic sneakers with maximum air cushioning and comfort.","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"
"Apple iPad Air 11-inch M2",59900,64900,"Electronics",15,"Apple","Powerful iPad with Apple M2 chip, Liquid Retina display, and 128GB storage.","https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80"
"Minimalist Ceramic Matte Vase",1499,2499,"Home & Kitchen",30,"CM Living","Modern Scandinavian ceramic decorative flower vase for dining or living room.","https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80"`;

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CMCart_Product_Import_Template.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded CMCart product import CSV template!', 'success');
  };

  // Process text or CSV file
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        parseCSVText(text);
      }
    };
    reader.readAsText(uploadedFile);
  };

  // Parse CSV text into array of products
  const parseCSVText = (csv) => {
    try {
      const lines = csv.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        showToast('CSV is empty or missing data rows', 'error');
        return;
      }

      const rows = lines.slice(1);
      const items = rows.map((row, idx) => {
        // Simple regex parser for comma separated with quotes
        const match = row.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g) || [];
        const cols = match.map((c) => c.replace(/^,/, '').replace(/^"/, '').replace(/"$/, '').trim());

        return {
          id: `imp-${Date.now()}-${idx}`,
          name: cols[0] || `Imported Product #${idx + 1}`,
          price: Number(cols[1]) || 999,
          current_price: Number(cols[1]) || 999,
          original_price: Number(cols[2]) || Number(cols[1]) * 1.2 || 1299,
          category: cols[3] || 'General',
          category_name: cols[3] || 'General',
          stock: Number(cols[4]) || 20,
          brand: cols[5] || 'CMCart Retail',
          description: cols[6] || 'Imported catalog merchandise with full manufacturer warranty.',
          image: cols[7] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          images: [cols[7] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
          rating: 4.6,
          rating_count: 12,
          is_active: true
        };
      });

      setParsedProducts(items);
      setIsConfirmed(false);
      showToast(`Parsed ${items.length} products! Review table below before uploading.`, 'success');
    } catch {
      showToast('Error parsing CSV file format', 'error');
    }
  };

  // Load sample data button for instant preview
  const handleLoadSample = () => {
    const sample = [
      {
        id: `sample-1`,
        name: 'Sony WH-1000XM5 Wireless Headphones',
        price: 26990,
        current_price: 26990,
        original_price: 34990,
        category: 'Electronics',
        category_name: 'Electronics',
        stock: 25,
        brand: 'Sony',
        description: 'Industry leading noise cancelling bluetooth headphones with 30h battery.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        is_active: true
      },
      {
        id: `sample-2`,
        name: 'Nike Air Max 270 React Sneakers',
        price: 11995,
        current_price: 11995,
        original_price: 14995,
        category: 'Fashion',
        category_name: 'Fashion',
        stock: 40,
        brand: 'Nike',
        description: 'Breathable athletic sneakers with maximum air cushioning and comfort.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
        is_active: true
      },
      {
        id: `sample-3`,
        name: 'Apple iPad Air 11-inch M2',
        price: 59900,
        current_price: 59900,
        original_price: 64900,
        category: 'Electronics',
        category_name: 'Electronics',
        stock: 15,
        brand: 'Apple',
        description: 'Powerful iPad with Apple M2 chip, Liquid Retina display, and 128GB storage.',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'],
        is_active: true
      },
      {
        id: `sample-4`,
        name: 'Minimalist Ceramic Matte Vase',
        price: 1499,
        current_price: 1499,
        original_price: 2499,
        category: 'Home & Living',
        category_name: 'Home & Living',
        stock: 30,
        brand: 'CM Living',
        description: 'Modern Scandinavian ceramic decorative flower vase for dining or living room.',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800',
        images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800'],
        is_active: true
      }
    ];
    setParsedProducts(sample);
    setIsConfirmed(false);
    showToast('Loaded 4 sample products ready for import preview!', 'info');
  };

  // Perform Final Save to Database
  const handleConfirmImport = async () => {
    if (parsedProducts.length === 0) return;
    setIsImporting(true);

    try {
      for (const p of parsedProducts) {
        await commerceDb.addProduct({
          name: p.name,
          price: p.price,
          current_price: p.current_price,
          original_price: p.original_price,
          category: p.category,
          category_name: p.category_name,
          stock: p.stock,
          brand: p.brand,
          description: p.description,
          image: p.image,
          images: p.images || [p.image],
          is_active: true
        });
      }

      showToast(`Successfully imported ${parsedProducts.length} products to store catalog!`, 'success');
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch {
      showToast('Failed to import products into database', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-3xl w-full my-auto overflow-hidden text-neutral-900 dark:text-neutral-100">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E63946]/10 text-[#E63946] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Bulk Product Import Studio</h2>
              <p className="text-xs text-neutral-500">
                Batch upload catalog items via CSV or JSON format
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Upload Card with Best UI */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#E63946] dark:hover:border-[#E63946] bg-neutral-50/50 dark:bg-neutral-900/40 text-center space-y-3 transition-colors relative">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="product-csv-upload-input"
            />
            <div className="w-14 h-14 rounded-2xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center mx-auto shadow-xs">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Drag and drop your product CSV file here, or{' '}
                <span className="text-[#E63946] underline">browse files</span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Supports Standard CSV with UTF-8 encoding (Max 5MB)
              </p>
            </div>

            {/* Quick Actions inside Upload Card */}
            <div className="flex items-center justify-center gap-2 pt-2 relative z-20">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-[#E63946] hover:text-[#E63946] transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV Template</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>

          {/* Step 2: Show Data Preview Table after upload */}
          {parsedProducts.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Data Preview ({parsedProducts.length} Products Verified)
                  </h3>
                </div>
                <span className="text-xs text-neutral-500">
                  Ready to be saved to catalog
                </span>
              </div>

              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/80 sticky top-0 uppercase text-[10px] font-bold text-neutral-400">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3">Stock</th>
                        <th className="py-2.5 px-3">Brand</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {parsedProducts.map((p, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-8 h-8 rounded-lg object-contain bg-neutral-100 dark:bg-neutral-800 p-0.5 border border-neutral-200 dark:border-neutral-700 shrink-0"
                              />
                              <span className="font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1 max-w-[200px]">
                                {p.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400">
                            {p.category}
                          </td>
                          <td className="py-2 px-3 font-bold text-neutral-900 dark:text-neutral-100">
                            ₹{p.price.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-2 px-3 text-neutral-500">{p.brand}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="confirm-import-checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="w-4 h-4 text-[#E63946] rounded focus:ring-[#E63946] cursor-pointer"
                />
                <label
                  htmlFor="confirm-import-checkbox"
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
                >
                  I have verified the product names, pricing, and stock counts. Confirm upload and save to store catalog.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={parsedProducts.length === 0 || !isConfirmed}
            loading={isImporting}
            onClick={handleConfirmImport}
            icon={CheckCircle2}
            className="shadow-sm font-bold"
          >
            Confirm & Save {parsedProducts.length ? `(${parsedProducts.length} Items)` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
