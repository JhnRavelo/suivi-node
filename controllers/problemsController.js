const { problems } = require("../database/models");

const addProblem = async (req, res) => {
  try {
    const { productTypeId, name } = await req.body;
    console.log(productTypeId, "PROBLEM")

    if (!productTypeId || !name) return res.json({ success: false });

    const addedProblem = await problems.create({
      name: name,
      productTypeId: productTypeId,
    });

    if (!addedProblem) return res.json({ success: false });

    await getAllProblems(req, res);
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

const getAllProblems = async (req, res) => {
  try {
    const allProblems = await problems.findAll();

    if (!allProblems) return res.json({ success: false });

    res.json({ success: true, problems: allProblems });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

module.exports = { getAllProblems, addProblem };
