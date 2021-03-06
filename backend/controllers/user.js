import db from '../db';

export const register = async (req, res) => {
  if (typeof req.body.username === 'undefined' || typeof req.body.username !== 'string') {
    return res.status(500).json({ code: 1, message: 'username undefined or wrong type' });
  }
  if (typeof req.body.email === 'undefined' || typeof req.body.email !== 'string') {
    return res.status(500).json({ code: 2, message: 'email undefined or wrong type' });
  }
  if (typeof req.body.password === 'undefined' || typeof req.body.password !== 'string') {
    return res.status(500).json({ code: 3, message: 'password undefined or wrong type' });
  }
  try {
    await db.query('INSERT INTO userinfo(username, email, password, create_date) VALUES($1, $2, $3, to_timestamp($4/1000.0)) RETURNING *',
      [req.body.username, req.body.email, req.body.password, Date.now()]);
    if (typeof req.session === 'undefined') {
      return res.status(500).json({ message: 'session undefined' });
    }
    return res.json({
      code: 0,
      message: 'success',
    });
  } catch (e) {
    return res.status(500).json({ message: 'user insertion error' });
  }
};

export const getUser = async (req, res) => {
  try {
    if (typeof req.session === 'undefined') {
      return res.json({
        code: 0,
        message: 'success',
        isLoggedIn: false,
        userId: undefined,
      });
    }
    return res.json({
      code: 0,
      message: 'success',
      isLoggedIn: true,
      username: req.session.username,
      userId: req.session.uid,
    });
  } catch (e) {
    return res.status(500).json({ message: 'get user error' });
  }
};

export const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      return res.json({
        code: 0,
        message: 'logout success',
      });
    }
    return res.json({
      code: 1,
      message: 'session destroy fails',
    });
  });
};

export const login = async (req, res) => {
  if (typeof req.body.email === 'undefined' || typeof req.body.email !== 'string') {
    return res.status(500).json({ code: 1, message: 'email undefined or wrong type' });
  }
  if (typeof req.body.password === 'undefined' || typeof req.body.password !== 'string') {
    return res.status(500).json({ code: 2, message: 'password undefined or wrong type' });
  }
  try {
    const result = await db.query('SELECT * FROM userinfo WHERE email = $1', [req.body.email]);
    if (result.rowCount === 0) {
      return res.status(401).json({
        code: 4,
        message: 'no such email',
      });
    }
    if (typeof req.session === 'undefined') {
      return res.status(500).json({ message: 'session undefined' });
    }
    if (result.rows[0].password !== req.body.password) {
      return res.status(401).json({
        code: 4,
        message: 'email or password wrong',
      });
    }
    req.session.uid = result.rows[0].id;
    req.session.email = result.rows[0].email;
    req.session.username = result.rows[0].username;
    return res.json({
      code: 0,
      message: 'success',
      username: result.rows[0].username,
      userId: result.rows[0].id,
    });
  } catch (e) {
    return res.status(500).json({ message: `user login error: ${e} ${e.stack}` });
  }
};
