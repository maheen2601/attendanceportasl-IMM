
# from rest_framework import status, serializers
# from rest_framework.permissions import IsAdminUser
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from django.contrib.auth.models import User
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from rest_framework_simplejwt.views import TokenObtainPairView
# from .models import Employee
# from .serializers import EmployeeCreateSerializer,TeamSerializer
# from rest_framework.generics import ListAPIView
# from .models import Employee
# from .serializers import EmployeeCreateSerializer
# from rest_framework.permissions import IsAdminUser
# from rest_framework.generics import DestroyAPIView
# from .models import Employee
# from rest_framework.permissions import IsAdminUser
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework import viewsets, permissions
# from .models import LeaveRequest
# from .serializers import LeaveRequestSerializer
# from rest_framework.generics import ListAPIView, UpdateAPIView
# from .models import LeaveRequest
# from .serializers import LeaveRequestSerializer
# from rest_framework.permissions import IsAdminUser
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from .models import Attendance, Employee
# from django.utils import timezone
# from datetime import date
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from django.utils import timezone
# from datetime import timedelta, date
# from .models import Attendance, Employee, LeaveRequest
# from datetime import date, timedelta
# from .serializers import EarlyOffRequestSerializer, EarlyOffDecisionSerializer
# from rest_framework.permissions import IsAdminUser
# from rest_framework.generics import ListAPIView, UpdateAPIView
# from django.db.models import Q
# from .models import LeaveRequest
# from .serializers import LeaveRequestSerializer, LeaveRequestStatusUpdateSerializer
# from django.shortcuts import get_object_or_404
# from rest_framework import status, serializers, viewsets, permissions
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.generics import ListAPIView, UpdateAPIView, DestroyAPIView
# from rest_framework.permissions import IsAdminUser, IsAuthenticated
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from .models import Team
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from rest_framework_simplejwt.views import TokenObtainPairView
# from .serializers import LeaveAdminDecisionSerializer
# from datetime import date, timedelta
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from .serializers import LeaveRequestSerializer, LeaveRequestStatusUpdateSerializer
# from .permissions import IsAdminOrTeamLead
# from datetime import date, timedelta
# from django.db.models import Q, Count
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAdminUser
# from rest_framework.response import Response
# from .serializers import LeaveRequestCreateSerializer
# from .models import Employee, Attendance, LeaveRequest
# from django.db.models import Prefetch
# from .models import Employee, Attendance, LeaveRequest
# from .serializers import (
#     EmployeeCreateSerializer,
#     EmployeeProfileSerializer,
#     AttendanceSerializer,
#     LeaveRequestSerializer,
# )
# from rest_framework.exceptions import PermissionDenied 

# from collections import defaultdict
# # add this near the other imports
# from .mailers import (
#     notify_admin_new_leave,
#     notify_employee_leave_decision,
#     notify_admin_new_earlyoff,
#     notify_employee_earlyoff_decision,
# )

# from .models import PreNotice
# from django.utils import timezone
# from .models import PolicySettings
# from datetime import datetime, time as time_cls
# from .models import EarlyOffRequest
# from datetime import date, datetime
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated, IsAdminUser
# from rest_framework.response import Response
# from rest_framework.generics import ListAPIView, UpdateAPIView

# from .models import AttendanceCorrection, Employee
# from .serializers import (
#     AttendanceCorrectionSerializer,
#     AttendanceCorrectionUpdateSerializer,
# )
# from datetime import datetime
# from django.utils import timezone
# from django.db import transaction
# from rest_framework import status, permissions
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView

# from .models import AttendanceCorrection, Attendance
# from .serializers import (
#     AttendanceCorrectionSerializer,
#     AttendanceCorrectionUpdateSerializer,
# )

# # attendance/views.py (top of file)

# from datetime import date, datetime
# from django.utils import timezone
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated, IsAdminUser
# from rest_framework.response import Response
# from rest_framework.generics import ListAPIView, UpdateAPIView

# from .models import AttendanceCorrection, Attendance, Employee
# from .serializers import (
#     AttendanceCorrectionSerializer,
#     AttendanceCorrectionUpdateSerializer,
# )
# # ---------- AUTH ----------


# # ---- Shared helpers for team scoping ----
# from urllib.parse import unquote
# from .models import TeamLead, Employee

# def parse_team_params(request):
#     # supports team=A&team=B   OR   team[]=A&team[]=B   OR   team="A,B"
#     raw = request.query_params.getlist("team") or request.query_params.getlist("team[]")
#     if not raw:
#         return []
#     if len(raw) == 1 and "," in raw[0]:
#         return [t.strip() for t in unquote(raw[0]).split(",") if t.strip()]
#     return [t.strip() for t in raw if t.strip()]

# def lead_allowed_team_names(user):
#     """
#     Return a set of team names this user leads.
#     Empty set if user is not a lead.
#     """
#     tl = getattr(user, "team_lead", None)
#     if not tl:
#         return set()
#     return set(tl.teams.values_list("name", flat=True))

# def employee_scope_for(request):
#     """
#     Base Employee queryset limited by role:
#       - Admin: all employees (optionally filtered by ?team=…)
#       - Lead : only employees whose team is one of the lead's teams,
#                further intersected with any provided ?team=… filter
#     """
#     qs = Employee.objects.all().select_related("user", "team")

#     teams_param = set(parse_team_params(request))  # requested teams (names)
#     if request.user.is_staff and not hasattr(request.user, "team_lead"):
#         # Admin: optionally apply filter if provided
#         if teams_param:
#             qs = qs.filter(team__name__in=teams_param)
#         return qs

#     # Lead: intersect requested teams with allowed teams (or default to allowed)
#     allowed = lead_allowed_team_names(request.user)
#     if not allowed:
#         return qs.none()
#     effective = teams_param & allowed if teams_param else allowed
#     return qs.filter(team__name__in=effective)


# class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
#     def validate(self, attrs):
#         data = super().validate(attrs)
#         request = self.context.get("request")
#         user = self.user

#         role = (request.data.get("role") if request else "").strip().lower()
#         if role not in {"admin", "employee", "lead"}:
#             raise serializers.ValidationError("Invalid or missing role.")

#         if role == "admin":
#             # must be staff AND not logging in via lead path (if you want strict split)
#             if not user.is_staff:
#                 raise serializers.ValidationError("You are not authorized as admin.")
#             # optional guard: forbid team leads from using the admin role
#             if hasattr(user, "team_lead"):
#                 raise serializers.ValidationError("Team leads must use the 'lead' login.")
#         elif role == "employee":
#             if not Employee.objects.filter(user=user).exists():
#                 raise serializers.ValidationError("You are not registered as employee.")
#         elif role == "lead":
#             if not hasattr(user, "team_lead"):
#                 raise serializers.ValidationError("You are not a team lead.")

#         data.update({
#             "username": user.username,
#             "role": role,
#             "is_staff": user.is_staff,
#             "is_team_lead": hasattr(user, "team_lead"),
#             "lead_teams": list(user.team_lead.teams.values_list("name", flat=True)) if hasattr(user, "team_lead") else [],
#         })
#         return data
    
# class CustomTokenObtainPairView(TokenObtainPairView):
#     serializer_class = CustomTokenObtainPairSerializer




# # ---------- ADMIN APIs (unchanged behaviors) ----------

# class CreateEmployeeAPIView(APIView):
#     permission_classes = [IsAdminUser]
#     def post(self, request):
#         serializer = EmployeeCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({"message": "Employee created successfully."}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# class DeleteEmployeeAPIView(DestroyAPIView):
#     permission_classes = [IsAdminUser]
#     queryset = Employee.objects.all()
#     def delete(self, request, pk, *args, **kwargs):
#         try:
#             employee = self.get_object()
#             user = employee.user
#             employee.delete()
#             user.delete()
#             return Response({"message": "Employee deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# class LeaveRequestAdminList(ListAPIView):
#     permission_classes = [IsAdminOrTeamLead]
#     serializer_class = LeaveRequestSerializer

#     def get_queryset(self):
#         qs = (LeaveRequest.objects
#               .select_related('employee__user', 'employee__team')
#               .order_by('-created_at'))

#         # Scope by role + ?team
#         emp_scope = employee_scope_for(self.request)
#         qs = qs.filter(employee__in=emp_scope)

#         # NEW: default to items awaiting admin
#         stage = (self.request.query_params.get('stage') or 'admin').lower()
#         if stage == 'admin':
#             qs = qs.filter(step='admin', status='pending')
#         elif stage == 'lead':
#             qs = qs.filter(step='lead', status='pending')
#         elif stage == 'done':
#             qs = qs.filter(step='done')
#         # else stage=all -> no extra filter

#         # … keep your existing filters (status, type, date, q) …
#         status_p = (self.request.query_params.get('status') or '').strip().lower()
#         ltype  = (self.request.query_params.get('type') or '').strip().lower()
#         dfrom  = self.request.query_params.get('from')
#         dto    = self.request.query_params.get('to')
#         q      = (self.request.query_params.get('q') or '').strip()

#         if status_p and status_p != 'all':
#             qs = qs.filter(status=status_p)
#         if ltype and ltype != 'all':
#             qs = qs.filter(leave_type=ltype)
#         if dfrom:
#             qs = qs.filter(start_date__gte=dfrom)
#         if dto:
#             qs = qs.filter(end_date__lte=dto)
#         if q:
#             from django.db.models import Q
#             qs = qs.filter(
#                 Q(employee__user__username__icontains=q) |
#                 Q(reason__icontains=q) |
#                 Q(peer_note__icontains=q)
#             )
#         return qs
# class LeaveRequestAdminUpdate(UpdateAPIView):
#     permission_classes = [IsAdminOrTeamLead]
#     serializer_class = LeaveAdminDecisionSerializer
#     queryset = LeaveRequest.objects.select_related("employee__team", "employee__user")

#     def check_object_permissions(self, request, obj):
#         # Admin: allowed everywhere
#         if request.user.is_staff and not hasattr(request.user, "team_lead"):
#             return
#         # Lead: only their teams
#         allowed = lead_allowed_team_names(request.user)
#         if obj.employee.team and obj.employee.team.name in allowed:
#             return
#         from rest_framework.exceptions import PermissionDenied
#         raise PermissionDenied("You cannot act on requests outside your teams.")

#     def partial_update(self, request, *args, **kwargs):
#         instance = self.get_object()

#         if instance.step != "admin":
#             return Response({"detail":"This request is not awaiting admin review."}, status=400)

#         prev_status = instance.status
#         response = super().partial_update(request, *args, **kwargs)  # writes status/admin_note

#         instance.refresh_from_db()
#         if instance.status not in {"approved","rejected"}:
#             return Response({"detail":"status must be approved or rejected."}, status=400)

#         # mark final
#         instance.step = "done"
#         instance.save(update_fields=["step"])

#         if prev_status != "approved" and instance.status == "approved":
#             try:
#                 _apply_approved_leave(instance)
#             except serializers.ValidationError as e:
#                 # rollback to pending/admin if failed (e.g., insufficient balance)
#                 instance.status = "pending"
#                 instance.step   = "admin"
#                 instance.save(update_fields=["status","step"])
#                 detail = e.detail[0] if isinstance(e.detail, list) else e.detail
#                 return Response({"detail": str(detail)}, status=400)

#         # (Optional) notify employee of final decision:
#         try:
#             notify_employee_leave_decision(instance)
#         except Exception:
#             pass

#         return response

# class LeaveRequestUpdateAPIView(UpdateAPIView):
#     queryset = LeaveRequest.objects.all()
#     serializer_class = LeaveRequestSerializer
#     permission_classes = [IsAdminUser]
    


#     def partial_update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         prev_status = instance.status
#         response = super().partial_update(request, *args, **kwargs)
#         instance.refresh_from_db()
#         if prev_status != "approved" and instance.status == "approved":
#             try:
#                 _apply_approved_leave(instance)
#             except serializers.ValidationError as e:
#                 instance.status = prev_status
#                 instance.save()
#                 detail = e.detail[0] if isinstance(e.detail, list) else e.detail
#                 return Response({"detail": str(detail)}, status=status.HTTP_400_BAD_REQUEST)
#         return response

# # ---------- SHARED DASHBOARD STATS ----------
# from urllib.parse import unquote


# # def _parse_team_params(request):
# #     # support team=A&team=B and team[]=A&team[]=B and "TCP,The%20News"
# #     raw = request.query_params.getlist("team")
# #     if not raw:
# #         raw = request.query_params.getlist("team[]")  # <-- handle Axios default

# #     if not raw:
# #         return []

# #     if len(raw) == 1 and "," in raw[0]:
# #         return [t.strip() for t in unquote(raw[0]).split(",") if t.strip()]

# #     return [t.strip() for t in raw if t.strip()]


# # make sure these are imported somewhere above in the file:
# # from datetime import date, timedelta, time as time_cls
# # from django.db.models import Q, Count
# # from rest_framework.decorators import api_view, permission_classes
# # from rest_framework.response import Response
# # from .permissions import IsAdminOrTeamLead
# # from .models import Attendance, LeaveRequest, EarlyOffRequest
# # from .views import employee_scope_for   # (only if employee_scope_for is in another module)


# from datetime import date, timedelta, time as time_cls
# from django.db.models import Count, Q
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response

# # attendance/views.py

# from datetime import date, timedelta, time as time_cls
# from django.db.models import Count, Q
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response

# from .models import Attendance, LeaveRequest, EarlyOffRequest
# from .permissions import IsAdminOrTeamLead



# # attendance/views.py
# from datetime import date, timedelta, time as time_cls
# from django.db.models import Count, Q
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response

# from .models import Attendance, LeaveRequest, EarlyOffRequest, Employee
# from .permissions import IsAdminOrTeamLead


# @api_view(['GET'])
# @permission_classes([IsAdminOrTeamLead])
# def dashboard_stats(request):
#     """
#     Admin: full scope (optionally filtered by ?team=…)
#     Lead : only employees under their teams (intersected with ?team=…)
#     Supports ?from=YYYY-MM-DD&to=YYYY-MM-DD.

#     Returns:
#         • Single-day KPIs (present_today, absent_today, leave_today, wfh, onsite)
#         • Range KPIs (present_range, leave_range, wfh_range, onsite_range)
#         • Avg working hours in range
#         • Early-off count in range
#         • Shift-wise present snapshot for END date:
#               shift_8_4, shift_10_7, shift_12_8, shift_4_12
#         • Trend list for chart
#     """

#     # -----------------------------
#     # 1. Parse date range
#     # -----------------------------
#     f = request.query_params.get("from")
#     t = request.query_params.get("to")

#     if f and t:
#         try:
#             start = date.fromisoformat(f)
#             end = date.fromisoformat(t)
#         except ValueError:
#             return Response({"detail": "from/to must be YYYY-MM-DD."}, status=400)

#         if end < start:
#             return Response({"detail": "to cannot be before from."}, status=400)

#         # Hard limit → max 120 days range
#         if (end - start).days > 120:
#             end = start + timedelta(days=120)
#     else:
#         end = date.today()
#         start = end - timedelta(days=6)

#     # -----------------------------
#     # 2. Employee scope (Admin / Lead)
#     # -----------------------------
#     emp_qs = employee_scope_for(request)
#     total_employees = emp_qs.count()

#     # -----------------------------
#     # 3. Single-day KPIs (end date)
#     # -----------------------------
#     present_today = Attendance.objects.filter(
#         date=end, status="Present", employee__in=emp_qs
#     ).count()

#     leave_today = Attendance.objects.filter(
#         date=end, status="Leave", employee__in=emp_qs
#     ).count()

#     absent_today = max(0, total_employees - (present_today + leave_today))

#     wfh = Attendance.objects.filter(
#         date=end, status="Present", mode="WFH", employee__in=emp_qs
#     ).count()

#     onsite = Attendance.objects.filter(
#         date=end, status="Present", mode="Onsite", employee__in=emp_qs
#     ).count()

#     leave_pending = LeaveRequest.objects.filter(
#         status="pending",
#         employee__in=emp_qs
#     ).count()

#     # -----------------------------
#     # 4. Range KPIs
#     # -----------------------------
#     att_range_qs = Attendance.objects.filter(
#         employee__in=emp_qs,
#         date__range=(start, end)
#     )

#     present_range = att_range_qs.filter(status="Present").count()
#     leave_range   = att_range_qs.filter(status="Leave").count()

#     wfh_range = att_range_qs.filter(status="Present", mode="WFH").count()
#     onsite_range = att_range_qs.filter(status="Present", mode="Onsite").count()

#     # -----------------------------
#     # 5. Average working hours in range
#     # -----------------------------
#     present_with_times = att_range_qs.filter(
#         status="Present",
#         check_in__isnull=False,
#         check_out__isnull=False
#     )

#     total_hours = 0.0
#     for a in present_with_times:
#         total_hours += float(a.hours_worked or 0)

#     avg_work_hours = round(
#         total_hours / present_with_times.count(), 2
#     ) if present_with_times.exists() else 0.0

#     # -----------------------------
#     # 6. Early-off count in range
#     # -----------------------------
#     early_off_count = EarlyOffRequest.objects.filter(
#         employee__in=emp_qs,
#         status="approved",
#         for_date__range=(start, end)
#     ).count()

#     # -----------------------------
#     # 6.5 SHIFT-WISE COUNTS (END DATE)
#     # Use assigned Employee.shift_start / shift_end
#     # and require Present + check_in is not null.
#     # -----------------------------
#     today_present_qs = Attendance.objects.filter(
#         date=end,
#         status="Present",
#         employee__in=emp_qs,
#         check_in__isnull=False,
#     )

#     # Shift windows in local hours: [start, end)
#     SHIFT_WINDOWS = [
#         ("shift_8_4",  8, 10),   # 8am–4pm → checked in between 08:00–<10:00
#         ("shift_10_7", 10, 12),  # 10am–7pm → 10:00–<12:00
#         ("shift_12_8", 12, 16),  # 12pm–8pm → 12:00–<16:00
#         ("shift_4_12", 16, 24),  # 4pm–12am → 16:00–<24:00
#     ]

#     shift_counts = {key: 0 for (key, _, _) in SHIFT_WINDOWS}

#     for att in today_present_qs:
#         if not att.check_in:
#             continue

#         # convert to local timezone if aware
#         ci = att.check_in
#         ci_local = timezone.localtime(ci) if timezone.is_aware(ci) else ci
#         h = ci_local.hour

#         for key, start_h, end_h in SHIFT_WINDOWS:
#             if start_h <= h < end_h:
#                 shift_counts[key] += 1
#                 break

#     shift_8_4  = shift_counts["shift_8_4"]
#     shift_10_7 = shift_counts["shift_10_7"]
#     shift_12_8 = shift_counts["shift_12_8"]
#     shift_4_12 = shift_counts["shift_4_12"]

#     # -----------------------------
#     # 7. Trend per day for charts
#     # -----------------------------
#     daily_agg = {
#         d['date']: d
#         for d in att_range_qs.values('date').annotate(
#             present=Count('id', filter=Q(status="Present")),
#             leave=Count('id',   filter=Q(status="Leave")),
#         )
#     }

