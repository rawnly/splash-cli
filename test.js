import test from "ava";
import splashClient from ".";

test("Testing... 1", async t => {
  try {
    await splashClient([], {
      token: "d780e2d296ea4a26b9a373cfd3265f8f949de7260d62f7dc838d5396142cd3a6"
    });
    t.pass();
  } catch (error) {
    t.fail(error);
  }
});

test("Testing again", async t => {
  execa.shell();
});
