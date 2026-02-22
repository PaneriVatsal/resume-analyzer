"use client";

import { useState } from "react";

const N8N_WEBHOOK_URL = "/api/analyze";

export default function Home() {
  const [jdText, setJdText] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState("");

  // Analysis logic with retry
  const analyzeCandidate = async (file: File, retryCount = 0): Promise<any> => {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd", jdText);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Server responded with ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.error) {
                errorMessage = errorJson.error;
              } else {
                errorMessage += `: ${JSON.stringify(errorJson)}`;
              }
            } catch {
              errorMessage += `: ${errorText}`;
            }
          }
        } catch (e) {
          // ignore error parsing
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      const candidateData = Array.isArray(data) ? data[0] : data || {};
      const score = Number(candidateData.score) || 0;

      // Retry condition: Score is 0 or critical data missing AND we haven't retried yet
      if ((score === 0 || !candidateData.name) && retryCount < 1) {
        console.log(`Retrying ${file.name} (Attempt ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
        return analyzeCandidate(file, retryCount + 1);
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        name: candidateData.name || "Unknown Candidate",
        email: candidateData.email || "N/A",
        phone: candidateData.phone || "N/A",
        score: score,
        status: candidateData.status || "Review",
        summary: candidateData.summary,
        interview_date: candidateData.interview_date
      };

    } catch (error: any) {
      console.error(`Error analyzing file (Attempt ${retryCount + 1}):`, file.name, error);

      // Retry on network/server error as well
      if (retryCount < 1) {
        console.log(`Retrying ${file.name} due to error...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return analyzeCandidate(file, retryCount + 1);
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        name: "Analysis Failed",
        email: "N/A",
        phone: "N/A",
        score: 0,
        status: "Error",
        summary: error.message
      };
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (!jdText.trim()) {
        alert("Please enter a Job Description first.");
        return;
      }

      setAnalyzing(true);
      const files = Array.from(e.target.files);

      // Process sequentially with robust delays
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        setAnalyzeStatus(`Analyzing ${i + 1}/${files.length}: ${file.name}...`);

        const result = await analyzeCandidate(file);

        // Update UI progressively so user sees something happening
        setCandidates(prev => [...prev, result]);

        // Significant delay to respect rate limits (3 seconds)
        // Only wait if there are more files to process
        if (i < files.length - 1) {
          setAnalyzeStatus(`Waiting (${3}s)...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      setAnalyzing(false);
      setAnalyzeStatus("");
    }
  };


  const handleDraftEmail = (candidateName: string) => {
    // Basic interaction simulation
    alert(`Drafting email to ${candidateName}...\n\nSubject: Interview Invitation\nHi ${candidateName}, we'd love to chat!`);
  };

  const handleScheduleInterview = (candidateName: string) => {
    alert(`Opening calendar for ${candidateName}...`);
  };

  return (
    <main style={{ padding: "4rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>
          AI Resume Vibe Check
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#a0aec0", maxWidth: "600px", margin: "0 auto" }}>
          Upload multiple resumes (PDF/Doc) and a JD to get a ranked candidate list.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
        {/* JD Input */}
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>1. Job Description</h2>
          <textarea
            placeholder="Paste the Job Description here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            style={{
              width: "100%",
              height: "200px",
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
              padding: "1rem",
              fontFamily: "inherit",
              resize: "none",
            }}
          />
        </div>

        {/* Multi-File Upload */}
        <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderStyle: "dashed", borderWidth: "2px" }}>
          <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>2. Upload Resumes</h2>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="btn-primary"
            style={{ cursor: "pointer", display: "inline-block", marginTop: "1rem" }}
          >
            {analyzing ? (analyzeStatus || "Analyzing Vibe...") : "Select Files (PDF/Doc)"}
          </label>
          <p style={{ marginTop: "1rem", color: "#a0aec0", fontSize: "0.9rem" }}>
            Drag & drop or click to upload multiple files
          </p>
        </div>
      </div>

      {/* Candidate Table */}
      {candidates.length > 0 && (
        <div className="glass-panel" style={{ padding: "2rem", animation: "fadeIn 0.5s ease" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
            Candidate Analysis
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "1rem", color: "var(--accent-purple)" }}>Candidate</th>
                  <th style={{ padding: "1rem", color: "var(--accent-purple)" }}>Contact</th>
                  <th style={{ padding: "1rem", color: "var(--accent-purple)" }}>Vibe Score</th>
                  <th style={{ padding: "1rem", color: "var(--accent-purple)" }}>Status</th>
                  <th style={{ padding: "1rem", color: "var(--accent-purple)" }}>Scheduled For</th>
                </tr>
              </thead>
              <tbody>
                {candidates.sort((a, b) => b.score - a.score).map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "1rem", fontWeight: "bold" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{c.name}</span>
                        <span style={{ fontSize: "0.8rem", color: "#a0aec0" }}>{c.fileName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                      <div style={{ opacity: 0.8 }}>{c.email}</div>
                      <div style={{ opacity: 0.6 }}>{c.phone}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{
                          color: c.score >= 75 ? "var(--success)" : c.score >= 40 ? "var(--accent-cyan)" : "var(--error)",
                          fontWeight: "bold",
                          fontSize: "1.2rem"
                        }}>
                          {c.score}%
                        </span>
                        <div style={{ width: "80px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px" }}>
                          <div style={{
                            width: `${c.score}%`,
                            height: "100%",
                            background: c.score >= 75 ? "var(--success)" : c.score >= 40 ? "var(--accent-cyan)" : "var(--error)",
                            borderRadius: "3px"
                          }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        background: c.status === "Interview" ? "rgba(0, 230, 118, 0.15)" : c.status === "Reject" ? "rgba(207, 102, 121, 0.15)" : "rgba(3, 218, 198, 0.15)",
                        color: c.status === "Interview" ? "var(--success)" : c.status === "Reject" ? "var(--error)" : "var(--accent-cyan)",
                        border: `1px solid ${c.status === "Interview" ? "var(--success)" : c.status === "Reject" ? "var(--error)" : "var(--accent-cyan)"}`
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {c.status === "Interview" && c.interview_date ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--success)", fontSize: "0.9rem" }}>
                          <span>📅</span>
                          <span>
                            {new Date(c.interview_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            {" at "}
                            {new Date(c.interview_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
