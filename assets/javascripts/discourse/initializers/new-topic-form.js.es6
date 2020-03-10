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
    newTopicFormErrors: Ember.Object.create()
  });

  api.modifyClass("controller:composer", {
    @observes("model.showFields")
    _ntfSetup() {
      if (!this.get("model.showFields")) return;

      this.set("model.newTopicFormErrors", Ember.Object.create());

      const result = Ember.Object.create();

      if (this.get("model.editingFirstPost")) {
        this.ntfFields().forEach(f => {
          const val = this.get(
            `model.post.topic.new_topic_form_data.${f.id}`
          );

          result.set(f.id, val);
        });
      }

      this.set("model.newTopicFormData", result);
    },

    @observes("model.newTopicFormData")
    _setReplyFromNtf() {
      if (!this.get("model.showFields")) return;

      this.ntfCreateReply();
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

      if (field.required && (Ember.isBlank(value) || !!!value)) return "required"; // err
      if (!["text", "textarea"].includes(field.type)) return; // ok
      if (Ember.isBlank(field.regexp)) return; // ok

      const regexp = new RegExp(field.regexp, field.regexp_flags);

      if (!regexp.test(value)) return "invalid"; // err

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

        if (!val && f.type !== "checkbox") {
          row += "&ndash;";
        } else {
          switch (f.type) {
            case "upload":
              row += getUploadMarkdown(val);
              break;
            case "users":
              const users = val
                .split(",")
                .map(u => `@${u}`)
                .join(" ");
              row += users;
              break;
            case "checkbox":
              row += val ? ":white_check_mark:" : ":x:";
              row += " ";
              row += f.placeholder || "";
              break;
            default:
              row += val;
          }
        }

        result.push(row);
      });

      this.set("model.reply", result.join("\n\n"));
    },

    ntfFields() {
      return this.get("model.category.new_topic_form.fields");
    },

    getNtfVal(id) {
      return this.get(`model.newTopicFormData.${id}`);
    }
  });
}

export default {
  name: "new-topic-form",

  initialize() {
    withPluginApi("0.8", initWithApi);
  }
};
