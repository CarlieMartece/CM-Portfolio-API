const db = require('.');
const format = require('pg-format');
const { dropTables, createTables } = require('./manage-tables');
const { createRef, formatArt, createCoverRef } = require('./utils');

function seed({categoriesData, seriesData, bookData, artData, codeData}) {
    return dropTables()
        .then(() => {
            return createTables();
        }).then(() => {
            const categoryQuery = format(
                `INSERT INTO categories (category_name) VALUES %L RETURNING*;`, 
                categoriesData.map((category) => [
                    category.category_name
                ])
            );
            return db.query(categoryQuery)
        }).then(() => {
            const seriesQuery = format(
                `INSERT INTO series (series_name, category_id) VALUES %L RETURNING*;`, 
                seriesData.map((series) => [
                    series.series_name,
                    series.category_id
                ])
            );
            return db.query(seriesQuery)
        }).then(() => {
            const bookQuery = format(
                `INSERT INTO books (book_title, edition_no, cover_stock_id, release_date, series_id, sequence_no, sales_url, blurb) VALUES %L RETURNING*;`,
                bookData.map((book) => [
                    book.book_title,
                    book.edition_no,
                    book.cover_stock_id,
                    book.release_date,
                    book.series_id,
                    book.sequence_no,
                    book.sales_url,
                    book.blurb
                ])
            );
            return db.query(bookQuery)          
        }).then((bookResult) => { 
            const bookList = bookResult.rows;
            const formattedArt = formatArt(artData);         
            const artQuery = format(
                `INSERT INTO art (stock_id, art_title, three_word_description, colours, completion, subject, category_id, series_id, alt_text, quote, book_id, made_from, price, self_ref, close_ups, link, shape) VALUES %L RETURNING*;`,
                formattedArt.map((art) => [
                    art.stock_id,
                    art.art_title,
                    art.three_word_description,
                    art.colours,
                    art.completion,
                    art.subject,
                    art.category_id,
                    art.series_id,
                    art.alt_text,
                    art.quote,
                    art.book_id,
                    art.made_from,
                    art.price,
                    art.self_ref,
                    art.close_ups,
                    art.link,
                    art.shape
                ])
            );
            return Promise.all([db.query(artQuery), bookList]) 
        }).then(([artResult, bookList]) => {
            const artList = artResult.rows
            const lookUp = createRef(artList, 'stock_id', 'art_id');
            const coverRef = createCoverRef(bookList, lookUp);
            const bookCoverRefQuery = format(
                `INSERT INTO book_cover_ref (book_id, art_id) VALUES %L RETURNING*;`, 
                coverRef.map((ref) => [
                    ref.book_id,
                    ref.art_id
                ])
            );
            return db.query(bookCoverRefQuery)
        }).then(() => {
            const codeQuery = format(
                `INSERT INTO code (stock_id, name, location, view, first_launched, last_update, tech_stack, description, further_info) VALUES %L RETURNING*;`,
                codeData.map((project) => [
                    project.stock_id,
                    project.name,
                    project.location,
                    project.view,
                    project.first_launched,
                    project.last_update,
                    project.tech_stack,
                    project.description,
                    project.further_info
                ])
            );
            return db.query(codeQuery)
        });
};


module.exports = seed;