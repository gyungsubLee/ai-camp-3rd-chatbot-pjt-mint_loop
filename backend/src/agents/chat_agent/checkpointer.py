"""Checkpointer 설정

환경에 따른 상태 저장소 설정.
- 개발: MemorySaver (인메모리)
- 프로덕션: PostgresSaver (Supabase PostgreSQL)
"""
import os
from typing import TYPE_CHECKING

import structlog
from langgraph.checkpoint.memory import MemorySaver

if TYPE_CHECKING:
    from langgraph.checkpoint.base import BaseCheckpointSaver

logger = structlog.get_logger(__name__)


def get_checkpointer() -> "BaseCheckpointSaver":
    """환경에 따른 Checkpointer 반환

    환경 변수:
    - ENV: 환경 (development, production)
    - DATABASE_URL: PostgreSQL 연결 문자열 (프로덕션용)

    Returns:
        BaseCheckpointSaver: 상태 저장소 인스턴스
    """
    env = os.getenv("ENV", "development")

    if env == "production":
        return _get_postgres_checkpointer()

    # 개발 환경: 인메모리 저장소
    logger.info("Using MemorySaver for development environment")
    return MemorySaver()


def _get_postgres_checkpointer() -> "BaseCheckpointSaver":
    """PostgreSQL Checkpointer 생성

    Supabase 또는 다른 PostgreSQL 데이터베이스를 사용합니다.

    Returns:
        PostgresSaver 인스턴스
    """
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        logger.warning(
            "DATABASE_URL not set, falling back to MemorySaver"
        )
        return MemorySaver()

    try:
        from langgraph.checkpoint.postgres import PostgresSaver

        checkpointer = PostgresSaver.from_conn_string(database_url)
        logger.info("Using PostgresSaver for production environment")
        return checkpointer

    except ImportError:
        logger.warning(
            "langgraph-checkpoint-postgres not installed, "
            "falling back to MemorySaver. "
            "Install with: pip install langgraph-checkpoint-postgres"
        )
        return MemorySaver()

    except Exception as e:
        logger.error(
            "Failed to initialize PostgresSaver",
            error=str(e),
        )
        return MemorySaver()


# =============================================================================
# 싱글톤 인스턴스
# =============================================================================

_checkpointer_instance: "BaseCheckpointSaver | None" = None


def get_shared_checkpointer() -> "BaseCheckpointSaver":
    """공유 Checkpointer 인스턴스 반환

    애플리케이션 전역에서 동일한 Checkpointer를 공유합니다.

    Returns:
        BaseCheckpointSaver: 공유 상태 저장소 인스턴스
    """
    global _checkpointer_instance

    if _checkpointer_instance is None:
        _checkpointer_instance = get_checkpointer()

    return _checkpointer_instance


def reset_checkpointer() -> None:
    """Checkpointer 인스턴스 리셋 (테스트용)"""
    global _checkpointer_instance
    _checkpointer_instance = None
