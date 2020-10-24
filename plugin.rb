# name: new-topic-form
# version: 1.0.1
# author: Muhlis Cahyono (muhlisbc@gmail.com)
# url: https://github.com/paviliondev/discourse-new-topic-form

%i[common desktop mobile admin].each do |layout|
  register_asset "stylesheets/new-topic-form/#{layout}.scss", layout
end

enabled_site_setting :new_topic_form_enabled

add_admin_route 'new_topic_form.admin.nav_label', 'new-topic-form'

register_svg_icon('far-save')
register_svg_icon('redo')

after_initialize do
  %w[
    ../lib/new_topic_form/engine.rb
    ../lib/new_topic_form/form.rb
    ../app/controllers/new_topic_form/form_controller.rb
    ../config/routes.rb
  ].each do |path|
    load File.expand_path(path, __FILE__)
  end
  
  add_to_serializer(:basic_category, :new_topic_form) do
    return unless object.new_topic_form_enabled?

    object.new_topic_form
  end
  
  add_to_class(:category, :new_topic_form) do
    @new_topic_form ||= begin
      PluginStore.get('new_topic_form', id) || {}
    end
  end
  
  add_to_class(:category, :new_topic_form=) do |val|
    PluginStore.set('new_topic_form', id, val)

    val
  end
  
  add_to_class(:category, :new_topic_form_enabled?) do
    return false unless new_topic_form.present?

    new_topic_form['enabled'].present? &&
      new_topic_form['fields'].present?
  end

  add_to_class(:topic, :new_topic_form_enabled?) do
    return false unless SiteSetting.new_topic_form_enabled
    return false if private_message?
    return false if category.blank?

    category.new_topic_form_enabled?
  end

  register_topic_custom_field_type('new_topic_form_data', :json)

  add_to_serializer(:topic_view, :new_topic_form_data) do
    if object.topic.new_topic_form_enabled?
      object.topic.custom_fields['new_topic_form_data'] || {}
    end
  end

  add_permitted_post_create_param(:new_topic_form_data)
  PostRevisor.track_topic_field(:new_topic_form_data) do |tc, data|
    if tc.topic.new_topic_form_enabled?
      DiscourseEvent.trigger(:new_topic_form_before_save, data)
      tc.topic.custom_fields['new_topic_form_data'] = data.to_unsafe_hash
    end
  end

  on(:topic_created) do |topic, opts, _user|
    data = opts[:new_topic_form_data]

    if topic.new_topic_form_enabled? && data.present?
      topic.custom_fields['new_topic_form_data'] = data
      topic.save!
    end
  end
end
