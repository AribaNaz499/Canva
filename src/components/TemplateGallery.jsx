import React, { useEffect, useState } from 'react';
// import { supabase } from './supabaseClient'; 
import { Layout, Trash2, FolderOpen, Loader2, FileText, Download } from 'lucide-react'; 
import { jsPDF } from "jspdf";

const TemplateGallery = ({ onEdit }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };


  const exportDesignToPDF = (design, e) => {
    e.stopPropagation(); 
    
    if (!design.preview) {
      alert("No preview available for this design.");
      return;
    }

    const pdf = new jsPDF({
      orientation: 'portrait', 
      unit: 'px',
      format: [450, 600]
    });

  
    pdf.addImage(design.preview, 'PNG', 0, 0, 450, 600);
    pdf.save(`${design.name || 'design'}.pdf`);
  };

  const deleteDesign = async (id, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this design?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      alert("Error deleting design: " + err.message);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 p-4 md:p-12 overflow-y-auto h-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 md:mb-12">
          <FolderOpen className="text-blue-600 w-8 h-8 md:w-10 md:h-10" />
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            My Saved Designs
          </h2>
        </div>
        
        {templates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed mx-2">
            <p className="text-slate-400 font-medium">No designs saved yet. Start creating!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-2">
            {templates.map((design) => (
              <div 
                key={design.id} 
                onClick={() => onEdit(design)} 
                className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border cursor-pointer"
              >
                <div className="h-40 md:h-52 bg-slate-100 flex items-center justify-center overflow-hidden border-b relative">
                  {design.preview ? (
                    <img 
                      src={design.preview} 
                      alt={design.name} 
                      className="w-full h-full object-contain p-2 md:p-4 group-hover:scale-105 transition-transform" 
                    />
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center">
                      <Layout size={32} />
                      <span className="text-[10px] mt-2 font-bold uppercase">No Preview</span>
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-5 flex items-center justify-between">
                  <div className="flex flex-col truncate pr-2">
                    <span className="font-bold text-slate-700 truncate text-base md:text-lg">
                      {design.name || "Untitled"}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-400">
                      {new Date(design.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                
                  <div className="flex items-center gap-1">
              
                    <button 
                      onClick={(e) => exportDesignToPDF(design, e)} 
                      className="p-2 hover:bg-emerald-50 rounded-full transition-colors group/btn"
                      title="Export to PDF"
                    >
                      <FileText size={18} className="text-slate-400 group-hover/btn:text-emerald-600" />
                    </button>

                  
                    <button 
                      onClick={(e) => deleteDesign(design.id, e)} 
                      className="p-2 hover:bg-red-50 rounded-full transition-colors group/trash"
                      title="Delete Design"
                    >
                      <Trash2 size={18} className="text-slate-300 group-hover/trash:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateGallery;