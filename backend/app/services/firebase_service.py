import firebase_admin
from firebase_admin import credentials, auth
from app.config import settings
import logging
import time

logger = logging.getLogger(__name__)


def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key_id": settings.firebase_private_key_id,
            "private_key": settings.firebase_private_key.replace("\\n", "\n"),
            "client_email": settings.firebase_client_email,
            "client_id": settings.firebase_client_id,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        })
        firebase_admin.initialize_app(cred)
        logger.info("Firebase initialized")


async def verify_firebase_token(id_token: str) -> dict:
    """Verify a Firebase ID token and return the decoded payload.
    Retries once on transient network errors (common on Render cold-start).
    """
    init_firebase()
    last_error = None
    for attempt in range(2):
        try:
            decoded_token = auth.verify_id_token(id_token)
            return {
                "uid": decoded_token["uid"],
                "phone": decoded_token.get("phone_number"),
                "email": decoded_token.get("email"),
                "name": decoded_token.get("name"),
                "photo_url": decoded_token.get("picture"),
            }
        except Exception as e:
            last_error = e
            logger.warning(f"Firebase token verification attempt {attempt + 1} failed: {e}")
            if attempt == 0:
                time.sleep(1)  # brief pause before retry
    logger.error(f"Firebase token verification failed after retries: {last_error}")
    raise ValueError(f"Invalid token: {last_error}")
