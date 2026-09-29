import json
import os
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
NOTES_FILE = DATA_DIR / "notes.json"


def _ensure_storage() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not NOTES_FILE.exists():
        _write_raw({"notes": []})


def _read_raw() -> Dict[str, Any]:
    _ensure_storage()
    try:
        with open(NOTES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, dict) or "notes" not in data or not isinstance(data["notes"], list):
                return {"notes": []}
            return data
    except (json.JSONDecodeError, OSError):
        # In case of corruption or read error, fallback to empty notes safely
        return {"notes": []}


def _write_raw(data: Dict[str, Any]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    # Atomic write to prevent file corruption
    temp_file = tempfile.NamedTemporaryFile("w", dir=str(DATA_DIR), delete=False, encoding="utf-8")
    try:
        json.dump(data, temp_file, indent=2, ensure_ascii=False)
        temp_file.flush()
        os.fsync(temp_file.fileno())
        temp_file.close()
        os.replace(temp_file.name, str(NOTES_FILE))
    except Exception:
        if os.path.exists(temp_file.name):
            os.remove(temp_file.name)
        raise


def get_all_notes() -> List[Dict[str, Any]]:
    data = _read_raw()
    return data.get("notes", [])


def get_note_by_id(note_id: str) -> Optional[Dict[str, Any]]:
    notes = get_all_notes()
    for note in notes:
        if note.get("id") == note_id:
            return note
    return None


def create_note(title: str, ciphertext: str, iv: str) -> Dict[str, Any]:
    notes = get_all_notes()
    now_iso = datetime.now(timezone.utc).isoformat()
    new_note = {
        "id": f"note-{uuid.uuid4().hex[:12]}",
        "title": title.strip(),
        "ciphertext": ciphertext,
        "iv": iv,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    notes.insert(0, new_note)
    _write_raw({"notes": notes})
    return new_note


def update_note(note_id: str, title: str, ciphertext: str, iv: str) -> Optional[Dict[str, Any]]:
    notes = get_all_notes()
    now_iso = datetime.now(timezone.utc).isoformat()
    updated_note = None
    for note in notes:
        if note.get("id") == note_id:
            note["title"] = title.strip()
            note["ciphertext"] = ciphertext
            note["iv"] = iv
            note["updated_at"] = now_iso
            updated_note = note
            break
    if updated_note:
        _write_raw({"notes": notes})
    return updated_note


def delete_note(note_id: str) -> bool:
    notes = get_all_notes()
    initial_count = len(notes)
    notes = [n for n in notes if n.get("id") != note_id]
    if len(notes) < initial_count:
        _write_raw({"notes": notes})
        return True
    return False
