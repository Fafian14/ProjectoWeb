import json
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from pathlib import Path
from django.http import JsonResponse
from .models import Juego
from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def tienda(request):
    return render(request, 'tienda.html')

def carrito(request):
    return render(request, 'carrito.html')

def login(request):
    return render(request, 'login.html')

def gift_cards(request):
    return render(request, 'gift-cards.html')

def admin_panel(request):
    return render(request, 'admin.html')

def busqueda(request):
    return render(request, 'busqueda.html')

def ofertas(request):
    return render(request, 'ofertas.html')

def pcgaming(request):
    return render(request, 'pcgaming.html')

def perfil(request):
    return render(request, 'perfil.html')

def topventas(request):
    return render(request, 'topventas.html')

def api_datos(request):
    ruta_json = Path(__file__).resolve().parent / 'static' / 'js' / 'data.json'
    with open(ruta_json, encoding='utf-8') as archivo:
        data = json.load(archivo)
    juegos_django = [juego.to_dict() for juego in Juego.objects.all().order_by('-id')]
    data['juegos'] = juegos_django
    return JsonResponse(data)

@csrf_exempt
@require_http_methods(["POST"])
def admin_crear_juego(request):
    try:
        datos = json.loads(request.body)

        juego = Juego.objects.create(
            nombre=datos.get('nombre', ''),
            precio=datos.get('precio', 0),
            stock=datos.get('stock', 0),
            ventas=datos.get('ventas', 0),
            genero=datos.get('genero', ''),
            desarrollador=datos.get('desarrollador', ''),
            plataformas=', '.join(datos.get('plataformas', ['PC'])),
            imagen=datos.get('imagen', ''),
            descuento=datos.get('descuento', 0),
            descripcion=datos.get('descripcion', ''),
            video_url=datos.get('videoUrl') or None,
        )

        return JsonResponse({'ok': True, 'juego': juego.to_dict()})

    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["DELETE"])
def admin_eliminar_juego(request, juego_id):
    try:
        juego = Juego.objects.get(id=juego_id)
        juego.delete()
        return JsonResponse({'ok': True})

    except Juego.DoesNotExist:
        return JsonResponse({'ok': False, 'error': 'Juego no encontrado'}, status=404)
    
@csrf_exempt
@require_http_methods(["POST"])
def admin_editar_juego(request, juego_id):
    try:
        datos = json.loads(request.body)

        juego = Juego.objects.get(id=juego_id)

        juego.nombre = datos.get('nombre', juego.nombre)
        juego.precio = datos.get('precio', juego.precio)
        juego.stock = datos.get('stock', juego.stock)
        juego.genero = datos.get('genero', juego.genero)
        juego.desarrollador = datos.get('desarrollador', juego.desarrollador)
        juego.plataformas = ', '.join(datos.get('plataformas', juego.plataformas_lista()))
        juego.imagen = datos.get('imagen', juego.imagen)
        juego.descuento = datos.get('descuento', juego.descuento)
        juego.descripcion = datos.get('descripcion', juego.descripcion)
        juego.video_url = datos.get('videoUrl') or None

        juego.save()

        return JsonResponse({'ok': True, 'juego': juego.to_dict()})

    except Juego.DoesNotExist:
        return JsonResponse({'ok': False, 'error': 'Juego no encontrado'}, status=404)

    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=400)
    
@csrf_exempt
@require_http_methods(["POST"])
def registrar_usuario(request):
    try:
        datos = json.loads(request.body)

        nombre = datos.get('nombre', '').strip()
        email = datos.get('email', '').strip().lower()
        password = datos.get('password', '')

        if not nombre or not email or not password:
            return JsonResponse({'ok': False, 'error': 'Faltan datos'}, status=400)

        if len(password) < 6:
            return JsonResponse({'ok': False, 'error': 'La contraseña debe tener al menos 6 caracteres'}, status=400)

        if User.objects.filter(username=email).exists():
            return JsonResponse({'ok': False, 'error': 'Este correo ya está registrado'}, status=400)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=nombre
        )

        return JsonResponse({
            'ok': True,
            'usuario': {
                'nombre': user.first_name,
                'email': user.email,
                'rol': 'user'
            }
        })

    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def login_usuario(request):
    try:
        datos = json.loads(request.body)
        email = datos.get('email', '').strip().lower()
        password = datos.get('password', '')
        user = authenticate(request, username=email, password=password)

        if user is None:
            return JsonResponse({'ok': False, 'error': 'Correo o contraseña incorrectos'}, status=400)
        auth_login(request, user)

        return JsonResponse({
            'ok': True,
            'usuario': {
                'nombre': user.first_name or user.username,
                'email': user.email,
                'rol': 'admin' if user.is_staff else 'user'
            }
        })

    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=400)
    