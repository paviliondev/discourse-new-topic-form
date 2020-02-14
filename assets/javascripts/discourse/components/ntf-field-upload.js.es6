import UploadMixin from "discourse/mixins/upload";
import discourseComputed from "discourse-common/utils/decorators";
import { isImage } from "discourse/lib/uploads";

export default Ember.Component.extend(UploadMixin, {
  type: "composer",
  tagName: "div",

  uploadDone(upload) {
    this.set("value", upload);
  },

  @discourseComputed("placeholder")
  btnText(placeholder) {
    if (!Ember.isBlank(placeholder)) return placeholder;

    return I18n.t("new_topic_form.upload");
  },

  @discourseComputed("value.url")
  isImage(url) {
    return isImage(url);
  }
});
