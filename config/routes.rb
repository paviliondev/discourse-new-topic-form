# frozen_string_literal: true

NewTopicForm::Engine.routes.draw do
  resources :form
end

Discourse::Application.routes.append do
  mount NewTopicForm::Engine, at: 'new-topic-form'

  get '/admin/plugins/new-topic-form' => 'new_topic_form/form#index', constraints: StaffConstraint.new
end