#     trend = []
#     cursor = start
#     while cursor <= end:
#         obj = daily_agg.get(cursor, {"present": 0, "leave": 0})
#         trend.append({
#             "date": cursor.isoformat(),
#             "present": int(obj["present"]),
#             "leave": int(obj["leave"]),
#             "total": total_employees,
#         })
#         cursor += timedelta(days=1)

#     # -----------------------------
#     # 8. Response
#     # -----------------------------
#     return Response({
#         "total_employees": total_employees,

#         "present_today": present_today,
#         "absent_today":  absent_today,
#         "leave_today":   leave_today,
#         "leave_pending": leave_pending,
#         "wfh":           wfh,
#         "onsite":        onsite,

#         "present_range": present_range,
#         "leave_range":   leave_range,
#         "wfh_range":     wfh_range,
#         "onsite_range":  onsite_range,
#         "avg_work_hours": avg_work_hours,
#         "early_off_count": early_off_count,

#         "shift_8_4":  shift_8_4,
#         "shift_10_7": shift_10_7,
#         "shift_12_8": shift_12_8,
#         "shift_4_12": shift_4_12,

#         "trend": trend,
#         "range": {
#             "from": start.isoformat(),
#             "to":   end.isoformat(),
#         },
#     })
# # ---------- EMPLOYEE APIs ----------

# def _get_employee(user) -> Employee:
#     emp = get_object_or_404(Employee, user=user)
#     _auto_topup_leave_balance(emp)  # ✅ ensure balance is fresh on each self-API
#     return emp

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def me_profile(request):
#     emp = _get_employee(request.user)
#     return Response(EmployeeProfileSerializer(emp).data)
# def _parse_range_for_shift(request):
#     """Use the same logic as _parse_range, but tiny wrapper for clarity."""
#     f = parse_date(request.GET.get("from") or "")
#     t = parse_date(request.GET.get("to") or "")
#     today = timezone.localdate()
#     f = f or today
#     t = t or today
#     if t < f:
#         t = f
#     if (t - f).days > 120:
#         t = f + timedelta(days=120)
#     return f, t


# @api_view(["GET"])
# @permission_classes([IsAdminOrTeamLead])
# def dashboard_shift_stats(request):
#     """
#     GET /api/dashboard-shift-stats/?from=YYYY-MM-DD&to=YYYY-MM-DD&team=TCP&team=SEO

#     Uses the END date of the range as the "today" snapshot and returns:
#         shift_8_4, shift_10_7, shift_12_8, shift_4_12
#     """
#     # 1) parse range → we'll use 'end' as snapshot date
#     start, end = _parse_range_for_shift(request)

#     # 2) scope employees by role + ?team
#     emp_qs = employee_scope_for(request)

#     # 3) Present with check_in on END date
#     today_present_qs = Attendance.objects.filter(
#         date=end,
#         status="Present",
#         employee__in=emp_qs,
#         check_in__isnull=False,
#     )

#     # 4) Same shift windows as dashboard_stats
#     SHIFT_WINDOWS = [
#         ("shift_8_4",  8, 10),
#         ("shift_10_7", 10, 12),
#         ("shift_12_8", 12, 16),
#         ("shift_4_12", 16, 24),
#     ]

#     shift_counts = {key: 0 for (key, _, _) in SHIFT_WINDOWS}

#     for att in today_present_qs:
#         ci = att.check_in
#         if not ci:
#             continue
#         ci_local = timezone.localtime(ci) if timezone.is_aware(ci) else ci
#         h = ci_local.hour

#         for key, start_h, end_h in SHIFT_WINDOWS:
#             if start_h <= h < end_h:
#                 shift_counts[key] += 1
#                 break

#     return Response({
#         "date": end.isoformat(),
#         "shift_8_4":  shift_counts["shift_8_4"],
#         "shift_10_7": shift_counts["shift_10_7"],
#         "shift_12_8": shift_counts["shift_12_8"],
#         "shift_4_12": shift_counts["shift_4_12"],
#     }, status=200)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def check_in(request):
#     emp = _get_employee(request.user)

#     # If there’s an old open shift hanging around, auto-close it (existing behavior)
#     open_att = _open_attendance(emp)
#     if open_att:
#         now = timezone.now()
#         age = now - open_att.check_in if open_att.check_in else timedelta(0)
#         if age > timedelta(hours=STALE_OPEN_MAX_HOURS):
#             _force_close_stale(open_att, max_hours=STALE_OPEN_MAX_HOURS)
#         else:
#             return Response(
#                 {
#                     "detail": (
#                         f"You still have an open shift for {open_att.date.isoformat()} "
#                         "that has not been checked out. Please check out first."
#                     ),
#                     "open_shift_date": open_att.date.isoformat(),
#                     "open_shift_check_in": open_att.check_in.isoformat() if open_att.check_in else None,
#                 },
#                 status=409,
#             )

#     mode = (request.data.get("mode") or "").strip()
#     if mode not in ["WFH", "Onsite"]:
#         return Response({"detail": "mode must be 'WFH' or 'Onsite'."}, status=400)

#     # FLEX SHIFT: no fixed start time, no late/no-late tags, no minutes_late math
#     today = timezone.localdate()
#     now = timezone.now()

#     obj, _ = Attendance.objects.update_or_create(
#         employee=emp,
#         date=today,
#         defaults={
#             "status": "Present",
#             "mode": mode,
#             "check_in": now,
#             "minutes_late": 0,     # always 0 in flex model
#             "tag": "Present",            # keep compact 'normal' tag if you want, or set None
#         }
#     )
#     return Response(AttendanceSerializer(obj).data)




# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def my_stats(request):
#     emp = _get_employee(request.user)
#     days = 30
#     end = date.today()
#     start = end - timedelta(days=days - 1)
#     qs = Attendance.objects.filter(employee=emp, date__range=(start, end))
#     by_date = {a.date: a for a in qs}
#     present = leave = absent = 0
#     cur = start
#     while cur <= end:
#         a = by_date.get(cur)
#         if a:
#             if a.status == "Present":
#                 present += 1
#             elif a.status == "Leave":
#                 leave += 1
#             else:
#                 absent += 1
#         else:
#             absent += 1
#         cur += timedelta(days=1)
#     upcoming = LeaveRequest.objects.filter(
#         employee=emp, status='approved', start_date__gte=date.today()
#     ).order_by('start_date').first()
#     today_row = Attendance.objects.filter(employee=emp, date=date.today()).first()
#     on_leave_today = LeaveRequest.objects.filter(
#         employee=emp, status='approved', start_date__lte=date.today(), end_date__gte=date.today()
#     ).exists()
#     today_status = (
#         today_row.status if today_row else ("Leave" if on_leave_today else "None")
#     )
#     return Response({
#         "leave_balance": emp.leave_balance,
#         "present_days": present,
#         "leave_days": leave,
#         "absent_days": absent,
#         "today_status": today_status,
#         "upcoming_leave": {
#             "start_date": upcoming.start_date.isoformat(),
#             "end_date": upcoming.end_date.isoformat(),
#             "reason": upcoming.reason,
#         } if upcoming else None
#     })

# @api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated])
# def my_leaves(request):
#     emp = _get_employee(request.user)

#     # ---------- GET: list my own leaves ----------
#     if request.method == 'GET':
#         qs = LeaveRequest.objects.filter(employee=emp).order_by('-id')
#         return Response(LeaveRequestSerializer(qs, many=True).data)

#     # ---------- POST: create new leave ----------
#     start_date = request.data.get('start_date')
#     end_date   = request.data.get('end_date')
#     leave_type = (request.data.get('leave_type') or 'casual').strip().lower()
#     reason     = (request.data.get('reason') or '').strip()
#     peer_note  = (request.data.get('peer_note') or '').strip()

#     if not (start_date and end_date):
#         return Response({"detail": "start_date and end_date are required."}, status=400)

#     try:
#         s = date.fromisoformat(start_date)
#         e = date.fromisoformat(end_date)
#     except ValueError:
#         return Response({"detail": "Dates must be YYYY-MM-DD."}, status=400)

#     if e < s:
#         return Response({"detail": "end_date cannot be before start_date."}, status=400)

#     # Validate leave_type against model choices
#     valid_types = {c[0] for c in LeaveRequest.LEAVE_TYPES}
#     if leave_type not in valid_types:
#         return Response({"detail": f"leave_type must be one of {sorted(valid_types)}."}, status=400)

#     # Disallow overlap with existing pending/approved requests
#     overlap = LeaveRequest.objects.filter(
#         employee=emp,
#         end_date__gte=s,
#         start_date__lte=e,
#         status__in=['pending', 'approved'],
#     ).exists()
#     if overlap:
#         return Response({"detail": "Requested range overlaps an existing request."}, status=400)

#     days_needed = (e - s).days + 1

#     # Which leave types consume balance
#     consumes_balance = leave_type in {'annual', 'casual', 'sick', 'comp'}
#     if consumes_balance and emp.leave_balance < days_needed:
#         return Response({"detail": "Insufficient leave balance."}, status=400)

#     # ---------- Policy / notice window ----------
#     settings = PolicySettings.get()
#     now = timezone.now()
#     today = timezone.localdate()

#     notice_met = True
#     if leave_type == 'sick':
#         shift_start_naive = datetime.combine(s, emp.shift_start)
#         try:
#             shift_start_dt = timezone.make_aware(
#                 shift_start_naive, timezone.get_current_timezone()
#             )
#         except Exception:
#             shift_start_dt = shift_start_naive
#         notice_met = now <= (shift_start_dt - timedelta(hours=settings.notice_sick_hours))
    


#     elif leave_type == 'casual':
#         notice_met = (s - today) >= timedelta(hours=settings.notice_casual_hours)

#     elif leave_type == 'annual':
#         needed_days = (
#             settings.notice_annual_long_days
#             if days_needed > 10
#             else settings.notice_annual_short_days
#         )
#         notice_met = (s - today).days >= needed_days

#     elif leave_type == 'comp':
#         notice_met = (s - today).days >= settings.notice_comp_days

#     elif leave_type == 'wfh':
#         notice_met = (s - today).days >= settings.wfh_prior_days

#     # ---------- SPECIAL CASE: admin self-leave ----------
#     # "Admin" in your app = staff & NOT a team lead
#     is_admin_self = request.user.is_staff and not hasattr(request.user, "team_lead")

#     if is_admin_self:
#         # Admin leaves should just be documented/auto-approved.
#         status_val = "approved"
#         step_val = "done"
#     else:
#         # Employees: normal workflow → lead → admin
#         status_val = "pending"
#         step_val = "lead"

#     # Create object
#     obj = LeaveRequest.objects.create(
#         employee=emp,
#         start_date=s,
#         end_date=e,
#         reason=reason,
#         leave_type=leave_type,
#         notice_met=notice_met,
#         status=status_val,
#         step=step_val,
#         peer_note=peer_note,
#     )

#     # ---------- Apply effects ----------
#     if is_admin_self:
#         # For admin: immediately apply the leave to Attendance + balances
#         try:
#             _apply_approved_leave(obj)
#         except serializers.ValidationError as e:
#             # Roll back if something goes wrong (e.g. type-specific balance)
#             obj.delete()
#             detail = e.detail[0] if isinstance(e.detail, list) else e.detail
#             return Response({"detail": str(detail)}, status=400)
#     else:
#         # For employees: keep your existing notification flow
#         try:
#             notify_admin_new_leave(obj)
#         except Exception:
#             pass

#     return Response(LeaveRequestSerializer(obj).data, status=201)

# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
# def my_leave_cancel(request, pk):
#     emp = _get_employee(request.user)
#     obj = get_object_or_404(LeaveRequest, pk=pk, employee=emp)
#     if obj.status != 'pending':
#         return Response({"detail": "Only pending leaves can be cancelled."}, status=400)
#     obj.delete()
#     return Response(status=204)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def me_dashboard(request):
#     emp = _get_employee(request.user)
#     today = date.today()

#     # profile
#     profile = {
#         "username": request.user.username,
#         "designation": getattr(emp, "designation", "") or "",
#         "join_date": getattr(emp, "join_date", None).isoformat() if getattr(emp, "join_date", None) else "",
#         "leave_balance": int(getattr(emp, "leave_balance", 0) or 0),
#         "team": emp.team.name if getattr(emp, "team_id", None) else "",
#     }

#     # today
#     today_row = Attendance.objects.filter(employee=emp, date=today).first()
#     on_leave_today = LeaveRequest.objects.filter(
#         employee=emp, status='approved', start_date__lte=today, end_date__gte=today
#     ).exists()
#     today_block = (
#         {"status": today_row.status, "mode": today_row.mode}
#         if today_row else
#         {"status": "Leave" if on_leave_today else "None", "mode": None}
#     )

#     # month counters
#     month_start = today.replace(day=1)
#     month_qs = Attendance.objects.filter(employee=emp, date__range=(month_start, today))
#     present_count = month_qs.filter(status="Present").count()
#     leave_count   = month_qs.filter(status="Leave").count()
#     elapsed_days  = (today - month_start).days + 1
#     absent_count  = max(0, elapsed_days - (present_count + leave_count))
#     wfh_count     = month_qs.filter(status="Present", mode="WFH").count()
#     onsite_count  = month_qs.filter(status="Present", mode="Onsite").count()

#     # pending leaves
#     pending_leaves = LeaveRequest.objects.filter(employee=emp, status='pending').count()

#     # trend (last 7 days)
#     days = 7
#     start = today - timedelta(days=days - 1)
#     by_date = {a.date: a for a in Attendance.objects.filter(employee=emp, date__range=(start, today))}

#     trend = []
#     cur = start
#     while cur <= today:
#         a = by_date.get(cur)
#         status = a.status if a else None
#         present = 1 if status == "Present" else 0
#         leave   = 1 if status == "Leave" else 0
#         absent  = 1 if status is None or status == "Absent" else 0
#         trend.append({
#             "date": cur.isoformat(),
#             "present": present,
#             "leave": leave,
#             "absent": absent,
#             "total": 1,
#         })
#         cur += timedelta(days=1)

#     # ✅ NEW: include any open shift (yesterday or today)
#     open_att = _open_attendance(emp)
#     open_shift = None
#     auto_closed_shift = None

#     if open_att:
#         open_shift = {
#             "id": open_att.id,
#             "date": open_att.date.isoformat(),
#             "check_in": open_att.check_in.isoformat() if open_att.check_in else None,
#             "mode": open_att.mode,
#         }
#     else:
#         # If no open shift, was something just auto-closed by the server?
#         now = timezone.now()
#         recent_acs = (Attendance.objects
#                       .filter(employee=emp, tag__icontains='acs')
#                       .order_by('-check_out')
#                       .first())
#         if recent_acs and recent_acs.check_out:
#             # consider “recent” as last 5 minutes; tweak if you like
#             if (now - recent_acs.check_out).total_seconds() <= 300:
#                 auto_closed_shift = {
#                     "id": recent_acs.id,
#                     "date": recent_acs.date.isoformat(),
#                     "check_in": recent_acs.check_in.isoformat() if recent_acs.check_in else None,
#                     "auto_closed_at": recent_acs.check_out.isoformat(),
#                     "capped_hours": STALE_OPEN_MAX_HOURS,  # helpful context for the UI
#                 }

#     return Response({
#         "profile": profile,
#         "today": today_block,
#         "month": {
#             "present": present_count, "absent": absent_count, "leave": leave_count,
#             "wfh": wfh_count, "onsite": onsite_count
#         },
#         "pending_leaves": pending_leaves,
#         "trend": trend,
#         "open_shift": open_shift,              # existing behavior
#         "auto_closed_shift": auto_closed_shift # ✅ NEW for the red banner
#     })
# class LeaveRequestUpdateAPIView(UpdateAPIView):
#     queryset = LeaveRequest.objects.all()
#     permission_classes = [IsAdminUser]

#     # writable serializer for PATCH
#     serializer_class = LeaveRequestStatusUpdateSerializer

#     def partial_update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         prev_status = instance.status
#         response = super().partial_update(request, *args, **kwargs)  # writes new status

#         instance.refresh_from_db()
#         if prev_status != "approved" and instance.status == "approved":
#             try:
#                 _apply_approved_leave(instance)
#             except serializers.ValidationError as e:
#                 instance.status = prev_status
#                 instance.save()
#                 detail = e.detail[0] if isinstance(e.detail, list) else e.detail
#                 return Response({"detail": str(detail)}, status=400)
#         return response
    
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def pre_notify_late(request):
#     emp = _get_employee(request.user)
#     target = date.today()  # or accept ?for=YYYY-MM-DD
#     PreNotice.objects.create(employee=emp, kind='late', for_date=target)
#     return Response({"ok": True, "for_date": target.isoformat()})

# # @api_view(['POST'])
# # @permission_classes([IsAuthenticated])
# # def check_out(request):
# #     emp = _get_employee(request.user)
# #     today = date.today()
# #     a = Attendance.objects.filter(employee=emp, date=today).first()
# #     if not a or not a.check_in:
# #         return Response({"detail":"No check-in found."}, status=400)

# #     settings = PolicySettings.get()
# #     now = timezone.now()
# #     a.check_out = now
# #     # Early-off logic
# #     min_hours = settings.min_daily_hours
# #     approved_early = EarlyOffRequest.objects.filter(employee=emp, for_date=today, status='approved').exists()
# #     if a.hours_worked < min_hours and not approved_early:
# #         a.tag = 'short_hours'
# #     elif a.hours_worked < min_hours and approved_early:
# #         a.tag = 'early_off_ok'
# #     a.save()
# #     return Response(AttendanceSerializer(a).data)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def check_out(request):
#     emp = _get_employee(request.user)

#     a = _open_attendance(emp)
#     if not a:
#         today = timezone.localdate()
#         existing = Attendance.objects.filter(employee=emp, date=today).first()
#         if existing and existing.check_out:
#             return Response({"detail": "You have already checked out for today."}, status=400)
#         return Response({"detail": "No open check-in to check out."}, status=400)

#     settings = PolicySettings.get()
#     now = timezone.now()

#     try:
#         a.check_out = now

#         # Keep cross-midnight tag for bookkeeping
#         if now.date() != a.date:
#             _append_tag(a, "cross_midnight")

#         # FLEX SHIFT: only enforce min hours (no relation to a start time)
#         delta_hours = 0.0
#         if a.check_in and a.check_out:
#             delta_hours = max(0.0, (a.check_out - a.check_in).total_seconds() / 3600.0)

#         min_hours = float(settings.min_daily_hours or 0)  # e.g., 8.0
#         approved_early = EarlyOffRequest.objects.filter(
#             employee=emp, for_date=a.date, status='approved'
#         ).exists()

#         if delta_hours < min_hours:
#             _append_tag(a, "early_off_ok" if approved_early else "short_hours")

#         a.save(update_fields=["check_out", "tag"])
#         return Response(AttendanceSerializer(a).data)

#     except Exception as e:
#         return Response({"detail": f"Checkout failed: {str(e)}"}, status=500)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def my_attendance(request):
#     emp = _get_employee(request.user)

