"""AESVault Database Package."""
from .database import (
    init_db,
    get_db_connection,
    create_user,
    get_user_by_email,
    get_user_by_id,
    update_user_name,
    record_file_operation,
    get_user_history,
    get_user_statistics
)

__all__ = [
    'init_db',
    'get_db_connection',
    'create_user',
    'get_user_by_email',
    'get_user_by_id',
    'update_user_name',
    'record_file_operation',
    'get_user_history',
    'get_user_statistics'
]
