import { registerHelper } from "discourse-common/lib/helpers";

registerHelper("ntf-eq", params => {
  return params[0] == params[1];
});