#     from_str = request.query_params.get("from")
#     to_str   = request.query_params.get("to")

#     if from_str and to_str:
#         try:
#             start = date.fromisoformat(from_str)
#             end   = date.fromisoformat(to_str)
#         except ValueError:
#             return Response({"detail": "from/to must be YYYY-MM-DD."}, status=400)
#         if end < start:
#             return Response({"detail": "to cannot be before from."}, status=400)
#         if (end - start).days > 120:
#             end = start + timedelta(days=120)
#     else:
#         try:
#             days = int(request.query_params.get("days", 30))
#         except ValueError:
#             days = 30
#         days = max(1, min(days, 90))
#         end = date.today()
#         start = end - timedelta(days=days - 1)

#     qs = Attendance.objects.filter(employee=emp, date__range=(start, end))
#     by_date = {a.date: a for a in qs}

#     out = []
#     cur = start
#     while cur <= end:
#         a = by_date.get(cur)
#         if a:
#             out.append({
#                 "id": a.id,
#                 "date": cur.isoformat(),
#                 "status": a.status,
#                 "mode": a.mode,
#                 "check_in": a.check_in.isoformat() if getattr(a, "check_in", None) else None,
#                 "check_out": a.check_out.isoformat() if getattr(a, "check_out", None) else None,
#                 "minutes_late": getattr(a, "minutes_late", None),
#                 "tag": getattr(a, "tag", None),
#                 "hours_worked": getattr(a, "hours_worked", None),
#             })
#         else:
#             out.append({
#                 "id": None,
#                 "date": cur.isoformat(),
#                 "status": "Absent",
#                 "mode": None,
#                 "check_in": None,
#                 "check_out": None,
#                 "minutes_late": None,
#                 "tag": None,
#                 "hours_worked": None,
#             })
#         cur += timedelta(days=1)

#     return Response(out)



# # attendance/views.py
# from .models import PolicySettings, EarlyOffRequest
# from .serializers import EarlyOffRequestSerializer

# # --- Policy (GET) ---
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def policy_settings_get(request):
#     ps = PolicySettings.get()
#     return Response({
#         "grace_minutes": ps.grace_minutes,
#         "min_daily_hours": float(ps.min_daily_hours),
#         "late_notice_minutes": ps.late_notice_minutes,
#         "wfh_prior_days": ps.wfh_prior_days,
#         "notice_sick_hours": ps.notice_sick_hours,
#         "notice_casual_hours": ps.notice_casual_hours,
#         "notice_annual_short_days": ps.notice_annual_short_days,
#         "notice_annual_long_days": ps.notice_annual_long_days,
#         "notice_comp_days": ps.notice_comp_days,
#         # optionally add holidays/shifts if you have them
#     })

# # --- Early-off (employee self) ---
# @api_view(["GET","POST"])
# @permission_classes([IsAuthenticated])
# def earlyoff_list_create(request):
#     emp = _get_employee(request.user)
#     if request.method == "GET":
#         qs = EarlyOffRequest.objects.filter(employee=emp)
#         return Response(EarlyOffRequestSerializer(qs, many=True).data)

#     # POST
#     for_date = request.data.get("for_date")
#     reason = request.data.get("reason", "")
#     if not for_date:
#         return Response({"detail":"for_date is required."}, status=400)
#     try:
#         f = date.fromisoformat(for_date)
#     except ValueError:
#         return Response({"detail":"for_date must be YYYY-MM-DD."}, status=400)

#     obj = EarlyOffRequest.objects.create(employee=emp, for_date=f, reason=reason)

#     try:
#         notify_admin_new_earlyoff(obj)
#     except Exception:
#         pass

#     return Response(EarlyOffRequestSerializer(obj).data, status=201)


# @api_view(["GET"])
# @permission_classes([IsAdminOrTeamLead])
# def earlyoff_admin_list(request):
#     emp_scope = employee_scope_for(request)
#     qs = EarlyOffRequest.objects.select_related("employee","employee__user","employee__team") \
#                                 .filter(employee__in=emp_scope) \
#                                 .order_by("-id")

#     status_param = (request.query_params.get("status") or "").lower()
#     if status_param and status_param != "all":
#         qs = qs.filter(status=status_param)

#     f = request.query_params.get("from")
#     t = request.query_params.get("to")
#     if f: qs = qs.filter(for_date__gte=f)
#     if t: qs = qs.filter(for_date__lte=t)

#     q = (request.query_params.get("q") or "").strip()
#     if q:
#         from django.db.models import Q
#         qs = qs.filter(
#             Q(employee__user__username__icontains=q) |
#             Q(reason__icontains=q) |
#             Q(admin_note__icontains=q)
#         )

#     return Response(EarlyOffRequestSerializer(qs, many=True).data)

# @api_view(["PATCH"])
# @permission_classes([IsAdminOrTeamLead])
# def earlyoff_update(request, pk):
#     obj = get_object_or_404(
#         EarlyOffRequest.objects.select_related("employee__team", "employee__user"),
#         pk=pk
#     )

#     # object-level guard for leads
#     if not (request.user.is_staff and not hasattr(request.user, "team_lead")):
#         allowed = lead_allowed_team_names(request.user)
#         if not (obj.employee.team and obj.employee.team.name in allowed):
#             return Response({"detail": "Forbidden for this team."}, status=403)

#     status_val = request.data.get("status")
#     admin_note = request.data.get("admin_note", "")
#     if status_val not in {"approved", "rejected", "pending"}:
#         return Response({"detail": "status must be approved/rejected/pending"}, status=400)

#     obj.status = status_val
#     obj.admin_note = admin_note
#     obj.save()  # updated_at auto-updates

#     try:
#         notify_employee_earlyoff_decision(obj)
#     except Exception:
#         pass

#     return Response(EarlyOffRequestSerializer(obj).data, status=200)


# @api_view(['GET'])
# def get_leave_distribution(request):
#     user = request.user
#     employee = Employee.objects.get(user=user)

#     # Fetch total leaves used by the employee for each leave type
#     total_sick = LeaveRequest.objects.filter(employee=employee, leave_type='sick', status='approved').count()
#     total_casual = LeaveRequest.objects.filter(employee=employee, leave_type='casual', status='approved').count()
#     total_annual = LeaveRequest.objects.filter(employee=employee, leave_type='annual', status='approved').count()
#     total_comp = LeaveRequest.objects.filter(employee=employee, leave_type='comp', status='approved').count()

#     # Fetch remaining leave balance for each leave type
#     remaining_sick = employee.sick_leave_balance
#     remaining_casual = employee.casual_leave_balance
#     remaining_annual = employee.annual_leave_balance
#     remaining_comp = employee.comp_leave_balance

#     return Response({
#         'leave_types': {
#             'sick': {'used': total_sick, 'remaining': remaining_sick},
#             'casual': {'used': total_casual, 'remaining': remaining_casual},
#             'annual': {'used': total_annual, 'remaining': remaining_annual},
#             'comp': {'used': total_comp, 'remaining': remaining_comp},
#         }
#     })






# @api_view(["GET", "POST"])
# @permission_classes([IsAuthenticated])
# def my_attendance_corrections(request):
#     emp = _get_employee(request.user)

#     # ---------- GET: list my own corrections ----------
#     if request.method == "GET":
#         qs = AttendanceCorrection.objects.filter(employee=emp).order_by("-id")
#         return Response(AttendanceCorrectionSerializer(qs, many=True).data)

#     # ---------- POST: create new correction ----------
#     for_date = request.data.get("for_date")
#     want_in = request.data.get("want_check_in")    # "HH:MM" or ""
#     want_out = request.data.get("want_check_out")  # "HH:MM" or ""
#     reason = (request.data.get("reason") or "").strip()

#     if not for_date:
#         return Response({"detail": "for_date is required (YYYY-MM-DD)."}, status=400)
#     try:
#         d = date.fromisoformat(for_date)
#     except ValueError:
#         return Response({"detail": "for_date must be YYYY-MM-DD."}, status=400)

#     def parse_hhmm(v):
#         if not v:
#             return None
#         try:
#             return datetime.strptime(v, "%H:%M").time()
#         except ValueError:
#             return None

#     t_in = parse_hhmm(want_in)
#     t_out = parse_hhmm(want_out)

#     if not t_in and not t_out:
#         return Response(
#             {"detail": "Provide want_check_in and/or want_check_out in HH:MM."},
#             status=400,
#         )

#     # create as usual
#     obj = AttendanceCorrection.objects.create(
#         employee=emp,
#         for_date=d,
#         want_check_in=t_in,
#         want_check_out=t_out,
#         reason=reason,
#         status="pending",
#     )

#     # ---------- SPECIAL CASE: admin self-correction ----------
#     # "Admin" in your app = staff & NOT a team lead
#     is_admin_self = request.user.is_staff and not hasattr(request.user, "team_lead")

#     if is_admin_self:
#         # 1) mark as approved
#         obj.status = "approved"
#         obj.save(update_fields=["status"])

#         # 2) apply directly to Attendance (same logic as AttendanceCorrectionAdminUpdate)
#         att, _ = Attendance.objects.get_or_create(
#             employee=emp,
#             date=obj.for_date,
#             defaults={"status": "Present", "mode": "WFH"},
#         )

#         def to_dt(d_, t_):
#             if not t_:
#                 return None
#             try:
#                 if isinstance(t_, str):
#                     t_ = datetime.strptime(t_, "%H:%M").time()
#                 return timezone.make_aware(datetime.combine(d_, t_))
#             except Exception:
#                 return None

#         if obj.want_check_in:
#             att.check_in = to_dt(obj.for_date, obj.want_check_in)
#         if obj.want_check_out:
#             att.check_out = to_dt(obj.for_date, obj.want_check_out)

#         # mark as corrected present day
#         att.minutes_late = 0
#         att.tag = "corrected"
#         att.status = "Present"

#         # infer mode from [MODE:WFH] / [MODE:Onsite] in reason
#         mode_txt = None
#         m = re.search(r"\[MODE\s*:\s*(WFH|Onsite)\]", (obj.reason or ""), flags=re.I)
#         if m:
#             mode_txt = m.group(1).title()
#         if mode_txt in {"WFH", "Onsite"}:
#             att.mode = mode_txt

#         att.save(update_fields=["check_in", "check_out", "minutes_late", "tag", "status", "mode"])

#     # -------- response (same for admin & employee) --------
#     return Response(AttendanceCorrectionSerializer(obj).data, status=201)



# import re
# from rest_framework.generics import RetrieveUpdateAPIView
# from rest_framework.response import Response
# from rest_framework import serializers
# from django.utils import timezone
# from datetime import datetime
# from django.shortcuts import get_object_or_404


# class AttendanceCorrectionAdminUpdate(RetrieveUpdateAPIView):
#     permission_classes = [IsAdminOrTeamLead]
#     serializer_class = AttendanceCorrectionUpdateSerializer
#     queryset = AttendanceCorrection.objects.select_related("employee__team", "employee__user")

#     def check_object_permissions(self, request, obj):
#         # Admin (staff but NOT logging in as lead): allowed everywhere
#         if request.user.is_staff and not hasattr(request.user, "team_lead"):
#             return
#         # Team lead: only their teams
#         allowed = lead_allowed_team_names(request.user)
#         if obj.employee.team and obj.employee.team.name in allowed:
#             return
#         from rest_framework.exceptions import PermissionDenied
#         raise PermissionDenied("You cannot act on requests outside your teams.")

#     def partial_update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         prev = instance.status

#         resp = super().partial_update(request, *args, **kwargs)
#         instance.refresh_from_db()

#         if prev != "approved" and instance.status == "approved":
#             emp = instance.employee
#             att, _ = Attendance.objects.get_or_create(
#                 employee=emp,
#                 date=instance.for_date,
#                 defaults={"status": "Present", "mode": "WFH"},
#         )

#             def to_dt(d, t):
#                 if not t:
#                     return None
#                 try:
#                     if isinstance(t, str):
#                         t = datetime.strptime(t, "%H:%M").time()
#                     return timezone.make_aware(datetime.combine(d, t))
#                 except Exception:
#                     return None

#             if instance.want_check_in:
#                 att.check_in = to_dt(instance.for_date, instance.want_check_in)
#             if instance.want_check_out:
#                 att.check_out = to_dt(instance.for_date, instance.want_check_out)

#             # minutes late
#             att.minutes_late = 0
#             att.tag = "corrected"
#             att.status = "Present"

#             # infer mode from reason/admin_note
#             mode_txt = None
#             m = re.search(r"\[MODE\s*:\s*(WFH|Onsite)\]", (instance.reason or ""), flags=re.I)
#             if m:
#                 mode_txt = m.group(1).title()
#             else:
#                 m2 = re.search(r"\bmode\s*[:=]\s*(WFH|Onsite)\b", (instance.admin_note or ""), flags=re.I)
#                 if m2:
#                     mode_txt = m2.group(1).title()

#             if mode_txt in {"WFH", "Onsite"}:
#                 att.mode = mode_txt

#             att.save(update_fields=["check_in", "check_out", "minutes_late", "tag", "status", "mode"])

#         return resp



# # ---------- helper to apply approved times to Attendance ----------
# def _combine_local(d, t):
#     """date + time -> timezone-aware datetime"""
#     tz = timezone.get_current_timezone()
#     return timezone.make_aware(datetime.combine(d, t), tz)

# def _apply_to_attendance(employee, for_date, want_in=None, want_out=None):
#     att, _ = Attendance.objects.get_or_create(employee=employee, date=for_date)
#     if want_in:
#         att.check_in = _combine_local(for_date, want_in)
#     if want_out:
#         att.check_out = _combine_local(for_date, want_out)
#     att.save()
#     return att



# # ---------- ADMIN: list + approve/reject ----------
# class AttendanceCorrectionAdminList(ListAPIView):
#     permission_classes = [IsAdminOrTeamLead]
#     serializer_class = AttendanceCorrectionSerializer

#     def get_queryset(self):
#         emp_scope = employee_scope_for(self.request)
#         qs = AttendanceCorrection.objects.select_related("employee__user", "employee__team") \
#                                          .filter(employee__in=emp_scope) \
#                                          .order_by("-created_at")
#         status_param = (self.request.query_params.get("status") or "pending").lower()
#         if status_param in {"pending", "approved", "rejected"}:
#             qs = qs.filter(status=status_param)
#         return qs





# LeaveRequestListAPIView = LeaveRequestAdminList
# LeaveRequestUpdateAPIView = LeaveRequestAdminUpdate


# # views.py
# # from django.db.models import Q

# # from django.db import transaction
# # from datetime import timedelta
# # from rest_framework import serializers

# # which leave types consume balance & which field to deduct
# _CONSUMES_MAP = {
#     "sick":   "sick_leave_balance",
#     "casual": "casual_leave_balance",
#     "annual": "annual_leave_balance",
#     "comp":   "comp_leave_balance",
# }

# def _apply_approved_leave(req: LeaveRequest):
#     """
#     When a leave request is approved:
#       - auto-topup balance if needed (based on join_date)
#       - mark Attendance rows as 'Leave' (or 'Present' with mode='WFH' for WFH)
#       - deduct correct leave balance (skip for WFH)
#     """
#     emp = req.employee

#     # WFH doesn't consume leave balance and should be marked as Present with mode=WFH
#     if req.leave_type == 'wfh':
#         d = req.start_date
#         while d <= req.end_date:
#             Attendance.objects.update_or_create(
#                 employee=emp, date=d,
#                 defaults={"status": "Present", "mode": "WFH", "tag": "normal"}
#             )
#             d += timedelta(days=1)
#         return  # WFH doesn't need balance deduction

#     # For other leave types, deduct balance and mark as Leave
#     # ✅ make sure yearly top-ups are applied before checking/deducting
#     try:
#         _auto_topup_leave_balance(emp)
#     except Exception as e:
#         # If topup fails, log but continue (might be missing join_date)
#         pass

#     days = (req.end_date - req.start_date).days + 1

#     with transaction.atomic():
#         # Employee model only has 'leave_balance' field, use it for all leave types
#         cur = getattr(emp, "leave_balance", 0) or 0
#         if cur < days:
#             raise serializers.ValidationError(f"Insufficient leave balance. Required: {days}, Available: {cur}")
        
#         emp.leave_balance = cur - days
#         emp.save(update_fields=["leave_balance"])

#         # write attendance rows...
#         d = req.start_date
#         while d <= req.end_date:
#             try:
#                 Attendance.objects.update_or_create(
#                     employee=emp, date=d,
#                     defaults={"status": "Leave", "mode": None, "tag": "normal"}
#                 )
#             except Exception as e:
#                 # If attendance creation fails, log and continue
#                 # This shouldn't happen but handle gracefully
#                 pass
#             d += timedelta(days=1)
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def my_attendance_today(request):
#     emp = get_object_or_404(Employee, user=request.user)
#     d = timezone.localdate()  # today in local tz

#     att = Attendance.objects.filter(employee=emp, date=d).first()
#     if att:
#         return Response({
#             "id": att.id,
#             "date": d.isoformat(),
#             "status": att.status,
#             "mode": att.mode,
#             "check_in": att.check_in.isoformat() if att.check_in else None,
#             "check_out": att.check_out.isoformat() if att.check_out else None,
#             "minutes_late": getattr(att, "minutes_late", 0),
#             "tag": getattr(att, "tag", None),
#             "hours_worked": getattr(att, "hours_worked", 0),
#         })

#     on_leave = LeaveRequest.objects.filter(
#         employee=emp, status='approved',
#         start_date__lte=d, end_date__gte=d
#     ).exists()

#     return Response({
#         "id": None,
#         "date": d.isoformat(),
#         "status": "Leave" if on_leave else "Absent",
#         "mode": None,
#         "check_in": None,
#         "check_out": None,
#         "minutes_late": 0,
#         "tag": None,
#         "hours_worked": 0,
#     })

# # attendance/views.py
# from datetime import date, timedelta
# from django.db.models import Q, Count
# from rest_framework.generics import ListAPIView
# from rest_framework.permissions import IsAdminUser
# from .models import Employee,TeamLead
# from .serializers import EmployeeListSerializer


# class EmployeeListAPIView(ListAPIView):
#     """
#     Shared view for Admin & Team Leads
#     Shows WFH/Onsite counts + Pre-Notify Late flag
#     Works with ?from=YYYY-MM-DD&to=YYYY-MM-DD
#     """
#     serializer_class = EmployeeListSerializer
#     permission_classes = [IsAdminOrTeamLead]

#     def get_serializer_context(self):
#         ctx = super().get_serializer_context()
#         ctx["team_to_leads"] = _team_leads_map()

#         # Parse date range
#         f = parse_date(self.request.query_params.get("from") or "")
#         t = parse_date(self.request.query_params.get("to") or "")
#         today = date.today()
#         f = f or today
#         t = t or today
    
#         if t < f:
#             t = f
#         if (t - f).days > 120:
#             t = f + timedelta(days=120)

#         ctx["from_date"] = f
#         ctx["to_date"] = t
#         return ctx

