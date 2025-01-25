---
title: 2025-01-03 Top 100 ruby on rails interview question and answers
description: Ruby on Rails, often simply referred to as Rails, is a robust web
  development framework that has revolutionized how web applications are built.
image: /img/blogs/top-100-ruby-on-rails-interview-question-and-answers.webp
layout: post
permalink: /blog/:title/
author: Shyam Mohan
category: "Interview "
date: 2025-01-03T02:36:00.000Z
---
#### 1. **What is Ruby on Rails?**

**Answer**: Ruby on Rails is an open-source web development framework written in Ruby. It follows the MVC (Model-View-Controller) architecture and emphasizes convention over configuration (CoC) and DRY (Don't Repeat Yourself) principles.

#### 2. **What are the advantages of using Ruby on Rails?**

**Answer**:

-   Follows MVC architecture for modular code.
-   DRY and CoC principles improve code efficiency.
-   Built-in tools for database migration, scaffolding, and testing.
-   Large community and extensive libraries (gems).

#### 3. **Explain the MVC architecture in Rails.**

**Answer**:

-   **Model**: Handles data and business logic.
-   **View**: Manages the presentation layer (HTML, ERB templates).
-   **Controller**: Manages the application logic, processes user input, and interacts with the model and view.

#### 4. **What is Active Record?**

**Answer**: Active Record is the ORM (Object-Relational Mapping) layer in Rails, which facilitates database interaction by representing data as objects.

#### 5. **What is a Rails gem?**

**Answer**: Gems are libraries or plugins that extend the functionality of a Ruby or Rails application.


#### 6. **What is the difference between `render` and `redirect_to` in Rails?**

**Answer**:

-   **render**: Renders a specific view template without making a new HTTP request.
-   **redirect_to**: Sends an HTTP redirect to the browser, which initiates a new request to a different URL.

#### 7. **What are Rails migrations?**

**Answer**: Rails migrations are used to make changes to the database schema over time in a consistent and version-controlled manner.

#### 8. **How does the `has_many :through` association work?**

**Answer**: It sets up a many-to-many connection between models using a third model to manage the relationship.

#### 9. **What is the Rails Asset Pipeline?**

**Answer**: The asset pipeline is used to manage and concatenate assets such as JavaScript, CSS, and images in a Rails application.

#### 10. **What are Rails callbacks?**

**Answer**: Callbacks are methods that get triggered at specific stages of an object’s lifecycle (e.g., `before_save`, `after_create`).


#### 11. **Explain eager loading and lazy loading in Rails.**

**Answer**:

-   **Eager loading**: Loads all associated records in a single query (e.g., `includes`).
-   **Lazy loading**: Loads associated records when they are accessed (e.g., `where` or `find`).

#### 12. **How does Rails handle security vulnerabilities?**

**Answer**: Rails includes protections against common vulnerabilities like SQL injection, XSS (Cross-Site Scripting), and CSRF (Cross-Site Request Forgery) by default.

#### 13. **What are polymorphic associations in Rails?**

**Answer**: Polymorphic associations allow a model to belong to multiple other models using a single association.

#### 14. **What is the difference between `save` and `save!`?**

**Answer**:

-   `save`: Returns `true` or `false` based on validation.
-   `save!`: Raises an exception if validation fails.

#### 15. **What is Turbolinks in Rails?**

**Answer**: Turbolinks speeds up navigation by loading only the body and merging it into the current page without reloading JavaScript or CSS.


#### 16. **How do you set up a custom validation in Rails?**

**Answer**: Define a method in the model and use `validate`.

ruby

`class User < ApplicationRecord  

  validate :email_domain_check  
  

  private  
  def email_domain_check  
  
    errors.add(:email, "must be from example.com") unless email.include?("example.com")  
    
  end  
  
end` 

#### 17. **How do you handle file uploads in Rails?**

**Answer**: Use gems like `CarrierWave` or `ActiveStorage`.

#### 18. **How do you optimize database queries in Rails?**

**Answer**:

-   Use `includes` for eager loading.
-   Use `select` to fetch only necessary columns.
-   Avoid N+1 queries.

#### 19. **What is a Rails Concern? How do you use it?**

**Answer**: Concerns are modules used to extract reusable code in models and controllers. They are included using `include` or `extend`.

#### 20. **How do you implement caching in Rails?**

**Answer**:

-   **Fragment caching**: Cache parts of a view.
-   **Action caching**: Cache the entire output of an action.
-   Use libraries like `Memcached` or `Redis`.


#### 21. **Describe a challenging bug you resolved in Rails.**

**Answer**: Be prepared to talk about debugging techniques like using `byebug`, reviewing logs, or isolating issues in test environments.

#### 22. **How do you ensure scalability in Rails applications?**

**Answer**: Use caching, optimize database queries, and implement background jobs using tools like Sidekiq.

#### 23. **Explain the Rails initialization process.**

**Answer**: It involves loading the `application.rb` file, initializing gems, and loading middleware, routes, and models.

#### 24. **How do you handle background jobs in Rails?**

**Answer**: Use tools like Sidekiq, Delayed Job, or Resque for asynchronous processing.

#### 25. **How do you implement RESTful APIs in Rails?**

**Answer**: Use Rails controllers, `ActiveModel::Serializer`, and tools like `JBuilder` for JSON responses.



### **26. What are ActionCable and WebSockets in Rails?**

**Answer**:

-   **ActionCable**: A Rails framework for real-time communication over WebSockets.
-   **WebSockets**: A protocol for two-way communication between the client and server without repeatedly making HTTP requests.
-   ActionCable integrates WebSockets with the Rails app and allows broadcasting messages to connected clients.


### **27. How do you integrate a third-party API in Rails?**

**Answer**: Use the `Net::HTTP`, `Faraday`, or `HTTParty` gem to make API requests. For example:

ruby


`require 'httparty'  

response = HTTParty.get('https://api.example.com/resource')  

puts response.body` 


### **28. What are some best practices for writing Rails tests?**

**Answer**:

-   Use `RSpec` or `Minitest` for testing.
-   Follow TDD principles (Test-Driven Development).
-   Mock and stub external APIs.
-   Use `FactoryBot` for test data.
-   Organize tests into unit, integration, and system levels.


### **29. How do you implement authentication and authorization in Rails?**

**Answer**:

-   **Authentication**: Use Devise or OmniAuth for login systems.
-   **Authorization**: Use Pundit or CanCanCan for role-based access control.


### **30. What is the difference between `form_for` and `form_with`?**

**Answer**:

-   `form_for`: Used for creating forms associated with a specific model.
-   `form_with`: Introduced in Rails 5.1, supports forms with or without models and uses modern syntax.


### **31. What is the role of the `config/routes.rb` file?**

**Answer**: It defines URL endpoints and maps them to controller actions. Example:

ruby

`Rails.application.routes.draw do  

  resources :articles  
  
end` 

### **32. How do you debug a Rails application?**

**Answer**:

-   Use `byebug` or `pry` to inspect the code.
-   Check logs in the `log/` directory.
-   Use tools like `better_errors` or `rack-mini-profiler`.

### **33. What is a migration rollback? How do you use it?**

**Answer**: A rollback undoes the last migration. Use the command:

bash

`rails db:rollback` 


### **34. How do you optimize asset loading in Rails?**

**Answer**:

-   Compress assets using tools like Uglifier or CSS compressors.
-   Use the Rails asset pipeline for concatenation and minification.
-   Leverage browser caching with proper cache headers.


### **35. What is a Rails initializer?**

**Answer**: Initializers are Ruby files in the `config/initializers/` directory used to set up application-wide configurations during boot.


### **36. How do you handle time zones in Rails?**

**Answer**:

-   Set the application time zone in `config/application.rb`:
    
    ruby
        
    `config.time_zone = 'UTC'` 
    
-   Use `Time.zone.now` for timezone-aware operations.


### **37. How do you manage background jobs in Rails?**

**Answer**: Use gems like Sidekiq or Delayed Job. Define jobs and enqueue them for execution. Example:

ruby


`class MyJob < ApplicationJob  

  def perform  
  
    # Task logic here 
    
  end  
  
end` 


### **38. What are Rails Environments?**

**Answer**: Rails has three default environments:

-   **Development**: Used for coding and debugging.
-   **Test**: Used for running automated tests.
-   **Production**: Used for the live application.


### **39. What is the `params` object in Rails?**

**Answer**: The `params` object contains parameters sent by the client in HTTP requests (e.g., form data, query strings).


### **40. What is the purpose of Rails layouts?**

**Answer**: Layouts provide a common structure (e.g., header, footer) for views in an application.


### **41. What is Spring in Rails?**

**Answer**: Spring is a Rails application preloader that speeds up development by keeping the app running in the background.


### **42. How do you secure sensitive data in a Rails application?**

**Answer**:

-   Use environment variables for secrets (e.g., `dotenv` gem).
-   Store credentials using `rails credentials:edit`.
-   Use strong parameter filtering in controllers.

### **43. What is the difference between `delete` and `destroy` in Rails?**

**Answer**:

-   **delete**: Removes a record directly from the database without callbacks.
-   **destroy**: Removes a record and runs associated callbacks.

### **44. How do you handle file attachments in Rails?**

**Answer**: Use Active Storage to manage file uploads and attachments. Example:

ruby

`has_one_attached :image` 


### **45. How do you implement pagination in Rails?**

**Answer**: Use gems like `kaminari` or `will_paginate`. Example with Kaminari:

ruby

`@posts = Post.page(params[:page]).per(10)` 


### **46. What is `before_action` in Rails?**

**Answer**: A callback that runs a specified method before controller actions.

ruby

`before_action :authenticate_user` 


### **47. What are helpers in Rails?**

**Answer**: Helpers are methods used to simplify view templates.


### **48. What are partials in Rails?**

**Answer**: Partials are reusable view templates prefixed with an underscore (e.g., `_form.html.erb`).


### **49. What is a nested resource in Rails?**

**Answer**: A resource that belongs to another resource. Example:

ruby

`resources :articles do  

  resources :comments  
  
end` 


### **50. How do you validate uniqueness in Rails models?**

**Answer**: Use the `validates` method. Example:

ruby

`validates :email, uniqueness: true` 

### **51. What are polymorphic routes in Rails?**

**Answer**: Routes that handle multiple controllers based on a single resource.

### **52. What are Rails engines?**

**Answer**: Mini Rails applications that can be mounted in a parent app.

### **53. What is a scope in Rails?**

**Answer**: A custom query defined in a model. Example:

ruby

`scope :active, -> { where(active: true) }` 


### **54. What is ActiveSupport?**

**Answer**: A Ruby library providing utility classes and extensions used by Rails.


### **55. What is an N+1 query problem in Rails?**

**Answer**:  
The N+1 query problem occurs when the application executes one query to retrieve the main records and then N additional queries to retrieve related records, causing inefficiency.  

**Solution**: Use `includes` to eager load associations:

ruby

`@posts = Post.includes(:comments)` 


### **56. How do you perform eager loading in Rails?**

**Answer**: Use the `includes` or `joins` method in ActiveRecord to load associated records in fewer queries.  

**Example:**

ruby

`@users = User.includes(:posts).all` 


### **57. What is the purpose of the `rake` command in Rails?**

**Answer**:  
The `rake` command is used to run administrative tasks like database migrations, cleaning logs, or running custom tasks.  

**Example:**

bash

`rake db:migrate` 


### **58. What are `joins` and `includes` in Rails? How are they different?**

**Answer**:

-   **joins**: Performs an SQL join but doesn’t load associated records.
- 
-   **includes**: Eager loads associated records to prevent N+1 queries. 
- 
    **Example:**

ruby

`# joins

User.joins(:posts)

#includes

User.includes(:posts)` 


### **59. How do you define a custom route in Rails?**

**Answer**: Use the `get`, `post`, or other HTTP verbs in `config/routes.rb`.  
Example:

ruby

`get 'custom_route', to: 'controller#action'` 



### **60. How do you handle exceptions in Rails?**

**Answer**: Use `rescue_from` in controllers to handle specific exceptions.  

**Example:**

ruby

`class ApplicationController < ActionController::Base  

  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  

  def record_not_found
  
    render plain: '404 Not Found', status: 404
    
  end
  
end` 



### **61. What is Rails’ asset pipeline?**

**Answer**:  
The asset pipeline concatenates, minifies, and serves CSS, JavaScript, and images efficiently. Files are stored in the `app/assets`, `lib/assets`, or `vendor/assets` directories.



### **62. How do you create a custom validation in Rails?**

**Answer**: Define a custom validation method in the model.  

**Example:**

ruby

`class User < ApplicationRecord  

  validate :email_must_be_valid

  def email_must_be_valid
  
    errors.add(:email, 'is not valid') unless email.include?('@')
    
  end
  
end` 


### **63. What is the difference between `save` and `save!` in Rails?**

**Answer**:

-   `save`: Returns `false` if validation fails.
-   `save!`: Raises an exception if validation fails.


### **64. What are filters in Rails controllers?**

**Answer**: Filters are methods used to run code before or after controller actions.  
Examples:

-   **before_action**
- 
-   **after_action**
- 
-   **around_action**


### **65. What is a `Concern` in Rails?**

**Answer**: A module that provides shared functionality across models or controllers.  
Example:

ruby

`module Archivable  

  extend ActiveSupport::Concern  
  

  included do  
  
    scope :archived, -> { where(archived: true) }
    
  end
  
end` 


### **66. How do you deploy a Rails application?**

**Answer**:

-   Use tools like **Capistrano**, **Docker**, or **Heroku**.
-   Precompile assets using `rails assets:precompile`.
-   Run database migrations with `rails db:migrate`.


### **67. What is `caching` in Rails, and how do you implement it?**

**Answer**:  
Caching stores frequently accessed data to improve performance. Rails supports:

-   **Fragment Caching**
- 
-   **Page Caching**
- 
-   **Action Caching**

Example for fragment caching:

erb

`<% cache @article do %>

  <%= render @article %>
  
<% end %>` 


### **68. How do you generate a migration in Rails?**

**Answer**: Use the `rails generate migration` command.  

**Example:**

bash

`rails generate migration AddAgeToUsers age:integer` 



### **69. What is a database schema in Rails?**

**Answer**:  
The `schema.rb` file represents the current state of the database structure, including tables, columns, and indexes.



### **70. How do you use `ActiveRecord` callbacks?**

**Answer**: Callbacks are methods triggered during the lifecycle of an ActiveRecord object.  

**Examples:**

-   **before_save**
- 
-   **after_create**
- 
-   **around_destroy**


### **71. What is the difference between `find` and `find_by`?**

**Answer**:

-   `find`: Finds a record by its primary key. Raises an error if not found.
-   `find_by`: Finds the first record matching the condition. Returns `nil` if not found.


### **72. How do you implement nested forms in Rails?**

**Answer**: Use `fields_for` and enable `accepts_nested_attributes_for` in the model.  
Example:

ruby

`class Post < ApplicationRecord  

  has_many :comments  
  
  accepts_nested_attributes_for :comments
  
end` 


### **73. What is the difference between `delete` and `destroy_all`?**

**Answer**:

-   `delete`: Removes records without callbacks.
-   `destroy_all`: Deletes records and runs callbacks.

### **74. How do you generate JSON responses in Rails?**

**Answer**: Use `render json`.  
Example:

ruby

`render json: @user` 


### **75. What is CSRF, and how does Rails prevent it?**

**Answer**:  
Cross-Site Request Forgery (CSRF) is an attack where unauthorized commands are transmitted from a user. Rails includes CSRF protection using authenticity tokens.


### **76. How do you handle file uploads in Rails?**

**Answer**: Use Active Storage or gems like CarrierWave.


### **77. What is the purpose of `flash` in Rails?**

**Answer**:  
`flash` stores temporary data for use in the next request, often for displaying messages.

### **78. How do you use Rails validations?**

**Answer**: Add validations in the model.  
Example:

ruby

`validates :name, presence: true, uniqueness: true` 


### **79. How do you schedule tasks in Rails?**

**Answer**: Use gems like `whenever` or `sidekiq-scheduler`.


### **80. How do you perform database indexing in Rails?**

**Answer**: Add indexes via migrations:

bash

`rails generate migration AddIndexToUsersEmail` 


### **81. What is the `has_secure_password` method in Rails?**

**Answer**:  
The `has_secure_password` method adds methods to set and authenticate securely hashed passwords using `bcrypt`. It requires a `password_digest` column in the database.  
Example:

ruby

`class User < ApplicationRecord

  has_secure_password
  
end` 


### **82. What is the purpose of `ActiveJob` in Rails?**

**Answer**:  
`ActiveJob` is a framework for declaring background jobs and making them run on various queuing backends (e.g., Sidekiq, DelayedJob).  
Example:

ruby

`class MyJob < ApplicationJob

  queue_as :default

  def perform(*args)
  
    # Do something
    
  end
  
end` 


### **83. How do you configure internationalization (i18n) in Rails?**

**Answer**:  
Rails has built-in support for internationalization. Create locale files in `config/locales/`.  
Example:

yml

`# config/locales/en.yml

en:

  hello: "Hello World"` 

Usage in views:

erb

`<%= t('hello') %>` 


### **84. What are concerns in Rails, and when do you use them?**

**Answer**:  
Concerns are modules used to extract and reuse common functionality across models or controllers. They help keep code DRY (Don't Repeat Yourself).  
Example:

ruby

`module Archivable

  extend ActiveSupport::Concern

  included do
  
    scope :archived, -> { where(archived: true) }
    
  end
  
end` 


### **85. What is the difference between optimistic and pessimistic locking in Rails?**

**Answer**:

-   **Optimistic locking**: Uses a `lock_version` column to ensure no conflicting updates.
-   **Pessimistic locking**: Locks a database row until the transaction is complete, preventing others from modifying it.  
    Example of pessimistic locking:

ruby

`user = User.lock("FOR UPDATE").find(1)` 


### **86. What is the difference between `polymorphic` and `single table inheritance` (STI) in Rails?**

**Answer**:

-   **Polymorphic associations**: Allow a model to belong to multiple other models using a shared interface.
-   **STI**: Allows multiple classes to inherit from a single database table.



### **87. What is a PORO in Rails?**

**Answer**:  
PORO stands for "Plain Old Ruby Object." It refers to simple Ruby classes that aren't dependent on Rails. They are used for business logic that doesn’t fit into models or controllers.


### **88. How do you use Rails helpers?**

**Answer**:  
Helpers are used to encapsulate reusable view logic.  
Example:

ruby

`module ApplicationHelper

  def format_date(date)
  
    date.strftime('%d-%m-%Y')
    
  end
  
end` 

Usage in views:

erb



`<%= format_date(Time.now) %>` 


### **89. What is the difference between `before_validation` and `before_save` callbacks?**

**Answer**:

-   **before_validation**: Runs before validations are checked.
-   **before_save**: Runs before the record is saved to the database.


### **90. What are partials in Rails?**

**Answer**:  
Partials are reusable view templates.  
Example: Create `_form.html.erb` and render it using:

erb

`<%= render 'form' %>` 


### **91. How do you debug a Rails application?**

**Answer**:  
Use tools like:

-   `byebug` or `debugger` gem for setting breakpoints.
-   Logs (`log/development.log`).
-   Browser developer tools for frontend issues.


### **92. What is the difference between `render` and `redirect_to`?**

**Answer**:

-   `render`: Renders a specific template without making a new HTTP request.
-   `redirect_to`: Issues a new HTTP request to a different action or URL.


### **93. What are scopes in Rails?**

**Answer**:  
Scopes are methods for defining reusable queries in models.  

**Example:**

ruby

`scope :active, -> { where(active: true) }` 


### **94. What is Rails' `ActiveSupport::Concern`?**

**Answer**:  
It is a module used to include shared functionality in classes. It provides `included` and `class_methods` blocks for extending functionality.


### **95. How do you create a custom generator in Rails?**

**Answer**:  
Create a generator under the `lib/generators` directory.  
Example:

bash

`rails generate generator MyGenerator` 


### **96. What is the purpose of `environment.rb` in Rails?**

**Answer**:  
The `environment.rb` file initializes the Rails application and loads all configurations.


### **97. What is the difference between `has_many :through` and `has_and_belongs_to_many`?**

**Answer**:

-   **has_many :through**: Requires an intermediate join model.
-   **has_and_belongs_to_many**: Direct many-to-many relationship without an intermediate model.



### **98. How do you handle background jobs in Rails?**

**Answer**:  
Use gems like Sidekiq, Resque, or DelayedJob to manage background jobs.



### **99. What is a serializer in Rails?**

**Answer**:  
Serializers format data for APIs. Rails supports `ActiveModel::Serializer`.  

**Example:**

ruby

    `class UserSerializer <ActiveModel::Serializer
  attributes :id, :name, :email
end` 



### **100. What are Action Mailers in Rails?**

**Answer**:  
Action Mailers are used to send and receive emails in Rails.  

**Example:**

ruby

    `class UserMailer < ApplicationMailer
    
  def welcome_email(user)
  
    @user = user
    
    mail(to: @user.email, subject: 'Welcome to My 
    App')
  end
  
end` 


   
