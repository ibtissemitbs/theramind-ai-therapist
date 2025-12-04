"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TestUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addLog("=== handleFileChange appelé ===");
    
    const files = e.target.files;
    addLog(`Files object: ${files ? 'exists' : 'null'}`);
    addLog(`Files length: ${files?.length || 0}`);
    
    if (!files || files.length === 0) {
      addLog("❌ Aucun fichier sélectionné");
      return;
    }

    const file = files[0];
    addLog(`✓ Fichier trouvé: ${file.name}`);
    addLog(`  - Type: ${file.type}`);
    addLog(`  - Taille: ${(file.size / 1024).toFixed(2)} KB`);
    
    setSelectedFile(file);

    // Lire le fichier pour l'aperçu
    addLog("Lecture du fichier en base64...");
    const reader = new FileReader();
    
    reader.onloadstart = () => {
      addLog("📖 Lecture démarrée");
    };
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = ((e.loaded / e.total) * 100).toFixed(0);
        addLog(`📊 Progression: ${percent}%`);
      }
    };
    
    reader.onload = () => {
      addLog("✓ Lecture terminée avec succès");
      const result = reader.result as string;
      addLog(`  - Longueur base64: ${result.length} caractères`);
      setPreview(result);
    };
    
    reader.onerror = () => {
      addLog("❌ Erreur lors de la lecture du fichier");
      addLog(`  - Erreur: ${reader.error?.message}`);
    };
    
    reader.readAsDataURL(file);
  };

  const clearTest = () => {
    setSelectedFile(null);
    setPreview("");
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Test Upload Image</h1>
          <p className="text-muted-foreground">
            Page de diagnostic pour tester l'upload d'images
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Sélection de fichier</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Input file standard
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Input file avec accept spécifique
            </label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Input natif HTML
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
          </div>

          <Button onClick={clearTest} variant="outline">
            Réinitialiser le test
          </Button>
        </div>

        {selectedFile && (
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Fichier sélectionné</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Nom:</strong> {selectedFile.name}</p>
              <p><strong>Type:</strong> {selectedFile.type}</p>
              <p><strong>Taille:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        )}

        {preview && (
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Aperçu</h2>
            <img 
              src={preview} 
              alt="Preview" 
              className="max-w-md rounded-lg shadow-lg border"
            />
            <p className="text-sm text-muted-foreground">
              Base64 length: {preview.length} caractères
            </p>
          </div>
        )}

        <div className="bg-card border rounded-lg p-6 space-y-2">
          <h2 className="text-xl font-semibold mb-4">Logs de diagnostic</h2>
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucun log pour le moment. Sélectionnez une image pour voir les logs.
            </p>
          ) : (
            <div className="bg-muted p-4 rounded-md space-y-1 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
