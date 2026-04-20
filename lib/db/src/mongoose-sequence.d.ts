declare module "mongoose-sequence" {
  import mongoose from "mongoose";
  const AutoIncrementFactory: (mongooseInstance: typeof mongoose) => any;
  export default AutoIncrementFactory;
}
