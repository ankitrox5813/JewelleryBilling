import pool from "../config/db.js";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  if (!rows.length) return res.status(401).json({ message: "Invalid login" });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(401).json({ message: "Invalid login" });

  res.json({
    id: user.id,
    name: user.name,
    role: user.role
  });
};
