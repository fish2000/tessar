from django.dispatch import Signal

tika_document_ready = Signal(providing_args=['instance'])