#     def get_queryset(self):
#         f = parse_date(self.request.query_params.get("from") or "")
#         t = parse_date(self.request.query_params.get("to") or "")
#         today = date.today()
#         f = f or today
#         t = t or today
#         if t < f:
#             t = f
#         if (t - f).days > 120:
#             t = f + timedelta(days=120)

#         base_qs = employee_scope_for(self.request)

#         return (
#             base_qs.select_related("user", "team")
#             .annotate(
#                 wfh_count=Count(
#                     "attendances",
#                     filter=Q(
#                         attendances__status="Present",
#                         attendances__mode="WFH",
#                         attendances__date__range=(f, t),
#                     ),
#                 ),
#                 onsite_count=Count(
#                     "attendances",
#                     filter=Q(
#                         attendances__status="Present",
#                         attendances__mode="Onsite",
#                         attendances__date__range=(f, t),
#                     ),
#                 ),
#             )
#             .order_by("user__username")
#         )


# def lead_allowed_team_names(user):
#     tl = getattr(user, "team_lead", None)
#     if not tl:
#         return set()
#     return set(tl.teams.values_list("name", flat=True))

# @api_view(["GET"])
# @permission_classes([IsAdminOrTeamLead])
# def team_list(request):
#     # Admins (staff but NOT leads): see all
#     if request.user.is_staff and not hasattr(request.user, "team_lead"):
#         qs = Team.objects.all().order_by("name")
#     else:
#         # Leads: only their teams
#         allowed = lead_allowed_team_names(request.user)
#         qs = Team.objects.filter(name__in=allowed).order_by("name")
    
#     return Response(TeamSerializer(qs, many=True).data)




# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from django.utils import timezone
# from .permissions import IsAdminOrTeamLead
# from .serializers import LeaveRequestSerializer, LeaveLeadDecisionSerializer
# from .models import LeaveRequest, TeamLead

# def _lead_can_see(user, req):
#     tl = getattr(user, "team_lead", None)
#     if not tl or not req.employee.team:
#         return False
#     return tl.teams.filter(id=req.employee.team_id).exists()

# @api_view(["GET"])
# @permission_classes([IsAdminOrTeamLead])
# def lead_leave_list(request):
#     qs = LeaveRequest.objects.select_related("employee__team","employee__user") \
#                              .order_by("-created_at")
#     if request.user.is_staff and not hasattr(request.user, "team_lead"):
#         step = (request.query_params.get("step") or "lead").lower()
#         if step == "lead":
#             qs = qs.filter(step="lead")
#     else:
#         team_ids = request.user.team_lead.teams.values_list("id", flat=True)
#         qs = qs.filter(step="lead", employee__team_id__in=team_ids)

#     q = (request.query_params.get("q") or "").strip()
#     if q:
#         from django.db.models import Q
#         qs = qs.filter(
#             Q(employee__user__username__icontains=q) |
#             Q(reason__icontains=q) |
#             Q(peer_note__icontains=q)
#         )

#     return Response(LeaveRequestSerializer(qs, many=True).data)

# @api_view(["PATCH"])
# @permission_classes([IsAdminOrTeamLead])
# def lead_leave_update(request, pk):
#     """Lead approves/rejects; on approve -> admin step; on reject -> final rejected."""
#     obj = get_object_or_404(LeaveRequest.objects.select_related("employee__team","employee__user"), pk=pk)

#     # only allow when still at lead step
#     if obj.step != "lead":
#         return Response({"detail":"This request is not awaiting lead review."}, status=400)

#     # object-level guard: must be that team's lead unless admin
#     if not (request.user.is_staff and not hasattr(request.user, "team_lead")):
#         if not _lead_can_see(request.user, obj):
#             return Response({"detail":"Forbidden for this team."}, status=403)

#     ser = LeaveLeadDecisionSerializer(obj, data=request.data, partial=True)
#     ser.is_valid(raise_exception=True)

#     decision = ser.validated_data.get("lead_decision")
#     note     = ser.validated_data.get("lead_note", "")

#     if decision not in {"approved","rejected"}:
#         return Response({"detail":"lead_decision must be approved or rejected."}, status=400)

#     obj.lead_decision   = decision
#     obj.lead_note       = note
#     obj.lead_decided_by = request.user
#     obj.lead_decided_at = timezone.now()

#     if decision == "approved":
#         obj.step   = "admin"     # move to admin queue
#         obj.status = "pending"   # still not final
#         # TODO: notify admins here if you have a mailer
#     else:
#         obj.step   = "done"
#         obj.status = "rejected"  # final
#         # notify employee of rejection if you like

#     obj.save()
#     return Response(LeaveRequestSerializer(obj).data)




# # views.py
# from datetime import date
# from django.utils.dateparse import parse_date
# from django.db.models import Sum, Case, When, IntegerField, Q
# from django.db.models.functions import Coalesce
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response

# from .models import Employee, Attendance  # adjust imports as needed

# def _range(request):
#   """Parse ?from=YYYY-MM-DD&to=YYYY-MM-DD, default both to today."""
#   f = parse_date(request.GET.get("from") or "") or date.today()
#   t = parse_date(request.GET.get("to") or "") or date.today()
#   return f, t

# def _employees_with_counts(qs, _from, _to):
#   return (
#     qs.select_related("user")
#       .annotate(
#         wfh_count=Coalesce(
#           Sum(
#             Case(
#               When(
#                 Q(attendance__date__gte=_from) &
#                 Q(attendance__date__lte=_to) &
#                 Q(attendance__status="present") &
#                 Q(attendance__mode="WFH"),
#                 then=1,
#               ),
#               default=0,
#               output_field=IntegerField(),
#             )
#           ),
#           0,
#         ),
#         onsite_count=Coalesce(
#           Sum(
#             Case(
#               When(
#                 Q(attendance__date__gte=_from) &
#                 Q(attendance__date__lte=_to) &
#                 Q(attendance__status="present") &
#                 Q(attendance__mode="ONSITE"),
#                 then=1,
#               ),
#               default=0,
#               output_field=IntegerField(),
#             )
#           ),
#           0,
#         ),
#       )
#       .order_by("user__username")
#   )

# @api_view(["GET"])
# @permission_classes([IsAdminOrTeamLead])
# def admin_employees(request):
#     """
#     GET /api/admin/employees/?from=YYYY-MM-DD&to=YYYY-MM-DD
#     Works for both Admin and Team Leads (scoped via employee_scope_for).
#     Now includes pre_notify_late boolean per employee:
#       - If single day, True when a PreNotice(kind='late') exists for that date.
#       - If a range, True when any day in the range has a late prenotice.
#     """
#     # --- date range + single-day
#     _from, _to = _parse_range(request)
#     single_day = (_from == _to)

#     # --- role-scoped employee queryset
#     emp_qs = employee_scope_for(request).select_related("user", "team")

#     # --- aggregate WFH/Onsite in the range
#     emp_qs = emp_qs.annotate(
#         wfh_count=Count(
#             "attendances",
#             filter=Q(
#                 attendances__status="Present",
#                 attendances__mode="WFH",
#                 attendances__date__range=(_from, _to),
#             ),
#         ),
#         onsite_count=Count(
#             "attendances",
#             filter=Q(
#                 attendances__status="Present",
#                 attendances__mode="Onsite",
#                 attendances__date__range=(_from, _to),
#             ),
#         ),
#     ).order_by("user__username")

#     # --- preload attendance rows for the grid (to show check-in/out & minutes)
#     atts = Attendance.objects.filter(
#         employee__in=emp_qs, date__range=(_from, _to)
#     ).only("id","employee_id","date","status","mode","check_in","check_out")

#     by_emp = defaultdict(list)
#     for a in atts:
#         by_emp[a.employee_id].append(a)

#     # --- ✅ preload prenotices (late) for the range
#     pre_late = PreNotice.objects.filter(
#         kind="late",
#         for_date__range=(_from, _to),
#         employee__in=emp_qs,
#     ).values_list("employee_id", "for_date")

#     pre_late_map = defaultdict(set)  # emp_id -> {dates}
#     for emp_id, fdate in pre_late:
#         pre_late_map[emp_id].add(fdate)

#     # --- also include team leads list (as you had)
#     leads_map = _team_leads_map()

#     # --- build response
#     data = []
#     for e in emp_qs:
#         rows = by_emp.get(e.id, [])

#         # minutes & averages from present rows
#         present_rows = [a for a in rows if a.status == "Present"]
#         total_minutes = sum(_minutes_from_attendance(a) for a in present_rows)
#         avg_work_minutes = int(round(total_minutes / len(present_rows))) if present_rows else 0

#         # details for a single day
#         checkin_time = checkout_time = None
#         work_minutes = None
#         if single_day:
#             todays = next((a for a in rows if a.date == _from), None)
#             if todays:
#                 checkin_time  = _fmt_hhmm(todays.check_in)
#                 checkout_time = _fmt_hhmm(todays.check_out)
#                 work_minutes  = _minutes_from_attendance(todays)

#         # ✅ pre-notify flag logic
#         if single_day:
#             pre_notify_late = _from in pre_late_map.get(e.id, set())
#         else:
#             pre_notify_late = bool(pre_late_map.get(e.id))

#         w = int(getattr(e, "wfh_count", 0) or 0)
#         o = int(getattr(e, "onsite_count", 0) or 0)

#         data.append({
#             "id": e.id,
#             "username": getattr(e.user, "username", "") or getattr(e, "username", ""),
#             "email": getattr(e.user, "email", "") or getattr(e, "email", ""),
#             "team_name": getattr(getattr(e, "team", None), "name", None),
#             "designation": getattr(e, "designation", ""),
#             "leave_balance": int(getattr(e, "leave_balance", 0) or 0),
#             "join_date": (getattr(e, "join_date", None) or "") and e.join_date.isoformat(),

#             "wfh_count": w,
#             "onsite_count": o,
#             "present": (w + o) > 0,

#             "checkin_time": checkin_time,
#             "checkout_time": checkout_time,
#             "work_minutes": work_minutes,
#             "avg_work_minutes": avg_work_minutes,

#             "team_leads": leads_map.get(e.team_id, []),

#             # ✅ NEW FIELD consumed by your React table
#             "pre_notify_late": pre_notify_late,
#         })

#     return Response(data, status=200)
# def _minutes_from_attendance(att: "Attendance") -> int:
#     """
#     Return minutes worked for a single Attendance row.
#     Prefer 'hours_worked' if provided (hours float), otherwise compute from
#     check_in/check_out when both exist.
#     """
#     mins = None
#     hw = getattr(att, "hours_worked", None)
#     if hw is not None:
#         try:
#             mins = int(round(float(hw) * 60))  # convert hours -> minutes
#         except Exception:
#             mins = None

#     if mins is None and getattr(att, "check_in", None) and getattr(att, "check_out", None):
#         secs = (att.check_out - att.check_in).total_seconds()
#         mins = max(0, int(round(secs / 60.0)))

#     return mins if mins is not None else 0

# def _fmt_hhmm(dt):
#     """Format an aware datetime as 'HH:MM' in the server’s TZ; return None if missing."""
#     if not dt:
#         return None
#     return dt.astimezone(timezone.get_current_timezone()).strftime("%H:%M")

# from django.utils import timezone
# def _parse_range(request):
#     f = parse_date(request.GET.get("from") or "")
#     t = parse_date(request.GET.get("to") or "")
#     today = timezone.localdate()
#     f = f or today
#     t = t or today
#     if t < f:
#         t = f
#     if (t - f).days > 120:
#         t = f + timedelta(days=120)
#     return f, t

# @api_view(["GET"])
# @permission_classes([IsAdminOrTeamLead])
# def lead_employees(request):
#     """
#     GET /api/lead/employees/?from=YYYY-MM-DD&to=YYYY-MM-DD
#     Returns employees under this lead/admin, with aggregated counts and new Pre-Notify Late flag.
#     """
#     _from, _to = _parse_range(request)
#     single_day = (_from == _to)

#     emp_qs = employee_scope_for(request).select_related("user", "team")

#     emp_qs = emp_qs.annotate(
#         wfh_count=Count(
#             "attendances",
#             filter=Q(
#                 attendances__status="Present",
#                 attendances__mode="WFH",
#                 attendances__date__range=(_from, _to),
#             ),
#         ),
#         onsite_count=Count(
#             "attendances",
#             filter=Q(
#                 attendances__status="Present",
#                 attendances__mode="Onsite",
#                 attendances__date__range=(_from, _to),
#             ),
#         ),
#     ).order_by("user__username")

#     # preload attendances
#     atts = Attendance.objects.filter(
#         employee__in=emp_qs, date__range=(_from, _to)
#     ).only("id", "employee_id", "date", "status", "mode", "check_in", "check_out")

#     # ✅ Preload prenotices (only late)
#     pre_late = PreNotice.objects.filter(
#         kind="late", for_date__range=(_from, _to), employee__in=emp_qs
#     ).values_list("employee_id", "for_date")

#     # build maps for quick lookup
#     by_emp_att = defaultdict(list)
#     for a in atts:
#         by_emp_att[a.employee_id].append(a)

#     pre_late_map = defaultdict(set)
#     for emp_id, fdate in pre_late:
#         pre_late_map[emp_id].add(fdate)

#     leads_map = _team_leads_map()
    
#     data = []
#     for e in emp_qs:
#         rows = by_emp_att.get(e.id, [])
#         present_rows = [a for a in rows if a.status == "Present"]
#         total_minutes = sum(_minutes_from_attendance(a) for a in present_rows)
#         avg_work_minutes = int(round(total_minutes / len(present_rows))) if present_rows else 0

#         checkin_time = checkout_time = None
#         work_minutes = None
#         pre_notify_late = False

#         if single_day:
#             todays = next((a for a in rows if a.date == _from), None)
#             if todays:
#                 checkin_time = _fmt_hhmm(todays.check_in)
#                 checkout_time = _fmt_hhmm(todays.check_out)
#                 work_minutes = _minutes_from_attendance(todays)
#             # ✅ Determine if pre-notified late on that date
#             pre_notify_late = _from in pre_late_map.get(e.id, set())
#         else:
#             # if range > 1 day, mark true if any day has prenotice late
#             pre_notify_late = bool(pre_late_map.get(e.id))

#         w = int(getattr(e, "wfh_count", 0) or 0)
#         o = int(getattr(e, "onsite_count", 0) or 0)

#         data.append({
#             "id": e.id,
#             "username": getattr(e.user, "username", "") or getattr(e, "username", ""),
#             "email": getattr(e.user, "email", "") or getattr(e, "email", ""),
#             "team_name": getattr(getattr(e, "team", None), "name", None),
#             "designation": getattr(e, "designation", ""),
#             "leave_balance": int(getattr(e, "leave_balance", 0) or 0),
#             "join_date": (getattr(e, "join_date", None) or "") and e.join_date.isoformat(),
#             "wfh_count": w,
#             "onsite_count": o,
#             "present": (w + o) > 0,
#             "checkin_time": checkin_time,
#             "checkout_time": checkout_time,
#             "work_minutes": work_minutes,
#             "avg_work_minutes": avg_work_minutes,
#             "team_leads": leads_map.get(e.team_id, []),
#             # ✅ NEW COLUMN: Pre-Notify Late
#             "pre_notify_late": pre_notify_late,
#         })

#     return Response(data)
# from collections import defaultdict
# from .models import TeamLead

# def _team_leads_map():
#     """team_id → [lead usernames]"""
#     mapping = defaultdict(list)
#     for tl in TeamLead.objects.select_related("user").prefetch_related("teams"):
#         uname = tl.user.username
#         for t in tl.teams.all():
#             mapping[t.id].append(uname)
#     return mapping



# @api_view(["GET"])
# @permission_classes([IsAdminOrTeamLead])
# def admin_employee_attendance(request):
#     """
#     GET /api/admin/employee-attendance/?employee_id=123&from=YYYY-MM-DD&to=YYYY-MM-DD
#     Returns a dense per-day list: one item per date in range.
#     """
#     emp_id = request.query_params.get("employee_id")
#     if not emp_id:
#         return Response({"detail": "employee_id is required."}, status=400)

#     # validate employee with role scoping
#     emp_qs = employee_scope_for(request)
#     emp = get_object_or_404(emp_qs, id=emp_id)

#     f, t = _parse_range(request)  # you already have this helper at bottom of views.py

#     # fetch attendance rows for that employee
#     qs = Attendance.objects.filter(employee=emp, date__range=(f, t))
#     by_date = {a.date: a for a in qs}

#     # build dense list day by day
#     out = []
#     cur = f
#     from datetime import timedelta
#     while cur <= t:
#         a = by_date.get(cur)
#         if a:
#             out.append({
#                 "date": cur.isoformat(),
#                 "status": a.status,
#                 "mode": a.mode,
#                 "check_in": a.check_in.isoformat() if a.check_in else None,
#                 "check_out": a.check_out.isoformat() if a.check_out else None,
#                 "hours_minutes": _minutes_from_attendance(a),
#             })
#         else:
#             out.append({
#                 "date": cur.isoformat(),
#                 "status": "Absent",
#                 "mode": None,
#                 "check_in": None,
#                 "check_out": None,
#                 "hours_minutes": 0,
#             })
#         cur += timedelta(days=1)

#     return Response(out, status=200)


# def _open_attendance(emp):
#     """
#     Return the most recent Attendance with check_in set and check_out missing,
#     *but only if* it's not older than 16 hours.
#     """
#     now = timezone.now()
#     sixteen_hours_ago = now - timedelta(hours=STALE_OPEN_MAX_HOURS)

#     att = (Attendance.objects
#            .filter(employee=emp, check_in__isnull=False, check_out__isnull=True)
#            .order_by('-date', '-check_in')
#            .first())

#     if not att:
#         return None

#     # Auto-close if stale → treat as closed
#     if att.check_in < sixteen_hours_ago:
#         _force_close_stale(att, max_hours=STALE_OPEN_MAX_HOURS)
#         return None

#     return att

# YEARLY_LEAVE_DAYS = 60  # your yearly entitlement per completed year


# def _auto_topup_leave_balance(emp):
#     """
#     Reset-style yearly leave:

#     - Each leave year (based on join_date anniversary) has a fresh
#       entitlement of YEARLY_LEAVE_DAYS (15).
#     - Old remaining balance from previous years is *ignored*.
#     - leave_balance = 15 - days_used_in_current_leave_year
#     """
#     if not emp.join_date:
#         return  # cannot compute without join date

#     today = timezone.localdate()
#     jd = emp.join_date

#     # Safety: future join_date → do nothing
#     if jd > today:
#         return

#     # -------- 1) Find current leave-year start --------
#     # Try this year's anniversary first
#     try:
#         this_year_anniv = jd.replace(year=today.year)
#     except ValueError:
#         # handle 29-Feb join date on non-leap years
#         if jd.month == 2 and jd.day == 29:
#             this_year_anniv = date(today.year, 2, 28)
#         else:
#             this_year_anniv = jd

