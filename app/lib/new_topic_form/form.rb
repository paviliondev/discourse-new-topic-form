# frozen_string_literal: true

module NewTopicForm
  class Form
    VALID_TYPES = %w[date dropdown text textarea upload users]

    attr_accessor :form

    def initialize(category)
      @category = category
      custom_fields = category.custom_fields['new_topic_form']
      @form = custom_fields.present? ? custom_fields : initialize_form
    end

    def save
      format

      @category.custom_fields['new_topic_form'] = @form
      @category.save!
    end

    def reset
      @form = initialize_form
      save
    end

    private

    def format
      @form['fields'] ||= []

      if @form['fields'].is_a?(Hash)
        @form['fields'] = @form['fields'].values
      end

      result = initialize_form

      %w[enabled apply_to_subcategories].each do |i|
        result[i] = cast_boolean(@form[i])
      end

      result['fields'] = @form['fields'].map do |field|
        fmt_field(field)
      end.compact

      @form = result
    end

    def cast_boolean(val)
      ActiveModel::Type::Boolean.new.cast(val) || false
    end

    def initialize_form
      {
        'enabled' => false,
        'apply_to_subcategories' => false,
        'category_id' => @category.id,
        'fields' => []
      }
    end

    def fmt_field(field)
      return unless VALID_TYPES.include?(field['type'])

      {
        'id' => field['id'].to_s.strip,
        'label' => field['label'].to_s.strip,
        'type' => field['type'],
        'required' => cast_boolean(field['required']),
        'options' => field['options'].to_s.split(',').map(&:strip).join(', '),
        'regexp' => field['regexp'].to_s.strip,
        'regexp_flags' => field['regexp_flags'].to_s.strip,
        'placeholder' => field['placeholder'].to_s.strip
      }
    end
  end
end
