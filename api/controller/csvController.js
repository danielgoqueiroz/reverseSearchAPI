module.exports = {
  jsontoCsv(json) {
    let csvContent = "data:text/csv;charset=utf-8,Site,Link, \r\n";
    json.forEach((item) => {
      const line = `"${item.host}","${item.link}"\r\n`;
      csvContent += line;
    });
    return csvContent;
  },
};
