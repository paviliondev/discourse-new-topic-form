import discourseComputed from "discourse-common/utils/decorators";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import EmberObject from "@ember/object";
import { isBlank } from "@ember/utils";
import Controller from "@ember/controller";
import { SHOW_REGEX } from "../components/ntf-setting-field";

const DEF_FIELD = {
  id: "",
  label: "",
  type: "text",
  required: false,
  options: "",
  regexp: "",
  regexp_flags: "",
  placeholder: "",
  isError: false
};

export default Controller.extend({
  categoryId: null,
  data: null,

  init() {
    this._super(...arguments);

    ajax("/new-topic-form/form.json").then(result => {
      const data = result.map(r => this.formatData(r));

      this.set("data", data);
    });
  },

  createObject(obj) {
    return EmberObject.create(obj);
  },

  formatData(data) {
    data.fields = data.fields.map(f => this.createObject(f));

    return data;
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
      this.get("form.fields").addObject(this.createObject(DEF_FIELD));
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
      opts.data = JSON.parse(JSON.stringify({ form }));
    }

    this.set("loading", true);

    ajax(url, opts)
      .then(result => {
        this.get("data").removeObject(form);
        this.get("data").addObject(this.formatData(result));
      })
      .catch(popupAjaxError)
      .finally(() => this.set("loading", false));
  },

  showError(field, m) {
    field.set("isError", true);
    bootbox.alert(I18n.t(`new_topic_form.admin.errors.${m}`));

    return false;
  },

  isValid() {
    const fields = this.get("form.fields");

    // clear errors
    fields.forEach(f => f.set("isError", false));

    // check blank id
    const blankId = fields.find(f => isBlank(f.id));

    if (blankId) {
      return this.showError(blankId, "id_required");
    }

    // check duplicate id
    let duplicateId = null;
    const checkedIds = [];

    fields.forEach(f => {
      if (checkedIds.includes(f.id) && !duplicateId) {
        // duplicate
        duplicateId = f;
      }

      checkedIds.push(f.id);
    });

    if (duplicateId) {
      return this.showError(duplicateId, "id_not_unique");
    }

    // check blank options
    const blankOptions = fields.find(f => {
      if (f.type !== "dropdown") return false;

      const options = f.options
        .split(",")
        .map(o => o.trim())
        .filter(o => !isBlank(o));

      return options.length < 1;
    });

    if (blankOptions) {
      return this.showError(blankOptions, "options_required");
    }

    // validate RegExp flags
    const invalidFlags = fields.find(f => {
      if (!SHOW_REGEX.includes(f.type)) return;
      if (isBlank(f.regexp_flags)) return;

      return /[^gimsuy]/.test(f.regexp_flags);
    });

    if (invalidFlags) {
      return this.showError(invalidFlags, "invalid_regexp_flags");
    }

    // all good
    return true;
  }
});