#     if this_year_anniv > today:
#         # We are before the anniversary → current leave year started last year
#         try:
#             year_start = jd.replace(year=today.year - 1)
#         except ValueError:
#             if jd.month == 2 and jd.day == 29:
#                 year_start = date(today.year - 1, 2, 28)
#             else:
#                 year_start = jd
#     else:
#         # On/after this year's anniversary
#         year_start = this_year_anniv

#     # -------- 2) Count approved leave days in THIS leave year --------
#     consumes_types = {"sick", "casual", "annual", "comp"}

#     qs = LeaveRequest.objects.filter(
#         employee=emp,
#         status="approved",
#         leave_type__in=consumes_types,
#         start_date__gte=year_start,
#         start_date__lte=today,
#     )

#     days_used_this_year = 0
#     for lr in qs:
#         days_used_this_year += (lr.end_date - lr.start_date).days + 1

#     # -------- 3) Compute remaining balance for this year only --------
#     new_balance = YEARLY_LEAVE_DAYS - days_used_this_year
#     if new_balance < 0:
#         new_balance = 0

#     # Only save if changed
#     if emp.leave_balance != new_balance:
#         emp.leave_balance = new_balance
#         emp.save(update_fields=["leave_balance"])

# STALE_OPEN_MAX_HOURS = 9  # or fetch from PolicySettings if you add a field there

# MAX_TAG_LEN = 20

# TAG_ALIAS = {
#     "auto_close_stale": "acs",
#     "cross_midnight":   "cm",
#     "short_hours":      "sh",
#     "early_off_ok":     "eok",
#     "late_uninf":       "lu",
#     "late_inf":         "li",
#     "normal":           "Present",
# }

# def _append_tag(att, new_tag):
#     """
#     Append a compact tag to att.tag without exceeding DB limit (VARCHAR(20)).
#     - Uses TAG_ALIAS when available.
#     - De-dupes.
#     - Keeps only the last few tokens if needed to fit.
#     """
#     # normalize to alias
#     t = TAG_ALIAS.get(new_tag, new_tag)

#     # current tokens (already compacted if we’ve used this once)
#     cur = (att.tag or "").strip()
#     tokens = [tok for tok in cur.split("|") if tok] if cur else []

#     # de-dup
#     if t not in tokens:
#         tokens.append(t)

#     # ensure fits MAX_TAG_LEN by dropping oldest tokens
#     s = "|".join(tokens)
#     while len(s) > MAX_TAG_LEN and tokens:
#         tokens.pop(0)          # drop oldest
#         s = "|".join(tokens)

#     att.tag = s  # <= 20 chars


# def _force_close_stale(att, *, max_hours=STALE_OPEN_MAX_HOURS):
#     """
#     Force-close an open Attendance by capping its checkout time at
#     (check_in + max_hours). Adds 'auto_close_stale' tag and saves.
#     """
#     if not att.check_in or att.check_out:
#         return att  # nothing to do

#     cutoff = att.check_in + timedelta(hours=max_hours)
#     att.check_out = cutoff
#     _append_tag(att, "auto_close_stale")
#     # do NOT assign att.hours_worked here if it's a computed property
#     att.save(update_fields=["check_out", "tag"])
#     return att

# def _force_open_stale(att, *, min_hours=STALE_OPEN_MAX_HOURS):
#     """
#     Force-open a stale Attendance by clearing its checkout time
#     if (check_out - check_in) > min_hours. Adds 'auto_open_stale' tag and saves.
#     """


#     if not att.check_in or not att.check_out:
#         return att  # nothing to do

#     duration = att.check_out - att.check_in
#     if duration.total_seconds() >= (min_hours * 3600):
#         att.check_out = None
#         _append_tag(att, "auto_open_stale")
#         att.save(update_fields=["check_out", "tag"])
#     return att


# class LeaveRequestAdminUpdate(UpdateAPIView):
#     queryset = LeaveRequest.objects.all()   # ✅ REQUIRED
#     serializer_class = LeaveRequestSerializer
#     permission_classes = [IsAdminUser]
#     http_method_names = ["patch", "put"]

from rest_framework import status, serializers
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Employee
from .serializers import EmployeeCreateSerializer,TeamSerializer
from rest_framework.generics import ListAPIView
from .models import Employee
from .serializers import EmployeeCreateSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework.generics import DestroyAPIView
from .models import Employee
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets, permissions
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer
from rest_framework.generics import ListAPIView, UpdateAPIView
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Attendance, Employee
from django.utils import timezone
from datetime import date
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, date
from .models import Attendance, Employee, LeaveRequest
from datetime import date, timedelta
from .serializers import EarlyOffRequestSerializer, EarlyOffDecisionSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework.generics import ListAPIView, UpdateAPIView
from django.db.models import Q
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer, LeaveRequestStatusUpdateSerializer
from django.shortcuts import get_object_or_404
from rest_framework import status, serializers, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Team
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import LeaveAdminDecisionSerializer
from datetime import date, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import LeaveRequestSerializer, LeaveRequestStatusUpdateSerializer
from .permissions import IsAdminOrTeamLead
from datetime import date, timedelta
from django.db.models import Q, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .serializers import LeaveRequestCreateSerializer
from .models import Employee, Attendance, LeaveRequest
from django.db.models import Prefetch
from .models import Employee, Attendance, LeaveRequest
from .serializers import (
    EmployeeCreateSerializer,
    EmployeeProfileSerializer,
    AttendanceSerializer,
    LeaveRequestSerializer,
)
from rest_framework.exceptions import PermissionDenied 

from collections import defaultdict
# add this near the other imports
from .mailers import (
    notify_admin_new_leave,
    notify_employee_leave_decision,
    notify_admin_new_earlyoff,
    notify_employee_earlyoff_decision,
)

from .models import PreNotice
from django.utils import timezone
from .models import PolicySettings
from datetime import datetime, time as time_cls
from .models import EarlyOffRequest
from datetime import date, datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, UpdateAPIView

from .models import AttendanceCorrection, Employee
from .serializers import (
    AttendanceCorrectionSerializer,
    AttendanceCorrectionUpdateSerializer,
)
from datetime import datetime
from django.utils import timezone
from django.db import transaction
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView

from .models import AttendanceCorrection, Attendance
from .serializers import (
    AttendanceCorrectionSerializer,
    AttendanceCorrectionUpdateSerializer,
)

# attendance/views.py (top of file)

from datetime import date, datetime
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, UpdateAPIView

from .models import AttendanceCorrection, Attendance, Employee
from .serializers import (
    AttendanceCorrectionSerializer,
    AttendanceCorrectionUpdateSerializer,
)
# ---------- AUTH ----------


# ---- Shared helpers for team scoping ----
from urllib.parse import unquote
from .models import TeamLead, Employee

def parse_team_params(request):
    # supports team=A&team=B   OR   team[]=A&team[]=B   OR   team="A,B"
    raw = request.query_params.getlist("team") or request.query_params.getlist("team[]")
    if not raw:
        return []
    if len(raw) == 1 and "," in raw[0]:
        return [t.strip() for t in unquote(raw[0]).split(",") if t.strip()]
    return [t.strip() for t in raw if t.strip()]

def lead_allowed_team_names(user):
    """
    Return a set of team names this user leads.
    Empty set if user is not a lead.
    """
    tl = getattr(user, "team_lead", None)
    if not tl:
        return set()
    return set(tl.teams.values_list("name", flat=True))

def employee_scope_for(request):
    """
    Base Employee queryset limited by role:
      - Admin: all employees (optionally filtered by ?team=…)
      - Lead : only employees whose team is one of the lead's teams,
               further intersected with any provided ?team=… filter
    """
    qs = Employee.objects.all().select_related("user", "team")

    teams_param = set(parse_team_params(request))  # requested teams (names)
    if request.user.is_staff and not hasattr(request.user, "team_lead"):
        # Admin: optionally apply filter if provided
        if teams_param:
            qs = qs.filter(team__name__in=teams_param)
        return qs

    # Lead: intersect requested teams with allowed teams (or default to allowed)
    allowed = lead_allowed_team_names(request.user)
    if not allowed:
        return qs.none()
    effective = teams_param & allowed if teams_param else allowed
    return qs.filter(team__name__in=effective)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        request = self.context.get("request")
        user = self.user

        role = (request.data.get("role") if request else "").strip().lower()
        if role not in {"admin", "employee", "lead"}:
            raise serializers.ValidationError("Invalid or missing role.")

        if role == "admin":
            # must be staff AND not logging in via lead path (if you want strict split)
            if not user.is_staff:
                raise serializers.ValidationError("You are not authorized as admin.")
            # optional guard: forbid team leads from using the admin role
            if hasattr(user, "team_lead"):
                raise serializers.ValidationError("Team leads must use the 'lead' login.")
        elif role == "employee":
            if not Employee.objects.filter(user=user).exists():
                raise serializers.ValidationError("You are not registered as employee.")
        elif role == "lead":
            if not hasattr(user, "team_lead"):
                raise serializers.ValidationError("You are not a team lead.")

        data.update({
            "username": user.username,
            "role": role,
            "is_staff": user.is_staff,
            "is_team_lead": hasattr(user, "team_lead"),
            "lead_teams": list(user.team_lead.teams.values_list("name", flat=True)) if hasattr(user, "team_lead") else [],
        })
        return data
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer




# ---------- ADMIN APIs (unchanged behaviors) ----------

