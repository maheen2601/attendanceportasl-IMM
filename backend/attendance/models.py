# from django.db import models
# from django.contrib.auth.models import User 

# # Create your models here.
# class Employee(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)  # Link to login account
#     designation = models.CharField(max_length=100)
#     join_date = models.DateField(auto_now_add=True)
#     leave_balance = models.IntegerField(default=15)

#     def __str__(self):
#         return self.user.username  # ✅ fixed

# class Attendance(models.Model):
#     STATUS_CHOICES = [
#         ('Present', 'Present'),
#         ('Absent', 'Absent'),
#         ('Leave', 'Leave'),
#     ]

#     MODE_CHOICES = [
#         ('WFH', 'Work From Home'),
#         ('Onsite', 'Onsite'),
#     ]

#     employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
#     date = models.DateField(auto_now_add=True)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES)
#     mode = models.CharField(max_length=10, choices=MODE_CHOICES, blank=True, null=True)

#     def __str__(self):
#         return f"{self.employee.user.username} - {self.date} - {self.status}"
# # models.py
# from django.db import models
# from django.contrib.auth.models import User

# class LeaveRequest(models.Model):
#     STATUS_CHOICES = (
#         ('pending', 'Pending'),
#         ('approved', 'Approved'),
#         ('rejected', 'Rejected'),
#     )
#     employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
#     start_date = models.DateField()
#     end_date = models.DateField()
#     reason = models.TextField()
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

#     def __str__(self):
#         return f"{self.employee.user.username} - {self.status}"
    



# attendance/models.py
from django.db import models
from django.contrib.auth.models import User
from datetime import date as date_cls
from datetime import date as date_cls, time as time_cls, datetime as dt
# class Employee(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     designation = models.CharField(max_length=100)
#     join_date = models.DateField(auto_now_add=True)
#     leave_balance = models.IntegerField(default=15)
#     shift_start = models.TimeField(default="09:00")
#     shift_end   = models.TimeField(default="17:00")

#     def __str__(self):
#         return self.user.username

# class Attendance(models.Model):
#     STATUS_CHOICES = [
#         ('Present', 'Present'),
#         ('Absent', 'Absent'),
#         ('Leave', 'Leave'),
#     ]
#     MODE_CHOICES = [
#         ('WFH', 'Work From Home'),
#         ('Onsite', 'Onsite'),
#     ]
#     employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
#     # default=today so we can also create backfilled rows (e.g., for leave)
#     date = models.DateField(default=date_cls.today)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES)
#     mode = models.CharField(max_length=10, choices=MODE_CHOICES, blank=True, null=True)
#     check_in  = models.DateTimeField(blank=True, null=True)
#     check_out = models.DateTimeField(blank=True, null=True)
#     minutes_late = models.PositiveIntegerField(default=0)
#     TAG_CHOICES = [
#         ('normal','Normal'),
#         ('late_inf','Late (informed)'),
#         ('late_uninf','Late (uninformed)'),
#         ('early_off_ok','Early-off (approved)'),
#         ('short_hours','Short hours (unapproved)'),
#     ]
#     tag = models.CharField(max_length=20, choices=TAG_CHOICES, default='normal')

#     @property
#     def hours_worked(self):
#         if self.check_in and self.check_out:
#             delta = self.check_out - self.check_in
#             return round(delta.total_seconds()/3600, 2)
#         return 0

#     class Meta:
#         unique_together = ('employee', 'date')  # one attendance per day
#         ordering = ['-date']

#     def __str__(self):
#         return f"{self.employee.user.username} - {self.date} - {self.status}"

# class LeaveRequest(models.Model):
#     STATUS_CHOICES = (
#         ('pending', 'Pending'),
#         ('approved', 'Approved'),
#         ('rejected', 'Rejected'),
#     )
#     employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
#     start_date = models.DateField()
#     end_date = models.DateField()
#     reason = models.TextField()
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
#     LEAVE_TYPES = (
#     ('sick','Sick/Emergency'),
#     ('casual','Casual'),
#     ('annual','Annual'),
#     ('comp','Compensatory'),
#     ('wfh','WFH'),
# )
#     STATUS_CHOICES = (
#         ('pending','Pending'),
#         ('approved','Approved'),
#         ('rejected','Rejected'),
#         ('auto_rejected','Auto Rejected'),
#     )
#     leave_type = models.CharField(max_length=10, choices=LEAVE_TYPES, default='casual')
#     notice_met = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     peer_note  = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"{self.employee.user.username} - {self.status}"

