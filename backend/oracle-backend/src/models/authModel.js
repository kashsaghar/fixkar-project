// models/authModel.js
const connect = require('../config/db');
const oracledb = require('oracledb');

const getUserByEmail = async (email) => {
  const conn = await connect();
  try {
    const result = await conn.execute(
      `SELECT user_id, name, email, password, phone, role, is_active FROM users WHERE email = :1`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );

    if (!result.rows || result.rows.length === 0) return null;

    const row = result.rows[0]; // Oracle returns array of arrays when OUT_FORMAT_ARRAY
    return {
      id: row[0],
      name: row[1],
      email: row[2],
      password: row[3],
      phone: row[4],
      role: row[5],
      is_active: row[6] // optional, if you have column
    };
  } finally {
    await conn.close();
  }
};

const createUser = async (name, email, hashedPassword, phone, role) => {
  const conn = await connect();
  try {
    // Use RETURNING to get generated user_id
    const binds = {
      p_name: name,
      p_email: email,
      p_password: hashedPassword,
      p_phone: phone,
      p_role: role,
      out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };

    const sql = `
      INSERT INTO users (name, email, password, phone, role)
      VALUES (:p_name, :p_email, :p_password, :p_phone, :p_role)
      RETURNING user_id INTO :out_id
    `;

    const result = await conn.execute(sql, binds, { autoCommit: true });
    const userId = result.outBinds.out_id[0];
    return userId;
  } finally {
    await conn.close();
  }
};

const getUserById = async (userId) => {
  const conn = await connect();
  try {
    const result = await conn.execute(
      `SELECT user_id, name, email, password, phone, role, is_active FROM users WHERE user_id = :1`,
      [userId],
      { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );

    if (!result.rows || result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row[0],
      name: row[1],
      email: row[2],
      password: row[3],
      phone: row[4],
      role: row[5],
      is_active: row[6]
    };
  } finally {
    await conn.close();
  }
};

module.exports = {
  getUserByEmail,
  createUser,
  getUserById,
};
