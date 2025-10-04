

# # attendance/serializers.py
# from rest_framework import serializers
# from django.contrib.auth.models import User
# from .models import Employee, LeaveRequest, Attendance
# from .models import EarlyOffRequest



# class EmployeeProfileSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source='user.username', read_only=True)

#     class Meta:
#         model = Employee
#         fields = ['id', 'username', 'designation', 'join_date', 'leave_balance']

# class LeaveRequestSerializer(serializers.ModelSerializer):
#     # nice-to-have display name for admin list
#     employee_name = serializers.CharField(
#         source='employee.user.username', read_only=True
#     )

#     class Meta:
#         model = LeaveRequest
#         fields = [
#             'id',
#             'employee',        # keep id for admin lists (write-only on create if you like)
#             'employee_name',   # read-only helper
#             'start_date',
#             'end_date',
#             'reason',
#             'leave_type',      # <-- needed by UI + pie chart
#             'status',
#             'notice_met',      # <-- shows “Met/Short” badge
#             'peer_note',       # <-- optional, used by your form
#             'created_at',      # optional but handy
#         ]
#         read_only_fields = ('status', 'notice_met', 'created_at')
#         # read_only_fields = ['status']


# class LeaveRequestStatusUpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = LeaveRequest
#         fields = ['status']  # only allow changing status


# # serializers.py
# from rest_framework import serializers
# from .models import Attendance

# class AttendanceSerializer(serializers.ModelSerializer):
#     date = serializers.DateField(format="%Y-%m-%d")
#     check_in = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S%z", required=False, allow_null=True)
#     check_out = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S%z", required=False, allow_null=True)
#     hours_worked = serializers.SerializerMethodField()

#     class Meta:
#         model = Attendance
#         fields = [
#             "id", "date", "status", "mode",
#             "check_in", "check_out",
#             "minutes_late", "tag", "hours_worked",
#         ]

#     def get_hours_worked(self, obj):
#         # if your model already has a property, this will return it
#         hw = getattr(obj, "hours_worked", None)
#         if hw is not None:
#             return hw
#         # fallback compute
#         if obj.check_in and obj.check_out:
#             delta = obj.check_out - obj.check_in
#             return round(delta.total_seconds() / 3600, 2)
#         return None

# class EarlyOffRequestSerializer(serializers.ModelSerializer):
#     employee_name = serializers.CharField(source='employee.user.username', read_only=True)
#     class Meta:
#         model = EarlyOffRequest
#         fields = [
#             'id','employee','employee_name',
#             'for_date','reason','status','admin_note',
#             'created_at','updated_at'
#         ]
#         read_only_fields = ['status','created_at','updated_at']

# class EarlyOffDecisionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = EarlyOffRequest
#         fields = ['status','admin_note']


# # attendance/serializers.py
# from .models import AttendanceCorrection

# from rest_framework import serializers
# from .models import AttendanceCorrection

# class AttendanceCorrectionSerializer(serializers.ModelSerializer):
#     # nice to have for the admin list
#     employee_name = serializers.CharField(
#         source="employee.user.username", read_only=True
#     )

#     class Meta:
#         model = AttendanceCorrection
#         fields = [
#             "id", "employee", "employee_name",
#             "for_date", "want_check_in", "want_check_out",
#             "reason", "status", "admin_note", "created_at",
#         ]
#         read_only_fields = ("status", "admin_note", "created_at", "employee")



# class AttendanceCorrectionUpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AttendanceCorrection
#         fields = ("status", "admin_note")


# from rest_framework import serializers
# from django.contrib.auth.models import User
# from .models import Employee, LeaveRequest, Attendance, EarlyOffRequest

# class EmployeeCreateSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(write_only=True)
#     password = serializers.CharField(write_only=True)
#     email    = serializers.EmailField(write_only=True)  # NEW

#     class Meta:
#         model = Employee
#         fields = ['id', 'username', 'password', 'email', 'designation', 'leave_balance', 'join_date']

#     def create(self, validated_data):
#         username = validated_data.pop('username')
#         password = validated_data.pop('password')
#         email    = validated_data.pop('email')
#         user = User.objects.create_user(username=username, password=password, email=email)
#         return Employee.objects.create(user=user, **validated_data)

#     def to_representation(self, instance):
#         rep = super().to_representation(instance)
#         rep['username'] = instance.user.username
#         rep['email'] = instance.user.email  # helpful for admin UI
#         return rep
    
    
# from rest_framework import serializers
# from .models import Employee
# # attendance/serializers.py
# class EmployeeListSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source="user.username", read_only=True)
#     email    = serializers.EmailField(source="user.email", read_only=True)
#     wfh_count    = serializers.IntegerField(read_only=True, default=0)   # must be declared
#     onsite_count = serializers.IntegerField(read_only=True, default=0)   # must be declared

#     class Meta:
#         model  = Employee
#         fields = ("id","username","email","designation","leave_balance","join_date","wfh_count","onsite_count")


# attendance/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, LeaveRequest, Attendance
from .models import EarlyOffRequest
from .models import Employee, LeaveRequest, Attendance, EarlyOffRequest, AttendanceCorrection, Team, TeamLead


class EmployeeProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'username', 'designation', 'join_date', 'leave_balance']

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.username', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name',
            'start_date','end_date','reason','leave_type',
            'status','step','notice_met','peer_note','created_at',
            # lead/admin display fields (read-only to most callers)
            'lead_decision','lead_note','lead_decided_by','lead_decided_at',
            'admin_note',
        ]
        read_only_fields = (
            'status','step','notice_met','created_at',
            'lead_decision','lead_note','lead_decided_by','lead_decided_at',
            'admin_note',
        )
