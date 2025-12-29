import pool from "../config/db.js";

export const addRate = async (req, res) => {
  const { metal, purity, rate_per_10g } = req.body;

  await pool.query(
    `INSERT INTO metal_rates (metal, purity, rate_per_10g, rate_date)
     VALUES (?, ?, ?, CURDATE())`,
    [metal, purity, rate_per_10g]
  );

  res.json({ message: "Rate saved" });
};

export const getTodayRates = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM metal_rates WHERE rate_date = CURDATE()"
  );
  res.json(rows);
};
