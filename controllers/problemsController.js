const { problems } = require("../database/models");

const addProblem = async (req, res) => {
  try {
    const { productTypeId, name } = await req.body;

    if (!productTypeId || !name) return res.json({ success: false });

    const addedProblem = await problems.create({
      name: name,
      productTypeId: productTypeId,
    });

    if (!addedProblem) return res.json({ success: false });

    await getAllProblems(req, res);
  } catch (error) {
    res.json({ success: false });
    console.log("ADDPROBLEM", error);
  }
};

const updateProblem = async (req, res) => {
  try {
    const { name, id } = await req.body;

    if (!name || !id) return res.json({ success: false });
    const updatedProblem = await problems.findOne({ where: { id: id } });

    if (!updatedProblem) return res.json({ success: false });
    updatedProblem.name = name;
    const result = await updatedProblem.save();

    if (!result) return res.json({ success: false });
    await getAllProblems(req, res);
  } catch (error) {
    res.json({success: false})
    console.log("UPDATE PROBLEM", error)
  }
};

const getAllProblems = async (req, res) => {
  try {
    const allProblems = await problems.findAll();
    
    if (!allProblems) return res.json({ success: false });
    res.json({ success: true, problems: allProblems });
  } catch (error) {
    res.json({ success: false });
    console.log("GET ALL PROBLEM", error);
  }
};

const deleteProblems = async (req, res) => {
  try {
    const { id } = await req.params;

    if (!id) return res.json({ success: false });
    const deletedProblem = await problems.findOne({
      where: {
        id: id,
      },
    });

    if (!deletedProblem) return res.json({ success: false });
    const result = await deletedProblem.destroy();

    if (!result) return res.json({ success: false });
    await getAllProblems(req, res);
  } catch (error) {
    res.json({success: false})
    console.log("DELETE PROBLEM", error)
  }
};

module.exports = { getAllProblems, addProblem, updateProblem, deleteProblems };
