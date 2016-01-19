from django.dispatch import Signal

leica_image_ready = Signal(providing_args=['instance'])