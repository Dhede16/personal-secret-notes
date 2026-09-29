from typing import List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from services import storage

router = APIRouter(prefix="/api/notes", tags=["notes"])


class NoteCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, description="Title of the secret note")
    ciphertext: str = Field(..., min_length=1, description="Base64 encoded ciphertext")
    iv: str = Field(..., min_length=1, description="Base64 encoded IV")


class NoteUpdateRequest(BaseModel):
    title: str = Field(..., min_length=1, description="Title of the secret note")
    ciphertext: str = Field(..., min_length=1, description="Base64 encoded ciphertext")
    iv: str = Field(..., min_length=1, description="Base64 encoded IV")


class NoteResponse(BaseModel):
    id: str
    title: str
    ciphertext: str
    iv: str
    created_at: str
    updated_at: str


@router.get("", response_model=List[NoteResponse])
def get_notes():
    return storage.get_all_notes()


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreateRequest):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty.")
    if not payload.ciphertext.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty.")
    if not payload.iv.strip():
        raise HTTPException(status_code=400, detail="IV cannot be empty.")

    note = storage.create_note(payload.title, payload.ciphertext, payload.iv)
    return note


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: str, payload: NoteUpdateRequest):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty.")
    if not payload.ciphertext.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty.")
    if not payload.iv.strip():
        raise HTTPException(status_code=400, detail="IV cannot be empty.")

    updated = storage.update_note(note_id, payload.title, payload.ciphertext, payload.iv)
    if not updated:
        raise HTTPException(status_code=404, detail="Note not found.")
    return updated


@router.delete("/{note_id}")
def delete_note(note_id: str):
    success = storage.delete_note(note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found.")
    return {"message": "Note deleted successfully"}
