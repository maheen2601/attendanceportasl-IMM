

# attendance/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, LeaveRequest, Attendance
from .models import EarlyOffRequest


class EmployeeCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'username', 'password', 'designation', 'leave_balance', 'join_date']

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user = User.objects.create_user(username=username, password=password)
        return Employee.objects.create(user=user, **validated_data)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['username'] = instance.user.username
        return rep

class EmployeeProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'username', 'designation', 'join_date', 'leave_balance']

class AttendanceSerializer(serializers.ModelSerializer):
    date = serializers.DateField(format="%Y-%m-%d")
    class Meta:
        model = Attendance
        fields = ["id","date","status","mode","check_in","check_out","minutes_late","tag","hours_worked"]
        read_only_fields = ["hours_worked"]
class LeaveRequestSerializer(serializers.ModelSerializer):
    # nice-to-have display name for admin list
    employee_name = serializers.CharField(
        source='employee.user.username', read_only=True
    )

    class Meta:
        model = LeaveRequest
        fields = [
            'id',
            'employee',        # keep id for admin lists (write-only on create if you like)
            'employee_name',   # read-only helper
            'start_date',
            'end_date',
            'reason',
            'leave_type',      # <-- needed by UI + pie chart
            'status',
            'notice_met',      # <-- shows “Met/Short” badge
            'peer_note',       # <-- optional, used by your form
            'created_at',      # optional but handy
        ]
        read_only_fields = ('status', 'notice_met', 'created_at')
        # read_only_fields = ['status']


class LeaveRequestStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = ['status']  # only allow changing status


# serializers.py
from rest_framework import serializers
from .models import Attendance

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

# # attendance/serializers.py

# class EarlyOffRequestSerializer(serializers.ModelSerializer):
#     employee_name = serializers.CharField(source='employee.user.username', read_only=True)

#     class Meta:
#         model = EarlyOffRequest
#         # keep ONLY fields that exist on the model
#         fields = [
#             'id', 'employee', 'employee_name',
#             'for_date', 'reason', 'status',
#             'created_at', 'updated_at'
#         ]
#         read_only_fields = ['status', 'created_at', 'updated_at']


# # used by admin PATCH to approve/reject
# class EarlyOffDecisionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = EarlyOffRequest
#         fields = ['status']  # add 'admin_note' here only if the model has it

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


# attendance/serializers.py
from .models import AttendanceCorrection

from rest_framework import serializers
from .models import AttendanceCorrection

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


from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, LeaveRequest, Attendance, EarlyOffRequest

class EmployeeCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email    = serializers.EmailField(write_only=True)  # NEW

    class Meta:
        model = Employee
        fields = ['id', 'username', 'password', 'email', 'designation', 'leave_balance', 'join_date']

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email    = validated_data.pop('email')
        user = User.objects.create_user(username=username, password=password, email=email)
        return Employee.objects.create(user=user, **validated_data)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['username'] = instance.user.username
        rep['email'] = instance.user.email  # helpful for admin UI
        return rep
# attendance/serializers.py
from rest_framework import serializers
from .models import Employee

class EmployeeListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email    = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model  = Employee
        fields = ("id", "username", "email", "designation", "leave_balance", "join_date")



