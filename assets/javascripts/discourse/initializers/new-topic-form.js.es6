import { withPluginApi } from "discourse/lib/plugin-api";
import discourseComputed, { observes } from "discourse-common/utils/decorators";
import Composer from "discourse/models/composer";
import { getUploadMarkdown } from "discourse/lib/uploads";

function initWithApi(api) {
  if (!Discourse.SiteSettings.new_topic_form_enabled) return;

  Composer.serializeOnCreate("new_topic_form_data");
  Composer.serializeToTopic("new_topic_form_data");

  api.modifyClass("model:composer", {
    @discourseComputed(
      "category.new_topic_form",
      "creatingTopic",
      "editingFirstPost"
    )
    showFields(new_topic_form, creatingTopic, editingFirstPost) {
      return new_topic_form && (creatingTopic || editingFirstPost);
    },

    newTopicFormData: Ember.Object.create(),
    newTopicFormErrors: Ember.Object.create(),

    @observes("title", "reply")
    dataChanged() {
      if (!this.get("showFields")) {
        this._super(...arguments);
      }
    }
  });

  api.modifyClass("controller:composer", {
    @observes("model.showFields")
    anu() {
      if (this.get("model.showFields")) {
        this.set("showPreview", false);
        this.set("model.newTopicFormErrors", Ember.Object.create());

        if (this.get("model.editingFirstPost")) {
          const result = Ember.Object.create();

          this.ntfFields().forEach(f => {
            const val = this.get(
              `model.post.topic.new_topic_form_data.${f.id}`
            );

            result.set(f.id, val);
          });

          this.set("model.newTopicFormData", result);
        } else {
          this.set("model.newTopicFormData", Ember.Object.create());
        }
      }
    },

    save(force) {
      if (this.get("model.showFields")) {
        if (!this.newTopicFormValid()) return;

        const data = {};

        this.ntfFields().forEach(f => {
          data[f.id] = this.getNtfVal(f.id);
        });

        this.set("model.new_topic_form_data", data);
        this.ntfCreateReply();

        return this._super(...arguments);
      } else {
        return this._super(...arguments);
      }
    },

    newTopicFormValid() {
      let isValid = true;
      const errors = Ember.Object.create();

      this.ntfFields().forEach(f => {
        const reason = this.ntfErrorReason(f);

        if (reason) {
          errors.set(f.id, reason);
          isValid = false;
        }
      });

      this.set("model.newTopicFormErrors", errors);

      return isValid;
    },

    ntfErrorReason(field) {
      const value = this.getNtfVal(field.id);

      if (field.required && Ember.isBlank(value)) return "required";
      if (!["text", "textarea"].includes(field.type)) return; // ok
      if (Ember.isBlank(field.regexp)) return; // ok

      const regexp = new RegExp(field.regexp, field.regexp_flags);

      if (!regexp.test(value)) return "invalid";

      return; // ok
    },

    ntfCreateReply() {
      const result = [];

      this.ntfFields().forEach(f => {
        let row = "";
        if (f.label) {
          row += `**${f.label}**\n`;
        }

        const val = this.getNtfVal(f.id);

        if (!val) {
          row += "-";
        } else {
          switch (f.type) {
            case "upload":
              row += getUploadMarkdown(val);
              break;
            case "date":
              row += `[date=${val} timezone=${moment.tz.guess()}]`;
              break;
            case "users":
              const users = val
                .split(",")
                .map(u => `@${u}`)
                .join(" ");
              row += users;
              break;
            default:
              row += val;
          }
        }

        result.push(row);
      });

      console.log(result.join("\n\n"));

      this.set("model.reply", result.join("\n\n"));
    },

    ntfFields() {
      return this.get("model.category.new_topic_form.fields");
    },

    getNtfVal(id) {
      return this.get(`model.newTopicFormData.${id}`);
    },

    @observes("model.reply", "model.title")
    _shouldSaveDraft() {
      if (!this.get("model.showFields")) {
        this._super(...arguments);
      }
    }
  });
}

export default {
  name: "new-topic-form",

  initialize() {
    withPluginApi("0.8", initWithApi);
  }
};
