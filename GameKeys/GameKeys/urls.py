"""
URL configuration for GameKeys project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from APP import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/datos/', views.api_datos, name='api_datos'),
    path('api/usuarios/registro/', views.registrar_usuario),
    path('api/usuarios/login/', views.login_usuario),
    path('', views.index, name='index'),
    path('index.html', views.index, name='index'),
    path('tienda.html', views.tienda, name='tienda'),
    path('carrito.html', views.carrito, name='carrito'),
    path('login.html', views.login, name='login'),
    path('gift-cards.html', views.gift_cards, name='gift_cards'),
    path('admin.html', views.admin_panel, name='admin_panel'),
    path('busqueda.html', views.busqueda, name='busqueda'),
    path('ofertas.html', views.ofertas, name='ofertas'),
    path('pcgaming.html', views.pcgaming, name='pcgaming'),
    path('perfil.html', views.perfil, name='perfil'),
    path('topventas.html', views.topventas, name='topventas'),
    path('api/admin/juegos/crear/', views.admin_crear_juego),
    path('api/admin/juegos/<int:juego_id>/eliminar/', views.admin_eliminar_juego),
    path('api/admin/juegos/<int:juego_id>/editar/', views.admin_editar_juego),
]
