# views.py
from rest_framework import status, serializers
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Employee
from .serializers import EmployeeCreateSerializer
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

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from datetime import date, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import LeaveRequestSerializer, LeaveRequestStatusUpdateSerializer

from datetime import date, timedelta
from django.db.models import Q, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .models import Employee, Attendance, LeaveRequest

from .models import Employee, Attendance, LeaveRequest
from .serializers import (
    EmployeeCreateSerializer,
    EmployeeProfileSerializer,
    AttendanceSerializer,
    LeaveRequestSerializer,
)


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

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        role = self.context['request'].data.get('role')

        if role == "admin" and not user.is_staff:
            raise serializers.ValidationError("You are not authorized as admin.")
        elif role == "employee":
            if not Employee.objects.filter(user=user).exists():
                raise serializers.ValidationError("You are not registered as employee.")

        data['username'] = user.username
        data['role'] = role
        data['is_staff'] = user.is_staff
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
    """
    GET /api/leave-requests/?status=pending|approved|rejected|all
                              &type=sick|casual|annual|comp|wfh|all
                              &from=YYYY-MM-DD
                              &to=YYYY-MM-DD
                              &q=<search>
    """
    permission_classes = [IsAdminUser]
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        qs = (LeaveRequest.objects
              .select_related('employee__user')
              .order_by('-created_at'))

        status = self.request.query_params.get('status', '').strip().lower()
        ltype  = self.request.query_params.get('type', '').strip().lower()
        dfrom  = self.request.query_params.get('from')
        dto    = self.request.query_params.get('to')
        q      = self.request.query_params.get('q')

        if status and status != 'all':
            qs = qs.filter(status=status)
        if ltype and ltype != 'all':
            qs = qs.filter(leave_type=ltype)
        if dfrom:
            qs = qs.filter(start_date__gte=dfrom)
        if dto:
            qs = qs.filter(end_date__lte=dto)
        if q:
            qs = qs.filter(
                Q(employee__user__username__icontains=q) |
                Q(reason__icontains=q) |
                Q(peer_note__icontains=q)
            )
        return qs


class LeaveRequestAdminUpdate(UpdateAPIView):
    """
    PATCH /api/leave-requests/<id>/  { "status": "approved"|"rejected" }
    """
    permission_classes = [IsAdminUser]
    serializer_class = LeaveRequestStatusUpdateSerializer
    queryset = LeaveRequest.objects.all()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        prev_status = instance.status

        # write status (and any other incoming fields)
        response = super().partial_update(request, *args, **kwargs)

        # if just approved -> apply attendance/leave balance
        instance.refresh_from_db()
        if prev_status != "approved" and instance.status == "approved":
            try:
                _apply_approved_leave(instance)
            except serializers.ValidationError as e:
                instance.status = prev_status
                instance.save()
                detail = e.detail[0] if isinstance(e.detail, list) else e.detail
                return Response({"detail": str(detail)}, status=400)

        # ✅ tell the employee about the decision
        try:
            notify_employee_leave_decision(instance)
        except Exception:
            pass

        return response

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
@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    """
    Supports optional ?from=YYYY-MM-DD&to=YYYY-MM-DD.
    Defaults to the last 7 days (inclusive).
    """
    # ---- parse range safely
    f = request.query_params.get("from")
    t = request.query_params.get("to")

    if f and t:
        try:
            start = date.fromisoformat(f)
            end   = date.fromisoformat(t)
        except ValueError:
            return Response({"detail": "from/to must be YYYY-MM-DD."}, status=400)
        if end < start:
            return Response({"detail": "to cannot be before from."}, status=400)
        # clamp excessively long ranges (optional)
        if (end - start).days > 120:
            end = start + timedelta(days=120)
    else:
        end = date.today()
        start = end - timedelta(days=6)  # last 7 days

    # ---- point-in-time (end day) KPIs
    total_employees = Employee.objects.count()

    # present / absent / leave for the END day
    present_today = Attendance.objects.filter(date=end, status="Present").count()
    leave_today   = Attendance.objects.filter(date=end, status="Leave").count()

    # define "absent" as total employees minus those who are present or on leave that day
    # (tweak if you treat "absent" differently)
    absent_today  = max(0, total_employees - (present_today + leave_today))

    # work modes for the END day
    wfh = Attendance.objects.filter(date=end, status="Present", mode="WFH").count()
    onsite = Attendance.objects.filter(date=end, status="Present", mode="Onsite").count()

    # pending leave requests (global)
    leave_pending = LeaveRequest.objects.filter(status='pending').count()

    # ---- trend over the selected range: for each day compute present/total
    # here "total" = total employees (so Absent = total - present - leave)
    trend = []
    cur = start
    # prefetch all attendance in range to cut queries
    att_in_range = Attendance.objects.filter(date__range=(start, end))
    by_day = {
        d['date']: d for d in att_in_range.values('date')
                                .annotate(
                                    present=Count('id', filter=Q(status="Present")),
                                    leave=Count('id', filter=Q(status="Leave"))
                                )
    }
    while cur <= end:
        agg = by_day.get(cur, {"present": 0, "leave": 0})
        present = int(agg["present"])
        leave = int(agg["leave"])
        total = total_employees
        trend.append({
            "date": cur.isoformat(),
            "present": present,
            "leave": leave,
            "total": total,
        })
        cur += timedelta(days=1)

    return Response({
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "leave_pending": leave_pending,
        "wfh": wfh,
        "onsite": onsite,
        "trend": trend,
        "range": {"from": start.isoformat(), "to": end.isoformat()},
    })
