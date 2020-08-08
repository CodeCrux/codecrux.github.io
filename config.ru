gems: ['kramdown']
exclude: ['config.ru', 'Gemfile', 'Gemfile.lock', 'vendor', 'Procfile', 'Rakefile']
require 'rack/jekyll'
require 'yaml'
run Rack::Jekyll.new