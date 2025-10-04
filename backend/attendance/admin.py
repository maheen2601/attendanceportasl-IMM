# from django.contrib import admin
# from .models import Employee
# from .models import Employee, Attendance
# # Register your models here.
# from .models import PolicySettings


# @admin.register(Employee)
# class EmployeeAdmin(admin.ModelAdmin):
#     list_display = ('user', 'designation', 'leave_balance', 'join_date')

# @admin.register(Attendance)
# class AttendanceAdmin(admin.ModelAdmin):
#     list_display = ('employee', 'date', 'status', 'mode')
#     list_filter = ('status', 'mode', 'date')

# @admin.register(PolicySettings)
# class PolicySettingsAdmin(admin.ModelAdmin):
#     list_display = ("grace_minutes","late_notice_minutes","min_daily_hours")





# attendance/admin.py
from django import forms
from django.contrib import admin
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.contrib.auth.models import User

from .models import Employee, Attendance, PolicySettings, Team, TeamLead

class EmployeeAdminForm(forms.ModelForm):
    is_team_lead = forms.BooleanField(required=False, label="Is Team Lead?")
    lead_teams = forms.ModelMultipleChoiceField(
        queryset=Team.objects.all(),
        required=False,
        widget=FilteredSelectMultiple("teams", is_stacked=False),
        label="Lead Teams"
    )

    class Meta:
        model = Employee
        fields = "__all__"


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # When editing, pre-fill from existing TeamLead
        if self.instance and self.instance.pk:
            tl = TeamLead.objects.filter(user=self.instance.user).first()
            if tl:
                self.fields["is_team_lead"].initial = True
                self.fields["lead_teams"].initial = tl.teams.all()

    def save(self, commit=True):
        emp = super().save(commit)
        user = emp.user
        is_lead = self.cleaned_data.get("is_team_lead")
        teams = self.cleaned_data.get("lead_teams")

        if is_lead:
            # Ensure they can access the admin UI
            if not user.is_staff:
                user.is_staff = True
                user.save(update_fields=["is_staff"])
            tl, _ = TeamLead.objects.get_or_create(user=user)
            if teams is not None:
                tl.teams.set(teams)
        else:
            # Remove lead record if unchecked
            TeamLead.objects.filter(user=user).delete()
        return emp


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    form = EmployeeAdminForm
    list_display = ("user", "designation", "team", "is_lead", "leave_balance", "join_date")
    list_filter = ("team",)
    search_fields = ("user__username", "user__email", "designation")

    def is_lead(self, obj):
        return TeamLead.objects.filter(user=obj.user).exists()
    is_lead.boolean = True
    is_lead.short_description = "Lead?"

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'status', 'mode')
    list_filter = ('status', 'mode', 'date')

@admin.register(PolicySettings)
class PolicySettingsAdmin(admin.ModelAdmin):
    list_display = ("grace_minutes", "late_notice_minutes", "min_daily_hours")

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    search_fields = ("name",)

@admin.register(TeamLead)
class TeamLeadAdmin(admin.ModelAdmin):
    list_display = ("user",)
    filter_horizontal = ("teams",)
