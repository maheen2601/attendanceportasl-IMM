# from django.urls import path
# from .views import CustomTokenObtainPairView
# from rest_framework_simplejwt.views import TokenRefreshView
# from .views import CreateEmployeeAPIView
# from .views import EmployeeListAPIView
# from .views import DeleteEmployeeAPIView
# from .views import LeaveRequestListAPIView, LeaveRequestUpdateAPIView
# from .views import dashboard_stats
# from . import views
# from .views import (
#     CustomTokenObtainPairView,
#     CreateEmployeeAPIView, EmployeeListAPIView, DeleteEmployeeAPIView,
#     LeaveRequestListAPIView, LeaveRequestUpdateAPIView,
#     dashboard_stats,
#     me_profile, my_stats, my_attendance,
#     my_leaves, my_leave_cancel,
# )




# from .views import admin_employee_attendance
# from .views import my_leaves, my_leave_cancel
# from .views import me_dashboard

# from .views import team_list
# from .views import lead_leave_list,lead_leave_update



# from .views import admin_employees, lead_employees
# # attendance/urls.py
# from django.urls import path
# from rest_framework_simplejwt.views import TokenRefreshView

# from .views import (
#     # auth
#     CustomTokenObtainPairView,

#     # employee self
#     me_profile, me_dashboard, my_stats, my_attendance,
#     check_in, check_out, pre_notify_late,
#     my_leaves, my_leave_cancel,
#     my_attendance_corrections,

#     # admin employees
#     CreateEmployeeAPIView, EmployeeListAPIView, DeleteEmployeeAPIView,

#     # admin leave requests
#     LeaveRequestAdminList, LeaveRequestAdminUpdate,

#     # time corrections admin
#     AttendanceCorrectionAdminList, AttendanceCorrectionAdminUpdate,

#     # early-off + policy + stats
#     policy_settings_get, earlyoff_list_create,
#     earlyoff_admin_list, earlyoff_update,
#     dashboard_stats,

#     # (optional) extra
#     get_leave_distribution,
# )

# urlpatterns = [
#     # -------- Auth
#     path("login/",   CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
#     path("refresh/", TokenRefreshView.as_view(),          name="token_refresh"),

#     # -------- Employee (self)
#     path("me/profile/",               me_profile,    name="me_profile"),
#     path("me/dashboard/",             me_dashboard,  name="me_dashboard"),
#     path("me/attendance/",            my_attendance, name="my_attendance"),
#     path("me/attendance/stats/",      my_stats,      name="my_stats"),
#     path("me/attendance/check-in/",   check_in,      name="check_in"),
#     path("me/attendance/check-out/",  check_out,     name="check_out"),
#     path("me/attendance/pre-notice/late/", pre_notify_late, name="pre_notify_late"),
#     path("me/attendance/corrections/",    my_attendance_corrections, name="my_attendance_corrections"),
#     path("me/leaves/",                    my_leaves,       name="my_leaves"),
#     path("me/leaves/<int:pk>/",           my_leave_cancel, name="my_leave_cancel"),
#     path("me/leave-distribution/",        get_leave_distribution, name="leave_distribution"),

#     # -------- Admin: employees  (👈 these match your React page)
#     # path("admin/employees/",            EmployeeListAPIView.as_view(),   name="admin_employee_list"),
#     path("admin/employees/create/",     CreateEmployeeAPIView.as_view(), name="admin_employee_create"),
#     path("admin/employees/<int:pk>/",   DeleteEmployeeAPIView.as_view(), name="admin_employee_delete"),
#     path("admin/employee-attendance/", admin_employee_attendance, name="admin_employee_attendance"),

#     # -------- Admin: leave approvals
#     path("leave-requests/",             LeaveRequestAdminList.as_view(),   name="leave_requests"),
#     path("leave-requests/<int:pk>/",    LeaveRequestAdminUpdate.as_view(), name="leave_request_update"),
    

#     # -------- Admin: time corrections
#     path("attendance-corrections/",          AttendanceCorrectionAdminList.as_view(),   name="attendance_correction_admin_list"),
#     path("attendance-corrections/<int:pk>/", AttendanceCorrectionAdminUpdate.as_view(), name="attendance_correction_admin_update"),

#     # -------- Early-off + policy + stats
#     path("me/earlyoff/",               earlyoff_list_create, name="earlyoff_list_create"),  # employee self
#     path("admin/earlyoff/",            earlyoff_admin_list, name="earlyoff_admin_list"),
#     path("admin/earlyoff/<int:pk>/",   earlyoff_update,     name="earlyoff_update"),
#     path("policy/",                    policy_settings_get, name="policy_get"),
#     # path("admin/stats/",               dashboard_stats,     name="dashboard_stats"),
#     path("dashboard-stats/", views.dashboard_stats, name="dashboard-stats"),
#     path("leave-requests/<int:pk>/", views.LeaveRequestAdminUpdate.as_view()),
#     path("me/attendance/today/", views.my_attendance_today, name="my-attendance-today"),
#     # your existing list/range endpoint:
#     path("me/attendance/", views.my_attendance, name="my-attendance"),
#     path("admin/teams/", team_list, name="admin_team_list"),
#     # lead endpoints
#     # path("admin/teams/", team_list, name="admin_team_list"),
#     path("lead/leave-requests/", lead_leave_list, name="lead_leave_list"),
#     path("lead/leave-requests/<int:pk>/", lead_leave_update, name="lead_leave_update"),
    

