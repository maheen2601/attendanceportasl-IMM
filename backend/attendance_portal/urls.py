"""
URL configuration for attendance_portal project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,re_path
from django.urls import include
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView
from django.http import HttpResponse


from django.http import JsonResponse
from django.conf import settings
import os

def diag(request):
    base = settings.BASE_DIR
    tdir = base / "attendance_portal" / "templates"
    ipath = tdir / "index.html"
    payload = {
        "BASE_DIR": str(base),
        "template_dir": str(tdir),
        "index_path": str(ipath),
        "template_dir_exists": tdir.exists(),
        "index_exists": ipath.exists(),
        "template_dir_listing": sorted(os.listdir(tdir)) if tdir.exists() else [],
    }
    return JsonResponse(payload)




urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('attendance.urls')),
    # serve favicon from static (after we copy it there)
    path("favicon.ico", RedirectView.as_view(url="/static/favicon.ico", permanent=True)),
    path("__diag/", diag),   
    # SPA entry: root and any unmatched path -> index.html
    re_path(r"^(?:.*)/?$", TemplateView.as_view(template_name="index.html")),
    path("ping/", lambda r: HttpResponse("pong")),  # quick health check
    
]

