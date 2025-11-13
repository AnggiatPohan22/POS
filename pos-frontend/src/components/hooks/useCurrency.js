export const useCurrency = () => {
  const formatIDR = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value).replace("Rp", "IDR");
  };

  return { formatIDR };
};