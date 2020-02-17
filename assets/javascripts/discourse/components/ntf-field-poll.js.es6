import showModal from "discourse/lib/show-modal";
import { confirmAction } from "../lib/new-topic-form-helper";

export default Ember.Component.extend({
  actions: {
    createPoll() {
      // :D
      const toolbarEvent = {
        getText() { return ""; },
        addText() { return; }
      };

      const modal = showModal("poll-ui-builder");

      modal.setProperties({
        toolbarEvent,
        ntfPoll: this
      });
    },

    removePoll() {
      const message = I18n.t("new_topic_form.confirm_delete_poll");
      const cb = () => this.set("value", null);

      confirmAction(message, cb);
    }
  }
});
