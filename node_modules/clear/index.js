module.exports = function(clear) {
  if (clear !== false) {
    process.stdout.write('\033[2J');
  }
  process.stdout.write('\033[0f');
};
