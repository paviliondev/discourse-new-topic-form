# frozen_string_literal: true

module NewTopicForm
  class FormController < ApplicationController
    before_action :ensure_staff
    before_action :find_category, except: [:index]

    def index
      respond_to do |f|
        f.json do
          result = Category.all.map do |cat|
            Form.new(cat).form
          end

          render_json_dump(result)
        end

        f.html do
          render nothing: true
        end
      end
    end

    def create

    end

    def show
      form = Form.new(@category)

      render_json_dump(form.form)
    end

    def update
      form = Form.new(@category)
      form.form = params[:form].to_unsafe_h
      form.save

      render_json_dump(form.form)
    end

    def destroy
      form = Form.new(@category)
      form.reset

      render_json_dump(form.form)
    end

    private

    def find_category
      @category = Category.find(params[:id])
    end
  end
end