# class PolicySettings(models.Model):
#     grace_minutes = models.PositiveIntegerField(default=15)       # late grace
#     late_notice_minutes = models.PositiveIntegerField(default=45) # inform-before window
#     notice_sick_hours = models.PositiveIntegerField(default=3)
#     notice_casual_hours = models.PositiveIntegerField(default=24)
#     notice_annual_short_days = models.PositiveIntegerField(default=20)
#     notice_annual_long_days = models.PositiveIntegerField(default=30)
#     notice_comp_days = models.PositiveIntegerField(default=2)
#     min_daily_hours = models.PositiveIntegerField(default=8)
#     wfh_prior_days = models.PositiveIntegerField(default=0)       # “in advance”

#     def __str__(self): return "Policy Settings"
#     @classmethod
#     def get(cls): return cls.objects.first() or cls.objects.create()


# class PreNotice(models.Model):
#     KIND_CHOICES = (('late','Late-coming'),)
#     employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
#     kind = models.CharField(max_length=10, choices=KIND_CHOICES)
#     for_date = models.DateField()         # which shift day
#     created_at = models.DateTimeField(auto_now_add=True)

# class EarlyOffRequest(models.Model):
#     STATUS = (('pending','Pending'),('approved','Approved'),('rejected','Rejected'))
#     employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
#     for_date = models.DateField()
#     reason   = models.TextField(blank=True)
#     status   = models.CharField(max_length=10, choices=STATUS, default='pending')
#     decided_at = models.DateTimeField(blank=True, null=True)


# attendance/models.py
from django.db import models
from django.contrib.auth.models import User
from datetime import date as date_cls
from datetime import date as date_cls, time as time_cls, datetime as dt



class Team(models.Model):
    name = models.CharField(max_length=80, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
class TeamLead(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="team_lead")
    teams = models.ManyToManyField(Team, related_name="leaders", blank=True)
    def __str__(self): return f"{self.user.username} (lead)"

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    designation = models.CharField(max_length=100)
    join_date = models.DateField(auto_now_add=True)
    leave_balance = models.IntegerField(default=15)
    shift_start = models.TimeField(default=time_cls(9, 0))
    shift_end   = models.TimeField(default=time_cls(17, 0))

    # NEW: team assignment
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees")

    def __str__(self):
        return self.user.username
    

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Leave',  'Leave'),
    ]
    MODE_CHOICES = [
        ('WFH',    'Work From Home'),
        ('Onsite', 'Onsite'),
    ]
    TAG_CHOICES = [
        ('normal',       'Normal'),
        ('late_inf',     'Late (informed)'),
        ('late_uninf',   'Late (uninformed)'),
        ('early_off_ok', 'Early-off (approved)'),
        ('short_hours',  'Short hours (unapproved)'),
    ]
    
    employee   = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date       = models.DateField(default=date_cls.today, db_index=True)
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES)
    mode       = models.CharField(max_length=10, choices=MODE_CHOICES, blank=True, null=True)
    check_in   = models.DateTimeField(blank=True, null=True)
    check_out  = models.DateTimeField(blank=True, null=True)
    minutes_late = models.PositiveIntegerField(default=0)
    tag        = models.CharField(max_length=20, choices=TAG_CHOICES, default='normal')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['employee', 'date'], name='uniq_employee_attendance_per_day'),
        ]
        ordering = ['-date']

    def save(self, *args, **kwargs):
        # Auto-calc minutes_late if we have a check-in and the person is present
        if self.check_in and self.status == 'Present':
            try:
                shift_dt = dt.combine(self.date, self.employee.shift_start)
                raw_minutes = (self.check_in - shift_dt).total_seconds() / 60
                late = int(raw_minutes) if raw_minutes > 0 else 0
                grace = PolicySettings.get().grace_minutes if PolicySettings.objects.exists() else 15
                self.minutes_late = max(0, late - grace)
            except Exception:
                # Keep whatever is set if something goes wrong
                pass
        else:
            self.minutes_late = 0
        super().save(*args, **kwargs)

    @property
    def hours_worked(self):
        if self.check_in and self.check_out:
            secs = (self.check_out - self.check_in).total_seconds()
            return round(max(0, secs) / 3600, 2)
        return 0

    def __str__(self):
        return f"{self.employee.user.username} - {self.date} - {self.status}"


