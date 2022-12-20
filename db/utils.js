exports.createRef = (array, val1, val2) => {
  const lookUp = {};
  array.forEach((item) => {
    const key = item[val1];
    const value = item[val2];
    lookUp[key] = value;
  });
  return lookUp;
};

exports.formatArt = (array) => {
  const formattedArt = array.map((art) => {
    const newArt = { ...art };
    const close_ups_count = Number(newArt.close_ups);
    if (newArt.close_ups !== 0) {
      let closeUpsArray = [];
      const stockCropped = newArt.stock_id.slice(0, 4);
      for (let i = 1; i <= close_ups_count; i++) {
        let letter = String.fromCharCode(97 + i);
        closeUpsArray.push(`${stockCropped}${letter}`);
      }
      newArt.close_ups = closeUpsArray.join();
    }
    return newArt;
  });
  return formattedArt;
};

exports.createCoverRef = (array, lookUp) => {
  const coverRef = [];
  array.forEach((book) => {
    const bookObj = {};
    bookObj.book_id = book.book_id;
    let artId = 1;
    if (lookUp[book.cover_stock_id] !== undefined)
      artId = lookUp[book.cover_stock_id];
    bookObj.art_id = artId;
    coverRef.push(bookObj);
  });
  return coverRef;
};

exports.createFilteredList = (array) => {
  let collectObj = {};
  let filteredItems = [];
  array.forEach((item) => {
    let searchKey = "";
    item.blurb ? searchKey = "book_title" : searchKey = "art_title";
    const searchItem = item[searchKey]
    if (!collectObj.hasOwnProperty(searchItem) ||
    collectObj[searchItem].edition_no < item.edition_no ||
    collectObj[searchItem].stock_id > item.stock_id  
      ){
      collectObj[searchItem] = item;
    }
  });
  for (item in collectObj) {
    filteredItems.push(collectObj[item]);
  };
  return filteredItems;
};
