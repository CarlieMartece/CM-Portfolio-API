const {
  createRef,
  formatArt,
  createCoverRef,
  createFilteredList,
} = require("../db/utils");

const categories = [
  { category_id: 1, category_name: "Drawing" },
  { category_id: 3, category_name: "Collage" },
  { category_id: 7, category_name: "Book" },
];

const series = [
  {
    series_id: 1,
    series_name: "art-k",
    category_id: 3,
  },
  {
    series_id: 2,
    series_name: "book-b",
    category_id: 7,
  },
  {
    series_id: 3,
    series_name: "art-b",
    category_id: 1,
  },
  {
    series_id: 4,
    series_name: "book-x",
    category_id: 7,
  },
];

const books = [
  {
    book_id: 6,
    book_title: "Toxic Nursery",
    edition_no: 1,
    cover_stock_id: "5301",
    release_date: "2013-03-14",
    series_id: 4,
    sequence_no: 1,
    sales_url: "https://mybook.to/toxic-nursery",
    blurb: "TN Blurb",
  },
  {
    book_id: 4,
    book_title: "Toxic Nursery",
    edition_no: 2,
    cover_stock_id: "2002",
    release_date: "2021-9-21",
    series_id: 4,
    sequence_no: 1,
    sales_url: "https://mybook.to/toxic-nursery",
    blurb: "TN Blurb",
  },
  {
    book_id: 2,
    book_title: "DarkStar Vale",
    edition_no: 1,
    cover_stock_id: "TBC",
    release_date: "2023-12-25",
    series_id: 2,
    sequence_no: 1,
    sales_url: "TBC",
    blurb: "TBC",
  },
];

const art = [
  {
    art_id: 3,
    stock_id: "3101g",
    art_title: "Claireytale",
    three_word_description: "lamplit-brown-bear",
    colours: "brown, orange",
    subject: "toys",
    completion: "2021-09-26",
    category_id: 3,
    series_id: 1,
    alt_text: "Photo of brown bear toy.",
    quote: "Home #2 was in a new-built student complex...",
    book_id: 1,
    made_from: "Photograph of lamplit toys for my first uni project",
    price: -1,
    self_ref: "TBC",
    close_ups: "0",
    link: "TBC",
  },
  {
    art_id: 1,
    stock_id: "3101a",
    art_title: "Claireytale",
    three_word_description: "disturbing-childhood-dreamscape",
    colours: "pink,peach",
    completion: "2005-08-09",
    category_id: 3,
    series_id: 1,
    alt_text:
      "Weird collage with dripping paint and disturbing childhood imagery.",
    quote: "Honeysuckle said the imagery was creepy...",
    quote_source: 4,
    made_from: "61cm by 61cm by 3.5cm boxed canvas, watercolour paints...",
    price: null,
    self_ref: "TBC",
    close_ups: 6,
    link: "TBC",
  },
  {
    art_id: 2,
    stock_id: "2002",
    art_title: "Mute Fairy",
    three_word_description: "sad-fairy-painting",
    colours: "purple,brown,grey",
    completion: "2005-03-14",
    category_id: 1,
    series_id: 3,
    alt_text:
      "Depressed fairy with no mouth holding flowers that look like grapes.",
    quote: "Now, we had nothing left to lose.",
    quote_source: 4,
    made_from: "Lovely watercolours...",
    price: null,
    self_ref: "5001",
    close_ups: null,
    link: "TBC",
  },
  {
    stock_id: "913-130314a",
    art_title: "Toxic Nursery promo shoot with Under Your Skin Photography",
    three_word_description: "purple-wigged-aspiration",
    colours: "purple",
    completion: "2013-03-14",
    subject: "Carlie Martece",
    category_id: 9,
    series_id: 13,
    alt_text: "Carlie Martece in purple wig and sunglasses. I don't know what they're smiling about.",
    quote: "\"Everybody's enslaved by something,\"",
    book_id: 5,
    made_from: "Modelling and dreams of a brighter tomorrow.",
    price: -1,
    self_ref: "TBC",
    close_ups: "8",
    link: "TBC",
  },
];

describe("multi-purpose createRef function", () => {
  test("Function accepts an array and returns an object", () => {
    const actual = createRef(categories);
    expect(actual).toBeInstanceOf(Object);
  });
  test("When passed one object in an array, returning an object with the correct key and value", () => {
    const input = [{ category_id: 1, category_name: "Drawing" }];
    const actual = createRef(input, "category_id", "category_name");
    const expected = { 1: "Drawing" };
    expect(actual).toEqual(expected);
    expect(actual).not.toBe(input);
  });
  test("When passed an array of objects returns a complete lookUp object", () => {
    let actual = createRef(categories, "category_id", "category_name");
    let expected = {
      1: "Drawing",
      3: "Collage",
      7: "Book",
    };
    expect(actual).toEqual(expected);
    actual = createRef(series, "series_id", "series_name");
    expected = {
      1: "art-k",
      2: "book-b",
      3: "art-b",
      4: "book-x",
    };
    expect(actual).toEqual(expected);
    actual = createRef(books, "book_id", "book_title");
    expected = {
      4: "Toxic Nursery",
      2: "DarkStar Vale",
      6: "Toxic Nursery",
    };
    expect(actual).toEqual(expected);
    actual = createRef(art, "stock_id", "art_id");
    expected = {
      2002: 2,
      "3101a": 1,
      "3101g": 3,
    };
    expect(actual).toEqual(expected);
  });
});

describe("formatArt function", () => {
  test("Function returns an array of objects", () => {
    const actual = formatArt(art);
    expect(Array.isArray(actual)).toBe(true);
    expect(actual[0]).toBeInstanceOf(Object);
  });
  test("Function changes close_ups count to stock_id array", () => {
    const actual = formatArt(art);
    const expected = "3101b,3101c,3101d,3101e,3101f,3101g";
    expect(actual[1].close_ups).toEqual(expected);
  });
  test("Function also works with model shots", () => {
    const actual = formatArt(art);
    const expected = "913-130314b,913-130314c,913-130314d,913-130314e,913-130314f,913-130314g,913-130314h,913-130314i";
    expect(actual[3].close_ups).toEqual(expected);
  });
});

describe("createCoverRef", () => {
  test("Function returns an array of objects", () => {
    const lookUp = createRef(art, "stock_id", "art_id");
    const actual = createCoverRef(books, lookUp);
    expect(Array.isArray(actual)).toBe(true);
    expect(actual[0]).toBeInstanceOf(Object);
  });
  test("Function adds correct art_id to all books in the array", () => {
    const lookUp = createRef(art, "stock_id", "art_id");
    const coverRef = createCoverRef(books, lookUp);
    expect(coverRef[1].art_id).toBe(2);
    expect(coverRef[2].art_id).toBe(3);
  });
});

describe("createFilteredList", () => {
  test("Function returns an array of objects", () => {
    const actual = createFilteredList(books);
    expect(Array.isArray(actual)).toBe(true);
    expect(actual[0]).toBeInstanceOf(Object);
  });
  test("Function returns list with duplicate book editions filtered", () => {
    const actual = createFilteredList(books);
    expect(actual).toHaveLength(2);
  });
  test("Function returns list with only most recent editions", () => {
    const actual = createFilteredList(books);
    expect(actual[0].edition_no).toBe(2);
  });
  test("Function returns list with duplicate art shots filtered, showing only first shots", () => {
    const actual = createFilteredList(art);
    expect(actual).toHaveLength(3);
    expect(actual[0].stock_id).toBe('3101a');
  });
});
