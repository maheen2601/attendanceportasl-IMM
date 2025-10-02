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
from .views import my_leaves, my_leave_cancel
from .views import me_dashboard
from .views import MeProfileView
# urlpatterns = [
#     path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('employees/', CreateEmployeeAPIView.as_view(), name='create_employee'),
#     path('employees/all/', EmployeeListAPIView.as_view(), name='all_employees'),
#     path('employees/delete/<int:pk>/', DeleteEmployeeAPIView.as_view(), name='delete_employee'),
#     path('dashboard-stats/', views.dashboard_stats),

#     path('me/', me_profile, name='me_profile'),
#     path('me/stats/', my_stats, name='my_stats'),
#     path('me/attendance/', my_attendance, name='my_attendance'),
#     path('me/attendance/mark/', mark_today_present, name='mark_today_present'),
#     path('me/leave-requests/', my_leaves, name='my_leaves_alias'),
#     path('me/leave-requests/<int:pk>/', my_leave_cancel, name='my_leave_cancel_alias'),
#     path('me/leaves/<int:pk>/', my_leave_cancel, name='my_leave_cancel'),
#     path('me/dashboard/', me_dashboard, name='me_dashboard'),
#     path('dashboard-stats/', dashboard_stats),
# ]


# urlpatterns += [
#     path('leave-requests/', LeaveRequestListAPIView.as_view(), name='leave_requests'),
#     path('leave-requests/<int:pk>/', LeaveRequestUpdateAPIView.as_view(), name='leave_request_update'),
# # ]
# from django.urls import path
# from rest_framework_simplejwt.views import TokenRefreshView

# from django.urls import path
# from .views import (
#     my_attendance_corrections,
#     AttendanceCorrectionAdminList,
#     AttendanceCorrectionAdminUpdate,
#     # ...other imports you already had
# )

# from .views import (
#     # auth
#     CustomTokenObtainPairView,
#     # admin users
#     CreateEmployeeAPIView, EmployeeListAPIView, DeleteEmployeeAPIView,
#     # leave admin
#     LeaveRequestListAPIView, LeaveRequestUpdateAPIView,
#     # dashboards
#     dashboard_stats,
#     # employee self
#     me_profile, me_dashboard, my_stats, my_attendance,
#     check_in, check_out, pre_notify_late,
#     my_leaves, my_leave_cancel,
#     # policy
#     policy_settings_get, earlyoff_list_create, earlyoff_admin_list, earlyoff_update, get_leave_distribution,
#     MyAttendanceCorrections,
#     AttendanceCorrectionAdminList,
#     AttendanceCorrectionAdminUpdate,
# )

# from .views import earlyoff_admin_list, earlyoff_update



# urlpatterns = [
#     path('login/',   CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('refresh/', TokenRefreshView.as_view(),          name='token_refresh'),

#     path('employees/',                 CreateEmployeeAPIView.as_view(), name='employee_create'),
#     path('employees/all/',             EmployeeListAPIView.as_view(),   name='employee_list'),
#     path('employees/<int:pk>/delete/', DeleteEmployeeAPIView.as_view(), name='employee_delete'),

#     # ----- Dashboard -----
#     path('dashboard-stats/', dashboard_stats, name='dashboard_stats'),

#     # ----- Employee (self) -----
#     path('me/',                 me_profile,      name='me_profile'),
#     path('me/dashboard/',       me_dashboard,    name='me_dashboard'),
#     path('me/stats/',           my_stats,        name='my_stats'),
#     path('me/attendance/',      my_attendance,   name='my_attendance'),
#     path('me/attendance/check-in/',   check_in,       name='check_in'),
#     path('me/attendance/check-out/',  check_out,      name='check_out'),
#     path('me/attendance/pre-notice/late/', pre_notify_late, name='pre_notify_late'),

#     # Leave / WFH (self)
#     path('me/leave-requests/',          my_leaves,       name='my_leaves'),
#     path('me/leave-requests/<int:pk>/', my_leave_cancel, name='my_leave_cancel'),

#     # ----- Leave approvals (admin) -----
#     path('leave-requests/',          LeaveRequestListAPIView.as_view(),   name='leave_requests'),
#     path('leave-requests/<int:pk>/', LeaveRequestUpdateAPIView.as_view(), name='leave_request_update'),
#     # attendance/urls.py
# path('policy/', policy_settings_get, name='policy_get'),
# path('me/early-off/', earlyoff_list_create, name='earlyoff_list_create'),
# path('early-off/', earlyoff_admin_list, name='earlyoff_admin_list'),
# path('early-off/<int:pk>/', earlyoff_update, name='earlyoff_update'),
# path('api/me/leave-distribution/', get_leave_distribution, name='leave-distribution'),
#   path("me/attendance/corrections/", MyAttendanceCorrections.as_view(), name="my_attendance_corrections"),

