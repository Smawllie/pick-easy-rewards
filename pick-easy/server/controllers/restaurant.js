let mongoose = require("mongoose");
let { validationResult } = require("express-validator");
let Restaurant = mongoose.model("Restaurant");
let AchievementTemplate = mongoose.model("AchievementTemplate");

const isBadRequest = (req) => !validationResult(req).isEmpty();

module.exports.createRestaurant = async (req, res) => {
  if (isBadRequest(req)) return res.sendStatus(400);

  let restaurant;
  try {
    restaurant = await Restaurant.create({
      owner: { _id: req.user._id },
      name: req.body.description,
      rating: { value: 0, ratedBy: 0 },
      cost: req.body.cost,
      cuisine: req.body.cuisine,
    });

    res.json(restaurant);
  } catch (err) {
    return res.sendStatus(500);
  }
};

module.exports.retrieveRestaurantById = async (req, res) => {
  if (isBadRequest(req)) return res.sendStatus(400);

  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant)
      return res.status(404).send(`Restaurant ${req.params.id} does not exist`);

    res.json(restaurant);
  } catch (err) {
    res.sendStatus(500);
  }
};

module.exports.retrieveAllRestaurants = async (req, res) => {
  try {
    res.json(await Restaurant.find({}));
  } catch (err) {
    res.sendStatus(500);
  }
};

module.exports.retrieveOwnRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne({ "owner._id": req.user._id });

    if (!restaurant)
      return res.status(404).send(`No restaurant found under the user`);

    res.json(restaurant);
  } catch (err) {
    res.sendStatus(500);
  }
};

module.exports.updateAchievements = async (req, res) => {
  if (isBadRequest(req)) return res.sendStatus(400);

  for (const achievement of req.body.achievements) {
    let template = await AchievementTemplate.findOne({
      templateNumber: achievement.templateNumber,
    });

    if (
      !template ||
      template.variables.length != achievement.variables.length ||
      (!template.repeatable &&
        req.body.achievements.filter(
          (achievement) => achievement.templateNumber == template.templateNumber
        ).length > 1)
    ) {
      return res.sendStatus(400);
    }
  }

  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant)
      return res.status(404).send(`Restaurant ${req.params.id} does not exist`);

    if (!restaurant.owner._id.equals(req.user._id)) return res.sendStatus(403);

    await Restaurant.findByIdAndUpdate(restaurant._id, {
      $set: {
        numberOfStampsForReward: req.body.numberOfStampsForReward,
        achievements: req.body.achievements,
      },
    });

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
};
