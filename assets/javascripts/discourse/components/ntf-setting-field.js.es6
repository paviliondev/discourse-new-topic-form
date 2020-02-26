import discourseComputed from "discourse-common/utils/decorators";

export default Ember.Component.extend({
  validTypes: Ember.String.w("date dropdown text textarea upload users poll checkbox"),
  classNames: ["ntf-field"],

  @discourseComputed("model.type")
  showRegex(type) {
    return ["text", "textarea"].includes(type);
  },

  @discourseComputed("model.type")
  showPlaceholder(type) {
    return ["text", "date", "checkbox"].includes(type);
  }
});
