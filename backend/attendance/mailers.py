# mailers.py
from typing import Iterable
from django.conf import settings
from django.core.mail import send_mail

def _to_list(v) -> list[str]:
    if not v:
        return []
    if isinstance(v, (list, tuple, set)):
        return [str(x).strip() for x in v if str(x).strip()]
    if isinstance(v, str):
        return [p.strip() for p in v.split(",") if p.strip()]
    return [str(v)]

def _send_safe(subject: str, body: str, to):
    recipients = _to_list(to)
    if not recipients:
        return
    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, recipients, fail_silently=True)
    except Exception:
        pass  # or log

def _employee_email(emp):
    email = getattr(emp.user, "email", "") or ""
    return email.strip() or None

# ---- Leaves ----
def notify_admin_new_leave(leave):
    emp = leave.employee
    subject = f"[Leave Request] {emp.user.username} {leave.start_date} → {leave.end_date}"
    body = (
        f"Employee: {emp.user.username}\n"
        f"Type: {leave.leave_type}\n"
        f"Dates: {leave.start_date} → {leave.end_date}\n"
        f"Notice met: {'Yes' if leave.notice_met else 'No'}\n"
        f"Reason:\n{leave.reason}\n"
    )
    _send_safe(subject, body, getattr(settings, "NOTIFY_ADMIN_EMAILS", []))

def notify_employee_leave_decision(leave):
    to = _employee_email(leave.employee)
    if not to:
        return
    subject = f"Your leave was {leave.status}"
    body = (
        f"Hi {leave.employee.user.username},\n\n"
        f"Your leave ({leave.start_date} → {leave.end_date}) has been {leave.status}.\n\n"
        f"Thanks,\nAdminHub"
    )
    _send_safe(subject, body, [to])

# ---- Early-off ----
def notify_admin_new_earlyoff(req):
    emp = req.employee
    subject = f"[Early-Off Request] {emp.user.username} for {req.for_date}"
    body = (
        f"Employee: {emp.user.username}\n"
        f"Date: {req.for_date}\n"
        f"Reason:\n{req.reason}\n"
    )
    _send_safe(subject, body, getattr(settings, "NOTIFY_ADMIN_EMAILS", []))

def notify_employee_earlyoff_decision(req):
    to = _employee_email(req.employee)
    if not to:
        return
    subject = f"Your early-off was {req.status}"
    note = getattr(req, "admin_note", "") or getattr(req, "note", "")
    body = (
        f"Hi {req.employee.user.username},\n\n"
        f"Your early-off for {req.for_date} has been {req.status}.\n"
        f"{('Admin note: ' + note) if note else ''}\n\n"
        f"Thanks,\nAdminHub"
    )
    _send_safe(subject, body, [to])
