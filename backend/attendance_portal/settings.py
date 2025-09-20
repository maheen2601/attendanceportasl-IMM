
"""
Django settings for attendance_portal project.
Production-ready for Render & local dev (PostgreSQL).
"""
from pathlib import Path
from datetime import timedelta
import os
import dj_database_url

# ---------- env helpers ----------
def env(key, default=None):
    return os.getenv(key, default)

def env_list(key, default=""):
    raw = env(key, default) or ""
    return [x.strip() for x in raw.split(",") if x.strip()]

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------- security / debug ----------
SECRET_KEY = env("SECRET_KEY", "dev-secret-change-me")
DEBUG = env("DEBUG", "False").lower() == "true"

# Render host (Render sets RENDER_EXTERNAL_HOSTNAME)
RENDER_HOST = env("RENDER_EXTERNAL_HOSTNAME", "")

# Allow explicit hosts via env; include local and *.onrender.com by default
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", ".onrender.com,localhost,127.0.0.1")
if RENDER_HOST and RENDER_HOST not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(RENDER_HOST)

# ---------- apps ----------
INSTALLED_APPS = [
    "whitenoise.runserver_nostatic",  # correct dev static handling
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    # If you plan to blacklist rotated refresh tokens, also add:
    # "rest_framework_simplejwt.token_blacklist",
    "attendance",
]

# ---------- auth / DRF ----------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    )
}
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ---------- middleware (order matters) ----------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # must be right after SecurityMiddleware
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

ROOT_URLCONF = "attendance_portal.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "attendance_portal" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "attendance_portal.wsgi.application"

# ---------- CORS / CSRF ----------
FRONTEND_URL = (env("FRONTEND_URL", "") or "").rstrip("/")
DEFAULT_CORS = ["http://localhost:3000", "http://127.0.0.1:3000"]

cors_from_env = env_list("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = list(dict.fromkeys(
    DEFAULT_CORS
    + cors_from_env
    + ([FRONTEND_URL] if FRONTEND_URL.startswith(("http://", "https://")) else [])
))
CORS_ALLOW_CREDENTIALS = True  # okay even if using JWT; required only if you send cookies

CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "")
if FRONTEND_URL.startswith(("http://", "https://")) and FRONTEND_URL not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_URL)
if RENDER_HOST:
    CSRF_TRUSTED_ORIGNS = set(CSRF_TRUSTED_ORIGINS)  # dedupe
    CSRF_TRUSTED_ORIGNS.add(f"https://{RENDER_HOST}")
    CSRF_TRUSTED_ORIGINS = list(CSRF_TRUSTED_ORIGNS)

# ---------- database ----------
DATABASE_URL = os.getenv("DATABASE_URL", "")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=False,   # Internal URL doesn't need SSL
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "attendance_db"),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }

# ---------- i18n / tz ----------
LANGUAGE_CODE = "en-us"
TIME_ZONE = env("TIME_ZONE", "UTC")
USE_I18N = True
USE_TZ = True

# ---------- static / WhiteNoise ----------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
# If you actually place additional assets under BASE_DIR / "static", uncomment:
# STATICFILES_DIRS = [BASE_DIR / "static"]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
WHITENOISE_MAX_AGE = 60 * 60 * 24 * 30  # 30 days

# ---------- production security ----------
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------- logging ----------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "django.request": {"handlers": ["console"], "level": "ERROR", "propagate": False},
    },
}
import os, dj_database_url
# ----- SMTP / email -----
def env_bool(k, default="False"):
    return (os.getenv(k, default) or "").strip().lower() in {"1","true","yes","on"}

EMAIL_BACKEND      = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST         = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT         = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS      = env_bool("EMAIL_USE_TLS", "True")
EMAIL_USE_SSL      = env_bool("EMAIL_USE_SSL", "False")   # keep False when TLS=True
EMAIL_HOST_USER    = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD= os.getenv("EMAIL_HOST_PASSWORD", "")

DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "AdminHub <pc19463.malikfarooq@gmail.com>")
NOTIFY_ADMIN_EMAILS = [e.strip() for e in os.getenv("NOTIFY_ADMIN_EMAILS", "").split(",") if e.strip()]






# settings.py
import os

# … your existing SMTP settings …

DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "AdminHub <pc19463.malikfarooq@gmail.com>")

# IMPORTANT: turn comma-separated env into a real list
NOTIFY_ADMIN_EMAILS = [
    e.strip() for e in os.getenv("NOTIFY_ADMIN_EMAILS", "").split(",") if e.strip()
]



if RENDER_HOST:
    _set = set(CSRF_TRUSTED_ORIGINS)
    _set.add(f"https://{RENDER_HOST}")
    CSRF_TRUSTED_ORIGINS = list(_set)
