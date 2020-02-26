import discourseComputed, { observes } from "discourse-common/utils/decorators";

export default Ember.Component.extend({
  classNames: ["ntf-form-field"],

  @discourseComputed
  value: {
    get() {
      return this.get(`model.newTopicFormData.${this.get("field.id")}`);
    },

    set(val) {
      const type = this.get("field.type");

      if (type === "checkbox") {
        val = !!val;
      }

      this.get("model.newTopicFormData").set(this.get("field.id"), val);

      return val;
    }
  },

  @observes("value")
  resetError() {
    this.get("model.newTopicFormErrors").set(this.get("field.id"), null);
    this.notifyPropertyChange("errorMsg");
  },

  @discourseComputed("field.id", "model.newTopicFormErrors")
  errorMsg(id, errors) {
    const key = errors.get(id);

    if (key) {
      return I18n.t(`new_topic_form.errors.${key}`);
    }
  },

  @discourseComputed("field.options")
  options(opts) {
    return opts.split(",").map(o => o.trim());
  }
});
