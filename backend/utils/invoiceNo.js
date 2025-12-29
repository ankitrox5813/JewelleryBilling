export const generateInvoiceNo = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `GH/${year}/${rand}`;
};
