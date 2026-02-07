from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import connect_to_mongo, close_mongo_connection
from app.routes import projects, webhooks, github_app, webhook_manager
from app.config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    await connect_to_mongo()
    print(f"[STARTED] StarCPay Backend on {settings.api_host}:{settings.api_port}")
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="StarCPay API",
    description="AI-powered payment system for GitHub freelancers",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "*"],  # Configure based on your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(projects.router)
app.include_router(webhooks.router)
app.include_router(github_app.router)
app.include_router(webhook_manager.router)  # Re-enabled - MongoDB is working now


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "StarCPay API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.environment == "development"
    )
