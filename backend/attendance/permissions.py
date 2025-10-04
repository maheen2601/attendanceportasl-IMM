# attendance/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminOrTeamLead(BasePermission):
    """
    Allow site admins or users who have a TeamLead profile.
    """
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.is_staff or hasattr(u, "team_lead")))

class IsTeamLead(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and hasattr(u, "team_lead"))
