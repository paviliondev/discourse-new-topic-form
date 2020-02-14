import discourseComputed from "discourse-common/utils/decorators";
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
      if (this.isValid()) this.request("PUT", true);
    },

    reset() {
      this.request();
    },

    delete() {
      this.request("DELETE");
    },

    addField() {
      const field = {
        id: "",
        label: "",
        type: "text",
        required: false,
        options: "",
        regexp: "",
        regexp_flags: "",
        placeholder: ""
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
  },

  isValid() {
    const fields = this.get("form.fields");
    const showError = m =>
      bootbox.alert(I18n.t(`new_topic_form.admin.errors.${m}`));
    const ids = fields.map(f => f.id.trim());

    const blankIds = ids.filter(id => Ember.isBlank(id));

    if (blankIds.length) {
      showError("id_required");
      return false;
    }

    if (ids.uniq().length < ids.length) {
      showError("id_not_unique");
      return false;
    }

    const blankOptions = fields.filter(f => {
      if (f.type !== "dropdown") return false;

      const options = f.options
        .split(",")
        .map(o => o.trim())
        .filter(o => !Ember.isBlank(o));

      return options.length < 1;
    });

    if (blankOptions.length) {
      showError("options_required");
      return false;
    }

    return true;
  }
});
