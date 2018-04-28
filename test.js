import test from "ava";
import execa from "execa";
import splashClient from ".";
test("Testing again", async t => {
  try {
    await splashClient([], { quiet: true, user: "nasa" });
    t.pass();
  } catch (error) {
    t.fail(error.message);
    throw error;
  }
});
