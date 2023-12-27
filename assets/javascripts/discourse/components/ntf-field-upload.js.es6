import UppyUploadMixin from "discourse/mixins/uppy-upload";
import discourseComputed from "discourse-common/utils/decorators";
import { isImage } from "discourse/lib/uploads";
import { confirmAction } from "../lib/new-topic-form-helper";
import Component from "@ember/component";
import I18n from "I18n";
import { isBlank } from "@ember/utils";

export default Component.extend(UppyUploadMixin, {
  type: "composer",
  tagName: "div",
  classNames: ["ntf-field-upload", "ntf-field-btn"],

  uploadDone(upload) {
    this.set("value", upload);
  },

  @discourseComputed("placeholder")
  btnText(placeholder) {
    if (!isBlank(placeholder)) return placeholder;

    return I18n.t("new_topic_form.upload");
  },

  @discourseComputed("value.url")
  isImage(url) {
    return isImage(url);
  },

  actions: {
    removeUpload() {
      const message = I18n.t("new_topic_form.confirm_delete_upload");
      const cb = () => this.set("value", null);

      confirmAction(message, cb);
    }
  }
});
