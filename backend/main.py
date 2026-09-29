from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.notes import router as notes_router

app = FastAPI(
    title="Secret Notes API",
    description="Client-side encrypted notes backend",
    version="1.0.0",
)

# Enable CORS for frontend Vite dev server and local clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "secret-notes-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