#     path("admin/employees/", admin_employees, name="admin_employees"),
#     path("lead/employees/", lead_employees, name="lead_employees"),
# ]
from django.urls import path
from .views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CreateEmployeeAPIView
from .views import EmployeeListAPIView
from .views import DeleteEmployeeAPIView
from .views import LeaveRequestListAPIView, LeaveRequestUpdateAPIView
from .views import dashboard_stats
from . import views
from .views import (
    CustomTokenObtainPairView,
    CreateEmployeeAPIView, EmployeeListAPIView, DeleteEmployeeAPIView,
    LeaveRequestListAPIView, LeaveRequestUpdateAPIView,
    dashboard_stats,
    me_profile, my_stats, my_attendance,
    my_leaves, my_leave_cancel,
)




from .views import admin_employee_attendance
from .views import my_leaves, my_leave_cancel
from .views import me_dashboard

from .views import team_list
from .views import lead_leave_list,lead_leave_update



from .views import admin_employees, lead_employees
# attendance/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    # auth
    CustomTokenObtainPairView,

    # employee self
    me_profile, me_dashboard, my_stats, my_attendance,
    check_in, check_out, pre_notify_late,
    my_leaves, my_leave_cancel,
    my_attendance_corrections,

    # admin employees
    CreateEmployeeAPIView, EmployeeListAPIView, DeleteEmployeeAPIView,

    # admin leave requests
    LeaveRequestAdminList, LeaveRequestAdminUpdate,

    # time corrections admin
    AttendanceCorrectionAdminList, AttendanceCorrectionAdminUpdate,

    # early-off + policy + stats
    policy_settings_get, earlyoff_list_create,
    earlyoff_admin_list, earlyoff_update,
    dashboard_stats,

    # (optional) extra
    get_leave_distribution,
)

urlpatterns = [
    # -------- Auth
    path("login/",   CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(),          name="token_refresh"),

    # -------- Employee (self)
    path("me/profile/",               me_profile,    name="me_profile"),
    path("me/dashboard/",             me_dashboard,  name="me_dashboard"),
    path("me/attendance/",            my_attendance, name="my_attendance"),
    path("me/attendance/stats/",      my_stats,      name="my_stats"),
    path("me/attendance/check-in/",   check_in,      name="check_in"),
    path("me/attendance/check-out/",  check_out,     name="check_out"),
    path("me/attendance/pre-notice/late/", pre_notify_late, name="pre_notify_late"),
    path("me/attendance/corrections/",    my_attendance_corrections, name="my_attendance_corrections"),
    path("me/leaves/",                    my_leaves,       name="my_leaves"),
    path("me/leaves/<int:pk>/",           my_leave_cancel, name="my_leave_cancel"),
    path("me/leave-distribution/",        get_leave_distribution, name="leave_distribution"),

    # -------- Admin: employees  (👈 these match your React page)
    # path("admin/employees/",            EmployeeListAPIView.as_view(),   name="admin_employee_list"),
    path("admin/employees/create/",     CreateEmployeeAPIView.as_view(), name="admin_employee_create"),
    path("admin/employees/<int:pk>/",   DeleteEmployeeAPIView.as_view(), name="admin_employee_delete"),
    path("admin/employee-attendance/", admin_employee_attendance, name="admin_employee_attendance"),

    # -------- Admin: leave approvals
    path("leave-requests/",             LeaveRequestAdminList.as_view(),   name="leave_requests"),
    path("leave-requests/<int:pk>/",    LeaveRequestAdminUpdate.as_view(), name="leave_request_update"),
    

    # -------- Admin: time corrections
    path("attendance-corrections/",          AttendanceCorrectionAdminList.as_view(),   name="attendance_correction_admin_list"),
    path("attendance-corrections/<int:pk>/", AttendanceCorrectionAdminUpdate.as_view(), name="attendance_correction_admin_update"),

    # -------- Early-off + policy + stats
    path("me/earlyoff/",               earlyoff_list_create, name="earlyoff_list_create"),  # employee self
    path("admin/earlyoff/",            earlyoff_admin_list, name="earlyoff_admin_list"),
    path("admin/earlyoff/<int:pk>/",   earlyoff_update,     name="earlyoff_update"),
    path("policy/",                    policy_settings_get, name="policy_get"),
    # path("admin/stats/",               dashboard_stats,     name="dashboard_stats"),
    path("dashboard-stats/", views.dashboard_stats, name="dashboard-stats"),
    path("leave-requests/<int:pk>/", views.LeaveRequestAdminUpdate.as_view()),
    path("me/attendance/today/", views.my_attendance_today, name="my-attendance-today"),
    # your existing list/range endpoint:
    path("me/attendance/", views.my_attendance, name="my-attendance"),
    path("admin/teams/", team_list, name="admin_team_list"),
    # lead endpoints
    # path("admin/teams/", team_list, name="admin_team_list"),
    # path("lead/leave-requests/", lead_leave_list, name="lead_leave_list"),
    path("lead/leave-requests/<int:pk>/", lead_leave_update, name="lead_leave_update"),
    

    path("admin/employees/", admin_employees, name="admin_employees"),
    path("lead/employees/", lead_employees, name="lead_employees"),
]
