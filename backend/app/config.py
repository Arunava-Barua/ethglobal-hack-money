
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Literal


class Settings(BaseSettings):
    # GitHub App Configuration
    github_app_id: str
    github_private_key_path: str
    github_webhook_secret: str

    # MongoDB Configuration
    mongodb_url: str
    mongodb_db_name: str = "starcpay"

    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    environment: str = "production"

    # Frontend URL
    frontend_url: str = "http://localhost:3000"

    # AI/LLM Configuration
    # Employer can choose: "claude", "openai", or "gemini"
    llm_provider: Literal["claude", "openai", "gemini"] = "claude"

    # API Keys for different providers
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    google_api_key: str = ""

    # Model names
    claude_model: str = "claude-3-5-sonnet-20241022"
    openai_model: str = "gpt-4-turbo-preview"
    gemini_model: str = "gemini-1.5-flash"

    # Blockchain Configuration
    rpc_url: str = ""  # EVM RPC endpoint
    private_key: str = ""  # Private key for signing transactions

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
