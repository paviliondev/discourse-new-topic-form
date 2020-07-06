import userSearch from "discourse/lib/user-search";
import { on } from "discourse-common/utils/decorators";
import { findRawTemplate } from "discourse-common/lib/raw-templates";
import { caretPosition, inCodeBlock } from "discourse/lib/utilities";
import Component from "@ember/component";
import { schedule } from "@ember/runloop";

export default Component.extend({
  userSearchTerm(term) {
    const topicId = this.get("model.topic.id");
    const categoryId =
      this.get("model.topic.category_id") || this.get("model.categoryId");

    return userSearch({
      term,
      topicId,
      categoryId,
      includeGroups: true
    });
  },

  @on("didInsertElement")
  _composerEditorInit() {
    if (!this.siteSettings.enable_mentions) return;

    const $input = $(this.element.querySelector(".d-editor-input"));

    $input.autocomplete({
      template: findRawTemplate("user-selector-autocomplete"),
      dataSource: term => this.userSearchTerm.call(this, term),
      key: "@",
      transformComplete: v => v.username || v.name,
      afterComplete() {
        // ensures textarea scroll position is correct
        schedule("afterRender", () => $input.blur().focus());
      },
      triggerRule: textarea =>
        !inCodeBlock(textarea.value, caretPosition(textarea))
    });
  },

  @on("willDestroyElement")
  _cancelAutoComplete() {
    $(this.element.querySelector(".d-editor-input")).autocomplete({
      cancel: true
    });
  }
});
