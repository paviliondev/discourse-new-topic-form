import discourseComputed, { observes } from "discourse-common/utils/decorators";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default Ember.Controller.extend({
  categoryId: null,
  data: null,

  init() {
    this._super(...arguments);

    ajax("/new-topic-form/form.json").then(result => {
      this.set("data", result);
    });
  },

  @discourseComputed("categoryId", "data.[]")
  form(categoryId, data) {
    if (!categoryId || !data) return;

    return data.findBy("category_id", categoryId);
  },

  actions: {
    save() {
      this.request("PUT", true);
    },

    reset() {
      this.request();
    },

    delete() {
      this.request("DELETE");
    },

    addField() {
      const field = {
        id: null,
        label: null,
        type: "text",
        required: false,
        options: null,
        regex: null
      };

      this.get("form.fields").addObject(field);
    },

    removeField(field) {
      this.get("form.fields").removeObject(field);
    }
  },

  request(type, includeForm) {
    const form = this.get("form");
    const categoryId = this.get("categoryId");
    const url = `/new-topic-form/form/${categoryId}`;
    const opts = { type: type || "GET" };

    if (includeForm) {
      opts.data = { form };
    }

    this.set("loading", true);

    ajax(url, opts)
      .then(result => {
        this.get("data").removeObject(form);
        this.get("data").addObject(result);
      })
      .catch(popupAjaxError)
      .finally(() => this.set("loading", false));
  }
});
