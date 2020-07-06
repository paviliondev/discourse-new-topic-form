import discourseComputed from "discourse-common/utils/decorators";
import Component from "@ember/component";

export const SHOW_REGEX = ["text", "textarea"];

export default Component.extend({
  validTypes: Ember.String.w("date dropdown text textarea upload users poll checkbox"),
  classNames: ["ntf-field"],
  isError: false,
  classNameBindings: ["model.isError:error"],

  @discourseComputed("model.type")
  showRegex(type) {
    return SHOW_REGEX.includes(type);
  },

  @discourseComputed("model.type")
  showPlaceholder(type) {
    return ["text", "checkbox"].includes(type);
  }
});
