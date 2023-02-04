const db = require("../db/index.js");


const artQuery = `SELECT art.art_id, art.stock_id, art.art_title, art.three_word_description, art.colours, art.completion, categories.category_name, series.series_name, art.alt_text, art.quote, books.book_title, art.made_from, art.price, art.self_ref, art.close_ups, art.link, art.shape  
FROM art
INNER JOIN categories ON art.category_id = categories.category_id
INNER JOIN series ON art.series_id = series.series_id
INNER JOIN books ON art.book_id = books.book_id`;

exports.selectArt = (queries) => {
  let selectQuery = `SELECT art.art_id, art.stock_id, art.three_word_description, art.custom_link, art.alt_text, art.close_ups, art.is_close_up FROM art`;
  let filter = " ";
  let filterPlus = "";
  let orderQuery = `ORDER BY art.completion `;
  let ascOrDesc = queries.order_by || `DESC`;
  let queryValues = [];
  if (queries.colour) {
    selectQuery = `SELECT art.stock_id, art.colours FROM art`;
  }
  if (queries.category) {
    let value = "$2"
    if (queries.category === "13" || queries.category === "46") {
      const clause = ` art.category_id = `;
      filter = ` WHERE${clause}$1 OR${clause}$2 OR${clause}$3 `;
      value = "$4"
      for (
        let i = Number(queries.category.charAt(0));
        i < Number(queries.category.charAt(1)) + 1;
        i++
      ) {
        queryValues.push(i);
      }
    } else if (queries.category === "16") {
      filter = ` WHERE art.category_id != 7 AND art.category_id != 9 AND art.category_id != 10 `;
      value = '$1'
    } else if (queries.category === "314") {
      filter = ` `;
    } else {
      filter = ` WHERE art.category_id = $1 `;
      queryValues.push(queries.category);
    }
    if (queries.year) {
      filterPlus = `AND date_part('year', art.completion) = ${value} `;
      if (queries.year === 'now') {
        queryValues.push(new Date().getFullYear());
      } else {
        queryValues.push(queries.year);
      }
    }
  }
  if (queries.subject) {
    filter = ` WHERE art.subject ILIKE $1 `;
    queryValues.push(queries.subject);
  }
  if (queries.sort_by === "price") {
    selectQuery = `SELECT art.art_id, art.stock_id, art.art_title, art.category_id, art.alt_text, art.made_from, art.price, art.shape FROM art`;
    filter = ` WHERE art.price != $1 `;
    orderQuery = `ORDER BY art.price `;
    queryValues.push(-1);
  }
  if (queries.year && !queries.category) {
    filter = ` WHERE date_part('year', art.completion) = $1 `;
    if (queries.year === 'now') {
      queryValues.push(new Date().getFullYear());
    } else {
      queryValues.push(queries.year);
    }
  }
  if (
    (queries.category && !Number(queries.category)) ||
    Number(queries.subject) ||
    Number(queries.colour) ||
    (queries.sort_by && queries.sort_by !== "price") ||
    (queries.order_by && queries.order_by !== "asc")
  ) {
    return Promise.reject({ status: 400, msg: "Non-valid search criteria" });
  }
  const queryString = `${selectQuery}${filter}${filterPlus}${orderQuery}${ascOrDesc};`;
  return db.query(queryString, queryValues).then((result) => {
    return result.rows;
  });
};

exports.selectArtIds = (title) => {
  let filter = "";
  let queryValues = [];
  if (title) {
    filter = ` WHERE art.art_title=$1`
    queryValues.push(title);
  }
  const queryString = `SELECT art.art_id, art.stock_id, art.three_word_description FROM art${filter};`
  return db
    .query(queryString, queryValues)
    .then((result) => {
      return result.rows;
    });
}

exports.selectArtById = (art_id, extra) => {
  let plus = "";
  let queryValues = [art_id];
  if (extra) {
    plus = " OR art.art_id=$2 ORDER BY art.art_id DESC";
    queryValues.push(extra);
  }
  return db
    .query(`${artQuery} WHERE art.art_id = $1${plus};`, queryValues)
    .then((result) => {
      // if (!art) {
      //   return Promise.reject({ status: 404, msg: "Art not found" });
      // }
      return result.rows;
    });
};

exports.selectArtBy3Words = (three_word_description) => {
  const queryString = `${artQuery} WHERE art.three_word_description = $1 ORDER BY art.stock_id ASC;`
  return db
    .query(queryString, [three_word_description])
    .then((result) => {
      return result.rows;
    });

};

exports.selectArtBySeries = (series_id) => {
  return db
    .query(`SELECT art.art_id, art.stock_id, art.art_title, art.alt_text FROM art WHERE art.series_id = $1 ORDER BY art.stock_id ASC;`, [
      series_id,
    ])
    .then(({ rows: items }) => {
      return items;
    });
};

//////////////

const bookQuery = `SELECT books.book_id, books.book_title, books.edition_no, books.cover_stock_id, book_cover_ref.art_id, books.release_date, series.series_name, books.sequence_no, books.sales_url, books.blurb  
FROM books
INNER JOIN series ON books.series_id = series.series_id
INNER JOIN book_cover_ref ON books.book_id = book_cover_ref.book_id`;

exports.selectBooks = () => {
  return db
    .query(`${bookQuery} ORDER BY books.release_date DESC;`)
    .then((result) => {
      return result.rows;
    });
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
    .query(
      `${bookQuery} WHERE books.series_id = $1 ORDER BY books.sequence_no ASC;`,
      [series_id]
    )
    .then(({ rows: items }) => {
      return items;
    });
};

//////////////

exports.selectCategories = () => {
  return db.query("SELECT * FROM categories;").then((result) => result.rows);
};

//////////////

exports.selectCode = () => {
  return db.query("SELECT project_id, stock_id, name, first_launched, last_update, tech_stack FROM code;").then((result) => result.rows);
};

exports.selectCodeById = (project_id) => {
  return db
    .query("SELECT * FROM code WHERE project_id=$1;", [project_id])
    .then(({ rows: [project] }) => {
      if (!project) {
        return Promise.reject({
          status: 404,
          msg: "Project not found",
        });
      }
      return project;
    });
};

//////////////

const seriesQuery = `SELECT series.series_id, series.series_name, categories.category_name
FROM series
INNER JOIN categories ON series.category_id=categories.category_id`;

exports.selectSeries = () => {
  return db.query(`${seriesQuery};`).then((result) => result.rows);
};

exports.selectSeriesById = (series_id) => {
  return db
    .query(`${seriesQuery} WHERE series.series_id = $1;`, [series_id])
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

exports.countSubjects = () => {
  return db
    .query(`SELECT subject, count(subject) FROM art GROUP by subject ORDER BY count DESC`).then((result) => {
      return result.rows;
    });
};