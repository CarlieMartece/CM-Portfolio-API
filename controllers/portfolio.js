const apiEndpoints = require('../endpoints.json');
const { createRef, createFilteredList } = require("../db/utils");
const {
  selectArt,
  selectArtById,
  selectArtBySeries,
  selectArtIds,
  selectBooks,
  selectBookById,
  selectBooksBySeries,
  selectCategories,
  selectCode,
  selectCodeById,
  selectSeries,
  selectSeriesById,
  countSubjects,
  selectArtBy3Words,
} = require("../models/portfolio");

exports.getApi = (req, res, next) => {
  res.status(200).send({ apiEndpoints });
}

exports.getArt = (req, res, next) => {
  const queries = req.query;
  selectArt(queries)
    .then((response) => {
      if (queries.sort_by === "price") {
        res.status(200).send(response);
      }
      let stockArray = [];
      if (queries.colour) {
        response.forEach((item) => {
          const coloursArray = item.colours.split(", ");
          if (coloursArray.indexOf(queries.colour) !== -1) {
            stockArray.push(item);
          }
          delete item.colours;
        });
      } else {
        if (queries.category && queries.category === "3") {
          response = createFilteredList(response);
        }
        response.forEach((item) => {
          stockArray.push(item);
        });
      }
      if (stockArray.length < 1) {
        res.status(404).send({ msg: "Art not found" });
      } else {
        res.status(200).send(stockArray);
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArtIds = (req, res, next) => {
  const { queries } = req.query;
  selectArtIds(queries).then((result) => {
    artIds = createRef(result, "stock_id", "art_id");
    res.status(200).send({ artIds });
  });
};

exports.getArtById = (req, res, next) => {
  const { art_id } = req.params;
  const { extra } = req.query;
  selectArtById(art_id, extra)
    .then((art) => {
      return Promise.all([art, selectArtIds()]);
    })
    .then(([art, artIds]) => {
      const idRef = createRef(artIds, "stock_id", "art_id");
      const wordRef = createRef(artIds, "stock_id", "three_word_description");
      art.forEach((item) => {
        if (item.self_ref === "TBC") {
          item.self_ref = [];
        } else {
          const refArray = [];
          refArray.push(item.self_ref);
          refArray.push(idRef[item.self_ref]);
          refArray.push(wordRef[item.self_ref]);
          item.self_ref = refArray;
        }
      });
      if (art.length < 1) {
        res.status(404).send({ msg: "Art not found" });
      } else {
        res.status(200).send({ art });
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArtBy3Words = (req, res, next) => {
  const { three_word_description } = req.params;
  selectArtBy3Words(three_word_description)
    .then((art) => {
      return Promise.all([art, selectArtIds()]);
    })
    .then(([art, artIds]) => {
      let collage = {};
      const firstObj = art[0].stock_id;
      collage[firstObj] = art[0];
      const closeUps = art[0].close_ups.split(",");
      closeUps.forEach((stockId) => {
        const newObj = {
          alt_text: art[0].alt_text,
          completion: art[0].completion,
          made_from: art[0].made_from,
          stock_id: stockId,
          self_ref: [],
        };
        collage[stockId] = newObj;
      });
      const idRef = createRef(artIds, "stock_id", "art_id");
      const wordRef = createRef(artIds, "stock_id", "three_word_description");
      art.forEach((item) => {
        const key = item.stock_id;
        if (item.self_ref === "TBC") {
          item.self_ref = [];
        } else {
          const refArray = [];
          refArray.push(item.self_ref);
          refArray.push(idRef[item.self_ref]);
          refArray.push(wordRef[item.self_ref]);
          item.self_ref = refArray;
        }
        collage[key] = item;
      });
      if (collage.length < 1) {
        res.status(404).send({ msg: "Art not found" });
      } else {
        res.status(200).send({ collage });
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.getBookById = (req, res, next) => {
  const { book_id } = req.params;
  selectBookById(book_id)
    .then((book) => {
      const blurbArray = book.blurb.split("\n");
      book.blurb = blurbArray;
      res.status(200).send({ book });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getBooks = (req, res) => {
  selectBooks().then((books) => {
    books.forEach((book) => {
      const blurbArray = book.blurb.split("\n");
      book.blurb = blurbArray;
    });
    res.status(200).send({ books });
  });
};

exports.getCategories = (req, res) => {
  selectCategories().then((result) => {
    const categories = createRef(result, "category_id", "category_name");
    res.status(200).send({ categories });
  });
};

exports.getCode = (req, res) => {
  selectCode().then((code) => {
    code.forEach((project) => {
      if (project.last_update === null) {
        project.last_update = project.first_launched;
      }
      delete project.first_launched;
      const stackArray = project.tech_stack.split(", ");
      project.tech_stack = stackArray;
    });
    res.status(200).send({ code });
  });
};

exports.getCodeById = (req, res, next) => {
  const { project_id } = req.params;
  selectCodeById(project_id)
    .then((project) => {
      const stackArray = project.tech_stack.split(", ");
      project.tech_stack = stackArray;
      res.status(200).send({ project });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getSeries = (req, res) => {
  selectSeries().then((result) => {
    const series = createRef(result, "series_id", "series_name");
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
      return Promise.all([series, selectItems]);
    })
    .then(([series, selectItems]) => {
      series.items = createFilteredList(selectItems);
      if (series.category_name !== "Book" && series.category_name !== "Code" && series.category_name !== "Mixed") {
        const customRemoved = [];
        series.items.map((item) => {
          if (item.custom_link === "") {
            customRemoved.push(item);
          }
        });
        series.items = customRemoved;
      } else if (series.category_name === "Book") {
        series.items.forEach((item) => {
          const blurbArray = item.blurb.split("\n");
          item.blurb = blurbArray;
        });
      };
      res.status(200).send({ series });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getSubjects = (req, res) => {
  countSubjects().then((subjects) => {
    res.status(200).send({ subjects });
  });
};
