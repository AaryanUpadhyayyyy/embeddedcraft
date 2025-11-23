import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clear localStorage if it contains stale campaigns with timestamp IDs
// This is a one-time cleanup to fix the "Campaign not found" issue
try {
  const stored = localStorage.getItem('nudge-flow-storage');
  if (stored) {
    const data = JSON.parse(stored);
    if (data.state?.campaigns) {
      const hasTimestampIds = data.state.campaigns.some((c: any) => /^\d+$/.test(c.id));
      if (hasTimestampIds) {
        console.log('🧹 Clearing stale localStorage data with timestamp IDs...');
        localStorage.removeItem('nudge-flow-storage');
        console.log('✅ localStorage cleared. Page will fetch fresh data from backend.');
      }
    }
  }
  
  // Also clear editor store if it has a persisted campaign
  const editorStored = localStorage.getItem('editor-store');
  if (editorStored) {
    const editorData = JSON.parse(editorStored);
    if (editorData.state?.currentCampaign) {
      console.log('🧹 Clearing persisted editor campaign from localStorage...');
      localStorage.removeItem('editor-store');
      console.log('✅ Editor store cleared.');
    }
  }
} catch (e) {
  console.error('Failed to check localStorage:', e);
}

createRoot(document.getElementById("root")!).render(<App />);
