const express = require('express');
const app = express();
const {
    getArt,
    getArtById,
    getBookById,
    getBooks, 
    getCategories,
    getSeries,
    getSeriesById,
    getSubjects
} = require('./controllers/portfolio.js');

app.use(express.json());


app.get('/api/art', getArt);
app.get('/api/art/:art_id', getArtById);

app.get('/api/books', getBooks);
app.get('/api/books/:book_id', getBookById);

app.get('/api/categories', getCategories);

app.get('/api/series', getSeries);
app.get('/api/series/:series_id', getSeriesById);

app.get('/api/subjects', getSubjects);


app.all('*', (req, res) => {
    res.status(404).send({ msg: 'You must be lost.' });
});



//////////////

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({ msg: 'Are you lost?' })
    } else {
        res.status(err.status).send({ msg: err.msg })
    };
});


module.exports = app;