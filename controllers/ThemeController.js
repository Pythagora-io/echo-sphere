exports.changeTheme = (req, res) => {
  const { theme } = req.body;
  if (theme !== 'light' && theme !== 'dark') {
    console.error(`Invalid theme option received: ${theme}`);
    return res.status(400).json({ message: 'Invalid theme option.' });
  }
  req.session.theme = theme;
  req.session.save(err => {
    if (err) {
      console.error(`Error saving session: ${err.message}`, err.stack);
      return res.status(500).json({ message: 'Failed to update theme preference due to server error.', error: err });
    }
    console.log(`Theme updated successfully to: ${theme}`);
    res.status(200).json({ message: 'Theme updated successfully.' });
  });
};