import { join } from "node:path";

export default {
    getPath: () => join(import.meta.dirname, "dist"),
};
