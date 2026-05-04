import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import match, chat, stream, multimodal, paralympic, era

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize clients, warm caches
    yield
    # Shutdown: cleanup


app = FastAPI(
    title="Kifani — Athlete Archetype Agent",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Session-ID"],  # Expose SSE session header to frontend
)

app.include_router(match.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(stream.router, prefix="/api")
app.include_router(multimodal.router, prefix="/api")
app.include_router(paralympic.router, prefix="/api")
app.include_router(era.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