# ---------- EMPLOYEE APIs ----------

def _get_employee(user) -> Employee:
    return get_object_or_404(Employee, user=user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_profile(request):
    emp = _get_employee(request.user)
    return Response(EmployeeProfileSerializer(emp).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_in(request):
    emp = _get_employee(request.user)
    mode = (request.data.get("mode") or "").strip()
    if mode not in ["WFH","Onsite"]:
        return Response({"detail":"mode must be 'WFH' or 'Onsite'."}, status=400)

    settings = PolicySettings.get()
    today = date.today()
    now = timezone.now()

    # shift start today
    shift_start_dt = timezone.make_aware(datetime.combine(today, emp.shift_start))
    grace_deadline = shift_start_dt + timedelta(minutes=settings.grace_minutes)

    # is there a pre-notice created >= late_notice_minutes before shift?
    informed = PreNotice.objects.filter(
        employee=emp, kind='late', for_date=today,
        created_at__lte=shift_start_dt - timedelta(minutes=settings.late_notice_minutes)
    ).exists()

    minutes_late = 0
    tag = 'normal'
    if now > grace_deadline:
        minutes_late = int((now - shift_start_dt).total_seconds() // 60)
        tag = 'late_inf' if informed else 'late_uninf'

    obj, _ = Attendance.objects.update_or_create(
        employee=emp, date=today,
        defaults={"status":"Present","mode":mode,"check_in":now,
                  "minutes_late":minutes_late,"tag":tag}
    )
    return Response(AttendanceSerializer(obj).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_attendance(request):
    emp = _get_employee(request.user)
    d = date.today()

    att = Attendance.objects.filter(employee=emp, date=d).first()
    if att:
        return Response({
            "id": att.id,
            "date": d.isoformat(),
            "status": att.status,
            "mode": att.mode,
            "check_in": att.check_in.isoformat() if att.check_in else None,
            "check_out": att.check_out.isoformat() if att.check_out else None,
            "minutes_late": att.minutes_late,
            "tag": att.tag,
            "hours_worked": getattr(att, "hours_worked", 0),
        })

    # if no row exists, derive a “virtual” status for the day
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

    if request.method == 'GET':
        qs = LeaveRequest.objects.filter(employee=emp).order_by('-id')
        return Response(LeaveRequestSerializer(qs, many=True).data)

    # ---------- POST ----------
    start_date = request.data.get('start_date')
    end_date   = request.data.get('end_date')
    leave_type = request.data.get('leave_type', 'casual')
    reason     = request.data.get('reason', '')
    peer_note  = request.data.get('peer_note', '')

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

    # Disallow overlaps for pending/approved requests
    overlap = LeaveRequest.objects.filter(
        employee=emp,
        end_date__gte=s,
        start_date__lte=e,
        status__in=['pending', 'approved']
    ).exists()
    if overlap:
        return Response({"detail": "Requested range overlaps an existing request."}, status=400)

    days_needed = (e - s).days + 1

    # Only leaves that consume balance are checked
    consumes_balance = leave_type in {'annual', 'casual', 'sick', 'comp'}
    if consumes_balance and emp.leave_balance < days_needed:
        return Response({"detail": "Insufficient leave balance."}, status=400)

    # ---------- Policy / notice window ----------
    settings = PolicySettings.get()
    now = timezone.now()
    today = timezone.localdate()

    notice_met = True
    if leave_type == 'sick':
        # must inform ≥ notice_sick_hours before shift start on the leave's start day
        shift_start_naive = datetime.combine(s, emp.shift_start)
        try:
            shift_start_dt = timezone.make_aware(shift_start_naive, timezone.get_current_timezone())
        except Exception:
            shift_start_dt = shift_start_naive  # fallback if USE_TZ=False
        notice_met = now <= (shift_start_dt - timedelta(hours=settings.notice_sick_hours))
    elif leave_type == 'casual':
        # must inform ≥ notice_casual_hours before the leave start day
        notice_met = (s - today) >= timedelta(hours=settings.notice_casual_hours)
    elif leave_type == 'annual':
        needed_days = settings.notice_annual_long_days if days_needed > 10 else settings.notice_annual_short_days
        notice_met = (s - today).days >= needed_days
    elif leave_type == 'comp':
        notice_met = (s - today).days >= settings.notice_comp_days
    elif leave_type == 'wfh':
        notice_met = (s - today).days >= settings.wfh_prior_days

    # Create the request (keep status pending; you can auto-reject based on notice_met if you want)
    obj = LeaveRequest.objects.create(
        employee=emp,
        start_date=s,
        end_date=e,
        reason=reason,
        leave_type=leave_type,
        notice_met=notice_met,
        status='pending',               # OR: 'auto_rejected' if not notice_met and leave_type != 'sick'
        peer_note=peer_note,
    )
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


from datetime import date, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
        absent  = 1 if status is None or status == "Absent" else 0  # nothing recorded or explicitly Absent
        trend.append({
            "date": cur.isoformat(),
            "present": present,
            "leave": leave,
            "absent": absent,
            "total": 1,
        })
        cur += timedelta(days=1)

    return Response({
        "profile": profile,
        "today": today_block,
        "month": {
            "present": present_count, "absent": absent_count, "leave": leave_count,
            "wfh": wfh_count, "onsite": onsite_count
        },
        "pending_leaves": pending_leaves,
        "trend": trend,
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_out(request):
    emp = _get_employee(request.user)
    today = date.today()
    a = Attendance.objects.filter(employee=emp, date=today).first()
    if not a or not a.check_in:
        return Response({"detail":"No check-in found."}, status=400)

    settings = PolicySettings.get()
    now = timezone.now()
    a.check_out = now
    # Early-off logic
    min_hours = settings.min_daily_hours
    approved_early = EarlyOffRequest.objects.filter(employee=emp, for_date=today, status='approved').exists()
    if a.hours_worked < min_hours and not approved_early:
        a.tag = 'short_hours'
    elif a.hours_worked < min_hours and approved_early:
        a.tag = 'early_off_ok'
    a.save()
    return Response(AttendanceSerializer(a).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_out(request):
    emp = _get_employee(request.user)
    today = date.today()
    a = Attendance.objects.filter(employee=emp, date=today).first()
    if not a or not a.check_in:
        return Response({"detail":"No check-in found."}, status=400)

    settings = PolicySettings.get()
    now = timezone.now()
    a.check_out = now
    # Early-off logic
    min_hours = settings.min_daily_hours
    approved_early = EarlyOffRequest.objects.filter(employee=emp, for_date=today, status='approved').exists()
    if a.hours_worked < min_hours and not approved_early:
        a.tag = 'short_hours'
    elif a.hours_worked < min_hours and approved_early:
        a.tag = 'early_off_ok'
    a.save()
    return Response(AttendanceSerializer(a).data)

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

# --- Early-off (admin) ---
@api_view(["GET"])
@permission_classes([IsAdminUser])
def earlyoff_admin_list(request):
    qs = EarlyOffRequest.objects.select_related("employee","employee__user")
    return Response(EarlyOffRequestSerializer(qs, many=True).data)

@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def earlyoff_update(request, pk):
    obj = get_object_or_404(EarlyOffRequest, pk=pk)
    status_val = request.data.get("status")
    note = request.data.get("note", "")
    if status_val not in {"approved","rejected","pending"}:
        return Response({"detail":"status must be approved/rejected/pending"}, status=400)

    obj.status = status_val
    obj.note = note
    obj.decided_at = timezone.now()
    obj.save()

    # ✅ tell the employee about the decision
    try:
        notify_employee_earlyoff_decision(obj)
    except Exception:
        pass

    return Response(EarlyOffRequestSerializer(obj).data, status=200)



# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import LeaveRequest, Employee

@api_view(['GET'])
def get_leave_distribution(request):
    user = request.user
    employee = Employee.objects.get(user=user)

    # Fetch total leaves used by the employee for each leave type
    total_sick = LeaveRequest.objects.filter(employee=employee, leave_type='sick', status='approved').count()
    total_casual = LeaveRequest.objects.filter(employee=employee, leave_type='casual', status='approved').count()
    total_annual = LeaveRequest.objects.filter(employee=employee, leave_type='annual', status='approved').count()
    total_comp = LeaveRequest.objects.filter(employee=employee, leave_type='comp', status='approved').count()

    # Fetch remaining leave balance for each leave type
    remaining_sick = employee.sick_leave_balance
    remaining_casual = employee.casual_leave_balance
    remaining_annual = employee.annual_leave_balance
    remaining_comp = employee.comp_leave_balance

    return Response({
        'leave_types': {
            'sick': {'used': total_sick, 'remaining': remaining_sick},
            'casual': {'used': total_casual, 'remaining': remaining_casual},
            'annual': {'used': total_annual, 'remaining': remaining_annual},
            'comp': {'used': total_comp, 'remaining': remaining_comp},
        }
    })
# attendance/views.py
from .models import AttendanceCorrection

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_attendance_corrections(request):
    emp = _get_employee(request.user)

    if request.method == 'GET':
        qs = AttendanceCorrection.objects.filter(employee=emp).order_by('-id')
        return Response(AttendanceCorrectionSerializer(qs, many=True).data)

    # POST
    try:
        for_date = date.fromisoformat(request.data.get('for_date', ''))
    except Exception:
        return Response({"detail":"for_date must be YYYY-MM-DD."}, status=400)

    want_in  = request.data.get('want_check_in')  # "HH:MM" or ""
    want_out = request.data.get('want_check_out')
    reason   = (request.data.get('reason') or '').strip()
    if not (want_in or want_out):
        return Response({"detail":"Provide at least one of want_check_in / want_check_out."}, status=400)
    if not reason:
        return Response({"detail":"Reason is required."}, status=400)

    obj = AttendanceCorrection.objects.create(
        employee=emp,
        for_date=for_date,
        want_check_in=want_in or None,
        want_check_out=want_out or None,
        reason=reason
    )
    return Response(AttendanceCorrectionSerializer(obj).data, status=201)


class AttendanceCorrectionAdminList(ListAPIView):
    queryset = AttendanceCorrection.objects.all().select_related('employee','employee__user')
    serializer_class = AttendanceCorrectionSerializer
    permission_classes = [IsAdminUser]


class AttendanceCorrectionAdminUpdate(UpdateAPIView):
    queryset = AttendanceCorrection.objects.all()
    serializer_class = AttendanceCorrectionUpdateSerializer
    permission_classes = [IsAdminUser]

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        prev = instance.status
        resp = super().partial_update(request, *args, **kwargs)
        instance.refresh_from_db()

        # If just approved -> apply to Attendance
        if prev != 'approved' and instance.status == 'approved':
            emp = instance.employee
            att, created = Attendance.objects.get_or_create(
            employee=emp, date=instance.for_date,
        defaults={"status": "Present", "mode": "WFH"}   
        )

            # helper to build aware datetime from date + time string/obj
            def to_dt(d, t):
                if isinstance(t, str):
                    from datetime import datetime as dtc
                    t = dtc.strptime(t, "%H:%M").time()
                return timezone.make_aware(datetime.combine(d, t))

            if instance.want_check_in:
                att.check_in = to_dt(instance.for_date, instance.want_check_in)
            if instance.want_check_out:
                att.check_out = to_dt(instance.for_date, instance.want_check_out)

            # recompute minutes_late
            shift_start = timezone.make_aware(datetime.combine(instance.for_date, emp.shift_start))
            att.minutes_late = max(0, int(((att.check_in or shift_start) - shift_start).total_seconds() // 60))
            att.tag = 'corrected'
            att.status = "Present"
            att.save()

        return resp
# --- Employee: create/list my correction requests ---
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def my_attendance_corrections(request):
    emp = _get_employee(request.user)

    if request.method == "GET":
        qs = AttendanceCorrection.objects.filter(employee=emp).order_by("-id")
        return Response(AttendanceCorrectionSerializer(qs, many=True).data)

    # POST
    for_date = request.data.get("for_date")
    want_in = request.data.get("want_check_in")   # "HH:MM" or ""
    want_out = request.data.get("want_check_out") # "HH:MM" or ""
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

    t_in  = parse_hhmm(want_in)
    t_out = parse_hhmm(want_out)

    if not t_in and not t_out:
        return Response(
            {"detail": "Provide want_check_in and/or want_check_out in HH:MM."},
            status=400,
        )

    obj = AttendanceCorrection.objects.create(
        employee=emp,
        for_date=d,
        want_check_in=t_in,
        want_check_out=t_out,
        reason=reason,
        status="pending",
    )
    return Response(AttendanceCorrectionSerializer(obj).data, status=201)


# --- Admin: list all requests ---
class AttendanceCorrectionAdminList(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AttendanceCorrectionSerializer
    queryset = AttendanceCorrection.objects.select_related(
        "employee", "employee__user"
    ).order_by("-id")


# --- Admin: update status/admin note ---
class AttendanceCorrectionAdminUpdate(UpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AttendanceCorrectionUpdateSerializer
    queryset = AttendanceCorrection.objects.all()

class MyAttendanceCorrections(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = AttendanceCorrection.objects.filter(employee=request.user.employee).order_by("-created_at")
        return Response(AttendanceCorrectionSerializer(qs, many=True).data)

    def post(self, request):
        payload = {
            "employee": request.user.employee.id,
            "for_date": request.data.get("for_date"),
            "want_check_in": request.data.get("want_check_in"),
            "want_check_out": request.data.get("want_check_out"),
            "reason": request.data.get("reason"),
        }
        ser = AttendanceCorrectionSerializer(data=payload)
        ser.is_valid(raise_exception=True)
        obj = ser.save()
        return Response(AttendanceCorrectionSerializer(obj).data, status=status.HTTP_201_CREATED)


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
    """
    GET /api/attendance-corrections/?status=pending|approved|rejected|all
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AttendanceCorrectionSerializer

    def get_queryset(self):
        qs = AttendanceCorrection.objects.select_related("employee__user").order_by("-created_at")
        status_param = (self.request.query_params.get("status") or "pending").lower()
        if status_param in {"pending", "approved", "rejected"}:
            qs = qs.filter(status=status_param)
        return qs


class AttendanceCorrectionAdminUpdate(RetrieveUpdateAPIView):
    """
    PATCH /api/attendance-corrections/<id>/
    Body: { "status": "approved"|"rejected", "admin_note": "..." }
    On approve: applies want_check_in/out to Attendance.
    """
    permission_classes = [permissions.IsAdminUser]
    queryset = AttendanceCorrection.objects.select_related("employee__user")
    serializer_class = AttendanceCorrectionUpdateSerializer

    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        inst: AttendanceCorrection = self.get_object()
        ser = self.get_serializer(inst, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        inst = ser.save()

        if inst.status == "approved":
            _apply_to_attendance(
                employee=inst.employee,
                for_date=inst.for_date,
                want_in=inst.want_check_in,
                want_out=inst.want_check_out,
            )

        # Return full object for convenience in UI
        return Response(AttendanceCorrectionSerializer(inst).data)


# Backward-compat aliases (optional)
LeaveRequestListAPIView = LeaveRequestAdminList
LeaveRequestUpdateAPIView = LeaveRequestAdminUpdate


# views.py
from django.db.models import Q

@api_view(["GET"])
@permission_classes([IsAdminUser])
def earlyoff_admin_list(request):
    qs = EarlyOffRequest.objects.select_related("employee","employee__user").order_by("-id")

    status_param = (request.query_params.get("status") or "").lower()
    if status_param and status_param != "all":
        qs = qs.filter(status=status_param)

    f = request.query_params.get("from")
    t = request.query_params.get("to")
    if f: qs = qs.filter(for_date__gte=f)
    if t: qs = qs.filter(for_date__lte=t)

    q = (request.query_params.get("q") or "").strip()
    if q:
        qs = qs.filter(
            Q(employee__user__username__icontains=q) |
            Q(reason__icontains=q) |
            Q(admin_note__icontains=q)  # or Q(note__icontains=q) if your field is "note"
        )

    return Response(EarlyOffRequestSerializer(qs, many=True).data)
from django.db import transaction
from datetime import timedelta
from rest_framework import serializers

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
      - mark Attendance rows as 'Leave' for each day in range
      - deduct the correct leave balance (type-specific if fields exist; else fallback to 'leave_balance')
    Raises serializers.ValidationError on insufficient balance.
    """
    emp = req.employee
    days = (req.end_date - req.start_date).days + 1

    with transaction.atomic():
        # deduct balance
        field = _CONSUMES_MAP.get(req.leave_type)
        if field and hasattr(emp, field):
            cur = getattr(emp, field) or 0
            if cur < days:
                raise serializers.ValidationError(f"Insufficient {req.leave_type} leave balance.")
            setattr(emp, field, cur - days)
        else:
            # fallback to a single pool if you use one
            cur = getattr(emp, "leave_balance", 0) or 0
            if cur < days:
                raise serializers.ValidationError("Insufficient leave balance.")
            emp.leave_balance = cur - days
        emp.save()

        # write attendance rows
        d = req.start_date
        while d <= req.end_date:
            Attendance.objects.update_or_create(
                employee=emp, date=d,
                defaults={"status": "Leave", "mode": None, "tag": "on_leave"}
            )
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

from django.db.models import Q, Count
from .serializers import EmployeeListSerializer
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser  
# attendance/views.py
from datetime import date, timedelta
from django.db.models import Q, Count
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser
from .models import Employee
from .serializers import EmployeeListSerializer

class EmployeeListAPIView(ListAPIView):
    serializer_class = EmployeeListSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        # ---- parse optional date range (?from=YYYY-MM-DD&to=YYYY-MM-DD)
        f = (self.request.query_params.get("from") or "").strip()
        t = (self.request.query_params.get("to")   or "").strip()

        if f and t:
            try:
                start = date.fromisoformat(f)
                end   = date.fromisoformat(t)
            except ValueError:
                # fallback if bad params
                end = date.today()
                start = end - timedelta(days=29)
        else:
            # default = current month to today
            today = date.today()
            start = today.replace(day=1)
            end   = today

        if end < start:
            end = start
        if (end - start).days > 120:  # clamp long ranges
            end = start + timedelta(days=120)

        # ---- annotate counts inside the range
        return (
            Employee.objects.select_related("user")
            .annotate(
                wfh_count=Count(
                    "attendances",
                    filter=Q(
                        attendances__status="Present",
                        attendances__mode="WFH",
                        attendances__date__range=(start, end),
                    ),
                ),
                onsite_count=Count(
                    "attendances",
                    filter=Q(
                        attendances__status="Present",
                        attendances__mode="Onsite",
                        attendances__date__range=(start, end),
                    ),
                ),
            )
            .order_by("user__username")
        )
# attendance/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]

class MeProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
