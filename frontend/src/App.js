import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [builds, setBuilds] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("https://cicd-dashboard-1.onrender.com/builds");
      setBuilds(res.data);
    } catch (err) {
      console.error("Error fetching builds:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
    if (window.confirm("Wipe the entire build history?")) {
      try {
        await axios.delete("https://cicd-dashboard-b76h.onrender.com/clear-all");
        setBuilds([]);
      } catch (err) {
        alert("Failed to clear database.");
      }
    }
  };

  // --- NEW: Rock-Solid Command Extraction ---
  const copyToClipboard = (text) => {
    const match = text.match(/\[FIX\](.*?)\[\/FIX\]/);
    let textToCopy = "";

    if (match && match[1]) {
      textToCopy = match[1].trim();
    } else {
      // Fallback: search for backticks if tags fail
      const backtickMatch = text.match(/`([^`]+)`/);
      textToCopy = backtickMatch ? backtickMatch[1] : text;
    }

    // Clean up
    const finalCommand = textToCopy.replace(/[`]/g, '').trim();
    navigator.clipboard.writeText(finalCommand);

    // Button Visual Feedback
    const btn = document.activeElement;
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = "✅ COPIED";
      setTimeout(() => { btn.innerText = originalText; }, 2000);
    }
  };

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🚀 DEVOPS <span style={styles.blueText}>DASHBOARD</span></h1>
          <p style={styles.subtitle}>AI-Powered CI/CD Diagnostics</p>
        </div>
        <button onClick={handleClearAll} style={styles.clearBtn}>🗑️ Clear All</button>
      </header>

      <div style={styles.container}>
        {builds.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No active builds detected.</p>
          </div>
        ) : (
          builds.map((build, index) => (
            <div key={index} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={{
                  ...styles.badge,
                  color: build.status === "success" ? "#00e676" : "#ff4b4b",
                  borderColor: build.status === "success" ? "#00e676" : "#ff4b4b"
                }}>
                  ● {build.status?.toUpperCase()}
                </span>
                <span style={styles.time}>{new Date(build.createdAt).toLocaleString()}</span>
              </div>

              <div style={styles.logBox}>
                <div style={styles.logHeader}>build_terminal_output</div>
                <div style={styles.logBody}><span style={{color: '#58a6ff'}}>$</span> {build.logs}</div>
              </div>

              <div style={styles.aiWrapper}>
                <div style={styles.aiHeader}>
                  <div style={styles.aiTag}>✨ AI DIAGNOSTIC</div>
                  <button onClick={() => copyToClipboard(build.explanation)} style={styles.copyBtn}>📋 COPY FIX</button>
                </div>
                <div style={styles.aiContent}>
                  {build.explanation
                    .replace(/\[FIX\]|\[\/FIX\]/g, "") // Hides tags from the UI
                    .split('\n')
                    .map((line, i) => (
                      line.trim() && <p key={i} style={styles.aiLine}>{line}</p>
                    ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  dashboard: { backgroundColor: "#0d0f14", minHeight: "100vh", padding: "50px 20px", color: "#e6edf3", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "900px", margin: "0 auto 40px auto", borderBottom: "1px solid #21262d", paddingBottom: "20px" },
  title: { fontSize: "1.6rem", margin: 0, fontWeight: "800" },
  blueText: { color: "#4facfe" },
  subtitle: { margin: "5px 0 0 0", fontSize: "0.85rem", color: "#8b949e" },
  clearBtn: { backgroundColor: "transparent", color: "#f85149", border: "1px solid #f85149", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" },
  container: { maxWidth: "900px", margin: "0 auto" },
  card: { backgroundColor: "#161b22", borderRadius: "12px", border: "1px solid #30363d", padding: "24px", marginBottom: "30px" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  badge: { fontSize: "0.7rem", fontWeight: "800", padding: "4px 12px", borderRadius: "20px", border: "1px solid" },
  time: { fontSize: "0.75rem", color: "#8b949e" },
  logBox: { backgroundColor: "#010409", borderRadius: "8px", border: "1px solid #30363d", marginBottom: "24px" },
  logHeader: { backgroundColor: "#21262d", padding: "6px 15px", fontSize: "0.65rem", color: "#8b949e" },
  logBody: { padding: "15px", fontSize: "0.9rem", color: "#c9d1d9", fontFamily: "monospace", whiteSpace: "pre-wrap" },
  aiWrapper: { background: "rgba(79, 172, 254, 0.05)", border: "1px solid rgba(79, 172, 254, 0.2)", borderRadius: "10px", padding: "20px" },
  aiHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  aiTag: { fontSize: "0.7rem", fontWeight: "900", color: "#4facfe" },
  copyBtn: { backgroundColor: "#21262d", color: "#c9d1d9", border: "1px solid #30363d", padding: "5px 10px", borderRadius: "5px", fontSize: "0.65rem", cursor: "pointer" },
  aiContent: { borderLeft: "3px solid #4facfe", paddingLeft: "20px" },
  aiLine: { margin: "0 0 10px 0", fontSize: "0.95rem", color: "#d1d5db" },
  emptyState: { textAlign: "center", color: "#484f58", marginTop: "50px" }
};

export default App;