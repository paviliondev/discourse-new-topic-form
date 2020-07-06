import showModal from "discourse/lib/show-modal";
import { confirmAction } from "../lib/new-topic-form-helper";
import Component from "@ember/component";
import I18n from "I18n";

export default Component.extend({
  editingPoll: false,

  actions: {
    createPoll() {
      // :D
      const setValue = val => {
        this.set("value", val.replace("[poll", `[poll name=${this.id}`));
        this.set("editingPoll", false);
      };

      const toolbarEvent = {
        getText() {
          return "";
        },
        addText: setValue
      };

      const modal = showModal("poll-ui-builder");

      modal.setProperties({
        toolbarEvent
      });
    },

    removePoll() {
      const message = I18n.t("new_topic_form.confirm_delete_poll");
      const cb = () => {
        this.set("value", null);
        this.set("editingPoll", false);
      };

      confirmAction(message, cb);
    },

    editPoll() {
      this.set("valueCopy", this.value);
      this.set("editingPoll", true);
    },

    savePoll() {
      this.set("value", this.valueCopy);
      this.set("editingPoll", false);
    },

    cancelEditPoll() {
      this.set("editingPoll", false);
    }
  }
});