class LeaveRequest(models.Model):
    LEAVE_TYPES = (
        ('sick',   'Sick/Emergency'),
        ('casual', 'Casual'),
        ('annual', 'Annual'),
        ('comp',   'Compensatory'),
        ('wfh',    'WFH'),
    )
    # final status (unchanged semantics)
    STATUS_CHOICES = (
        ('pending',  'Pending'),     # means “not finally decided yet”
        ('approved', 'Approved'),    # final
        ('rejected', 'Rejected'),    # final
    )

    # NEW: which step we are on
    STEP_CHOICES = (
        ('lead',  'Lead review'),   # waiting on lead
        ('admin', 'Admin review'),  # waiting on admin
        ('done',  'Finalized'),     # final done (approved / rejected)
    )

    employee   = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='leave_requests')
    start_date = models.DateField()
    end_date   = models.DateField()
    reason     = models.TextField()
    leave_type = models.CharField(max_length=10, choices=LEAVE_TYPES, default='casual')

    # FINAL status (what you already had; keep as “pending” until admin finishes OR lead rejects)
    status     = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')

    # NEW: routing/step
    step       = models.CharField(max_length=10, choices=STEP_CHOICES, default='lead', db_index=True)

    # Policy flags you already had
    notice_met = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    peer_note  = models.TextField(blank=True, null=True)

    # NEW: lead decision fields
    LEAD_DECISIONS = (('approved','Approved'), ('rejected','Rejected'))
    lead_decision   = models.CharField(max_length=10, choices=LEAD_DECISIONS, blank=True, null=True)
    lead_note       = models.TextField(blank=True, default="")
    lead_decided_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='lead_leave_decisions')
    lead_decided_at = models.DateTimeField(null=True, blank=True)

    # NEW: admin note (admin decision is reflected in final status)
    admin_note      = models.TextField(blank=True, default="")

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.start_date > self.end_date:
            raise ValidationError("Start date cannot be after end date.")

    def __str__(self):
        return f"{self.employee.user.username} - {self.status} [{self.step}]"

class PolicySettings(models.Model):
    grace_minutes = models.PositiveIntegerField(default=15)       # late grace
    late_notice_minutes = models.PositiveIntegerField(default=45) # inform-before window
    notice_sick_hours = models.PositiveIntegerField(default=3)
    notice_casual_hours = models.PositiveIntegerField(default=24)
    notice_annual_short_days = models.PositiveIntegerField(default=20)
    notice_annual_long_days  = models.PositiveIntegerField(default=30)
    notice_comp_days = models.PositiveIntegerField(default=2)
    min_daily_hours  = models.PositiveIntegerField(default=8)
    wfh_prior_days   = models.PositiveIntegerField(default=0)     # “in advance”

    def __str__(self):
        return "Policy Settings"

    @classmethod
    def get(cls):
        return cls.objects.first() or cls.objects.create()

    class Meta:
        verbose_name_plural = "Policy settings"


class PreNotice(models.Model):
    KIND_CHOICES = (('late', 'Late-coming'),)
    employee   = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='pre_notices')
    kind       = models.CharField(max_length=10, choices=KIND_CHOICES)
    for_date   = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['employee', 'kind', 'for_date'], name='uniq_prenotice_per_day_kind'),
        ]


class EarlyOffRequest(models.Model):
    STATUS = (('pending','Pending'), ('approved','Approved'), ('rejected','Rejected'))
    employee   = models.ForeignKey(Employee, on_delete=models.CASCADE)
    for_date   = models.DateField()
    reason     = models.TextField(blank=True)
    status     = models.CharField(max_length=10, choices=STATUS, default='pending')
    admin_note = models.TextField(blank=True, default="")   # optional
    created_at = models.DateTimeField(auto_now_add=True)     # NEW
    updated_at = models.DateTimeField(auto_now=True)         # NEW


# attendance/models.py
class AttendanceCorrection(models.Model):
    STATUS = (('pending','Pending'), ('approved','Approved'), ('rejected','Rejected'))

    employee       = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_corrections')
    for_date       = models.DateField()
    want_check_in  = models.TimeField(blank=True, null=True)
    want_check_out = models.TimeField(blank=True, null=True)
    reason         = models.TextField()
    status         = models.CharField(max_length=10, choices=STATUS, default='pending')
    admin_note     = models.TextField(blank=True, null=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'for_date', 'created_at')  # prevents exact dupes
        ordering = ('-id',)

    def __str__(self):
        return f"{self.employee.user.username} {self.for_date} [{self.status}]"

