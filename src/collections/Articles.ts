import { CollectionConfig } from "payload/types";

export const Articles: CollectionConfig = {
  slug: "articles",
  access: {
    read: () => true,
  },
  upload: {
    staticURL: "/articles",
    staticDir: "articles",
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "releaseDate",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayOnly",
          displayFormat: "d MMM yyy",
        },
      },
    },
    {
      name: "title",
      type: "text",
    },
    {
      name: "content",
      type: "textarea",
    },
    {
      name: "alt image text",
      type: "text",
    },
    {
      name: "imageCaption",
      type: "text",
    },
  ],
};
