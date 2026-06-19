from django.db import models

class Juego(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    ventas = models.PositiveIntegerField(default=0)
    genero = models.CharField(max_length=50)
    desarrollador = models.CharField(max_length=100, blank=True)
    plataformas = models.CharField(max_length=200, default='PC')
    imagen = models.URLField(max_length=500, blank=True)
    descuento = models.PositiveIntegerField(default=0)
    descripcion = models.TextField()
    video_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.nombre

    def plataformas_lista(self):
        return [p.strip() for p in self.plataformas.split(',') if p.strip()]

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "precio": float(self.precio),
            "stock": self.stock,
            "ventas": self.ventas,
            "genero": self.genero,
            "desarrollador": self.desarrollador,
            "plataformas": self.plataformas_lista(),
            "imagen": self.imagen or "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
            "descuento": self.descuento,
            "descripcion": self.descripcion,
            "videoUrl": self.video_url or "",
        }