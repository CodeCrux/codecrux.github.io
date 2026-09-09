use Rack::Static,
    root: File.expand_path('_site', __dir__),
    urls: ['/'],
    index: 'index.html'

run ->(_env) { [404, { 'content-type' => 'text/plain' }, ['Not Found']] }
