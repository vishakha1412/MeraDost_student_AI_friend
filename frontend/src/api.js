const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function sendChat({ sessionId, mode, message, topic, role, difficulty }) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      mode,
      message,
      topic,
      role,
      difficulty,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Something went wrong talking to MeraDost.");
  }
  const data = await res.json();
  return data.reply;
}

export async function uploadDocument({ sessionId, file }) {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed.");
  }
  return res.json();
}

export async function getFiles(sessionId) {
  const res = await fetch(`${BASE_URL}/api/files/${sessionId}`);
  if (!res.ok) return { files: [] };
  return res.json();
}
