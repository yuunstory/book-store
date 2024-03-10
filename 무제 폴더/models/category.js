const pool = require("../mariadb");

const getAllCategories = async () => {
    const connection = await pool.getConnection();

    const selectCategorySql = "SELECT * FROM category";
    const [results] = await connection.query(selectCategorySql);
    return results;
};
module.exports = { getAllCategories };
