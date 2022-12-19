const { createRef, createFilteredList } = require("../db/utils");
const {
  selectCategories,
  selectSeries,
  selectBooks,
  selectBookById,
  selectArt,
  selectArtById,
  selectSeriesById,
  selectArtBySeries,
  selectBooksBySeries
} = require("../models/portfolio");

exports.getCategories = (req, res) => {
  selectCategories().then((result) => {
    const categories = createRef(result, "category_id", "category_name");
    res.status(200).send({ categories });
  });
};

exports.getSeries = (req, res) => {
  selectSeries().then((result) => {
    const series = createRef(result, 'series_id', 'series_name')
    res.status(200).send({ series });
  });
};

exports.getSeriesById = (req, res, next) => {
  const { series_id } = req.params;
  selectSeriesById(series_id)
    .then((series) => {
        let selectItems = selectArtBySeries(series_id);
        if (series.category_name === "Book") {
            selectItems = selectBooksBySeries(series_id);
        }
        return Promise.all([series, selectItems])
    }).then(([series, selectItems]) => {
        if (series.category_name === "Book") {
            series.items = createFilteredList(selectItems);
        } else {
            series.items = selectItems;
        }
        res.status(200).send({ series });
    }).catch((err) => {
        next(err);
    });
};

exports.getBooks = (req, res) => {
  selectBooks().then((books) => {
    res.status(200).send({ books });
  });
};

exports.getBookById = (req, res, next) => {
  const { book_id } = req.params;
  selectBookById(book_id)
    .then((book) => {
      res.status(200).send({ book });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArt = (req, res, next) => {
  const queries = req.query;
  selectArt(queries)
  .then((response) => {
    let stockArray = []
    if (queries.colour) {     
      response.forEach((item) => {
        const coloursArray = item.colours.split(', ');
        if (coloursArray.indexOf(queries.colour) !== -1) {
          stockArray.push(item.stock_id);
        }
      });
    } else {
      response.forEach((item) => stockArray.push(item.stock_id))
    };
    if (stockArray.length < 1) {
      res.status(404).send({ msg: "Art not found" })
    } else {
      res.status(200).send(stockArray);
    }
  })
  .catch((err) => {
    next(err);
  });
};

exports.getArtById = (req, res, next) => {
  const { art_id } = req.params;
  selectArtById(art_id)
    .then((art) => {
      res.status(200).send({ art });
    })
    .catch((err) => {
      next(err);
    });
};
