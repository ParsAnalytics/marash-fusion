import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, BrainCircuit } from 'lucide-react';
import { aiService } from '../services/aiService';
import localforage from 'localforage';

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadDocs = async () => {
      const docs = await localforage.getItem('knowledge_docs') || [];
      setDocuments(docs);
    };
    loadDocs();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    // 1. Read file to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        // 2. Pass to Gemini AI for processing
        const result = await aiService.parseDocumentWithGemini(reader.result, file.type);
        
        // 3. Save to local knowledge base
        const newDoc = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          extractedProfile: result.flavorProfile,
          dateAdded: new Date().toLocaleDateString()
        };
        
        const updatedDocs = [...documents, newDoc];
        setDocuments(updatedDocs);
        await localforage.setItem('knowledge_docs', updatedDocs);
      } catch (err) {
        console.error("AI parsing failed", err);
        alert('Failed to process document with AI.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="knowledge-base-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="zen-card" style={{ textAlign: 'center', marginBottom: '3rem', padding: '3rem' }}>
        <BrainCircuit size={48} color="var(--color-matcha-accent)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ marginBottom: '1rem' }}>Train Your AI Chef</h3>
        <p style={{ color: 'var(--color-ink-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          Upload PDFs, photos of old recipe books, or text documents about different culinary cultures. 
          Our hybrid AI (Gemini Vision) will read them and extract flavor profiles to fuel your fusion creativity.
        </p>
        
        <button 
          className="zen-button" 
          onClick={() => fileInputRef.current.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Processing with Gemini AI...' : (
            <>
              <UploadCloud size={20} />
              Upload Culinary Document
            </>
          )}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,image/*,.txt"
          onChange={handleFileUpload}
        />
      </div>

      <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-bamboo-light)', paddingBottom: '0.5rem' }}>
        Your Library
      </h3>
      
      {documents.length === 0 ? (
        <p style={{ color: 'var(--color-ink-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
          No documents uploaded yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {documents.map(doc => (
            <div key={doc.id} className="zen-card knowledge-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--color-washi-bg)', borderRadius: 'var(--radius-soft)' }}>
                  <FileText size={24} color="var(--color-bamboo)" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0' }}>{doc.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-secondary)', margin: 0 }}>Added: {doc.dateAdded}</p>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div className="tag-container" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {doc.extractedProfile.map((tag, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--color-matcha-accent)', color: 'white', borderRadius: '4px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-matcha-hover)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                  <CheckCircle size={14} /> Processed by AI
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