class LeaveRequestCreateSerializer(serializers.ModelSerializer):
    """Employee creates a request -> always starts at step=lead, status=pending."""
    class Meta:
        model = LeaveRequest
        fields = ['start_date','end_date','reason','leave_type','peer_note']

class LeaveLeadDecisionSerializer(serializers.ModelSerializer):
    """Used by Team Leads only."""
    class Meta:
        model = LeaveRequest
        fields = ['lead_decision','lead_note']  # approved / rejected + note

class LeaveAdminDecisionSerializer(serializers.ModelSerializer):
    """Used by Admin for the final decision."""
    class Meta:
        model = LeaveRequest
        fields = ['status','admin_note']  # status must be approved/rejected

class LeaveRequestStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = ['status']  # only allow changing status



class AttendanceSerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%Y-%m-%d")
    check_in = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S%z", required=False, allow_null=True)
    check_out = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S%z", required=False, allow_null=True)
    hours_worked = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            "id", "date", "status", "mode",
            "check_in", "check_out",
            "minutes_late", "tag", "hours_worked",
        ]

    def get_hours_worked(self, obj):
        # if your model already has a property, this will return it
        hw = getattr(obj, "hours_worked", None)
        if hw is not None:
            return hw
        # fallback compute
        if obj.check_in and obj.check_out:
            delta = obj.check_out - obj.check_in
            return round(delta.total_seconds() / 3600, 2)
        return None

class EarlyOffRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.username', read_only=True)
    class Meta:
        model = EarlyOffRequest
        fields = [
            'id','employee','employee_name',
            'for_date','reason','status','admin_note',
            'created_at','updated_at'
        ]
        read_only_fields = ['status','created_at','updated_at']

class EarlyOffDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EarlyOffRequest
        fields = ['status','admin_note']




class AttendanceCorrectionSerializer(serializers.ModelSerializer):
    # nice to have for the admin list
    employee_name = serializers.CharField(
        source="employee.user.username", read_only=True
    )

    class Meta:
        model = AttendanceCorrection
        fields = [
            "id", "employee", "employee_name",
            "for_date", "want_check_in", "want_check_out",
            "reason", "status", "admin_note", "created_at",
        ]
        read_only_fields = ("status", "admin_note", "created_at", "employee")



class AttendanceCorrectionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceCorrection
        fields = ("status", "admin_note")



class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["id", "name"]

class EmployeeCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email    = serializers.EmailField(write_only=True)

    team = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # NEW:
    is_team_lead = serializers.BooleanField(write_only=True, required=False, default=False)
    lead_teams   = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False, default=list
    )

    class Meta:
        model = Employee
        fields = [
            "id", "username", "password", "email",
            "designation", "leave_balance", "join_date",
            "team",
            # NEW:
            "is_team_lead", "lead_teams",
        ]

    def create(self, validated_data):
        username  = validated_data.pop("username")
        password  = validated_data.pop("password")
        email     = validated_data.pop("email")
        team_name = (validated_data.pop("team", "") or "").strip()

        is_lead   = bool(validated_data.pop("is_team_lead", False))
        lead_list = validated_data.pop("lead_teams", []) or []

        user = User.objects.create_user(username=username, password=password, email=email)

        team_obj = None
        if team_name:
            team_obj, _ = Team.objects.get_or_create(name=team_name)

        emp = Employee.objects.create(user=user, team=team_obj, **validated_data)

        if is_lead:
            # ensure is_staff for admin-side access
            if not user.is_staff:
                user.is_staff = True
                user.save(update_fields=["is_staff"])
            tl, _ = TeamLead.objects.get_or_create(user=user)
            team_objs = []
            for nm in {t.strip() for t in lead_list if str(t).strip()}:
                t, _ = Team.objects.get_or_create(name=nm)
                team_objs.append(t)
            if team_objs:
                tl.teams.set(team_objs)
        return emp

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["username"] = instance.user.username
        rep["email"]    = instance.user.email
        rep["team"]     = instance.team.name if instance.team else None

        # helpful for the Employee List table (optional)
        tl = getattr(instance.user, "team_lead", None)
        rep["is_team_lead"] = bool(tl)
        rep["lead_teams"]   = [t.name for t in tl.teams.all()] if tl else []
        return rep


# attendance/serializers.py
class EmployeeListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email    = serializers.EmailField(source="user.email", read_only=True)
    team     = serializers.CharField(source="team.name", read_only=True)

    # NEW
    is_team_lead = serializers.SerializerMethodField()
    lead_teams   = serializers.SerializerMethodField()     # teams this person leads
    team_leads   = serializers.SerializerMethodField()     # leaders of this employee's team

    wfh_count    = serializers.IntegerField(read_only=True, default=0)
    onsite_count = serializers.IntegerField(read_only=True, default=0)

    def get_is_team_lead(self, obj):
        return hasattr(obj.user, "team_lead")

    def get_is_team_lead(self,obj):
        return hasattr(obj.user,"team_lead")

    def get_lead_teams(self, obj):
        tl = getattr(obj.user, "team_lead", None)
        return [t.name for t in tl.teams.all()] if tl else []

    def get_team_leads(self, obj):
        # filled by context (built once in the view)
        mapping = self.context.get("team_to_leads", {})
        return mapping.get(obj.team_id, [])

    class Meta:
        model  = Employee
        fields = (
            "id","username","email","team","designation","leave_balance",
            "join_date","wfh_count","onsite_count",
            "is_team_lead","lead_teams","team_leads",
        )




