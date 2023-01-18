const db = require('.');

exports.dropTables = () => {
    return db
        .query('DROP TABLE IF EXISTS code;')
        .then(() => {
            return db.query('DROP TABLE IF EXISTS book_cover_ref;');
        })
        .then(() => {
            return db.query('DROP TABLE IF EXISTS art;');
        })
        .then(() => {
            return db.query('DROP TABLE IF EXISTS books;');
        })
        .then(() => {
            return db.query('DROP TABLE IF EXISTS series;');
        })
        .then(() => {
            return db.query('DROP TABLE IF EXISTS categories;');
        });
};

exports.createTables = () => {
    return db.query(
        `CREATE TABLE categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR NOT NULL
        );`
    ).then(() => {
        return db.query(`CREATE TABLE series (
            series_id SERIAL PRIMARY KEY,
            series_name VARCHAR NOT NULL,
            category_id SMALLINT REFERENCES categories(category_id)
        );`);
    }).then(() => {
        return db.query(`CREATE TABLE books (
            book_id SERIAL PRIMARY KEY,
            book_title VARCHAR NOT NULL,
            edition_no SMALLINT,
            cover_stock_id VARCHAR,
            release_date DATE,
            series_id SMALLINT REFERENCES series(series_id),
            sequence_no SMALLINT,
            sales_url VARCHAR,
            blurb VARCHAR
        );`);
    }).then(() => {
        return db.query(`CREATE TABLE art (
            art_id SERIAL PRIMARY KEY,
            stock_id VARCHAR NOT NULL,
            art_title VARCHAR NOT NULL,
            three_word_description VARCHAR NOT NULL,
            colours VARCHAR,
            completion DATE NOT NULL,
            subject VARCHAR,
            category_id SMALLINT REFERENCES categories(category_id),
            series_id SMALLINT REFERENCES series(series_id),
            alt_text VARCHAR,
            quote VARCHAR,
            book_id SMALLINT REFERENCES books(book_id),
            made_from VARCHAR,
            price MONEY,
            self_ref VARCHAR,
            close_ups VARCHAR,
            link VARCHAR
        );`);
    }).then(() => {
        return db.query(`CREATE TABLE book_cover_ref (
            ref_id SERIAL PRIMARY KEY,
            book_id SMALLINT REFERENCES books(book_id),
            art_id SMALLINT REFERENCES art(art_id)
        );`);
    }).then(() => {
        return db.query(`CREATE TABLE code (
            project_id SERIAL PRIMARY KEY,
            stock_id VARCHAR NOT NULL,
            name VARCHAR NOT NULL,
            location VARCHAR NOT NULL,
            view VARCHAR NOT NULL,
            first_launched DATE NOT NULL,
            last_update DATE,
            tech_stack VARCHAR NOT NULL,
            description VARCHAR NOT NULL,
            further_info VARCHAR
        );`);
    });
};