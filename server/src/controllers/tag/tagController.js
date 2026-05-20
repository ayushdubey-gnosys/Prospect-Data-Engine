const tagModel = require("../../models/tag.model");
const Tag = require("../../models/tag.model");

const createTag = async (req, res) => {
  try {
    const tag = await Tag.create(req.body);

    res.json(tag);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await Tag.find();

    res.json(tags);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const deleteTag = async (req, res) => {
  try {
    await tagModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Tag deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createTag,
  getTags,
  deleteTag
};