#     # admin
#     path("attendance-corrections/", AttendanceCorrectionAdminList.as_view(), name="attendance_correction_admin_list"),
#     path("attendance-corrections/<int:pk>/", AttendanceCorrectionAdminUpdate.as_view(), name="attendance_correction_admin_update"),
# ]

# urlpatterns += [
#     # employee self
#     path('me/attendance/corrections/', my_attendance_corrections, name='my_attendance_corrections'),

#     # admin
#     path('attendance-corrections/', AttendanceCorrectionAdminList.as_view(), name='attendance_correction_admin_list'),
#     path('attendance-corrections/<int:pk>/', AttendanceCorrectionAdminUpdate.as_view(), name='attendance_correction_admin_update'),
# ]


# urlpatterns += [
#     # …
#     path("admin/earlyoff/", earlyoff_admin_list, name="earlyoff_admin_list"),
#     path("admin/earlyoff/<int:pk>/", earlyoff_update, name="earlyoff_update"),
# ]

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

# urlpatterns = [
#     # -------- Auth
#     path("login/",   CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
#     path("refresh/", TokenRefreshView.as_view(),          name="token_refresh"),

#     # -------- Employee (self)
#     path("me/profile/", MeProfileView.as_view(), name="me-profile")
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
#     path("admin/employees/",            EmployeeListAPIView.as_view(),   name="admin_employee_list"),
#     path("admin/employees/create/",     CreateEmployeeAPIView.as_view(), name="admin_employee_create"),
#     path("admin/employees/<int:pk>/",   DeleteEmployeeAPIView.as_view(), name="admin_employee_delete"),

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
#     path("admin/stats/",               dashboard_stats,     name="dashboard_stats"),
#     path("dashboard-stats/", views.dashboard_stats, name="dashboard-stats"),
#     path("leave-requests/<int:pk>/", views.LeaveRequestAdminUpdate.as_view()),
#     path("me/attendance/today/", views.my_attendance_today, name="my-attendance-today"),
#     # your existing list/range endpoint:
#     path("me/attendance/", views.my_attendance, name="my-attendance"),
# ]


urlpatterns = [
    # --- Auth
    path("login/",   views.CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(),                name="token_refresh"),

    # --- Employee (self)
    path("me/profile/",                 views.me_profile,                name="me_profile"),
    path("me/dashboard/",               views.me_dashboard,              name="me_dashboard"),
    path("me/attendance/",              views.my_attendance,             name="my_attendance"),
    path("me/attendance/today/",        views.my_attendance_today,       name="my_attendance_today"),
    path("me/attendance/check-in/",     views.check_in,                  name="check_in"),
    path("me/attendance/check-out/",    views.check_out,                 name="check_out"),
    # expose both paths to match your UI calls
    path("pre-notice/late/",            views.pre_notify_late,           name="pre_notify_late"),        # /api/pre-notice/late/
    path("me/attendance/pre-notice/late/", views.pre_notify_late,       name="pre_notify_late_alt"),     # /api/me/attendance/pre-notice/late/
    path("me/attendance/corrections/",  views.my_attendance_corrections, name="my_attendance_corrections"),
    path("me/leaves/",                  views.my_leaves,                 name="my_leaves"),
    path("me/leaves/<int:pk>/",         views.my_leave_cancel,           name="my_leave_cancel"),
    path("me/leave-distribution/",      views.get_leave_distribution,    name="leave_distribution"),

    # --- Admin
    path("admin/employees/",            views.EmployeeListAPIView.as_view(),   name="admin_employee_list"),
    path("admin/employees/create/",     views.CreateEmployeeAPIView.as_view(), name="admin_employee_create"),
    path("admin/employees/<int:pk>/",   views.DeleteEmployeeAPIView.as_view(), name="admin_employee_delete"),

    path("leave-requests/",             views.LeaveRequestAdminList.as_view(),   name="leave_requests"),
    path("leave-requests/<int:pk>/",    views.LeaveRequestAdminUpdate.as_view(), name="leave_request_update"),

    path("attendance-corrections/",          views.AttendanceCorrectionAdminList.as_view(),   name="attendance_correction_admin_list"),
    path("attendance-corrections/<int:pk>/", views.AttendanceCorrectionAdminUpdate.as_view(), name="attendance_correction_admin_update"),

    path("admin/earlyoff/",             views.earlyoff_admin_list, name="earlyoff_admin_list"),
    path("admin/earlyoff/<int:pk>/",    views.earlyoff_update,     name="earlyoff_update"),
    path("me/earlyoff/",                views.earlyoff_list_create, name="earlyoff_list_create"),

    path("policy/",                     views.policy_settings_get, name="policy_get"),
    path("admin/stats/",                views.dashboard_stats,     name="dashboard_stats"),

    # --- Lead queue (optional but handy)
    path("lead/leave-requests/",                 views.lead_leave_list,  name="lead_leave_list"),
    path("lead/leave-requests/<int:pk>/",        views.lead_leave_update, name="lead_leave_update"),
]
