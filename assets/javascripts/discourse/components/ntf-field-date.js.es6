import showModal from "discourse/lib/show-modal";
import { confirmAction } from "../lib/new-topic-form-helper";
import Component from "@ember/component";
import I18n from "I18n";

export default Component.extend({
  classNames: ["ntf-field-date", "ntf-field-btn"],

  actions: {
    createdate() {
      const setValue = val => {
        this.set("value", val);
      };

      const toolbarEvent = {
        addText: setValue
      };

      const modal = showModal("discourse-local-dates-create-modal");

      modal.setProperties({
        toolbarEvent
      });
    },

    removeDate() {
      const message = I18n.t("new_topic_form.confirm_delete_date");
      const cb = () => this.set("value", null);

      confirmAction(message, cb);
    }
  }
});
