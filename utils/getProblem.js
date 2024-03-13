const getProblem = (value) => {
  let problemType = "",
    problem = "";
  if (value.problems && value.problem) {
    problemType = `${value.problems?.name}: `;
  } else if (value.problems && !value.problem) {
    problemType = value.problems?.name;
  }

  if (value.problem) {
    problem = value.problem;
  }
  return problemType + problem;
};

module.exports = getProblem
