import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import (
    auth, dashboard, documents, leakage, recovery,
    activity, audit, data_sources, security, settings
)

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RevGuard AI — Revenue Leakage Detection & Recovery",
    description="Multi-tenant enterprise backend for autonomous revenue leakage detection, payment verification, and bounded recovery.",
    version="2.0.0"
)

@app.on_event("startup")
def on_startup():
    # Ensure database schema is initialized without creating demo companies
    Base.metadata.create_all(bind=engine)

# Enable CORS for local development and preview
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(documents.router)
app.include_router(leakage.router)
app.include_router(recovery.router)
app.include_router(activity.router)
app.include_router(audit.router)
app.include_router(data_sources.router)
app.include_router(security.router)
app.include_router(settings.router)

@app.get("/")
def health_check():
    return {
        "status": "ONLINE",
        "service": "RevGuard AI Enterprise Platform",
        "version": "2.0.0",
        "architecture": "Multi-Tenant Isolated Engine",
        "database": "Relational Engine (SQLite/PostgreSQL)"
    }
