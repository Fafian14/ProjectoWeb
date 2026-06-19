from django.contrib import admin
from .models import Juego

@admin.register(Juego)
class JuegoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'stock', 'genero', 'desarrollador', 'descuento')
    search_fields = ('nombre', 'genero', 'desarrollador')
    list_filter = ('genero', 'stock')