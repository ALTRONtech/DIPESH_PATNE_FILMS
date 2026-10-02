from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("enquiries/", views.create_enquiry, name="create-enquiry"),
    path("auth/login/", views.login, name="login"),
    path("auth/me/", views.me, name="me"),
    path("admin/enquiries/", views.enquiries, name="enquiries"),
    path("admin/enquiries/<str:enquiry_id>/", views.enquiry_detail, name="enquiry-detail"),
    path("dashboard/", views.dashboard, name="dashboard"),
]
