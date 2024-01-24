const pool = require("../mariadb");

const getAllCategories = async () => {
    const selectCategorySql = "SELECT * FROM category";
    const [results] = await pool.query(selectCategorySql);
    return results;
};
module.exports = { getAllCategories };
