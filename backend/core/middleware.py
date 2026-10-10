class PrivateApiCacheMiddleware:
    """Do not leave academic, financial or session responses in shared/browser caches."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith('/api/') or request.path.startswith('/health/'):
            response['Cache-Control'] = 'private, no-store'
        return response
