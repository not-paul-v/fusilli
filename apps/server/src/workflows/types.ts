type UrlOrigin = {
	type: "url";
	url: string;
};
type PdfOrigin = {
	type: "pdf";
	r2Key: string;
};

export type Origin = UrlOrigin | PdfOrigin;
