module.exports = (req, res) => {
  res.json({ message: 'API test working', time: new Date() });
};
