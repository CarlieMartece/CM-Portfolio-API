const { createRef, createFilteredList } = require("../db/utils");
const {
  selectArt,
  selectArtById,
  selectArtBySeries,
  selectBooks,
  selectBookById,
  selectBooksBySeries,
  selectCategories,
  selectCode,
  selectCodeById,
  selectSeries,
  selectSeriesById,
  countSubjects,
  selectArtIds
} = require("../models/portfolio");


exports.getArt = (req, res, next) => {
  const queries = req.query;
  selectArt(queries)
  .then((response) => {
    if (queries.sort_by === 'price') {
      res.status(200).send(response);
    };
    let stockArray = []
    if (queries.colour) {     
      response.forEach((item) => {
        const coloursArray = item.colours.split(', ');
        if (coloursArray.indexOf(queries.colour) !== -1) {
          stockArray.push(item.stock_id);
        }
      });
    } else {
      response.forEach((item) => {
        stockArray.push(item)
      })
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

exports.getArtIds = (req, res, next) => {
  selectArtIds()
    .then((result) => {
      artIds = createRef(result, "stock_id", "art_id");
      res.status(200).send({ artIds });
    })
}

exports.getArtById = (req, res, next) => {
  const { art_id } = req.params;
  selectArtById(art_id)
    .then((art) => {
      // if (art.self_ref === "TBC") {
      //   art.self_ref = 0
      // } else {
      //   console.log(art.self_ref)
      //   const findRef = createRef(art, "category_id", "category_name");
      // }
      res.status(200).send({ art });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getBookById = (req, res, next) => {
  const { book_id } = req.params;
  selectBookById(book_id)
    .then((book) => {
      const blurbArray = book.blurb.split('\n')
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
      const blurbArray = book.blurb.split('\n')
      book.blurb = blurbArray;
    })
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
  selectCode()
  .then((code) => {
    code.forEach((project) => {
      if (project.last_update === null) {
        project.last_update = project.first_launched;
      }
      delete project.first_launched;
      const stackArray = project.tech_stack.split(', ');
      project.tech_stack = stackArray;
    })
    res.status(200).send({ code });
  });
};

exports.getCodeById = (req, res, next) => {
  const { project_id } = req.params;
  selectCodeById(project_id)
  .then((project) => {
    const stackArray = project.tech_stack.split(', ');
    project.tech_stack = stackArray;
    res.status(200).send({ project });
  })
  .catch((err) => {
    next(err);
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
        series.items = createFilteredList(selectItems);
        if (series.category_name === "Book") {
          series.items.forEach((item) => {
            const blurbArray = item.blurb.split('\n')
          item.blurb = blurbArray;
          });
        }
        res.status(200).send({ series });
    }).catch((err) => {
        next(err);
    });
};

exports.getSubjects = (req, res) => {
  countSubjects().then((subjects) => {
    res.status(200).send({ subjects });
  });
};