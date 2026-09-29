# 🔐 Secret Notes

A modern, minimalist, private notes web application featuring **Zero-Knowledge Client-Side Encryption** powered by the **Web Crypto API (AES-256-GCM)** and a lightweight **FastAPI** backend with JSON storage.

---

## 🌟 Key Features

* **Client-Side Encryption & Decryption**: Cryptographic operations occur solely in the browser. The server never sees plaintext note contents or encryption keys.
* **AES-256-GCM with Random IV**: Encrypts note contents using 256-bit keys and fresh cryptographically secure random 12-byte initialization vectors (IV) generated via `crypto.getRandomValues()`.
* **Zero-Knowledge Architecture**: Encryption keys remain only in browser memory while active and are never written to `localStorage`, cookies, or sent over the network.
* **Animated Cryptographic Pipelines**: Real-time vertical visualization showing plaintext conversion, AES-256-GCM authentication tags, and real ciphertext generation.
* **Metadata & List Preview**: View list of note titles and creation timestamps without decrypting content.
* **In-Memory Decryption & Lock**: Decrypted content remains in memory and can be instantly locked, clearing the decrypted buffer and key from application state.
* **Full CRUD Support**: Create, Read (Decrypt), Update (Re-encrypt with new IV), and Delete notes.

---

## 🏗️ Architecture

### Encryption Flow (Create / Edit)

```text
User Input (Plaintext + Passphrase)
   │
   ▼
Web Crypto API (SHA-256 Key Derivation & AES-256-GCM)
   │
   ├── Ciphertext (Base64)
   └── Random IV (Base64)
   │
   ▼
FastAPI (POST/PUT /api/notes)
   │
   ▼
backend/data/notes.json (Atomic write)
```

### Decryption Flow (View)

```text
backend/data/notes.json
   │
   ▼
FastAPI (GET /api/notes)
   │
   ▼
Vue.js Frontend (Ciphertext + IV + User Key)
   │
   ▼
Web Crypto API (crypto.subtle.decrypt)
   │
   ▼
Plaintext displayed in memory (Can be Locked anytime)
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Cryptography**: Native Web Crypto API (`SubtleCrypto`, `TextEncoder`, `TextDecoder`, `crypto.getRandomValues`)

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Validation**: Pydantic v2
- **Server**: Uvicorn
- **Storage**: JSON File (`backend/data/notes.json`) with safe atomic writes

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server (runs on http://127.0.0.1:8000)
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install node dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Running Self-Check Tests

A runnable self-check script is provided for backend storage:

```bash
cd backend
python test_storage.py
```

---

## 🔒 Security Model & Limitations

1. **Client-Side Trust**: Encryption and decryption happen in the browser runtime. If the user's host environment or browser is compromised (e.g., malicious browser extensions), security guarantees may be bypassed.
2. **Key Recovery**: Because keys are never sent to or stored on the backend, **forgotten encryption keys cannot be recovered or reset**.
3. **Transport**: When deploying to production, enforce **HTTPS** to ensure transport integrity for static assets and API requests.
