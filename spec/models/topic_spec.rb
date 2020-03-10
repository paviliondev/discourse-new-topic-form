# frozen_string_literal: true

require 'rails_helper'

describe Topic do
  fab!(:category) { Fabricate(:category) }
  fab!(:topic) { Fabricate(:topic, category: category) }

  context 'new_topic_form_enabled' do
    it 'should return false if private message' do
      topic.archetype = Archetype.private_message

      expect(topic.new_topic_form_enabled?).to eq(false)
    end

    it 'should return false unless enabled category' do
      expect(topic.new_topic_form_enabled?).to eq(false)
    end

    it 'should return true on enabled category' do
      category.custom_fields['new_topic_form'] = {
        'enabled' => true,
        'fields' => [
          {
            'id' => 'blah',
            'type' => 'text'
          }
        ]
      }

      category.save!
      category.reload
      topic.reload

      expect(topic.new_topic_form_enabled?).to eq(true)
    end
  end
end
