const db = require("../db/index.js");

exports.selectCategories = () => {
  return db.query("SELECT * FROM categories;").then((result) => result.rows);
};

//////////////

const seriesQuery = `SELECT series.series_id, series.series_name, categories.category_name
FROM series
INNER JOIN categories ON series.category_id=categories.category_id`

exports.selectSeries = () => {
  return db
    .query(`${seriesQuery};`)
    .then((result) => result.rows);
};

exports.selectSeriesById = (series_id) => {
  return db
    .query(`${seriesQuery} WHERE series.series_id = $1;`,
      [series_id]
    )
    .then(({ rows: [series] }) => {
      if (!series) {
        return Promise.reject({
          status: 404,
          msg: "Series not found",
        });
      }
      return series;
    });
};

//////////////

const bookQuery = `SELECT books.book_id, books.book_title, books.edition_no, books.cover_stock_id, book_cover_ref.art_id, books.release_date, series.series_name, books.sequence_no, books.sales_url, books.blurb  
FROM books
INNER JOIN series ON books.series_id = series.series_id
INNER JOIN book_cover_ref ON books.book_id = book_cover_ref.book_id`;

exports.selectBooks = () => {
  return db.query(`${bookQuery} ORDER BY books.release_date DESC;`).then((result) => result.rows);
};

exports.selectBookById = (book_id) => {
  return db
    .query(`${bookQuery} WHERE books.book_id = $1;`, [book_id])
    .then(({ rows: [book] }) => {
      if (!book) {
        return Promise.reject({
          status: 404,
          msg: "Book not found",
        });
      }
      return book;
    });
};

exports.selectBooksBySeries = (series_id) => {
  return db
    .query(`${bookQuery} WHERE books.series_id = $1 ORDER BY books.sequence_no ASC;`, [series_id])
    .then(({ rows: items }) => {
        return items;
    });
};

//////////////

const artQuery = `SELECT art.art_id, art.stock_id, art.art_title, art.three_word_description, art.colours, art.completion, categories.category_name, series.series_name, art.alt_text, art.quote, books.book_title, art.made_from, art.price, art.self_ref, art.close_ups, art.link  
FROM art
INNER JOIN categories ON art.category_id = categories.category_id
INNER JOIN series ON art.series_id = series.series_id
INNER JOIN books ON art.book_id = books.book_id`;

exports.selectArt = (queries) => {
  let filter = " ";
  let array = [];
  if (queries.category) {
    if (queries.category === '13' || queries.category === '46') {
      const clause = ` art.category_id = `;
      filter = ` WHERE${clause}$1 OR${clause}$2 OR${clause}$3 `;
      for (let i = Number(queries.category.charAt(0)); i < Number(queries.category.charAt(1)) + 1; i++) { array.push(i) }
    } else if (queries.category === '16') {
      filter = ` WHERE art.category_id != $1 `;
      array.push(7);
    } else {
      filter = ` WHERE art.category_id = $1 `;
      array.push(queries.category);
    }
  };
  if (queries.subject) {
    filter = ` WHERE art.subject = $1 `;
    array.push(queries.subject);
  }
  const queryString = `SELECT art.stock_id FROM art${filter}ORDER BY art.stock_id ASC;`;
  return db.query(queryString, array).then((result) => result.rows);
};

exports.selectArtById = (art_id) => {
  return db
    .query(`${artQuery} WHERE art.art_id = $1;`, [art_id])
    .then(({ rows: [art] }) => {
      if (!art) {
        return Promise.reject({
          status: 404,
          msg: "Art not found",
        });
      }
      return art;
    });
};

exports.selectArtBySeries = (series_id) => {
  return db
    .query(`${artQuery} WHERE art.series_id = $1 ORDER BY art.stock_id ASC;`, [series_id])
    .then(({ rows: items }) => {
      return items;
    });
};
