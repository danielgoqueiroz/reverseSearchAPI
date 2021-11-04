module.exports = {
  jsontoCsv(json) {
    let csvContent = "Site,Link, \r\n";
    json.forEach((item) => {
      const line = `"${item.host}","${item.link}"\r\n`;
      csvContent += line;
    });
    return csvContent;
  },
};
