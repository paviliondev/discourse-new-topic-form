# name: new-topic-form
# version: 0.1.0
# author: Muhlis Cahyono (muhlisbc@gmail.com)

%i[common desktop mobile admin].each do |layout|
  register_asset "stylesheets/new-topic-form/#{layout}.scss", layout
end

add_admin_route 'new_topic_form.admin.nav_label', 'new-topic-form'
require_relative 'lib/new_topic_form'
enabled_site_setting :new_topic_form_enabled

after_initialize do
  register_svg_icon('far-save')
  register_svg_icon('redo')

  register_category_custom_field_type('new_topic_form', :json)
end
