import { CollectionConfig } from "payload/types";

export const Articles: CollectionConfig = {
  slug: "articles",
  access: {
    read: () => true,
  },
  upload: {
    staticURL: "/articles",
    staticDir: "articles",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: undefined,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
    },
    {
      name: "title",
      type: "text",
    },
    {
      name: "content",
      type: "richText",
    },
  ],
};
