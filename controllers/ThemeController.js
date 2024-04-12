exports.changeTheme = (req, res) => {
  const { theme } = req.body;
  if (theme !== 'light' && theme !== 'dark') {
    console.error(`Invalid theme option provided: ${theme}`);
    return res.status(400).json({ message: 'Invalid theme option.' });
  }
  req.session.theme = theme;
  console.log(`Theme updated successfully to: ${theme}`);
  res.status(200).json({ message: 'Theme updated successfully.' });
};