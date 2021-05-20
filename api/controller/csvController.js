module.exports = {
  jsontoCsv(json) {
    let csvContent = "Site;Link;Texto\n";
    json.forEach((item) => {
      const line = `${item.host};${item.link};${item.text}\n`;
      csvContent += line;
    });
    return csvContent;
  },
};
