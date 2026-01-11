const formatDate = (isoString: string) => new Date(isoString).toISOString().split("T")[0];

export default formatDate;
