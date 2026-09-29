"""
Single runnable self-check script for backend storage without external test frameworks.
"""
import os
import sys
from services import storage

def run_tests():
    print("Testing storage service...")
    
    # Clean test
    initial_notes = storage.get_all_notes()
    initial_len = len(initial_notes)
    
    # 1. Create
    created = storage.create_note("Test Title", "dGVzdF9jaXBoZXI=", "dGVzdF9pdg==")
    assert created["id"].startswith("note-"), "ID should start with note-"
    assert created["title"] == "Test Title"
    assert created["ciphertext"] == "dGVzdF9jaXBoZXI="
    assert created["iv"] == "dGVzdF9pdg=="
    
    # 2. Read
    fetched = storage.get_note_by_id(created["id"])
    assert fetched is not None, "Note should be retrieved by id"
    assert fetched["title"] == "Test Title"
    
    # 3. Update
    updated = storage.update_note(created["id"], "Updated Title", "bmV3X2NpcGhlcg==", "bmV3X2l2")
    assert updated is not None
    assert updated["title"] == "Updated Title"
    assert updated["ciphertext"] == "bmV3X2NpcGhlcg=="
    assert updated["updated_at"] >= created["created_at"]
    
    # 4. Delete
    deleted = storage.delete_note(created["id"])
    assert deleted is True, "Delete should return True"
    assert storage.get_note_by_id(created["id"]) is None, "Deleted note should not be found"
    
    # 5. Length check
    final_notes = storage.get_all_notes()
    assert len(final_notes) == initial_len, "Storage note count should match initial count after cleanup"
    
    print("All storage tests passed successfully!")

if __name__ == "__main__":
    run_tests()
