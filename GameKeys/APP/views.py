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