class CreateEmployeeAPIView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        serializer = EmployeeCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Employee created successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class DeleteEmployeeAPIView(DestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = Employee.objects.all()
    def delete(self, request, pk, *args, **kwargs):
        try:
            employee = self.get_object()
            user = employee.user
            employee.delete()
            user.delete()
            return Response({"message": "Employee deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LeaveRequestAdminList(ListAPIView):
    permission_classes = [IsAdminOrTeamLead]
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        qs = (LeaveRequest.objects
              .select_related('employee__user', 'employee__team')
              .order_by('-created_at'))

        # Scope by role + ?team
        emp_scope = employee_scope_for(self.request)
        qs = qs.filter(employee__in=emp_scope)

        # NEW: default to items awaiting admin
        stage = (self.request.query_params.get('stage') or 'admin').lower()
        if stage == 'admin':
            qs = qs.filter(step='admin', status='pending')
        elif stage == 'lead':
            qs = qs.filter(step='lead', status='pending')
        elif stage == 'done':
            qs = qs.filter(step='done')
        # else stage=all -> no extra filter

        # … keep your existing filters (status, type, date, q) …
        status_p = (self.request.query_params.get('status') or '').strip().lower()
        ltype  = (self.request.query_params.get('type') or '').strip().lower()
        dfrom  = self.request.query_params.get('from')
        dto    = self.request.query_params.get('to')
        q      = (self.request.query_params.get('q') or '').strip()

        if status_p and status_p != 'all':
            qs = qs.filter(status=status_p)
        if ltype and ltype != 'all':
            qs = qs.filter(leave_type=ltype)
        if dfrom:
            qs = qs.filter(start_date__gte=dfrom)
        if dto:
            qs = qs.filter(end_date__lte=dto)
        if q:
            from django.db.models import Q
            qs = qs.filter(
                Q(employee__user__username__icontains=q) |
                Q(reason__icontains=q) |
                Q(peer_note__icontains=q)
            )
        return qs
class LeaveRequestAdminUpdate(UpdateAPIView):
    permission_classes = [IsAdminUser]  # Only admins can approve/reject at admin step
    serializer_class = LeaveAdminDecisionSerializer
    queryset = LeaveRequest.objects.select_related("employee__team", "employee__user")

    def partial_update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()

            # Only allow admin to approve/reject requests at "admin" step
            if instance.step != "admin":
                return Response({"detail":"This request is not awaiting admin review."}, status=400)

            prev_status = instance.status
            
            # Validate serializer data first
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if not serializer.is_valid():
                return Response(serializer.errors, status=400)
            
            # Wrap everything in a transaction to ensure atomicity
            try:
                with transaction.atomic():
                    # Save the status and admin_note via serializer
                    serializer.save()
                    instance.refresh_from_db()
                    
                    if instance.status not in {"approved","rejected"}:
                        # Raise exception to prevent transaction commit
                        raise serializers.ValidationError("status must be approved or rejected.")

                    # mark final
                    instance.step = "done"
                    instance.save(update_fields=["step"])

                    if prev_status != "approved" and instance.status == "approved":
                        # This will raise an exception if it fails, causing transaction rollback
                        _apply_approved_leave(instance)
            except serializers.ValidationError as e:
                # Transaction rolled back automatically, refresh to get original state
                instance.refresh_from_db()
                detail = e.detail[0] if isinstance(e.detail, list) else str(e.detail)
                return Response({"detail": str(detail)}, status=400)
            except Exception as e:
                # Transaction rolled back automatically
                instance.refresh_from_db()
                return Response({"detail": f"Error applying leave: {str(e)}"}, status=500)

            # Refresh after successful transaction commit
            instance.refresh_from_db()
            
            # (Optional) notify employee of final decision:
            try:
                notify_employee_leave_decision(instance)
            except Exception:
                pass  # Don't fail if notification fails

            # Return updated serializer data
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=200)
            
        except Exception as e:
            # Catch any unexpected errors
            return Response({"detail": f"An error occurred: {str(e)}"}, status=500)

class LeaveRequestUpdateAPIView(UpdateAPIView):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAdminUser]
    


    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        prev_status = instance.status
        response = super().partial_update(request, *args, **kwargs)
        instance.refresh_from_db()
        if prev_status != "approved" and instance.status == "approved":
            try:
                _apply_approved_leave(instance)
            except serializers.ValidationError as e:
                instance.status = prev_status
                instance.save()
                detail = e.detail[0] if isinstance(e.detail, list) else e.detail
                return Response({"detail": str(detail)}, status=status.HTTP_400_BAD_REQUEST)
        return response

# ---------- SHARED DASHBOARD STATS ----------
from urllib.parse import unquote


# def _parse_team_params(request):
#     # support team=A&team=B and team[]=A&team[]=B and "TCP,The%20News"
#     raw = request.query_params.getlist("team")
#     if not raw:
#         raw = request.query_params.getlist("team[]")  # <-- handle Axios default

#     if not raw:
#         return []

#     if len(raw) == 1 and "," in raw[0]:
#         return [t.strip() for t in unquote(raw[0]).split(",") if t.strip()]

#     return [t.strip() for t in raw if t.strip()]


# make sure these are imported somewhere above in the file:
# from datetime import date, timedelta, time as time_cls
# from django.db.models import Q, Count
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from .permissions import IsAdminOrTeamLead
# from .models import Attendance, LeaveRequest, EarlyOffRequest
# from .views import employee_scope_for   # (only if employee_scope_for is in another module)


from datetime import date, timedelta, time as time_cls
from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

# attendance/views.py

from datetime import date, timedelta, time as time_cls
from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Attendance, LeaveRequest, EarlyOffRequest
from .permissions import IsAdminOrTeamLead



# attendance/views.py
from datetime import date, timedelta, time as time_cls
from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Attendance, LeaveRequest, EarlyOffRequest, Employee
from .permissions import IsAdminOrTeamLead


@api_view(['GET'])
@permission_classes([IsAdminOrTeamLead])
def dashboard_stats(request):
    """
    Admin: full scope (optionally filtered by ?team=…)
    Lead : only employees under their teams (intersected with ?team=…)
    Supports ?from=YYYY-MM-DD&to=YYYY-MM-DD.

    Returns:
        • Single-day KPIs (present_today, absent_today, leave_today, wfh, onsite)
        • Range KPIs (present_range, leave_range, wfh_range, onsite_range)
        • Avg working hours in range
        • Early-off count in range
        • Shift-wise present snapshot for END date:
              shift_8_4, shift_10_7, shift_12_8, shift_4_12
        • Trend list for chart
    """

    # -----------------------------
    # 1. Parse date range
    # -----------------------------
    f = request.query_params.get("from")
    t = request.query_params.get("to")

    if f and t:
        try:
            start = date.fromisoformat(f)
            end = date.fromisoformat(t)
        except ValueError:
            return Response({"detail": "from/to must be YYYY-MM-DD."}, status=400)

        if end < start:
            return Response({"detail": "to cannot be before from."}, status=400)

        # Hard limit → max 120 days range
        if (end - start).days > 120:
            end = start + timedelta(days=120)
    else:
        end = date.today()
        start = end - timedelta(days=6)

    # -----------------------------
    # 2. Employee scope (Admin / Lead)
    # -----------------------------
    emp_qs = employee_scope_for(request)
    total_employees = emp_qs.count()

    # -----------------------------
    # 3. Single-day KPIs (end date)
    # -----------------------------
    present_today = Attendance.objects.filter(
        date=end, status="Present", employee__in=emp_qs
    ).count()

    leave_today = Attendance.objects.filter(
        date=end, status="Leave", employee__in=emp_qs
    ).count()

    absent_today = max(0, total_employees - (present_today + leave_today))

    wfh = Attendance.objects.filter(
        date=end, status="Present", mode="WFH", employee__in=emp_qs
    ).count()

    onsite = Attendance.objects.filter(
        date=end, status="Present", mode="Onsite", employee__in=emp_qs
    ).count()

    leave_pending = LeaveRequest.objects.filter(
        status="pending",
        employee__in=emp_qs
    ).count()

    # -----------------------------
    # 4. Range KPIs
    # -----------------------------
    att_range_qs = Attendance.objects.filter(
        employee__in=emp_qs,
        date__range=(start, end)
    )

    present_range = att_range_qs.filter(status="Present").count()
    leave_range   = att_range_qs.filter(status="Leave").count()

    wfh_range = att_range_qs.filter(status="Present", mode="WFH").count()
    onsite_range = att_range_qs.filter(status="Present", mode="Onsite").count()

    # -----------------------------
    # 5. Average working hours in range
    # -----------------------------
    present_with_times = att_range_qs.filter(
        status="Present",
        check_in__isnull=False,
        check_out__isnull=False
    )

    total_hours = 0.0
    for a in present_with_times:
        total_hours += float(a.hours_worked or 0)

    avg_work_hours = round(
        total_hours / present_with_times.count(), 2
    ) if present_with_times.exists() else 0.0

    # -----------------------------
    # 6. Early-off count in range
    # -----------------------------
    early_off_count = EarlyOffRequest.objects.filter(
        employee__in=emp_qs,
        status="approved",
        for_date__range=(start, end)
    ).count()

    # -----------------------------
    # 6.5 SHIFT-WISE COUNTS (END DATE)
    # Use assigned Employee.shift_start / shift_end
    # and require Present + check_in is not null.
    # -----------------------------
    today_present_qs = Attendance.objects.filter(
        date=end,
        status="Present",
        employee__in=emp_qs,
        check_in__isnull=False,
    )

    # Shift windows in local hours: [start, end)
    SHIFT_WINDOWS = [
        ("shift_8_4",  8, 10),   # 8am–4pm → checked in between 08:00–<10:00
        ("shift_10_7", 10, 12),  # 10am–7pm → 10:00–<12:00
        ("shift_12_8", 12, 16),  # 12pm–8pm → 12:00–<16:00
        ("shift_4_12", 16, 24),  # 4pm–12am → 16:00–<24:00
    ]

    shift_counts = {key: 0 for (key, _, _) in SHIFT_WINDOWS}

    for att in today_present_qs:
        if not att.check_in:
            continue

        # convert to local timezone if aware
        ci = att.check_in
        ci_local = timezone.localtime(ci) if timezone.is_aware(ci) else ci
        h = ci_local.hour

        for key, start_h, end_h in SHIFT_WINDOWS:
            if start_h <= h < end_h:
                shift_counts[key] += 1
                break

    shift_8_4  = shift_counts["shift_8_4"]
    shift_10_7 = shift_counts["shift_10_7"]
    shift_12_8 = shift_counts["shift_12_8"]
    shift_4_12 = shift_counts["shift_4_12"]

    # -----------------------------
    # 7. Trend per day for charts
    # -----------------------------
    daily_agg = {
        d['date']: d
        for d in att_range_qs.values('date').annotate(
            present=Count('id', filter=Q(status="Present")),
            leave=Count('id',   filter=Q(status="Leave")),
        )
    }

    trend = []
    cursor = start
    while cursor <= end:
        obj = daily_agg.get(cursor, {"present": 0, "leave": 0})
        trend.append({
            "date": cursor.isoformat(),
            "present": int(obj["present"]),
            "leave": int(obj["leave"]),
            "total": total_employees,
        })
        cursor += timedelta(days=1)

    # -----------------------------
    # 8. Response
    # -----------------------------
    return Response({
        "total_employees": total_employees,

        "present_today": present_today,
        "absent_today":  absent_today,
        "leave_today":   leave_today,
        "leave_pending": leave_pending,
        "wfh":           wfh,
        "onsite":        onsite,

        "present_range": present_range,
        "leave_range":   leave_range,
        "wfh_range":     wfh_range,
        "onsite_range":  onsite_range,
        "avg_work_hours": avg_work_hours,
        "early_off_count": early_off_count,

        "shift_8_4":  shift_8_4,
        "shift_10_7": shift_10_7,
        "shift_12_8": shift_12_8,
        "shift_4_12": shift_4_12,

        "trend": trend,
        "range": {
            "from": start.isoformat(),
            "to":   end.isoformat(),
        },
    })
# ---------- EMPLOYEE APIs ----------

def _get_employee(user) -> Employee:
    emp = get_object_or_404(Employee, user=user)
    _auto_topup_leave_balance(emp)  # ✅ ensure balance is fresh on each self-API
    return emp

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_profile(request):
    emp = _get_employee(request.user)
    return Response(EmployeeProfileSerializer(emp).data)
def _parse_range_for_shift(request):
    """Use the same logic as _parse_range, but tiny wrapper for clarity."""
    f = parse_date(request.GET.get("from") or "")
    t = parse_date(request.GET.get("to") or "")
    today = timezone.localdate()
    f = f or today
    t = t or today
    if t < f:
        t = f
    if (t - f).days > 120:
        t = f + timedelta(days=120)
    return f, t


@api_view(["GET"])
@permission_classes([IsAdminOrTeamLead])
def dashboard_shift_stats(request):
    """
    GET /api/dashboard-shift-stats/?from=YYYY-MM-DD&to=YYYY-MM-DD&team=TCP&team=SEO

    Uses the END date of the range as the "today" snapshot and returns:
        shift_8_4, shift_10_7, shift_12_8, shift_4_12
    """
    # 1) parse range → we'll use 'end' as snapshot date
    start, end = _parse_range_for_shift(request)

    # 2) scope employees by role + ?team
    emp_qs = employee_scope_for(request)

    # 3) Present with check_in on END date
    today_present_qs = Attendance.objects.filter(
        date=end,
        status="Present",
        employee__in=emp_qs,
        check_in__isnull=False,
    )

    # 4) Same shift windows as dashboard_stats
    SHIFT_WINDOWS = [
        ("shift_8_4",  8, 10),
        ("shift_10_7", 10, 12),
        ("shift_12_8", 12, 16),
        ("shift_4_12", 16, 24),
    ]

    shift_counts = {key: 0 for (key, _, _) in SHIFT_WINDOWS}

    for att in today_present_qs:
        ci = att.check_in
        if not ci:
            continue
        ci_local = timezone.localtime(ci) if timezone.is_aware(ci) else ci
        h = ci_local.hour

        for key, start_h, end_h in SHIFT_WINDOWS:
            if start_h <= h < end_h:
                shift_counts[key] += 1
                break

    return Response({
        "date": end.isoformat(),
        "shift_8_4":  shift_counts["shift_8_4"],
        "shift_10_7": shift_counts["shift_10_7"],
        "shift_12_8": shift_counts["shift_12_8"],
        "shift_4_12": shift_counts["shift_4_12"],
    }, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_in(request):
    emp = _get_employee(request.user)

    # If there’s an old open shift hanging around, auto-close it (existing behavior)
    open_att = _open_attendance(emp)
    if open_att:
        now = timezone.now()
        age = now - open_att.check_in if open_att.check_in else timedelta(0)
        if age > timedelta(hours=STALE_OPEN_MAX_HOURS):
            _force_close_stale(open_att, max_hours=STALE_OPEN_MAX_HOURS)
        else:
            return Response(
                {
                    "detail": (
                        f"You still have an open shift for {open_att.date.isoformat()} "
                        "that has not been checked out. Please check out first."
                    ),
                    "open_shift_date": open_att.date.isoformat(),
                    "open_shift_check_in": open_att.check_in.isoformat() if open_att.check_in else None,
                },
                status=409,
            )

    mode = (request.data.get("mode") or "").strip()
    if mode not in ["WFH", "Onsite"]:
        return Response({"detail": "mode must be 'WFH' or 'Onsite'."}, status=400)

    # FLEX SHIFT: no fixed start time, no late/no-late tags, no minutes_late math
    today = timezone.localdate()
    now = timezone.now()

    obj, _ = Attendance.objects.update_or_create(
        employee=emp,
        date=today,
        defaults={
            "status": "Present",
            "mode": mode,
            "check_in": now,
            "minutes_late": 0,     # always 0 in flex model
            "tag": "normal",            # Use valid tag from TAG_CHOICES
        }
    )
    return Response(AttendanceSerializer(obj).data)






@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_stats(request):
    emp = _get_employee(request.user)
    days = 30
    end = date.today()
    start = end - timedelta(days=days - 1)
    qs = Attendance.objects.filter(employee=emp, date__range=(start, end))
    by_date = {a.date: a for a in qs}
    present = leave = absent = 0
    cur = start
    while cur <= end:
        a = by_date.get(cur)
        if a:
            if a.status == "Present":
                present += 1
            elif a.status == "Leave":
                leave += 1
            else:
                absent += 1
        else:
            absent += 1
        cur += timedelta(days=1)
    upcoming = LeaveRequest.objects.filter(
        employee=emp, status='approved', start_date__gte=date.today()
    ).order_by('start_date').first()
    today_row = Attendance.objects.filter(employee=emp, date=date.today()).first()
    on_leave_today = LeaveRequest.objects.filter(
        employee=emp, status='approved', start_date__lte=date.today(), end_date__gte=date.today()
    ).exists()
    today_status = (
        today_row.status if today_row else ("Leave" if on_leave_today else "None")
    )
    return Response({
        "leave_balance": emp.leave_balance,
        "present_days": present,
        "leave_days": leave,
        "absent_days": absent,
        "today_status": today_status,
        "upcoming_leave": {
            "start_date": upcoming.start_date.isoformat(),
            "end_date": upcoming.end_date.isoformat(),
            "reason": upcoming.reason,
        } if upcoming else None
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_leaves(request):
    emp = _get_employee(request.user)

    # ---------- GET: list my own leaves ----------
    if request.method == 'GET':
        qs = LeaveRequest.objects.filter(employee=emp).order_by('-id')
        return Response(LeaveRequestSerializer(qs, many=True).data)

    # ---------- POST: create new leave ----------
    start_date = request.data.get('start_date')
    end_date   = request.data.get('end_date')
    leave_type = (request.data.get('leave_type') or 'casual').strip().lower()
    reason     = (request.data.get('reason') or '').strip()
    peer_note  = (request.data.get('peer_note') or '').strip()

    if not (start_date and end_date):
        return Response({"detail": "start_date and end_date are required."}, status=400)

    try:
        s = date.fromisoformat(start_date)
        e = date.fromisoformat(end_date)
    except ValueError:
        return Response({"detail": "Dates must be YYYY-MM-DD."}, status=400)

    if e < s:
        return Response({"detail": "end_date cannot be before start_date."}, status=400)

    # Validate leave_type against model choices
    valid_types = {c[0] for c in LeaveRequest.LEAVE_TYPES}
    if leave_type not in valid_types:
        return Response({"detail": f"leave_type must be one of {sorted(valid_types)}."}, status=400)

    # Disallow overlap with existing pending/approved requests
    overlap = LeaveRequest.objects.filter(
        employee=emp,
        end_date__gte=s,
        start_date__lte=e,
        status__in=['pending', 'approved'],
    ).exists()
    if overlap:
        return Response({"detail": "Requested range overlaps an existing request."}, status=400)

    days_needed = (e - s).days + 1

    # Which leave types consume balance
    consumes_balance = leave_type in {'annual', 'casual', 'sick', 'comp'}
    if consumes_balance and emp.leave_balance < days_needed:
        return Response({"detail": "Insufficient leave balance."}, status=400)

    # ---------- Policy / notice window ----------
    settings = PolicySettings.get()
    now = timezone.now()
    today = timezone.localdate()

    notice_met = True
    if leave_type == 'sick':
        shift_start_naive = datetime.combine(s, emp.shift_start)
        try:
            shift_start_dt = timezone.make_aware(
                shift_start_naive, timezone.get_current_timezone()
            )
        except Exception:
            shift_start_dt = shift_start_naive
        notice_met = now <= (shift_start_dt - timedelta(hours=settings.notice_sick_hours))

    elif leave_type == 'casual':
        notice_met = (s - today) >= timedelta(hours=settings.notice_casual_hours)

    elif leave_type == 'annual':
        needed_days = (
            settings.notice_annual_long_days
            if days_needed > 10
            else settings.notice_annual_short_days
        )
        notice_met = (s - today).days >= needed_days

    elif leave_type == 'comp':
        notice_met = (s - today).days >= settings.notice_comp_days

    elif leave_type == 'wfh':
        notice_met = (s - today).days >= settings.wfh_prior_days

    # ---------- SPECIAL CASE: admin self-leave ----------
    # "Admin" in your app = staff & NOT a team lead
    is_admin_self = request.user.is_staff and not hasattr(request.user, "team_lead")

    if is_admin_self:
        # Admin leaves should just be documented/auto-approved.
        status_val = "approved"
        step_val = "done"
    else:
        # Employees: normal workflow → lead → admin
        status_val = "pending"
        step_val = "lead"

    # Create object
    obj = LeaveRequest.objects.create(
        employee=emp,
        start_date=s,
        end_date=e,
        reason=reason,
        leave_type=leave_type,
        notice_met=notice_met,
        status=status_val,
        step=step_val,
        peer_note=peer_note,
    )

    # ---------- Apply effects ----------
    if is_admin_self:
        # For admin: immediately apply the leave to Attendance + balances
        try:
            _apply_approved_leave(obj)
        except serializers.ValidationError as e:
            # Roll back if something goes wrong (e.g. type-specific balance)
            obj.delete()
            detail = e.detail[0] if isinstance(e.detail, list) else e.detail
            return Response({"detail": str(detail)}, status=400)
    else:
        # For employees: keep your existing notification flow
        try:
            notify_admin_new_leave(obj)
        except Exception:
            pass

    return Response(LeaveRequestSerializer(obj).data, status=201)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def my_leave_cancel(request, pk):
    emp = _get_employee(request.user)
    obj = get_object_or_404(LeaveRequest, pk=pk, employee=emp)
    if obj.status != 'pending':
        return Response({"detail": "Only pending leaves can be cancelled."}, status=400)
    obj.delete()
    return Response(status=204)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_dashboard(request):
    emp = _get_employee(request.user)
    today = date.today()

    # profile
    profile = {
        "username": request.user.username,
        "designation": getattr(emp, "designation", "") or "",
        "join_date": getattr(emp, "join_date", None).isoformat() if getattr(emp, "join_date", None) else "",
        "leave_balance": int(getattr(emp, "leave_balance", 0) or 0),
        "team": emp.team.name if getattr(emp, "team_id", None) else "",
    }

    # today
    today_row = Attendance.objects.filter(employee=emp, date=today).first()
    on_leave_today = LeaveRequest.objects.filter(
        employee=emp, status='approved', start_date__lte=today, end_date__gte=today
    ).exists()
    today_block = (
        {"status": today_row.status, "mode": today_row.mode}
        if today_row else
        {"status": "Leave" if on_leave_today else "None", "mode": None}
    )

    # month counters
    month_start = today.replace(day=1)
    month_qs = Attendance.objects.filter(employee=emp, date__range=(month_start, today))
    present_count = month_qs.filter(status="Present").count()
    leave_count   = month_qs.filter(status="Leave").count()
    elapsed_days  = (today - month_start).days + 1
    absent_count  = max(0, elapsed_days - (present_count + leave_count))
    wfh_count     = month_qs.filter(status="Present", mode="WFH").count()
    onsite_count  = month_qs.filter(status="Present", mode="Onsite").count()

    # pending leaves
    pending_leaves = LeaveRequest.objects.filter(employee=emp, status='pending').count()

    # trend (last 7 days)
    days = 7
    start = today - timedelta(days=days - 1)
    by_date = {a.date: a for a in Attendance.objects.filter(employee=emp, date__range=(start, today))}

    trend = []
    cur = start
    while cur <= today:
        a = by_date.get(cur)
        status = a.status if a else None
        present = 1 if status == "Present" else 0
        leave   = 1 if status == "Leave" else 0
        absent  = 1 if status is None or status == "Absent" else 0
        trend.append({
            "date": cur.isoformat(),
            "present": present,
            "leave": leave,
            "absent": absent,
            "total": 1,
        })
        cur += timedelta(days=1)

    # ✅ NEW: include any open shift (yesterday or today)
    open_att = _open_attendance(emp)
    open_shift = None
    auto_closed_shift = None

    if open_att:
        open_shift = {
            "id": open_att.id,
            "date": open_att.date.isoformat(),
            "check_in": open_att.check_in.isoformat() if open_att.check_in else None,
            "mode": open_att.mode,
        }
    else:
        # If no open shift, was something just auto-closed by the server?
        now = timezone.now()
        recent_acs = (Attendance.objects
                      .filter(employee=emp, tag__icontains='acs')
                      .order_by('-check_out')
                      .first())
        if recent_acs and recent_acs.check_out:
            # consider “recent” as last 5 minutes; tweak if you like
            if (now - recent_acs.check_out).total_seconds() <= 300:
                auto_closed_shift = {
                    "id": recent_acs.id,
                    "date": recent_acs.date.isoformat(),
                    "check_in": recent_acs.check_in.isoformat() if recent_acs.check_in else None,
                    "auto_closed_at": recent_acs.check_out.isoformat(),
                    "capped_hours": STALE_OPEN_MAX_HOURS,  # helpful context for the UI
                }

    return Response({
        "profile": profile,
        "today": today_block,
        "month": {
            "present": present_count, "absent": absent_count, "leave": leave_count,
            "wfh": wfh_count, "onsite": onsite_count
        },
        "pending_leaves": pending_leaves,
        "trend": trend,
        "open_shift": open_shift,              # existing behavior
        "auto_closed_shift": auto_closed_shift # ✅ NEW for the red banner
    })
class LeaveRequestUpdateAPIView(UpdateAPIView):
    queryset = LeaveRequest.objects.all()
    permission_classes = [IsAdminUser]

    # writable serializer for PATCH
    serializer_class = LeaveRequestStatusUpdateSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        prev_status = instance.status
        response = super().partial_update(request, *args, **kwargs)  # writes new status

        instance.refresh_from_db()
        if prev_status != "approved" and instance.status == "approved":
            try:
                _apply_approved_leave(instance)
            except serializers.ValidationError as e:
                instance.status = prev_status
                instance.save()
                detail = e.detail[0] if isinstance(e.detail, list) else e.detail
                return Response({"detail": str(detail)}, status=400)
        return response
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pre_notify_late(request):
    emp = _get_employee(request.user)
    target = date.today()  # or accept ?for=YYYY-MM-DD
    PreNotice.objects.create(employee=emp, kind='late', for_date=target)
    return Response({"ok": True, "for_date": target.isoformat()})

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def check_out(request):
#     emp = _get_employee(request.user)
#     today = date.today()
#     a = Attendance.objects.filter(employee=emp, date=today).first()
#     if not a or not a.check_in:
#         return Response({"detail":"No check-in found."}, status=400)

#     settings = PolicySettings.get()
#     now = timezone.now()
#     a.check_out = now
#     # Early-off logic
#     min_hours = settings.min_daily_hours
#     approved_early = EarlyOffRequest.objects.filter(employee=emp, for_date=today, status='approved').exists()
#     if a.hours_worked < min_hours and not approved_early:
#         a.tag = 'short_hours'
#     elif a.hours_worked < min_hours and approved_early:
#         a.tag = 'early_off_ok'
#     a.save()
#     return Response(AttendanceSerializer(a).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_out(request):
    emp = _get_employee(request.user)

    a = _open_attendance(emp)
    if not a:
        today = timezone.localdate()
        existing = Attendance.objects.filter(employee=emp, date=today).first()
        if existing and existing.check_out:
            return Response({"detail": "You have already checked out for today."}, status=400)
        return Response({"detail": "No open check-in to check out."}, status=400)

    settings = PolicySettings.get()
    now = timezone.now()

    try:
        a.check_out = now

        # Keep cross-midnight tag for bookkeeping
        if now.date() != a.date:
            _append_tag(a, "cross_midnight")

        # FLEX SHIFT: only enforce min hours (no relation to a start time)
        delta_hours = 0.0
        if a.check_in and a.check_out:
            delta_hours = max(0.0, (a.check_out - a.check_in).total_seconds() / 3600.0)

        min_hours = float(settings.min_daily_hours or 0)  # e.g., 8.0
        approved_early = EarlyOffRequest.objects.filter(
            employee=emp, for_date=a.date, status='approved'
        ).exists()

        if delta_hours < min_hours:
            _append_tag(a, "early_off_ok" if approved_early else "short_hours")

        a.save(update_fields=["check_out", "tag"])
        return Response(AttendanceSerializer(a).data)

    except Exception as e:
        return Response({"detail": f"Checkout failed: {str(e)}"}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_attendance(request):
    emp = _get_employee(request.user)

    from_str = request.query_params.get("from")
    to_str   = request.query_params.get("to")

    if from_str and to_str:
        try:
            start = date.fromisoformat(from_str)
            end   = date.fromisoformat(to_str)
        except ValueError:
            return Response({"detail": "from/to must be YYYY-MM-DD."}, status=400)
        if end < start:
            return Response({"detail": "to cannot be before from."}, status=400)
        if (end - start).days > 120:
            end = start + timedelta(days=120)
    else:
        try:
            days = int(request.query_params.get("days", 30))
        except ValueError:
            days = 30
        days = max(1, min(days, 90))
        end = date.today()
        start = end - timedelta(days=days - 1)

    qs = Attendance.objects.filter(employee=emp, date__range=(start, end))
    by_date = {a.date: a for a in qs}

    out = []
    cur = start
    while cur <= end:
        a = by_date.get(cur)
        if a:
            out.append({
                "id": a.id,
                "date": cur.isoformat(),
                "status": a.status,
                "mode": a.mode,
                "check_in": a.check_in.isoformat() if getattr(a, "check_in", None) else None,
                "check_out": a.check_out.isoformat() if getattr(a, "check_out", None) else None,
                "minutes_late": getattr(a, "minutes_late", None),
                "tag": getattr(a, "tag", None),
                "hours_worked": getattr(a, "hours_worked", None),
            })
        else:
            out.append({
                "id": None,
                "date": cur.isoformat(),
                "status": "Absent",
                "mode": None,
                "check_in": None,
                "check_out": None,
                "minutes_late": None,
                "tag": None,
                "hours_worked": None,
            })
        cur += timedelta(days=1)

    return Response(out)



# attendance/views.py
from .models import PolicySettings, EarlyOffRequest
from .serializers import EarlyOffRequestSerializer

# --- Policy (GET) ---
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def policy_settings_get(request):
    ps = PolicySettings.get()
    return Response({
        "grace_minutes": ps.grace_minutes,
        "min_daily_hours": float(ps.min_daily_hours),
        "late_notice_minutes": ps.late_notice_minutes,
        "wfh_prior_days": ps.wfh_prior_days,
        "notice_sick_hours": ps.notice_sick_hours,
        "notice_casual_hours": ps.notice_casual_hours,
        "notice_annual_short_days": ps.notice_annual_short_days,
        "notice_annual_long_days": ps.notice_annual_long_days,
        "notice_comp_days": ps.notice_comp_days,
        # optionally add holidays/shifts if you have them
    })

# --- Early-off (employee self) ---
@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
def earlyoff_list_create(request):
    emp = _get_employee(request.user)
    if request.method == "GET":
        qs = EarlyOffRequest.objects.filter(employee=emp)
        return Response(EarlyOffRequestSerializer(qs, many=True).data)

    # POST
    for_date = request.data.get("for_date")
    reason = request.data.get("reason", "")
    if not for_date:
        return Response({"detail":"for_date is required."}, status=400)
    try:
        f = date.fromisoformat(for_date)
    except ValueError:
        return Response({"detail":"for_date must be YYYY-MM-DD."}, status=400)

    obj = EarlyOffRequest.objects.create(employee=emp, for_date=f, reason=reason)

    try:
        notify_admin_new_earlyoff(obj)
    except Exception:
        pass

    return Response(EarlyOffRequestSerializer(obj).data, status=201)


@api_view(["GET"])
@permission_classes([IsAdminOrTeamLead])
def earlyoff_admin_list(request):
    emp_scope = employee_scope_for(request)
    qs = EarlyOffRequest.objects.select_related("employee","employee__user","employee__team") \
                                .filter(employee__in=emp_scope) \
                                .order_by("-id")

    status_param = (request.query_params.get("status") or "").lower()
    if status_param and status_param != "all":
        qs = qs.filter(status=status_param)

    f = request.query_params.get("from")
    t = request.query_params.get("to")
    if f: qs = qs.filter(for_date__gte=f)
    if t: qs = qs.filter(for_date__lte=t)

    q = (request.query_params.get("q") or "").strip()
    if q:
        from django.db.models import Q
        qs = qs.filter(
            Q(employee__user__username__icontains=q) |
            Q(reason__icontains=q) |
            Q(admin_note__icontains=q)
        )

    return Response(EarlyOffRequestSerializer(qs, many=True).data)

@api_view(["PATCH"])
@permission_classes([IsAdminOrTeamLead])
def earlyoff_update(request, pk):
    obj = get_object_or_404(
        EarlyOffRequest.objects.select_related("employee__team", "employee__user"),
        pk=pk
    )

    # object-level guard for leads
    if not (request.user.is_staff and not hasattr(request.user, "team_lead")):
        allowed = lead_allowed_team_names(request.user)
        if not (obj.employee.team and obj.employee.team.name in allowed):
            return Response({"detail": "Forbidden for this team."}, status=403)

    status_val = request.data.get("status")
    admin_note = request.data.get("admin_note", "")
    if status_val not in {"approved", "rejected", "pending"}:
        return Response({"detail": "status must be approved/rejected/pending"}, status=400)

    obj.status = status_val
    obj.admin_note = admin_note
    obj.save()  # updated_at auto-updates

    try:
        notify_employee_earlyoff_decision(obj)
    except Exception:
        pass

    return Response(EarlyOffRequestSerializer(obj).data, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leave_distribution(request):
    user = request.user
    employee = Employee.objects.get(user=user)

    # Fetch total leaves used by the employee for each leave type
    total_sick = LeaveRequest.objects.filter(employee=employee, leave_type='sick', status='approved').count()
    total_casual = LeaveRequest.objects.filter(employee=employee, leave_type='casual', status='approved').count()
    total_annual = LeaveRequest.objects.filter(employee=employee, leave_type='annual', status='approved').count()
    total_comp = LeaveRequest.objects.filter(employee=employee, leave_type='comp', status='approved').count()

    # Employee model only has 'leave_balance' field, not type-specific fields
    # Calculate remaining by subtracting used from total balance
    total_balance = getattr(employee, "leave_balance", 0) or 0
    total_used = total_sick + total_casual + total_annual + total_comp
    
    # For simplicity, show same remaining balance for all types
    # Or you can calculate per-type if you track it differently
    remaining = max(0, total_balance - total_used)

    return Response({
        'leave_types': {
            'sick': {'used': total_sick, 'remaining': remaining},
            'casual': {'used': total_casual, 'remaining': remaining},
            'annual': {'used': total_annual, 'remaining': remaining},
            'comp': {'used': total_comp, 'remaining': remaining},
        },
        'total_balance': total_balance,
        'total_used': total_used,
    })






@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def my_attendance_corrections(request):
    emp = _get_employee(request.user)

    # ---------- GET: list my own corrections ----------
    if request.method == "GET":
        qs = AttendanceCorrection.objects.filter(employee=emp).order_by("-id")
        return Response(AttendanceCorrectionSerializer(qs, many=True).data)

    # ---------- POST: create new correction ----------
    for_date = request.data.get("for_date")
    want_in = request.data.get("want_check_in")    # "HH:MM" or ""
    want_out = request.data.get("want_check_out")  # "HH:MM" or ""
    reason = (request.data.get("reason") or "").strip()

    if not for_date:
        return Response({"detail": "for_date is required (YYYY-MM-DD)."}, status=400)
    try:
        d = date.fromisoformat(for_date)
    except ValueError:
        return Response({"detail": "for_date must be YYYY-MM-DD."}, status=400)

    def parse_hhmm(v):
        if not v:
            return None
        try:
            return datetime.strptime(v, "%H:%M").time()
        except ValueError:
            return None

    t_in = parse_hhmm(want_in)
    t_out = parse_hhmm(want_out)

    if not t_in and not t_out:
        return Response(
            {"detail": "Provide want_check_in and/or want_check_out in HH:MM."},
            status=400,
        )

    # create as usual
    obj = AttendanceCorrection.objects.create(
        employee=emp,
        for_date=d,
        want_check_in=t_in,
        want_check_out=t_out,
        reason=reason,
        status="pending",
    )

    # ---------- SPECIAL CASE: admin self-correction ----------
    # "Admin" in your app = staff & NOT a team lead
    is_admin_self = request.user.is_staff and not hasattr(request.user, "team_lead")

    if is_admin_self:
        # 1) mark as approved
        obj.status = "approved"
        obj.save(update_fields=["status"])

        # 2) apply directly to Attendance (same logic as AttendanceCorrectionAdminUpdate)
        att, _ = Attendance.objects.get_or_create(
            employee=emp,
            date=obj.for_date,
            defaults={"status": "Present", "mode": "WFH"},
        )

        def to_dt(d_, t_):
            if not t_:
                return None
            try:
                if isinstance(t_, str):
                    t_ = datetime.strptime(t_, "%H:%M").time()
                return timezone.make_aware(datetime.combine(d_, t_))
            except Exception:
                return None

        if obj.want_check_in:
            att.check_in = to_dt(obj.for_date, obj.want_check_in)
        if obj.want_check_out:
            att.check_out = to_dt(obj.for_date, obj.want_check_out)

        # mark as corrected present day
        att.minutes_late = 0
        att.tag = "normal"  # Use valid tag from TAG_CHOICES
        att.status = "Present"

        # infer mode from [MODE:WFH] / [MODE:Onsite] in reason
        mode_txt = None
        m = re.search(r"\[MODE\s*:\s*(WFH|Onsite)\]", (obj.reason or ""), flags=re.I)
        if m:
            mode_txt = m.group(1).title()
        if mode_txt in {"WFH", "Onsite"}:
            att.mode = mode_txt

        att.save(update_fields=["check_in", "check_out", "minutes_late", "tag", "status", "mode"])

    # -------- response (same for admin & employee) --------
    return Response(AttendanceCorrectionSerializer(obj).data, status=201)



import re
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework import serializers
from django.utils import timezone
from datetime import datetime
from django.shortcuts import get_object_or_404


class AttendanceCorrectionAdminUpdate(RetrieveUpdateAPIView):
    permission_classes = [IsAdminOrTeamLead]
    serializer_class = AttendanceCorrectionUpdateSerializer
    queryset = AttendanceCorrection.objects.select_related("employee__team", "employee__user")

    def check_object_permissions(self, request, obj):
        # Admin (staff but NOT logging in as lead): allowed everywhere
        if request.user.is_staff and not hasattr(request.user, "team_lead"):
            return
        # Team lead: only their teams
        allowed = lead_allowed_team_names(request.user)
        if obj.employee.team and obj.employee.team.name in allowed:
            return
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("You cannot act on requests outside your teams.")

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        prev = instance.status

        resp = super().partial_update(request, *args, **kwargs)
        instance.refresh_from_db()

        if prev != "approved" and instance.status == "approved":
            emp = instance.employee
            att, _ = Attendance.objects.get_or_create(
                employee=emp,
                date=instance.for_date,
                defaults={"status": "Present", "mode": "WFH"},
        )

            def to_dt(d, t):
                if not t:
                    return None
                try:
                    if isinstance(t, str):
                        t = datetime.strptime(t, "%H:%M").time()
                    return timezone.make_aware(datetime.combine(d, t))
                except Exception:
                    return None

            if instance.want_check_in:
                att.check_in = to_dt(instance.for_date, instance.want_check_in)
            if instance.want_check_out:
                att.check_out = to_dt(instance.for_date, instance.want_check_out)

            # minutes late
            att.minutes_late = 0
            att.tag = "normal"  # Use valid tag from TAG_CHOICES
            att.status = "Present"

            # infer mode from reason/admin_note
            mode_txt = None
            m = re.search(r"\[MODE\s*:\s*(WFH|Onsite)\]", (instance.reason or ""), flags=re.I)
            if m:
                mode_txt = m.group(1).title()
            else:
                m2 = re.search(r"\bmode\s*[:=]\s*(WFH|Onsite)\b", (instance.admin_note or ""), flags=re.I)
                if m2:
                    mode_txt = m2.group(1).title()

            if mode_txt in {"WFH", "Onsite"}:
                att.mode = mode_txt

            att.save(update_fields=["check_in", "check_out", "minutes_late", "tag", "status", "mode"])

        return resp



# ---------- helper to apply approved times to Attendance ----------
def _combine_local(d, t):
    """date + time -> timezone-aware datetime"""
    tz = timezone.get_current_timezone()
    return timezone.make_aware(datetime.combine(d, t), tz)

def _apply_to_attendance(employee, for_date, want_in=None, want_out=None):
    att, _ = Attendance.objects.get_or_create(employee=employee, date=for_date)
    if want_in:
        att.check_in = _combine_local(for_date, want_in)
    if want_out:
        att.check_out = _combine_local(for_date, want_out)
    att.save()
    return att



# ---------- ADMIN: list + approve/reject ----------
class AttendanceCorrectionAdminList(ListAPIView):
    permission_classes = [IsAdminOrTeamLead]
    serializer_class = AttendanceCorrectionSerializer

    def get_queryset(self):
        emp_scope = employee_scope_for(self.request)
        qs = AttendanceCorrection.objects.select_related("employee__user", "employee__team") \
                                         .filter(employee__in=emp_scope) \
                                         .order_by("-created_at")
        status_param = (self.request.query_params.get("status") or "pending").lower()
        if status_param in {"pending", "approved", "rejected"}:
            qs = qs.filter(status=status_param)
        return qs





LeaveRequestListAPIView = LeaveRequestAdminList
LeaveRequestUpdateAPIView = LeaveRequestAdminUpdate


# views.py
# from django.db.models import Q

# from django.db import transaction
# from datetime import timedelta
# from rest_framework import serializers

# which leave types consume balance & which field to deduct
_CONSUMES_MAP = {
    "sick":   "sick_leave_balance",
    "casual": "casual_leave_balance",
    "annual": "annual_leave_balance",
    "comp":   "comp_leave_balance",
}

def _apply_approved_leave(req: LeaveRequest):
    """
    When a leave request is approved:
      - auto-topup balance if needed (based on join_date)
      - mark Attendance rows as 'Leave' (or 'Present' with mode='WFH' for WFH)
      - deduct correct leave balance (skip for WFH)
    """
    emp = req.employee

    # WFH doesn't consume leave balance and should be marked as Present with mode=WFH
    if req.leave_type == 'wfh':
        d = req.start_date
        while d <= req.end_date:
            Attendance.objects.update_or_create(
                employee=emp, date=d,
                defaults={"status": "Present", "mode": "WFH", "tag": "normal"}
            )
            d += timedelta(days=1)
        return  # WFH doesn't need balance deduction

    # For other leave types, deduct balance and mark as Leave
    # ✅ make sure yearly top-ups are applied before checking/deducting
    try:
        _auto_topup_leave_balance(emp)
    except Exception as e:
        # If topup fails, log but continue (might be missing join_date)
        pass

    days = (req.end_date - req.start_date).days + 1

    with transaction.atomic():
        # Employee model only has 'leave_balance' field, use it for all leave types
        cur = getattr(emp, "leave_balance", 0) or 0
        if cur < days:
            raise serializers.ValidationError(f"Insufficient leave balance. Required: {days}, Available: {cur}")
        
        emp.leave_balance = cur - days
        emp.save(update_fields=["leave_balance"])

        # write attendance rows...
        d = req.start_date
        while d <= req.end_date:
            try:
                Attendance.objects.update_or_create(
                    employee=emp, date=d,
                    defaults={"status": "Leave", "mode": None, "tag": "normal"}
                )
            except Exception as e:
                # If attendance creation fails, log and continue
                # This shouldn't happen but handle gracefully
                pass
            d += timedelta(days=1)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_attendance_today(request):
    emp = get_object_or_404(Employee, user=request.user)
    d = timezone.localdate()  # today in local tz

    att = Attendance.objects.filter(employee=emp, date=d).first()
    if att:
        return Response({
            "id": att.id,
            "date": d.isoformat(),
            "status": att.status,
            "mode": att.mode,
            "check_in": att.check_in.isoformat() if att.check_in else None,
            "check_out": att.check_out.isoformat() if att.check_out else None,
            "minutes_late": getattr(att, "minutes_late", 0),
            "tag": getattr(att, "tag", None),
            "hours_worked": getattr(att, "hours_worked", 0),
        })

    on_leave = LeaveRequest.objects.filter(
        employee=emp, status='approved',
        start_date__lte=d, end_date__gte=d
    ).exists()

    return Response({
        "id": None,
        "date": d.isoformat(),
        "status": "Leave" if on_leave else "Absent",
        "mode": None,
        "check_in": None,
        "check_out": None,
        "minutes_late": 0,
        "tag": None,
        "hours_worked": 0,
    })

# attendance/views.py
from datetime import date, timedelta
from django.db.models import Q, Count
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser
from .models import Employee,TeamLead
from .serializers import EmployeeListSerializer


class EmployeeListAPIView(ListAPIView):
    """
    Shared view for Admin & Team Leads
    Shows WFH/Onsite counts + Pre-Notify Late flag
    Works with ?from=YYYY-MM-DD&to=YYYY-MM-DD
    """
    serializer_class = EmployeeListSerializer
    permission_classes = [IsAdminOrTeamLead]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["team_to_leads"] = _team_leads_map()

        # Parse date range
        f = parse_date(self.request.query_params.get("from") or "")
        t = parse_date(self.request.query_params.get("to") or "")
        today = date.today()
        f = f or today
        t = t or today
        if t < f:
            t = f
        if (t - f).days > 120:
            t = f + timedelta(days=120)

        ctx["from_date"] = f
        ctx["to_date"] = t
        return ctx

    def get_queryset(self):
        f = parse_date(self.request.query_params.get("from") or "")
        t = parse_date(self.request.query_params.get("to") or "")
        today = date.today()
        f = f or today
        t = t or today
        if t < f:
            t = f
        if (t - f).days > 120:
            t = f + timedelta(days=120)

        base_qs = employee_scope_for(self.request)

        return (
            base_qs.select_related("user", "team")
            .annotate(
                wfh_count=Count(
                    "attendances",
                    filter=Q(
                        attendances__status="Present",
                        attendances__mode="WFH",
                        attendances__date__range=(f, t),
                    ),
                ),
                onsite_count=Count(
                    "attendances",
                    filter=Q(
                        attendances__status="Present",
                        attendances__mode="Onsite",
                        attendances__date__range=(f, t),
                    ),
                ),
            )
            .order_by("user__username")
        )


def lead_allowed_team_names(user):
    tl = getattr(user, "team_lead", None)
    if not tl:
        return set()
    return set(tl.teams.values_list("name", flat=True))

@api_view(["GET"])
@permission_classes([IsAdminOrTeamLead])
def team_list(request):
    # Admins (staff but NOT leads): see all
    if request.user.is_staff and not hasattr(request.user, "team_lead"):
        qs = Team.objects.all().order_by("name")
    else:
        # Leads: only their teams
        allowed = lead_allowed_team_names(request.user)
        qs = Team.objects.filter(name__in=allowed).order_by("name")
    
    return Response(TeamSerializer(qs, many=True).data)




from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .permissions import IsAdminOrTeamLead
from .serializers import LeaveRequestSerializer, LeaveLeadDecisionSerializer
from .models import LeaveRequest, TeamLead

def _lead_can_see(user, req):
    tl = getattr(user, "team_lead", None)
    if not tl or not req.employee.team:
        return False
    return tl.teams.filter(id=req.employee.team_id).exists()

@api_view(["GET"])
@permission_classes([IsAdminOrTeamLead])
def lead_leave_list(request):
    qs = LeaveRequest.objects.select_related("employee__team","employee__user") \
                             .order_by("-created_at")
    if request.user.is_staff and not hasattr(request.user, "team_lead"):
        step = (request.query_params.get("step") or "lead").lower()
        if step == "lead":
            qs = qs.filter(step="lead")
    else:
        team_ids = request.user.team_lead.teams.values_list("id", flat=True)
        qs = qs.filter(step="lead", employee__team_id__in=team_ids)

    q = (request.query_params.get("q") or "").strip()
    if q:
        from django.db.models import Q
        qs = qs.filter(
            Q(employee__user__username__icontains=q) |
            Q(reason__icontains=q) |
            Q(peer_note__icontains=q)
        )

    return Response(LeaveRequestSerializer(qs, many=True).data)

@api_view(["PATCH"])
@permission_classes([IsAdminOrTeamLead])
def lead_leave_update(request, pk):
    """Lead approves/rejects; on approve -> admin step; on reject -> final rejected."""
    obj = get_object_or_404(LeaveRequest.objects.select_related("employee__team","employee__user"), pk=pk)

    # only allow when still at lead step
    if obj.step != "lead":
        return Response({"detail":"This request is not awaiting lead review."}, status=400)

    # object-level guard: must be that team's lead unless admin
    if not (request.user.is_staff and not hasattr(request.user, "team_lead")):
        if not _lead_can_see(request.user, obj):
            return Response({"detail":"Forbidden for this team."}, status=403)

    ser = LeaveLeadDecisionSerializer(obj, data=request.data, partial=True)
    ser.is_valid(raise_exception=True)

    decision = ser.validated_data.get("lead_decision")
    note     = ser.validated_data.get("lead_note", "")

    if decision not in {"approved","rejected"}:
        return Response({"detail":"lead_decision must be approved or rejected."}, status=400)

    obj.lead_decision   = decision
    obj.lead_note       = note
    obj.lead_decided_by = request.user
    obj.lead_decided_at = timezone.now()

    if decision == "approved":
        obj.step   = "admin"     # move to admin queue
        obj.status = "pending"   # still not final
        # TODO: notify admins here if you have a mailer
    else:
        obj.step   = "done"
        obj.status = "rejected"  # final
        # notify employee of rejection if you like

    obj.save()
    return Response(LeaveRequestSerializer(obj).data)




# views.py
from datetime import date
from django.utils.dateparse import parse_date
from django.db.models import Sum, Case, When, IntegerField, Q
from django.db.models.functions import Coalesce
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Employee, Attendance  # adjust imports as needed

def _range(request):
  """Parse ?from=YYYY-MM-DD&to=YYYY-MM-DD, default both to today."""
  f = parse_date(request.GET.get("from") or "") or date.today()
  t = parse_date(request.GET.get("to") or "") or date.today()
  return f, t

def _employees_with_counts(qs, _from, _to):
  return (
    qs.select_related("user")
      .annotate(
        wfh_count=Coalesce(
          Sum(
            Case(
              When(
                Q(attendance__date__gte=_from) &
                Q(attendance__date__lte=_to) &
                Q(attendance__status="present") &
                Q(attendance__mode="WFH"),
                then=1,
              ),
              default=0,
              output_field=IntegerField(),
            )
          ),
          0,
        ),
        onsite_count=Coalesce(
          Sum(
            Case(
              When(
                Q(attendance__date__gte=_from) &
                Q(attendance__date__lte=_to) &
                Q(attendance__status="present") &
                Q(attendance__mode="ONSITE"),
                then=1,
              ),
              default=0,
              output_field=IntegerField(),
            )
          ),
          0,
        ),
      )
      .order_by("user__username")
  )

@api_view(["GET"])
@permission_classes([IsAdminOrTeamLead])
def admin_employees(request):
    """
    GET /api/admin/employees/?from=YYYY-MM-DD&to=YYYY-MM-DD
    Works for both Admin and Team Leads (scoped via employee_scope_for).
    Now includes pre_notify_late boolean per employee:
      - If single day, True when a PreNotice(kind='late') exists for that date.
      - If a range, True when any day in the range has a late prenotice.
    """
    # --- date range + single-day
    _from, _to = _parse_range(request)
    single_day = (_from == _to)

    # --- role-scoped employee queryset
    emp_qs = employee_scope_for(request).select_related("user", "team")

    # --- aggregate WFH/Onsite in the range
    emp_qs = emp_qs.annotate(
        wfh_count=Count(
            "attendances",
            filter=Q(
                attendances__status="Present",
                attendances__mode="WFH",
                attendances__date__range=(_from, _to),
            ),
        ),
        onsite_count=Count(
            "attendances",
            filter=Q(
                attendances__status="Present",
                attendances__mode="Onsite",
                attendances__date__range=(_from, _to),
            ),
        ),
    ).order_by("user__username")

    # --- preload attendance rows for the grid (to show check-in/out & minutes)
    atts = Attendance.objects.filter(
        employee__in=emp_qs, date__range=(_from, _to)
    ).only("id","employee_id","date","status","mode","check_in","check_out")

    by_emp = defaultdict(list)
    for a in atts:
        by_emp[a.employee_id].append(a)

    # --- ✅ preload prenotices (late) for the range
    pre_late = PreNotice.objects.filter(
        kind="late",
        for_date__range=(_from, _to),
        employee__in=emp_qs,
    ).values_list("employee_id", "for_date")

    pre_late_map = defaultdict(set)  # emp_id -> {dates}
    for emp_id, fdate in pre_late:
        pre_late_map[emp_id].add(fdate)

    # --- also include team leads list (as you had)
    leads_map = _team_leads_map()

    # --- build response
    data = []
    for e in emp_qs:
        rows = by_emp.get(e.id, [])

        # minutes & averages from present rows
        present_rows = [a for a in rows if a.status == "Present"]
        total_minutes = sum(_minutes_from_attendance(a) for a in present_rows)
        avg_work_minutes = int(round(total_minutes / len(present_rows))) if present_rows else 0

        # details for a single day
        checkin_time = checkout_time = None
        work_minutes = None
        if single_day:
            todays = next((a for a in rows if a.date == _from), None)
            if todays:
                checkin_time  = _fmt_hhmm(todays.check_in)
                checkout_time = _fmt_hhmm(todays.check_out)
                work_minutes  = _minutes_from_attendance(todays)

        # ✅ pre-notify flag logic
        if single_day:
            pre_notify_late = _from in pre_late_map.get(e.id, set())
        else:
            pre_notify_late = bool(pre_late_map.get(e.id))

        w = int(getattr(e, "wfh_count", 0) or 0)
        o = int(getattr(e, "onsite_count", 0) or 0)

        data.append({
            "id": e.id,
            "username": getattr(e.user, "username", "") or getattr(e, "username", ""),
            "email": getattr(e.user, "email", "") or getattr(e, "email", ""),
            "team_name": getattr(getattr(e, "team", None), "name", None),
            "designation": getattr(e, "designation", ""),
            "leave_balance": int(getattr(e, "leave_balance", 0) or 0),
            "join_date": (getattr(e, "join_date", None) or "") and e.join_date.isoformat(),

            "wfh_count": w,
            "onsite_count": o,
            "present": (w + o) > 0,

            "checkin_time": checkin_time,
            "checkout_time": checkout_time,
            "work_minutes": work_minutes,
            "avg_work_minutes": avg_work_minutes,

            "team_leads": leads_map.get(e.team_id, []),

            # ✅ NEW FIELD consumed by your React table
            "pre_notify_late": pre_notify_late,
        })

    return Response(data, status=200)
def _minutes_from_attendance(att: "Attendance") -> int:
    """
    Return minutes worked for a single Attendance row.
    Prefer 'hours_worked' if provided (hours float), otherwise compute from
    check_in/check_out when both exist.
    """
    mins = None
    hw = getattr(att, "hours_worked", None)
    if hw is not None:
        try:
            mins = int(round(float(hw) * 60))  # convert hours -> minutes
        except Exception:
            mins = None

    if mins is None and getattr(att, "check_in", None) and getattr(att, "check_out", None):
        secs = (att.check_out - att.check_in).total_seconds()
        mins = max(0, int(round(secs / 60.0)))

    return mins if mins is not None else 0

def _fmt_hhmm(dt):
    """Format an aware datetime as 'HH:MM' in the server’s TZ; return None if missing."""
    if not dt:
        return None
    return dt.astimezone(timezone.get_current_timezone()).strftime("%H:%M")

from django.utils import timezone
def _parse_range(request):
    f = parse_date(request.GET.get("from") or "")
    t = parse_date(request.GET.get("to") or "")
    today = timezone.localdate()
    f = f or today
    t = t or today
    if t < f:
        t = f
    if (t - f).days > 120:
        t = f + timedelta(days=120)
    return f, t

@api_view(["GET"])
@permission_classes([IsAdminOrTeamLead])
def lead_employees(request):
    """
    GET /api/lead/employees/?from=YYYY-MM-DD&to=YYYY-MM-DD
    Returns employees under this lead/admin, with aggregated counts and new Pre-Notify Late flag.
    """
    _from, _to = _parse_range(request)
    single_day = (_from == _to)

    emp_qs = employee_scope_for(request).select_related("user", "team")

    emp_qs = emp_qs.annotate(
        wfh_count=Count(
            "attendances",
            filter=Q(
                attendances__status="Present",
                attendances__mode="WFH",
                attendances__date__range=(_from, _to),
            ),
        ),
        onsite_count=Count(
            "attendances",
            filter=Q(
                attendances__status="Present",
                attendances__mode="Onsite",
                attendances__date__range=(_from, _to),
            ),
        ),
    ).order_by("user__username")

    # preload attendances
    atts = Attendance.objects.filter(
        employee__in=emp_qs, date__range=(_from, _to)
    ).only("id", "employee_id", "date", "status", "mode", "check_in", "check_out")

    # ✅ Preload prenotices (only late)
    pre_late = PreNotice.objects.filter(
        kind="late", for_date__range=(_from, _to), employee__in=emp_qs
    ).values_list("employee_id", "for_date")

    # build maps for quick lookup
    by_emp_att = defaultdict(list)
    for a in atts:
        by_emp_att[a.employee_id].append(a)

    pre_late_map = defaultdict(set)
    for emp_id, fdate in pre_late:
        pre_late_map[emp_id].add(fdate)

    leads_map = _team_leads_map()
    
    data = []
    for e in emp_qs:
        rows = by_emp_att.get(e.id, [])
        present_rows = [a for a in rows if a.status == "Present"]
        total_minutes = sum(_minutes_from_attendance(a) for a in present_rows)
        avg_work_minutes = int(round(total_minutes / len(present_rows))) if present_rows else 0

        checkin_time = checkout_time = None
        work_minutes = None
        pre_notify_late = False

        if single_day:
            todays = next((a for a in rows if a.date == _from), None)
            if todays:
                checkin_time = _fmt_hhmm(todays.check_in)
                checkout_time = _fmt_hhmm(todays.check_out)
                work_minutes = _minutes_from_attendance(todays)
            # ✅ Determine if pre-notified late on that date
            pre_notify_late = _from in pre_late_map.get(e.id, set())
        else:
            # if range > 1 day, mark true if any day has prenotice late
            pre_notify_late = bool(pre_late_map.get(e.id))

        w = int(getattr(e, "wfh_count", 0) or 0)
        o = int(getattr(e, "onsite_count", 0) or 0)

        data.append({
            "id": e.id,
            "username": getattr(e.user, "username", "") or getattr(e, "username", ""),
            "email": getattr(e.user, "email", "") or getattr(e, "email", ""),
            "team_name": getattr(getattr(e, "team", None), "name", None),
            "designation": getattr(e, "designation", ""),
            "leave_balance": int(getattr(e, "leave_balance", 0) or 0),
            "join_date": (getattr(e, "join_date", None) or "") and e.join_date.isoformat(),
            "wfh_count": w,
            "onsite_count": o,
            "present": (w + o) > 0,
            "checkin_time": checkin_time,
            "checkout_time": checkout_time,
            "work_minutes": work_minutes,
            "avg_work_minutes": avg_work_minutes,
            "team_leads": leads_map.get(e.team_id, []),
            # ✅ NEW COLUMN: Pre-Notify Late
            "pre_notify_late": pre_notify_late,
        })

    return Response(data)
from collections import defaultdict
from .models import TeamLead

def _team_leads_map():
    """team_id → [lead usernames]"""
    mapping = defaultdict(list)
    for tl in TeamLead.objects.select_related("user").prefetch_related("teams"):
        uname = tl.user.username
        for t in tl.teams.all():
            mapping[t.id].append(uname)
    return mapping



@api_view(["GET"])
@permission_classes([IsAdminOrTeamLead])
def admin_employee_attendance(request):
    """
    GET /api/admin/employee-attendance/?employee_id=123&from=YYYY-MM-DD&to=YYYY-MM-DD
    Returns a dense per-day list: one item per date in range.
    """
    emp_id = request.query_params.get("employee_id")
    if not emp_id:
        return Response({"detail": "employee_id is required."}, status=400)

    # validate employee with role scoping
    emp_qs = employee_scope_for(request)
    emp = get_object_or_404(emp_qs, id=emp_id)

    f, t = _parse_range(request)  # you already have this helper at bottom of views.py

    # fetch attendance rows for that employee
    qs = Attendance.objects.filter(employee=emp, date__range=(f, t))
    by_date = {a.date: a for a in qs}

    # build dense list day by day
    out = []
    cur = f
    from datetime import timedelta
    while cur <= t:
        a = by_date.get(cur)
        if a:
            out.append({
                "date": cur.isoformat(),
                "status": a.status,
                "mode": a.mode,
                "check_in": a.check_in.isoformat() if a.check_in else None,
                "check_out": a.check_out.isoformat() if a.check_out else None,
                "hours_minutes": _minutes_from_attendance(a),
            })
        else:
            out.append({
                "date": cur.isoformat(),
                "status": "Absent",
                "mode": None,
                "check_in": None,
                "check_out": None,
                "hours_minutes": 0,
            })
        cur += timedelta(days=1)

    return Response(out, status=200)


def _open_attendance(emp):
    """
    Return the most recent Attendance with check_in set and check_out missing,
    *but only if* it's not older than 16 hours.
    """
    now = timezone.now()
    sixteen_hours_ago = now - timedelta(hours=STALE_OPEN_MAX_HOURS)

    att = (Attendance.objects
           .filter(employee=emp, check_in__isnull=False, check_out__isnull=True)
           .order_by('-date', '-check_in')
           .first())

    if not att:
        return None

    # Auto-close if stale → treat as closed
    if att.check_in < sixteen_hours_ago:
        _force_close_stale(att, max_hours=STALE_OPEN_MAX_HOURS)
        return None

    return att

YEARLY_LEAVE_DAYS = 60  # your yearly entitlement per completed year



def _auto_topup_leave_balance(emp):
    """
    Reset-style yearly leave:

    - Each leave year (based on join_date anniversary) has a fresh
      entitlement of YEARLY_LEAVE_DAYS (15).
    - Old remaining balance from previous years is *ignored*.
    - leave_balance = 15 - days_used_in_current_leave_year
    """
    if not emp.join_date:
        return  # cannot compute without join date

    today = timezone.localdate()
    jd = emp.join_date

    # Safety: future join_date → do nothing
    if jd > today:
        return

    # -------- 1) Find current leave-year start --------
    # Try this year's anniversary first
    try:
        this_year_anniv = jd.replace(year=today.year)
    except ValueError:
        # handle 29-Feb join date on non-leap years
        if jd.month == 2 and jd.day == 29:
            this_year_anniv = date(today.year, 2, 28)
        else:
            this_year_anniv = jd

    if this_year_anniv > today:
        # We are before the anniversary → current leave year started last year
        try:
            year_start = jd.replace(year=today.year - 1)
        except ValueError:
            if jd.month == 2 and jd.day == 29:
                year_start = date(today.year - 1, 2, 28)
            else:
                year_start = jd
    else:
        # On/after this year's anniversary
        year_start = this_year_anniv

    # -------- 2) Count approved leave days in THIS leave year --------
    consumes_types = {"sick", "casual", "annual", "comp"}

    qs = LeaveRequest.objects.filter(
        employee=emp,
        status="approved",
        leave_type__in=consumes_types,
        start_date__gte=year_start,
        start_date__lte=today,
    )

    days_used_this_year = 0
    for lr in qs:
        days_used_this_year += (lr.end_date - lr.start_date).days + 1

    # -------- 3) Compute remaining balance for this year only --------
    new_balance = YEARLY_LEAVE_DAYS - days_used_this_year
    if new_balance < 0:
        new_balance = 0

    # Only save if changed
    if emp.leave_balance != new_balance:
        emp.leave_balance = new_balance
        emp.save(update_fields=["leave_balance"])

STALE_OPEN_MAX_HOURS = 9  # or fetch from PolicySettings if you add a field there

MAX_TAG_LEN = 20

# Map to valid TAG_CHOICES from models.py: 'normal', 'late_inf', 'late_uninf', 'early_off_ok', 'short_hours'
TAG_ALIAS = {
    "auto_close_stale": "normal",  # Use valid choice
    "cross_midnight":   "normal",  # Use valid choice
    "short_hours":      "short_hours",  # Valid choice
    "early_off_ok":     "early_off_ok",  # Valid choice
    "late_uninf":       "late_uninf",  # Valid choice
    "late_inf":         "late_inf",  # Valid choice
    "normal":           "normal",
    "auto_open_stale":  "normal",  # Use valid choice
}




def _append_tag(att, new_tag):
    """
    Set tag to a valid choice from TAG_CHOICES.
    Since models.py has choices constraint, we use single valid tags only.
    """
    # normalize to valid tag via alias
    t = TAG_ALIAS.get(new_tag, new_tag)
    
    # Ensure it's a valid choice (fallback to 'normal' if not)
    valid_choices = ['normal', 'late_inf', 'late_uninf', 'early_off_ok', 'short_hours']
    if t not in valid_choices:
        t = 'normal'
    
    att.tag = t


def _force_close_stale(att, *, max_hours=STALE_OPEN_MAX_HOURS):
    """
    Force-close an open Attendance by capping its checkout time at
    (check_in + max_hours). Adds 'auto_close_stale' tag and saves.
    """
    if not att.check_in or att.check_out:
        return att  # nothing to do

    cutoff = att.check_in + timedelta(hours=max_hours)
    att.check_out = cutoff
    _append_tag(att, "auto_close_stale")
    # do NOT assign att.hours_worked here if it's a computed property
    att.save(update_fields=["check_out", "tag"])
    return att

def _force_open_stale(att, *, min_hours=STALE_OPEN_MAX_HOURS):
    """
    Force-open a stale Attendance by clearing its checkout time
    if (check_out - check_in) > min_hours. Adds 'auto_open_stale' tag and saves.
    """
    if not att.check_in or not att.check_out:
        return att  # nothing to do

    duration = att.check_out - att.check_in
    if duration.total_seconds() >= (min_hours * 3600):
        att.check_out = None
        _append_tag(att, "auto_open_stale")
        att.save(update_fields=["check_out", "tag"])
    return att


    
